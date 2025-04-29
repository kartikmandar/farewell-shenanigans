'use client';

import { ReactNode } from 'react';
import { Box, Container } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import { SessionProvider } from 'next-auth/react';
import ThemeProvider from '@/theme/ThemeProvider';

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <ThemeProvider>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: '100vh',
                    }}
                >
                    <Navbar />
                    <Box
                        component="main"
                        sx={{
                            flex: '1 1 auto',
                            py: 4,
                        }}
                    >
                        <Container maxWidth="xl">{children}</Container>
                    </Box>
                    <Footer />
                </Box>
            </ThemeProvider>
        </SessionProvider>
    );
} 