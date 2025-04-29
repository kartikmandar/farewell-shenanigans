import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

// This endpoint will be called by Vercel Cron
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET() {
    try {
        // Get all room keys
        const roomKeys = await kv.keys('room:*');
        let cleanedRooms = 0;

        // Filter out player keys
        const roomBaseKeys = roomKeys.filter(key => !key.includes(':players'));

        for (const roomKey of roomBaseKeys) {
            const gameId = roomKey.split('room:')[1];
            const playerKey = `room:${gameId}:players`;

            // Check if the room has players
            const players = await kv.hgetall(playerKey);

            if (!players || Object.keys(players).length === 0) {
                // Room is empty, clean it up
                await kv.del(roomKey);
                await kv.del(playerKey);
                cleanedRooms++;
            } else {
                // Check if all players have exited
                const allExited = Object.values(players).every((player: any) => player.exited);

                if (allExited) {
                    // All players have exited, clean up the room
                    await kv.del(roomKey);
                    await kv.del(playerKey);
                    cleanedRooms++;
                }
            }
        }

        return NextResponse.json({
            success: true,
            roomsChecked: roomBaseKeys.length,
            roomsCleaned: cleanedRooms
        });
    } catch (error) {
        console.error('Error cleaning up rooms:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 