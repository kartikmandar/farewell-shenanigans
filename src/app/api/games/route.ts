import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Mock data to use when database is not available
const mockGames = [
    {
        id: 1,
        code: 'ttt',
        name: 'Tic Tac Toe',
        description: 'Classic game of X and O. Be the first to get three in a row.'
    },
    {
        id: 2,
        code: 'rps',
        name: 'Rock Paper Scissors',
        description: 'Quick game of chance. Rock beats scissors, scissors beats paper, paper beats rock.'
    },
    {
        id: 3,
        code: 'quiz',
        name: 'Quick Quiz',
        description: 'Test your knowledge against friends with random trivia questions.'
    },
    {
        id: 4,
        code: 'mem',
        name: 'Memory Match',
        description: 'Find matching pairs of cards. The player with the most pairs wins.'
    }
];

export async function GET(request: Request) {
    try {
        // Check if we have a gameId query parameter
        const { searchParams } = new URL(request.url);
        const gameId = searchParams.get('gameId');

        // If we have a database connection, use it
        if (process.env.POSTGRES_URL) {
            if (gameId) {
                const result = await sql`SELECT * FROM games WHERE code = ${gameId}`;
                return NextResponse.json({ games: result.rows });
            } else {
                const result = await sql`SELECT * FROM games ORDER BY name`;
                return NextResponse.json({ games: result.rows });
            }
        }
        // Otherwise use mock data
        else {
            if (gameId) {
                const game = mockGames.filter(game => game.code === gameId);
                return NextResponse.json({ games: game });
            } else {
                return NextResponse.json({ games: mockGames });
            }
        }
    } catch (error) {
        console.error('Error fetching games:', error);
        // Return mock data as fallback
        return NextResponse.json({ games: mockGames });
    }
} 