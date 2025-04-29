import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getPusherServer } from '@/lib/pusher-server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { gameId } = await req.json();

        if (!gameId) {
            return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
        }

        const userId = session.user.id;

        // Get room info
        const roomInfo = await kv.get(`room:${gameId}`) as { host_uid: string } | null;

        if (!roomInfo) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }

        // Mark player as exited
        const playerKey = `room:${gameId}:players`;
        const playerData = await kv.hget(playerKey, userId) as { joined_at: string; exited: boolean } | null;

        if (playerData) {
            await kv.hset(playerKey, {
                [userId]: {
                    ...playerData,
                    exited: true
                }
            });
        }

        // Check if this user was the host
        if (roomInfo.host_uid === userId) {
            // Find a new host from active players
            const players = await kv.hgetall(playerKey) as Record<string, { joined_at: string; exited: boolean }> | null;

            if (players) {
                // Find first non-exited player
                const activePlayerId = Object.entries(players)
                    .find(([id, data]) => id !== userId && !data.exited)?.[0];

                if (activePlayerId) {
                    // Update room info with new host
                    await kv.set(`room:${gameId}`, {
                        ...roomInfo,
                        host_uid: activePlayerId
                    });

                    // Notify new host
                    const pusher = getPusherServer();
                    pusher.trigger(`game-${gameId}`, 'become-host', {
                        gameId,
                        userId: activePlayerId
                    });
                }
            }
        }

        // Get updated players list
        const updatedPlayers = await kv.hgetall(playerKey) as Record<string, any> || {};

        // Broadcast players update
        const pusher = getPusherServer();
        pusher.trigger(`game-${gameId}`, 'players-update', { gameId, players: updatedPlayers });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error leaving room:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 