import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const gameId = searchParams.get('gameId');
        const sessionId = searchParams.get('sessionId');

        if (!gameId || !sessionId) {
            return NextResponse.json({ error: 'Game ID and Session ID are required' }, { status: 400 });
        }

        const result = await sql`
      SELECT l.user_id, l.score, l.exited, u.display_name, u.gameplay_id
      FROM leaderboards l
      JOIN users u ON l.user_id = u.id
      WHERE l.game_code = ${gameId} AND l.session_id = ${sessionId}
      ORDER BY l.score DESC
    `;

        return NextResponse.json({ leaderboard: result.rows });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 