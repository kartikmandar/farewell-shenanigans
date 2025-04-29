import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export const runtime = 'edge';

export async function GET() {
    try {
        const session = await getServerSession();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await sql`
      SELECT l.id, l.game_code, l.session_id, l.score, l.exited, l.created_at, g.name as game_name
      FROM leaderboards l
      JOIN games g ON l.game_code = g.code
      WHERE l.user_id = ${session.user.id}
      ORDER BY l.created_at DESC
      LIMIT 50
    `;

        return NextResponse.json({ history: result.rows });
    } catch (error) {
        console.error('Error fetching user history:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 