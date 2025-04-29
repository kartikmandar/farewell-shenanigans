import { NextRequest, NextResponse } from 'next/server';
import { getPusherServer } from '@/lib/pusher-server';

// Store user presence in memory (not ideal for production, but works for demo without KV)
type PresenceData = {
    [userId: string]: {
        lastSeen: number;
    };
};

// Global variable for presence data
let presenceData: PresenceData = {};

// Function to clean up stale presence data
const cleanupPresenceData = () => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const newPresenceData: PresenceData = {};

    Object.entries(presenceData).forEach(([userId, data]) => {
        if (data.lastSeen > fiveMinutesAgo) {
            newPresenceData[userId] = data;
        }
    });

    presenceData = newPresenceData;
    return Object.keys(presenceData).length;
};

export const runtime = 'nodejs';
export const revalidate = 5; // Revalidate every 5 seconds

export async function POST(req: NextRequest) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Update user's last seen timestamp
        presenceData[userId] = {
            lastSeen: Date.now()
        };

        // Count active users
        const count = cleanupPresenceData();

        // Broadcast the updated count
        const pusher = getPusherServer();
        pusher.trigger('global', 'user-count', { count });

        return NextResponse.json({ count });
    } catch (error) {
        console.error('Error updating presence:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        // Count active users after cleanup
        const count = cleanupPresenceData();

        // Broadcast count
        const pusher = getPusherServer();
        pusher.trigger('global', 'user-count', { count });

        return NextResponse.json({ count });
    } catch (error) {
        console.error('Error handling presence:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 