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
        const timestamp = new Date().toISOString();

        // Get room info
        const roomInfo = await kv.get(`room:${gameId}`) as { host_uid: string } | null;

        // If room doesn't exist, create it and make this user the host
        if (!roomInfo) {
            await kv.set(`room:${gameId}`, { host_uid: userId });

            // Trigger event to make this user the host
            const pusher = getPusherServer();
            pusher.trigger(`game-${gameId}`, 'become-host', { gameId });
        }

        // Add user to the room's players
        const playerKey = `room:${gameId}:players`;
        await kv.hset(playerKey, {
            [userId]: {
                joined_at: timestamp,
                exited: false
            }
        });

        // Get all players to broadcast update
        const players = await kv.hgetall(playerKey) as Record<string, any> || {};

        // Trigger event to update players list
        const pusher = getPusherServer();
        pusher.trigger(`game-${gameId}`, 'players-update', { gameId, players });

        // Send room info to the joining user
        pusher.trigger(`game-${gameId}`, 'room-info', {
            roomInfo: roomInfo || { host_uid: userId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error joining room:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 