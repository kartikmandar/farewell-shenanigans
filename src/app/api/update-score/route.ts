import { sql } from '@vercel/postgres';
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

        const { gameId, sessionId, score } = await req.json();
        const userId = session.user.id;

        if (!gameId || !sessionId || score === undefined) {
            return NextResponse.json({ error: 'Game ID, Session ID, and score are required' }, { status: 400 });
        }

        // Update score in database
        await sql`
            UPDATE leaderboards 
            SET score = ${score} 
            WHERE game_code = ${gameId} 
            AND session_id = ${sessionId} 
            AND user_id = ${userId}
        `;

        // Broadcast score update
        const pusher = getPusherServer();
        pusher.trigger(`scores-${gameId}-${sessionId}`, 'score-update', {
            gameId,
            sessionId,
            userId,
            score
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating score:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 