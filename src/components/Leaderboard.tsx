'use client';

import { useEffect, useState } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Box,
    Chip,
    CircularProgress
} from '@mui/material';
import { useScores } from '@/lib/pusher';
import { useSession } from 'next-auth/react';

type LeaderboardEntry = {
    user_id: string;
    display_name: string;
    gameplay_id: string;
    score: number;
    exited: boolean;
};

type LeaderboardProps = {
    gameId: string;
    sessionId: string;
    title?: string;
};

export default function Leaderboard({ gameId, sessionId, title = 'Leaderboard' }: LeaderboardProps) {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { scores } = useScores(gameId, sessionId);
    const { data: session } = useSession();

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/leaderboard?gameId=${gameId}&sessionId=${sessionId}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch leaderboard');
                }

                const data = await response.json();
                setLeaderboard(data.leaderboard);
            } catch (err: any) {
                setError(err.message || 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [gameId, sessionId]);

    // Update scores from Pusher
    useEffect(() => {
        if (Object.keys(scores).length > 0) {
            setLeaderboard(prev =>
                prev.map(entry => ({
                    ...entry,
                    score: scores[entry.user_id] !== undefined ? scores[entry.user_id] : entry.score
                }))
            );
        }
    }, [scores]);

    // Sort leaderboard by score (highest first)
    const sortedLeaderboard = [...leaderboard].sort((a, b) => b.score - a.score);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ py: 2 }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    if (sortedLeaderboard.length === 0) {
        return (
            <Box sx={{ py: 2 }}>
                <Typography align="center">No players yet</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', mb: 4 }}>
            {title && (
                <Typography variant="h5" component="h2" gutterBottom>
                    {title}
                </Typography>
            )}
            <TableContainer component={Paper}>
                <Table aria-label="leaderboard table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Rank</TableCell>
                            <TableCell>Player</TableCell>
                            <TableCell align="right">Score</TableCell>
                            <TableCell align="right">Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedLeaderboard.map((entry, index) => (
                            <TableRow
                                key={entry.user_id}
                                sx={{
                                    '&:last-child td, &:last-child th': { border: 0 },
                                    bgcolor: entry.user_id === session?.user?.id ? 'action.selected' : 'inherit'
                                }}
                            >
                                <TableCell component="th" scope="row">
                                    {index + 1}
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                            {entry.display_name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            @{entry.gameplay_id}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell align="right">{entry.score}</TableCell>
                                <TableCell align="right">
                                    {entry.exited ? (
                                        <Chip
                                            label="Left"
                                            size="small"
                                            color="error"
                                            variant="outlined"
                                        />
                                    ) : (
                                        <Chip
                                            label="Playing"
                                            size="small"
                                            color="success"
                                            variant="outlined"
                                        />
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
} 