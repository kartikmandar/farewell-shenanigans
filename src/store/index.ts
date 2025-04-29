import { create } from 'zustand';

interface GameState {
    activeRoom: string | null;
    isHost: boolean;
    players: Record<string, { joined_at: string; exited?: boolean }>;
    userCount: number;
    gameStarted: boolean;
    sessionId: string | null;
    setActiveRoom: (roomId: string | null) => void;
    setIsHost: (isHost: boolean) => void;
    setPlayers: (players: Record<string, { joined_at: string; exited?: boolean }>) => void;
    addPlayer: (playerId: string, playerData: { joined_at: string; exited?: boolean }) => void;
    updatePlayer: (playerId: string, playerData: Partial<{ joined_at: string; exited: boolean }>) => void;
    setUserCount: (count: number) => void;
    setGameStarted: (started: boolean) => void;
    setSessionId: (sessionId: string | null) => void;
}

export const useGameStore = create<GameState>((set) => ({
    activeRoom: null,
    isHost: false,
    players: {},
    userCount: 0,
    gameStarted: false,
    sessionId: null,
    setActiveRoom: (roomId) => set({ activeRoom: roomId }),
    setIsHost: (isHost) => set({ isHost }),
    setPlayers: (players) => set({ players }),
    addPlayer: (playerId, playerData) =>
        set((state) => ({
            players: { ...state.players, [playerId]: playerData }
        })),
    updatePlayer: (playerId, playerData) =>
        set((state) => ({
            players: {
                ...state.players,
                [playerId]: { ...state.players[playerId], ...playerData }
            }
        })),
    setUserCount: (count) => set({ userCount: count }),
    setGameStarted: (started) => set({ gameStarted: started }),
    setSessionId: (sessionId) => set({ sessionId }),
})); 