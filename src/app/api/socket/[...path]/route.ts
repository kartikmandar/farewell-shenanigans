import { Server, Socket } from 'socket.io';
import { kv } from '@vercel/kv';
import { sql } from '@vercel/postgres';

// Rate limiter implementation
const RATE_LIMIT_DURATION = 1000; // 1 second
const rateLimit = new Map<string, number>();

// Types for socket events
interface JoinRoomPayload {
    gameId: string;
    userId: string;
}

interface LeaveRoomPayload {
    gameId: string;
    userId: string;
}

interface StartGamePayload {
    gameId: string;
    userId: string;
}

interface UpdateScorePayload {
    gameId: string;
    userId: string;
    sessionId: string;
    score: number;
}

interface RoomInfo {
    host_uid: string;
    created_at: string;
}

interface PlayerInfo {
    joined_at: string;
    exited: boolean;
}

// WebSocket handler
const ioHandler = async (req: Request) => {
    try {
        // Extract path from URL
        const { pathname } = new URL(req.url);
        const path = pathname.split('/api/socket/')[1] || '';

        // Get client IP for rate limiting
        const forwarded = req.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(/, /)[0] : 'unknown';

        // Apply rate limiting
        const now = Date.now();
        const lastRequest = rateLimit.get(ip) || 0;

        if (now - lastRequest < RATE_LIMIT_DURATION) {
            return new Response('Rate limit exceeded', { status: 429 });
        }
        rateLimit.set(ip, now);

        // Create Socket.IO server if needed
        // @ts-ignore - NextJS doesn't recognize global vars properly
        if (!global.io) {
            // @ts-ignore
            global.io = new Server({
                path: '/api/socket',
                addTrailingSlash: false,
                cors: {
                    origin: process.env.NEXT_PUBLIC_SITE_URL || '*',
                    methods: ['GET', 'POST'],
                },
            });

            // @ts-ignore
            const io = global.io;

            // Handle connections
            io.on('connection', (socket: Socket) => {
                console.log('Client connected:', socket.id);

                // Join Room
                socket.on('joinRoom', async ({ gameId, userId }: JoinRoomPayload) => {
                    try {
                        const roomKey = `room:${gameId}`;
                        const playerKey = `room:${gameId}:players`;

                        // Check if room exists, if not create it with this user as host
                        const roomExists = await kv.exists(roomKey);

                        if (!roomExists) {
                            await kv.set(roomKey, {
                                host_uid: userId,
                                created_at: new Date().toISOString()
                            });
                            socket.emit('becomeHost', { gameId });
                        }

                        // Add player to room
                        await kv.hset(playerKey, {
                            [userId]: {
                                joined_at: new Date().toISOString(),
                                exited: false
                            }
                        });

                        // Join socket room
                        socket.join(`game:${gameId}`);

                        // Get all players in room
                        const players = await kv.hgetall<Record<string, PlayerInfo>>(playerKey);

                        // Broadcast updated players list
                        io.to(`game:${gameId}`).emit('playersUpdate', {
                            gameId,
                            players
                        });

                        // Fetch room info
                        const roomInfo = await kv.get<RoomInfo>(roomKey);
                        socket.emit('roomInfo', { roomInfo });
                    } catch (error) {
                        console.error('Error joining room:', error);
                        socket.emit('error', { message: 'Failed to join room' });
                    }
                });

                // Leave Room
                socket.on('leaveRoom', async ({ gameId, userId }: LeaveRoomPayload) => {
                    try {
                        const playerKey = `room:${gameId}:players`;

                        // Get existing player data
                        const existingPlayer = await kv.hget<PlayerInfo>(playerKey, userId);
                        const joined_at = existingPlayer?.joined_at || new Date().toISOString();

                        // Mark player as exited
                        await kv.hset(playerKey, {
                            [userId]: {
                                joined_at,
                                exited: true
                            }
                        });

                        // Leave socket room
                        socket.leave(`game:${gameId}`);

                        // Get updated players list
                        const players = await kv.hgetall<Record<string, PlayerInfo>>(playerKey);

                        // Broadcast updated players list
                        io.to(`game:${gameId}`).emit('playersUpdate', {
                            gameId,
                            players
                        });

                        // Check if all players have exited
                        const allExited = Object.values(players || {}).every(
                            (player) => player.exited
                        );

                        if (allExited) {
                            // Clean up room if empty
                            await kv.del(playerKey);
                            await kv.del(`room:${gameId}`);
                        }
                    } catch (error) {
                        console.error('Error leaving room:', error);
                    }
                });

                // Start Game
                socket.on('startGame', async ({ gameId, userId }: StartGamePayload) => {
                    try {
                        const roomKey = `room:${gameId}`;
                        const playerKey = `room:${gameId}:players`;

                        // Check if user is host
                        const roomInfo = await kv.get<RoomInfo>(roomKey);

                        if (roomInfo?.host_uid !== userId) {
                            socket.emit('error', { message: 'Only the host can start the game' });
                            return;
                        }

                        // Generate a session ID
                        const sessionId = crypto.randomUUID();

                        // Get all players
                        const players = await kv.hgetall<Record<string, PlayerInfo>>(playerKey) || {};
                        const activePlayers = Object.entries(players)
                            .filter(([, player]) => !player.exited)
                            .map(([userId]) => userId);

                        // Create leaderboard entries for all players
                        for (const userId of activePlayers) {
                            await sql`
                INSERT INTO leaderboards (game_code, session_id, user_id, score)
                VALUES (${gameId}, ${sessionId}, ${userId}, 0)
              `;
                        }

                        // Broadcast game start
                        io.to(`game:${gameId}`).emit('gameStarted', {
                            gameId,
                            sessionId,
                            players: activePlayers
                        });
                    } catch (error) {
                        console.error('Error starting game:', error);
                        socket.emit('error', { message: 'Failed to start game' });
                    }
                });

                // Update Score
                socket.on('updateScore', async ({ gameId, userId, sessionId, score }: UpdateScorePayload) => {
                    try {
                        // Update score in database
                        await sql`
              UPDATE leaderboards 
              SET score = ${score}
              WHERE game_code = ${gameId} 
                AND session_id = ${sessionId} 
                AND user_id = ${userId}
            `;

                        // Broadcast score update
                        io.to(`game:${gameId}`).emit('scoreUpdate', {
                            gameId,
                            userId,
                            score,
                            sessionId
                        });
                    } catch (error) {
                        console.error('Error updating score:', error);
                    }
                });

                // Player presence updates
                socket.on('presence', async () => {
                    try {
                        // Get current online count
                        const currentCount = await kv.get<number>('online:count') || 0;

                        // Broadcast current count to everyone
                        io.emit('userCount', { count: currentCount });
                    } catch (error) {
                        console.error('Error fetching presence:', error);
                    }
                });

                // Disconnect handler
                socket.on('disconnect', () => {
                    console.log('Client disconnected:', socket.id);
                });
            });
        }

        // @ts-ignore
        const io = global.io;

        // Handle WebSocket upgrade
        // For direct server access like health checks
        if (path === 'health') {
            return new Response('OK', { status: 200 });
        }

        // This is required for Socket.IO to work with Edge functions
        return new Response(null, {
            status: 501,
            headers: {
                'Content-Type': 'text/plain',
            },
        });
    } catch (e) {
        console.error('Socket error:', e);
        return new Response('Internal Server Error', { status: 500 });
    }
};

export const GET = ioHandler;
export const POST = ioHandler; 