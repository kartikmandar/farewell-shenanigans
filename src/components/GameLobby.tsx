'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Typography,
    Button,
    Paper,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Divider,
    Chip,
    Alert,
    CircularProgress
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { useRoom } from '@/lib/socket';

type GameLobbyProps = {
    gameId: string;
    gameName: string;
    gameDescription: string;
};

export default function GameLobby({ gameId, gameName, gameDescription }: GameLobbyProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const userId = session?.user?.id;

    const {
        players,
        isHost,
        gameStarted,
        sessionId,
        error,
        startGame
    } = useRoom(gameId, userId || '');

    // Redirect to game when it starts
    useEffect(() => {
        if (gameStarted && sessionId) {
            router.push(`/games/${gameId}/play?session=${sessionId}`);
        }
    }, [gameStarted, sessionId, gameId, router]);

    // Filter out exited players
    const activePlayers = Object.entries(players)
        .filter(([, player]) => !player.exited)
        .map(([id]) => id);

    // Handle game start
    const handleStartGame = () => {
        if (activePlayers.length < 2) {
            return; // Need at least 2 players
        }

        startGame();
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <SportsEsportsIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="h4">{gameName}</Typography>
                        <Typography variant="body1" color="text.secondary">
                            {gameDescription}
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                        Lobby {isHost && <Chip size="small" label="You are the host" color="primary" />}
                    </Typography>
                    <Typography variant="body2">
                        {activePlayers.length} player{activePlayers.length !== 1 ? 's' : ''} waiting
                    </Typography>
                </Box>

                <List>
                    {Object.entries(players)
                        .filter(([, player]) => !player.exited)
                        .map(([playerId]) => (
                            <ListItem key={playerId}>
                                <ListItemAvatar>
                                    <Avatar>
                                        <PersonIcon />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        playerId === userId
                                            ? `${session?.user?.display_name || session?.user?.name} (You)`
                                            : `Player ${playerId.substring(0, 8)}...`
                                    }
                                    secondary={
                                        playerId === userId
                                            ? `@${session?.user?.gameplay_id}`
                                            : 'Waiting...'
                                    }
                                />
                                {playerId === players[Object.keys(players)[0]]?.host_uid && (
                                    <Chip size="small" label="Host" color="primary" variant="outlined" />
                                )}
                            </ListItem>
                        ))}
                </List>

                {activePlayers.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                        <CircularProgress size={24} sx={{ mb: 1 }} />
                        <Typography>Waiting for players to join...</Typography>
                    </Box>
                )}

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => router.push('/games')}
                    >
                        Leave Lobby
                    </Button>

                    {isHost && (
                        <Button
                            variant="contained"
                            color="primary"
                            disabled={activePlayers.length < 2}
                            onClick={handleStartGame}
                        >
                            Start Game {activePlayers.length < 2 && '(Need at least 2 players)'}
                        </Button>
                    )}
                </Box>
            </Paper>

            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    How to Play
                </Typography>
                <Typography variant="body1" paragraph>
                    1. Wait for other players to join the lobby.
                </Typography>
                <Typography variant="body1" paragraph>
                    2. The host (first player to join) will start the game when ready.
                </Typography>
                <Typography variant="body1" paragraph>
                    3. Follow the game instructions when the game begins.
                </Typography>
                <Typography variant="body1">
                    4. Your scores will be tracked on the leaderboard in real-time.
                </Typography>
            </Paper>
        </Box>
    );
} 