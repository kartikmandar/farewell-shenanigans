'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Box, CircularProgress, Typography, Container, Breadcrumbs } from '@mui/material';
import GameLobby from '@/components/GameLobby';
import AuthCheck from '@/components/AuthCheck';
import Link from 'next/link';

interface Game {
    code: string;
    name: string;
    description: string;
}

export default function GamePage() {
    const { gameId } = useParams();
    const { status } = useSession();
    const [game, setGame] = useState<Game | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGame = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/games?gameId=${gameId}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch game');
                }

                const data = await response.json();

                if (data.games && data.games.length > 0) {
                    setGame(data.games[0]);
                } else {
                    throw new Error('Game not found');
                }
            } catch (err: any) {
                setError(err.message || 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (gameId) {
            fetchGame();
        }
    }, [gameId]);

    if (status === 'loading' || loading) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error || !game) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h5" color="error" gutterBottom>
                        {error || 'Game not found'}
                    </Typography>
                    <Typography>
                        <Link href="/games" style={{ color: 'inherit' }}>
                            Return to games list
                        </Link>
                    </Typography>
                </Box>
            </Container>
        );
    }

    return (
        <AuthCheck>
            <Container maxWidth="lg">
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
                    <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
                    <Link href="/games" style={{ color: 'inherit', textDecoration: 'none' }}>Games</Link>
                    <Typography color="text.primary">{game.name}</Typography>
                </Breadcrumbs>

                <GameLobby
                    gameId={game.code}
                    gameName={game.name}
                    gameDescription={game.description}
                />
            </Container>
        </AuthCheck>
    );
} 