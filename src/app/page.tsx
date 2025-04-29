'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Skeleton,
  Chip,
  Stack,
  useTheme
} from '@mui/material';
import { usePresence } from '@/lib/pusher';
import GameplayIdModal from '@/components/GameplayIdModal';
import Link from 'next/link';

interface Game {
  code: string;
  name: string;
  description: string;
}

// Mock game images (in a real app, these would be served from a CDN)
const gameImages: Record<string, string> = {
  ttt: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?q=80&w=500&auto=format&fit=crop',
  rps: 'https://images.unsplash.com/photo-1614032686163-bdc24c13d0b6?q=80&w=500&auto=format&fit=crop',
  quiz: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=500&auto=format&fit=crop',
  mem: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?q=80&w=500&auto=format&fit=crop',
};

export default function Home() {
  const theme = useTheme();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { userCount } = usePresence();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGameplayIdModal, setShowGameplayIdModal] = useState(false);

  useEffect(() => {
    // Check if the user needs to set a gameplay ID
    if (status === 'authenticated' && !session?.user?.gameplay_id) {
      setShowGameplayIdModal(true);
    }
  }, [status, session]);

  useEffect(() => {
    // Fetch games
    const fetchGames = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/games');

        if (!response.ok) {
          throw new Error('Failed to fetch games');
        }

        const data = await response.json();
        setGames(data.games);
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: theme.palette.mode === 'dark' ? 'customBackground.dark' : 'customBackground.light',
          color: 'text.primary',
          pt: 8,
          pb: 6,
          borderRadius: 2,
          mb: 6,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            component="h1"
            variant="h2"
            align="center"
            fontWeight="bold"
            gutterBottom
          >
            Farewell Shenanigans
          </Typography>
          <Typography variant="h5" align="center" paragraph>
            Join our multiplayer game platform and challenge friends in real-time
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            alignItems="center"
            mt={4}
          >
            {status === 'authenticated' ? (
              <Button variant="contained" size="large" component={Link} href="/games">
                Browse Games
              </Button>
            ) : (
              <Button variant="contained" size="large" onClick={() => signIn('google')}>
                Sign In to Play
              </Button>
            )}

            <Chip
              label={`${userCount} ${userCount === 1 ? 'player' : 'players'} online`}
              color="primary"
              variant="outlined"
            />
          </Stack>
        </Container>
      </Box>

      {/* Games Section */}
      <Container maxWidth="lg">
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          Featured Games
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          paragraph
          sx={{ mb: 4 }}
        >
          Challenge friends or random players in these multiplayer games
        </Typography>

        <Grid container spacing={4}>
          {loading
            ? Array.from(new Array(4)).map((_, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ height: '100%' }}>
                  <Skeleton variant="rectangular" height={140} />
                  <CardContent>
                    <Skeleton variant="text" height={40} />
                    <Skeleton variant="text" height={60} />
                  </CardContent>
                </Card>
              </Grid>
            ))
            : games.map((game) => (
              <Grid key={game.code} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardActionArea
                    component={Link}
                    href={`/games/${game.code}`}
                    sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                  >
                    <CardMedia
                      component="img"
                      height={140}
                      image={gameImages[game.code] || `https://source.unsplash.com/random/500x280/?game,${game.name}`}
                      alt={game.name}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h5" component="div">
                        {game.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {game.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
        </Grid>
      </Container>

      {/* Gameplay ID Modal */}
      <GameplayIdModal
        open={showGameplayIdModal}
        onClose={() => setShowGameplayIdModal(false)}
      />
    </>
  );
}
