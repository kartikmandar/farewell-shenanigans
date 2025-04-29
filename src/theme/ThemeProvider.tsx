'use client';

import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider as MUIThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from './theme';
import { PaletteMode } from '@mui/material';

// Context and hook for theme management
type ThemeContextType = {
    mode: PaletteMode;
    toggleColorMode: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
    mode: 'light',
    toggleColorMode: () => { },
});

export const useThemeContext = () => useContext(ThemeContext);

// ThemeProvider component
export default function ThemeProvider({ children }: { children: ReactNode }) {
    // Use localStorage to persist theme preference
    const [mode, setMode] = useState<PaletteMode>('light');

    useEffect(() => {
        // Load saved theme preference
        const savedMode = localStorage.getItem('themeMode') as PaletteMode | null;

        if (savedMode) {
            setMode(savedMode);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            // If no saved preference, use system preference
            setMode('dark');
        }

        // Optional: Listen for system preference changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            if (!localStorage.getItem('themeMode')) {
                setMode(e.matches ? 'dark' : 'light');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Theme toggling function
    const toggleColorMode = () => {
        setMode((prevMode) => {
            const newMode = prevMode === 'light' ? 'dark' : 'light';
            localStorage.setItem('themeMode', newMode);
            return newMode;
        });
    };

    // Create theme based on current mode
    const theme = useMemo(() => getTheme(mode), [mode]);

    // Context value
    const contextValue = useMemo(() => ({
        mode,
        toggleColorMode,
    }), [mode]);

    return (
        <ThemeContext.Provider value={contextValue}>
            <MUIThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MUIThemeProvider>
        </ThemeContext.Provider>
    );
} 