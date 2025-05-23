import { sql } from '@vercel/postgres';
import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getPusherServer } from '@/lib/pusher-server';

export const runtime = 'nodejs';

interface RoomInfo {
    host_uid: string;
    [key: string]: string | number | boolean;
}

interface Player {
    exited: boolean;
    name: string;
    [key: string]: string | number | boolean;
}

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

        // Check if user is host
        const roomInfo = await kv.get(`room:${gameId}`) as RoomInfo | null;

        if (!roomInfo || roomInfo.host_uid !== session.user.id) {
            return NextResponse.json({ error: 'Only the host can start the game' }, { status: 403 });
        }

        // Generate session ID
        const sessionId = crypto.randomUUID();

        // Get all players
        const playerKey = `room:${gameId}:players`;
        const players = await kv.hgetall(playerKey) as Record<string, Player> || {};

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

        // Notify clients that the game has started
        const pusher = getPusherServer();
        pusher.trigger(`game-${gameId}`, 'game-started', { gameId, sessionId });

        return NextResponse.json({ success: true, sessionId, players: activePlayers });
    } catch (error) {
        console.error('Error starting game:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 