'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    CircularProgress,
    Alert
} from '@mui/material';
import { useSession } from 'next-auth/react';

type GameplayIdModalProps = {
    open: boolean;
    onClose: () => void;
};

export default function GameplayIdModal({ open, onClose }: GameplayIdModalProps) {
    const { data: session, update } = useSession();
    const [gameplayId, setGameplayId] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!gameplayId.trim()) {
            setError('Please enter a gameplay ID');
            return;
        }

        // Validate gameplay ID (alphanumeric only, 3-16 chars)
        if (!/^[a-zA-Z0-9]{3,16}$/.test(gameplayId)) {
            setError('Gameplay ID must be 3-16 characters and only contain letters and numbers');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch('/api/user/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ gameplay_id: gameplayId }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update gameplay ID');
            }

            // Update session to reflect the changes
            await update({
                ...session,
                user: {
                    ...session?.user,
                    gameplay_id: gameplayId,
                },
            });

            onClose();
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={() => {
                if (!isSubmitting && session?.user?.gameplay_id) onClose();
            }}
            maxWidth="sm"
            fullWidth
            aria-labelledby="gameplay-id-dialog-title"
        >
            <DialogTitle id="gameplay-id-dialog-title">
                Set Your Gameplay ID
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 1, mb: 2 }}>
                    <Typography variant="body1" gutterBottom>
                        Choose a unique ID that will be displayed to other players during games.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        This ID will be visible on leaderboards and during multiplayer games.
                    </Typography>
                </Box>
                <TextField
                    autoFocus
                    margin="dense"
                    id="gameplay-id"
                    label="Gameplay ID"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={gameplayId}
                    onChange={(e) => setGameplayId(e.target.value)}
                    disabled={isSubmitting}
                    error={!!error}
                    helperText={error || 'Use 3-16 alphanumeric characters'}
                    InputProps={{
                        startAdornment: session?.user?.name ? `@` : undefined,
                    }}
                />
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                {session?.user?.gameplay_id && (
                    <Button onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                )}
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={20} /> : undefined}
                >
                    {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
            </DialogActions>
        </Dialog>
    );
} 