import { createTheme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

declare module '@mui/material/styles' {
    interface Palette {
        customBackground: {
            main: string;
            light: string;
            dark: string;
        };
    }
    interface PaletteOptions {
        customBackground?: {
            main?: string;
            light?: string;
            dark?: string;
        };
    }
}

const getDesignTokens = (mode: PaletteMode) => ({
    palette: {
        mode,
        ...(mode === 'light'
            ? {
                // Light mode colors
                primary: {
                    main: '#5048E5',
                    light: '#8F85F2',
                    dark: '#3832A0',
                },
                secondary: {
                    main: '#FF9800',
                    light: '#FFB547',
                    dark: '#C77700',
                },
                error: {
                    main: '#DC2626',
                },
                background: {
                    default: '#F9FAFB',
                    paper: '#FFFFFF',
                },
                text: {
                    primary: '#121828',
                    secondary: '#65748B',
                },
                customBackground: {
                    main: '#F9FAFB',
                    light: '#FFFFFF',
                    dark: '#F3F4F6',
                },
            }
            : {
                // Dark mode colors
                primary: {
                    main: '#6366F1',
                    light: '#818CF8',
                    dark: '#4F46E5',
                },
                secondary: {
                    main: '#F59E0B',
                    light: '#FBBF24',
                    dark: '#D97706',
                },
                error: {
                    main: '#EF4444',
                },
                background: {
                    default: '#0F172A',
                    paper: '#1E293B',
                },
                text: {
                    primary: '#EFF6FF',
                    secondary: '#94A3B8',
                },
                customBackground: {
                    main: '#0F172A',
                    light: '#1E293B',
                    dark: '#0B1222',
                },
            }),
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        button: {
            textTransform: 'none',
            fontWeight: 600,
        },
        h1: {
            fontWeight: 700,
            fontSize: '2.5rem',
        },
        h2: {
            fontWeight: 700,
            fontSize: '2rem',
        },
        h3: {
            fontWeight: 700,
            fontSize: '1.5rem',
        },
        h4: {
            fontWeight: 700,
            fontSize: '1.25rem',
        },
        h5: {
            fontWeight: 600,
            fontSize: '1.125rem',
        },
        h6: {
            fontWeight: 600,
            fontSize: '1rem',
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    fontWeight: 600,
                    boxShadow: 'none',
                    textTransform: 'none',
                    padding: '10px 16px',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
                containedPrimary: {
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: mode === 'light'
                        ? '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        : '0px 4px 6px -1px rgba(0, 0, 0, 0.2), 0px 2px 4px -1px rgba(0, 0, 0, 0.12)',
                    borderRadius: '12px',
                },
            },
        },
        MuiInputBase: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: mode === 'light'
                        ? '1px solid #E5E7EB'
                        : '1px solid rgba(255, 255, 255, 0.12)',
                },
            },
        },
    },
});

export const getTheme = (mode: PaletteMode) => {
    return createTheme(getDesignTokens(mode));
}; 