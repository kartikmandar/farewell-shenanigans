'use client';

import { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Box,
    Menu,
    MenuItem,
    Avatar,
    Tooltip,
    Container,
    useMediaQuery,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { useThemeContext } from '@/theme/ThemeProvider';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
    const { mode, toggleColorMode } = useThemeContext();
    const { data: session } = useSession();
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // For user menu
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };
    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    // For mobile drawer
    const [drawerOpen, setDrawerOpen] = useState(false);
    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen);
    };

    const handleLogout = () => {
        handleCloseUserMenu();
        signOut();
    };

    const handleLogin = () => {
        signIn('google');
    };

    const handleProfile = () => {
        handleCloseUserMenu();
        router.push('/profile');
    };

    return (
        <AppBar position="static" elevation={0} color="transparent" sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.default
        }}>
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    {/* Logo - always visible */}
                    <Typography
                        variant="h4"
                        noWrap
                        component={Link}
                        href="/"
                        sx={{
                            mr: 2,
                            display: 'flex',
                            fontWeight: 700,
                            color: 'primary.main',
                            textDecoration: 'none',
                        }}
                    >
                        Farewell Shenanigans
                    </Typography>

                    {/* Mobile menu icon */}
                    {isMobile && (
                        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' }, justifyContent: 'flex-end' }}>
                            <IconButton
                                size="large"
                                aria-label="menu"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={toggleDrawer}
                                color="inherit"
                            >
                                <MenuIcon />
                            </IconButton>
                        </Box>
                    )}

                    {/* Desktop navigation */}
                    {!isMobile && (
                        <>
                            <Box sx={{ flexGrow: 1, display: 'flex' }}>
                                <Button
                                    component={Link}
                                    href="/"
                                    sx={{ color: 'text.primary', display: 'block', my: 2 }}
                                >
                                    Home
                                </Button>
                                <Button
                                    component={Link}
                                    href="/games"
                                    sx={{ color: 'text.primary', display: 'block', my: 2 }}
                                >
                                    Games
                                </Button>
                                {session && (
                                    <Button
                                        component={Link}
                                        href="/history"
                                        sx={{ color: 'text.primary', display: 'block', my: 2 }}
                                    >
                                        History
                                    </Button>
                                )}
                            </Box>

                            {/* Dark mode toggle button */}
                            <Box sx={{ mr: 2 }}>
                                <IconButton onClick={toggleColorMode} color="inherit">
                                    {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                                </IconButton>
                            </Box>

                            {/* User menu or login button */}
                            {session ? (
                                <Box sx={{ flexShrink: 0 }}>
                                    <Tooltip title="Open settings">
                                        <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                            <Avatar
                                                alt={session.user.name || 'User'}
                                                src={session.user.image || undefined}
                                                sx={{
                                                    bgcolor: 'primary.main',
                                                    width: 40,
                                                    height: 40
                                                }}
                                            >
                                                {!session.user.image && (session.user.name?.[0] || 'U')}
                                            </Avatar>
                                        </IconButton>
                                    </Tooltip>
                                    <Menu
                                        sx={{ mt: '45px' }}
                                        id="menu-appbar"
                                        anchorEl={anchorElUser}
                                        anchorOrigin={{
                                            vertical: 'top',
                                            horizontal: 'right',
                                        }}
                                        keepMounted
                                        transformOrigin={{
                                            vertical: 'top',
                                            horizontal: 'right',
                                        }}
                                        open={Boolean(anchorElUser)}
                                        onClose={handleCloseUserMenu}
                                    >
                                        <MenuItem onClick={handleProfile}>
                                            <ListItemIcon>
                                                <AccountCircleIcon fontSize="small" />
                                            </ListItemIcon>
                                            <Typography textAlign="center">Profile</Typography>
                                        </MenuItem>
                                        <MenuItem onClick={handleLogout}>
                                            <ListItemIcon>
                                                <LogoutIcon fontSize="small" />
                                            </ListItemIcon>
                                            <Typography textAlign="center">Logout</Typography>
                                        </MenuItem>
                                    </Menu>
                                </Box>
                            ) : (
                                <Button
                                    onClick={handleLogin}
                                    variant="contained"
                                    color="primary"
                                >
                                    Login
                                </Button>
                            )}
                        </>
                    )}
                </Toolbar>
            </Container>

            {/* Mobile drawer */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={toggleDrawer}
            >
                <Box
                    sx={{ width: 250 }}
                    role="presentation"
                    onClick={toggleDrawer}
                >
                    <List>
                        <ListItem disablePadding>
                            <ListItemButton component={Link} href="/">
                                <ListItemIcon>
                                    <HomeIcon />
                                </ListItemIcon>
                                <ListItemText primary="Home" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton component={Link} href="/games">
                                <ListItemIcon>
                                    <HomeIcon />
                                </ListItemIcon>
                                <ListItemText primary="Games" />
                            </ListItemButton>
                        </ListItem>
                        {session && (
                            <ListItem disablePadding>
                                <ListItemButton component={Link} href="/history">
                                    <ListItemIcon>
                                        <HomeIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="History" />
                                </ListItemButton>
                            </ListItem>
                        )}
                    </List>
                    <Divider />
                    <List>
                        <ListItem disablePadding>
                            <ListItemButton onClick={toggleColorMode}>
                                <ListItemIcon>
                                    {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                                </ListItemIcon>
                                <ListItemText primary={mode === 'dark' ? 'Light Mode' : 'Dark Mode'} />
                            </ListItemButton>
                        </ListItem>
                        {session ? (
                            <>
                                <ListItem disablePadding>
                                    <ListItemButton onClick={handleProfile}>
                                        <ListItemIcon>
                                            <AccountCircleIcon />
                                        </ListItemIcon>
                                        <ListItemText primary="Profile" />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemButton onClick={handleLogout}>
                                        <ListItemIcon>
                                            <LogoutIcon />
                                        </ListItemIcon>
                                        <ListItemText primary="Logout" />
                                    </ListItemButton>
                                </ListItem>
                            </>
                        ) : (
                            <ListItem disablePadding>
                                <ListItemButton onClick={handleLogin}>
                                    <ListItemIcon>
                                        <AccountCircleIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Login" />
                                </ListItemButton>
                            </ListItem>
                        )}
                    </List>
                </Box>
            </Drawer>
        </AppBar>
    );
} 