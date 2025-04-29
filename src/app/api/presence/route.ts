import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getPusherServer } from '@/lib/pusher-server';

export const runtime = 'nodejs';
export const revalidate = 5; // Revalidate every 5 seconds

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Update presence timestamp
        const userId = session.user.id;
        await kv.hset('presence', { [userId]: Date.now() });

        // Get all presence data
        const allPresence = await kv.hgetall('presence') || {};

        // Calculate current online users (active in last 5 minutes)
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        const onlineUsers = Object.values(allPresence).filter(
            (timestamp: any) => timestamp > fiveMinutesAgo
        );

        // Update online count
        await kv.set('online:count', onlineUsers.length);

        return NextResponse.json({ count: onlineUsers.length });
    } catch (error) {
        console.error('Error updating presence:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        // Get or initialize user count
        let count = await kv.get('online_users_count') as number;

        if (count === null) {
            count = 0;
            await kv.set('online_users_count', 0);
        }

        // Broadcast the count
        const pusher = getPusherServer();
        pusher.trigger('presence-global', 'user-count', { count });

        // Return the count
        return NextResponse.json({ count });
    } catch (error) {
        console.error('Error handling presence:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 