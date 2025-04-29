'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Avatar,
    Button,
    Grid,
    TextField,
    CircularProgress,
    Divider,
    Alert,
    Breadcrumbs
} from '@mui/material';
import AuthCheck from '@/components/AuthCheck';
import Link from 'next/link';

export default function ProfilePage() {
    const { data: session, update } = useSession();
    const [displayName, setDisplayName] = useState(session?.user?.display_name || '');
    const [gameplayId, setGameplayId] = useState(session?.user?.gameplay_id || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate inputs
        if (gameplayId && !/^[a-zA-Z0-9]{3,16}$/.test(gameplayId)) {
            setError('Gameplay ID must be 3-16 characters and only contain letters and numbers');
            return;
        }

        if (!displayName.trim()) {
            setError('Display name cannot be empty');
            return;
        }

        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/user/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    display_name: displayName,
                    gameplay_id: gameplayId
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update profile');
            }

            // Update session
            await update({
                ...session,
                user: {
                    ...session?.user,
                    display_name: displayName,
                    gameplay_id: gameplayId,
                },
            });

            setSuccess('Profile updated successfully');
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthCheck>
            <Container maxWidth="md">
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
                    <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
                    <Typography color="text.primary">Profile</Typography>
                </Breadcrumbs>

                <Typography variant="h4" component="h1" gutterBottom>
                    My Profile
                </Typography>

                <Paper sx={{ p: 4, mb: 4 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 3 }}>
                            {success}
                        </Alert>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                        <Avatar
                            src={session?.user?.image || undefined}
                            alt={session?.user?.name || 'User'}
                            sx={{ width: 80, height: 80, mr: 3 }}
                        />
                        <Box>
                            <Typography variant="h5">{session?.user?.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {session?.user?.email}
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Box component="form" onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid size={12}>
                                <Typography variant="h6" gutterBottom>
                                    Account Information
                                </Typography>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Display Name"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    disabled={isSubmitting}
                                    helperText="The name shown to other players"
                                    required
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Gameplay ID"
                                    value={gameplayId}
                                    onChange={(e) => setGameplayId(e.target.value)}
                                    disabled={isSubmitting}
                                    helperText="3-16 characters, letters and numbers only"
                                    error={gameplayId ? !/^[a-zA-Z0-9]{3,16}$/.test(gameplayId) : false}
                                    InputProps={{
                                        startAdornment: '@',
                                    }}
                                    required
                                />
                            </Grid>

                            <Grid size={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        disabled={isSubmitting}
                                        startIcon={isSubmitting ? <CircularProgress size={20} /> : undefined}
                                    >
                                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            </Container>
        </AuthCheck>
    );
} 