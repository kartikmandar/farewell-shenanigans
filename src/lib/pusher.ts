import Pusher from 'pusher-js';
import { useEffect, useState } from 'react';

// Initialize Pusher client
let pusherClient: Pusher | null = null;

export const getPusherClient = (): Pusher => {
    if (!pusherClient) {
        // Replace these with your actual Pusher credentials from environment variables
        pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY || '', {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || '',
            forceTLS: true,
        });
    }
    return pusherClient;
};

export const usePusher = () => {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const pusher = getPusherClient();

        pusher.connection.bind('connected', () => {
            console.log('Pusher connected');
            setIsConnected(true);
        });

        pusher.connection.bind('disconnected', () => {
            console.log('Pusher disconnected');
            setIsConnected(false);
        });

        if (pusher.connection.state === 'connected') {
            setIsConnected(true);
        }

        return () => {
            pusher.connection.unbind_all();
        };
    }, []);

    return { pusher: getPusherClient(), isConnected };
};

export const usePresence = () => {
    const { pusher, isConnected } = usePusher();
    const [userCount, setUserCount] = useState(0);

    useEffect(() => {
        if (!isConnected) return;

        // Subscribe to a public channel
        const channel = pusher.subscribe('global');

        // Handle user count update event
        channel.bind('user-count', (data: { count: number }) => {
            setUserCount(data.count);
        });

        // Request current count via API and update presence
        const updatePresence = async () => {
            try {
                // Generate a client ID if needed
                const clientId = localStorage.getItem('client_id') || `client_${Math.random().toString(36).substring(2, 9)}`;
                localStorage.setItem('client_id', clientId);

                // Post presence update
                const response = await fetch('/api/presence', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId: clientId }),
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserCount(data.count);
                }
            } catch (err) {
                console.error('Error updating presence:', err);

                // Fallback to GET request if POST fails
                try {
                    const response = await fetch('/api/presence');
                    if (response.ok) {
                        const data = await response.json();
                        setUserCount(data.count);
                    }
                } catch (err) {
                    console.error('Error fetching user count:', err);
                }
            }
        };

        // Update presence immediately and set interval
        updatePresence();
        const interval = setInterval(updatePresence, 30000); // Every 30 seconds

        return () => {
            // Unsubscribe when component unmounts
            pusher.unsubscribe('global');
            clearInterval(interval);
        };
    }, [pusher, isConnected]);

    return { userCount };
};

export const useRoom = (gameId: string, userId: string) => {
    const { pusher, isConnected } = usePusher();
    const [players, setPlayers] = useState<Record<string, { joined_at: string; exited?: boolean }>>({});
    const [isHost, setIsHost] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isConnected || !gameId || !userId) return;

        // Subscribe to the game room channel
        const channel = pusher.subscribe(`game-${gameId}`);

        // Handle players update event
        channel.bind('players-update', (data: { gameId: string; players: Record<string, { joined_at: string; exited?: boolean }> }) => {
            if (data.gameId === gameId) {
                setPlayers(data.players);
            }
        });

        // Handle become host event
        channel.bind('become-host', (data: { gameId: string }) => {
            if (data.gameId === gameId) {
                setIsHost(true);
            }
        });

        // Handle room info event
        channel.bind('room-info', (data: { roomInfo: { host_uid: string } }) => {
            if (data.roomInfo?.host_uid === userId) {
                setIsHost(true);
            }
        });

        // Handle game started event
        channel.bind('game-started', (data: { gameId: string; sessionId: string }) => {
            if (data.gameId === gameId) {
                setGameStarted(true);
                setSessionId(data.sessionId);
            }
        });

        // Handle error event
        channel.bind('error', (data: { message: string }) => {
            setError(data.message);
            setTimeout(() => setError(null), 5000);
        });

        // Join the room
        const joinRoom = async () => {
            try {
                await fetch('/api/room/join', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ gameId, userId }),
                });
            } catch (err) {
                console.error('Error joining room:', err);
            }
        };

        joinRoom();

        return () => {
            // Unsubscribe and leave the room when component unmounts
            pusher.unsubscribe(`game-${gameId}`);

            const leaveRoom = async () => {
                try {
                    await fetch('/api/room/leave', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ gameId, userId }),
                    });
                } catch (err) {
                    console.error('Error leaving room:', err);
                }
            };

            leaveRoom();
        };
    }, [pusher, isConnected, gameId, userId]);

    const startGame = async () => {
        if (!isHost) return;

        try {
            await fetch('/api/start-game', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ gameId, userId }),
            });
        } catch (err) {
            console.error('Error starting game:', err);
        }
    };

    const updateScore = async (score: number) => {
        if (!sessionId) return;

        try {
            await fetch('/api/update-score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ gameId, userId, sessionId, score }),
            });
        } catch (err) {
            console.error('Error updating score:', err);
        }
    };

    return {
        players,
        isHost,
        gameStarted,
        sessionId,
        error,
        startGame,
        updateScore,
    };
};

export const useScores = (gameId: string, sessionId: string | null) => {
    const { pusher, isConnected } = usePusher();
    const [scores, setScores] = useState<Record<string, number>>({});

    useEffect(() => {
        if (!isConnected || !gameId || !sessionId) return;

        // Subscribe to the scores channel
        const channel = pusher.subscribe(`scores-${gameId}-${sessionId}`);

        // Handle score update event
        channel.bind('score-update', (data: { gameId: string; sessionId: string; userId: string; score: number }) => {
            if (data.gameId === gameId && data.sessionId === sessionId) {
                setScores((prev) => ({
                    ...prev,
                    [data.userId]: data.score,
                }));
            }
        });

        return () => {
            // Unsubscribe when component unmounts
            pusher.unsubscribe(`scores-${gameId}-${sessionId}`);
        };
    }, [pusher, isConnected, gameId, sessionId]);

    return { scores };
}; 