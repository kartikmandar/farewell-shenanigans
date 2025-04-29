'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
    Box,
    CircularProgress,
    Typography,
    Container,
    Breadcrumbs,
    Paper,
    Button,
    Grid,
    Divider,
    Alert
} from '@mui/material';
import AuthCheck from '@/components/AuthCheck';
import Leaderboard from '@/components/Leaderboard';
import Link from 'next/link';

// Import game components
// Commented out until implemented
// import TicTacToe from './TicTacToe';
// import RockPaperScissors from './RockPaperScissors';
// import Quiz from './Quiz';
// import MemoryMatch from './MemoryMatch';

interface Game {
    code: string;
    name: string;
    description: string;
}

// Mock game components until they're implemented
const GamePlaceholder = ({ gameId, onScore }: { gameId: string, onScore: (score: number) => void }) => {
    return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
                {gameId.toUpperCase()} Game
            </Typography>
            <Typography paragraph>
                This is a placeholder for the {gameId} game.
            </Typography>
            <Button
                variant="contained"
                onClick={() => onScore(Math.floor(Math.random() * 100))}
            >
                Generate Random Score
            </Button>
        </Box>
    );
};

export default function GamePlayPage() {
    const { gameId } = useParams() as { gameId: string };
    const searchParams = useSearchParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const sessionId = searchParams.get('session');

    const [game, setGame] = useState<Game | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Function to update score
    const handleScore = (score: number) => {
        // Use the socket hook in the game component to update score
        console.log(`Score updated: ${score}`);
    };

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

    // Validate session parameter
    useEffect(() => {
        if (!sessionId && !loading) {
            router.push(`/games/${gameId}`);
        }
    }, [sessionId, loading, gameId, router]);

    if (status === 'loading' || loading) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error || !game || !sessionId) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h5" color="error" gutterBottom>
                        {error || 'Game session not found'}
                    </Typography>
                    <Typography>
                        <Link href={`/games/${gameId}`} style={{ color: 'inherit' }}>
                            Return to game lobby
                        </Link>
                    </Typography>
                </Box>
            </Container>
        );
    }

    // Render the appropriate game component based on gameId
    const renderGameComponent = () => {
        switch (gameId) {
            case 'ttt':
                return <GamePlaceholder gameId={gameId} onScore={handleScore} />;
            case 'rps':
                return <GamePlaceholder gameId={gameId} onScore={handleScore} />;
            case 'quiz':
                return <GamePlaceholder gameId={gameId} onScore={handleScore} />;
            case 'mem':
                return <GamePlaceholder gameId={gameId} onScore={handleScore} />;
            default:
                return (
                    <Alert severity="warning">
                        Game component not implemented yet. This is a placeholder.
                    </Alert>
                );
        }
    };

    return (
        <AuthCheck>
            <Container maxWidth="lg">
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
                    <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
                    <Link href="/games" style={{ color: 'inherit', textDecoration: 'none' }}>Games</Link>
                    <Link href={`/games/${gameId}`} style={{ color: 'inherit', textDecoration: 'none' }}>{game.name}</Link>
                    <Typography color="text.primary">Play</Typography>
                </Breadcrumbs>

                <Typography variant="h4" component="h1" gutterBottom>
                    {game.name}
                </Typography>

                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Paper sx={{ p: 3, mb: 4 }}>
                            {renderGameComponent()}
                        </Paper>

                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                How to Play
                            </Typography>
                            <Typography paragraph>
                                {game.description}
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    component={Link}
                                    href={`/games/${gameId}`}
                                >
                                    Leave Game
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Leaderboard gameId={gameId} sessionId={sessionId} title="Live Scores" />
                    </Grid>
                </Grid>
            </Container>
        </AuthCheck>
    );
} 