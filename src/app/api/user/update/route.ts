import { sql } from '@vercel/postgres';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { display_name, gameplay_id } = await req.json();

        if (!display_name && !gameplay_id) {
            return NextResponse.json({ error: 'No data provided' }, { status: 400 });
        }

        // Build update query based on provided fields
        let updateQuery = '';
        const params = [];

        if (display_name) {
            updateQuery += 'display_name = $1';
            params.push(display_name);
        }

        if (gameplay_id) {
            if (display_name) updateQuery += ', ';
            updateQuery += 'gameplay_id = $' + (params.length + 1);
            params.push(gameplay_id);
        }

        // Add user ID as the last parameter
        params.push(session.user.id);

        // Execute update
        await sql.query(
            `UPDATE users SET ${updateQuery} WHERE id = $${params.length}`,
            params
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 