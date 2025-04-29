import { sql } from '@vercel/postgres';
import Link from 'next/link';
import {
    Typography,
    Container,
    Grid,
    Card,
    CardContent,
    CardMedia,
    CardActionArea,
    Box,
    Breadcrumbs
} from '@mui/material';

// Game images mapping
const gameImages: Record<string, string> = {
    ttt: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?q=80&w=500&auto=format&fit=crop',
    rps: 'https://images.unsplash.com/photo-1614032686163-bdc24c13d0b6?q=80&w=500&auto=format&fit=crop',
    quiz: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=500&auto=format&fit=crop',
    mem: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?q=80&w=500&auto=format&fit=crop',
};

// This is a Server Component - runs on the server
export default async function GamesPage() {
    // Fetch games from database
    const { rows: games } = await sql`SELECT * FROM games ORDER BY name`;

    return (
        <Container maxWidth="lg">
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
                <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
                <Typography color="text.primary">Games</Typography>
            </Breadcrumbs>

            <Typography variant="h3" component="h1" gutterBottom>
                All Games
            </Typography>

            <Typography variant="body1" color="text.secondary" paragraph>
                Browse our collection of multiplayer games. Join a game room or create a new one.
            </Typography>

            <Box sx={{ my: 4 }}>
                <Grid container spacing={4}>
                    {games.map((game) => (
                        <Grid key={game.code} size={{ xs: 12, sm: 6, md: 4 }}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardActionArea
                                    component={Link}
                                    href={`/games/${game.code}`}
                                    sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                                >
                                    <CardMedia
                                        component="img"
                                        height={200}
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
            </Box>
        </Container>
    );
} 