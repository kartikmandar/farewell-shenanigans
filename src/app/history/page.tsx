'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Button,
    Breadcrumbs,
    Alert
} from '@mui/material';
import AuthCheck from '@/components/AuthCheck';
import Link from 'next/link';

interface GameHistory {
    id: string;
    game_code: string;
    session_id: string;
    score: number;
    exited: boolean;
    created_at: string;
    game_name: string;
}

export default function HistoryPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [history, setHistory] = useState<GameHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/user/history');

                if (!response.ok) {
                    throw new Error('Failed to fetch game history');
                }

                const data = await response.json();
                setHistory(data.history || []);
            } catch (err: any) {
                setError(err.message || 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (session?.user?.id) {
            fetchHistory();
        }
    }, [session?.user?.id]);

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(date);
    };

    return (
        <AuthCheck>
            <Container maxWidth="lg">
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
                    <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
                    <Typography color="text.primary">Game History</Typography>
                </Breadcrumbs>

                <Typography variant="h4" component="h1" gutterBottom>
                    Your Game History
                </Typography>

                <Paper sx={{ p: 4, mb: 4 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : history.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="h6" gutterBottom>
                                No game history found
                            </Typography>
                            <Typography paragraph>
                                You haven't played any games yet. Start playing to see your history.
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                component={Link}
                                href="/games"
                            >
                                Browse Games
                            </Button>
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Game</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell align="right">Score</TableCell>
                                        <TableCell align="right">Status</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {history.map((game) => (
                                        <TableRow key={game.id}>
                                            <TableCell>
                                                <Typography variant="body1" fontWeight="medium">
                                                    {game.game_name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Session: {game.session_id.substring(0, 8)}...
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {game.created_at ? formatDate(game.created_at) : 'Unknown'}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body1" fontWeight="medium">
                                                    {game.score}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                {game.exited ? (
                                                    <Chip label="Left" size="small" color="error" variant="outlined" />
                                                ) : (
                                                    <Chip label="Completed" size="small" color="success" variant="outlined" />
                                                )}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    component={Link}
                                                    href={`/games/${game.game_code}`}
                                                >
                                                    Play Again
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            </Container>
        </AuthCheck>
    );
} 