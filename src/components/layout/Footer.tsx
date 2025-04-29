'use client';

import { Box, Container, Typography, Link, Grid, useTheme } from '@mui/material';

export default function Footer() {
    const theme = useTheme();
    const currentYear = new Date().getFullYear();

    return (
        <Box
            component="footer"
            sx={{
                py: 4,
                mt: 'auto',
                borderTop: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={4} justifyContent="space-between">
                    <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                        <Typography variant="h6" color="text.primary" gutterBottom>
                            Farewell Shenanigans
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            A multiplayer game platform for casual gaming with friends.
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                        <Typography variant="h6" color="text.primary" gutterBottom>
                            Games
                        </Typography>
                        <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
                            <Box component="li" sx={{ py: 0.5 }}>
                                <Link href="/games/ttt" color="text.secondary" underline="hover">
                                    Tic Tac Toe
                                </Link>
                            </Box>
                            <Box component="li" sx={{ py: 0.5 }}>
                                <Link href="/games/rps" color="text.secondary" underline="hover">
                                    Rock Paper Scissors
                                </Link>
                            </Box>
                            <Box component="li" sx={{ py: 0.5 }}>
                                <Link href="/games/quiz" color="text.secondary" underline="hover">
                                    Quick Quiz
                                </Link>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                    sx={{ pt: 4, borderTop: `1px solid ${theme.palette.divider}`, mt: 4 }}
                >
                    {'© '}
                    {currentYear}
                    {' Farewell Shenanigans. All rights reserved.'}
                </Typography>
            </Container>
        </Box>
    );
} 