import { io, Socket } from 'socket.io-client';
import { useEffect, useState } from 'react';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
    if (!socket) {
        socket = io({
            path: '/api/socket',
            autoConnect: true,
        });
    }
    return socket;
};

export const useSocket = () => {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socket = getSocket();

        const onConnect = () => {
            console.log('Socket connected');
            setIsConnected(true);
        };

        const onDisconnect = () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        if (socket.connected) {
            setIsConnected(true);
        }

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
        };
    }, []);

    return { socket: getSocket(), isConnected };
};

export const usePresence = () => {
    const { socket, isConnected } = useSocket();
    const [userCount, setUserCount] = useState(0);

    useEffect(() => {
        if (!isConnected) return;

        const handleUserCount = (data: { count: number }) => {
            setUserCount(data.count);
        };

        socket.on('userCount', handleUserCount);

        // Request current count
        socket.emit('presence');

        // Set up polling every 2s
        const interval = setInterval(() => {
            socket.emit('presence');
        }, 2000);

        return () => {
            socket.off('userCount', handleUserCount);
            clearInterval(interval);
        };
    }, [socket, isConnected]);

    return { userCount };
};

export const useRoom = (gameId: string, userId: string) => {
    const { socket, isConnected } = useSocket();
    const [players, setPlayers] = useState<Record<string, { joined_at: string; exited?: boolean }>>({});
    const [isHost, setIsHost] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isConnected || !gameId || !userId) return;

        const handlePlayersUpdate = (data: { gameId: string; players: Record<string, { joined_at: string; exited?: boolean }> }) => {
            if (data.gameId === gameId) {
                setPlayers(data.players);
            }
        };

        const handleBecomeHost = (data: { gameId: string }) => {
            if (data.gameId === gameId) {
                setIsHost(true);
            }
        };

        const handleRoomInfo = (data: { roomInfo: { host_uid: string } }) => {
            if (data.roomInfo?.host_uid === userId) {
                setIsHost(true);
            }
        };

        const handleGameStarted = (data: { gameId: string; sessionId: string }) => {
            if (data.gameId === gameId) {
                setGameStarted(true);
                setSessionId(data.sessionId);
            }
        };

        const handleError = (data: { message: string }) => {
            setError(data.message);
            setTimeout(() => setError(null), 5000);
        };

        socket.on('playersUpdate', handlePlayersUpdate);
        socket.on('becomeHost', handleBecomeHost);
        socket.on('roomInfo', handleRoomInfo);
        socket.on('gameStarted', handleGameStarted);
        socket.on('error', handleError);

        // Join the room
        socket.emit('joinRoom', { gameId, userId });

        return () => {
            socket.off('playersUpdate', handlePlayersUpdate);
            socket.off('becomeHost', handleBecomeHost);
            socket.off('roomInfo', handleRoomInfo);
            socket.off('gameStarted', handleGameStarted);
            socket.off('error', handleError);

            // Leave the room when component unmounts
            socket.emit('leaveRoom', { gameId, userId });
        };
    }, [socket, isConnected, gameId, userId]);

    const startGame = () => {
        if (!isHost) return;
        socket.emit('startGame', { gameId, userId });
    };

    const updateScore = (score: number) => {
        if (!sessionId) return;
        socket.emit('updateScore', { gameId, userId, sessionId, score });
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
    const { socket, isConnected } = useSocket();
    const [scores, setScores] = useState<Record<string, number>>({});

    useEffect(() => {
        if (!isConnected || !gameId || !sessionId) return;

        const handleScoreUpdate = (data: { gameId: string; sessionId: string; userId: string; score: number }) => {
            if (data.gameId === gameId && data.sessionId === sessionId) {
                setScores((prev) => ({
                    ...prev,
                    [data.userId]: data.score,
                }));
            }
        };

        socket.on('scoreUpdate', handleScoreUpdate);

        return () => {
            socket.off('scoreUpdate', handleScoreUpdate);
        };
    }, [socket, isConnected, gameId, sessionId]);

    return { scores };
}; 