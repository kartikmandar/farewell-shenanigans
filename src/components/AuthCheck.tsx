'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import GameplayIdModal from './GameplayIdModal';

type AuthCheckProps = {
    children: ReactNode;
    requireGameplayId?: boolean;
};

export default function AuthCheck({ children, requireGameplayId = true }: AuthCheckProps) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [showGameplayIdModal, setShowGameplayIdModal] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push(`/?callbackUrl=${encodeURIComponent(pathname)}`);
        }

        if (
            status === 'authenticated' &&
            requireGameplayId &&
            !session?.user?.gameplay_id
        ) {
            setShowGameplayIdModal(true);
        }
    }, [status, router, pathname, session, requireGameplayId]);

    // Loading state
    if (status === 'loading') {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '50vh',
                flexDirection: 'column',
                gap: 2
            }}>
                <CircularProgress />
                <Typography>Loading...</Typography>
            </Box>
        );
    }

    // Unauthenticated state - should redirect, but just in case
    if (status === 'unauthenticated') {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '50vh',
                flexDirection: 'column',
                gap: 2
            }}>
                <Typography variant="h5">You need to be logged in</Typography>
                <Button
                    variant="contained"
                    onClick={() => router.push(`/?callbackUrl=${encodeURIComponent(pathname)}`)}
                >
                    Go to Login
                </Button>
            </Box>
        );
    }

    // Authenticated but needs a gameplay ID
    if (requireGameplayId && !session?.user?.gameplay_id) {
        return (
            <>
                {children}
                <GameplayIdModal
                    open={showGameplayIdModal}
                    onClose={() => setShowGameplayIdModal(false)}
                />
            </>
        );
    }

    // Fully authenticated and has gameplay ID if required
    return <>{children}</>;
} 