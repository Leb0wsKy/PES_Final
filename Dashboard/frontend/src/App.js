import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  Tab,
  Tabs,
  CircularProgress,
  Chip,
  Stack,
  Tooltip as MuiTooltip,
  CssBaseline,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  ElectricBolt,
  SolarPower,
  Dashboard as DashboardIcon,
  AccountCircle,
  Logout,
  LightMode,
  DarkMode,
  PrecisionManufacturing,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardProvider } from './context/DashboardContext';
import Login from './components/Login';
import Signup from './components/Signup';
import PrivateRoute from './components/PrivateRoute';
import NILMDashboard from './components/NILMDashboard';
import PVDashboard from './components/PVDashboard';
import OverviewDashboard from './components/OverviewDashboard';
import MachinesDashboard from './components/MachinesDashboard';
import ChatbotAssistant from './components/ChatbotAssistant';
import LandingPage from './components/LandingPage';
import './App.css';

function DashboardContent() {
  const { user, logout } = useAuth();
  const [selectedTab, setSelectedTab] = useState(0);
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState(() => localStorage.getItem('themeMode') || 'light');
  const [anchorEl, setAnchorEl] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState(0);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSettingsOpen = () => {
    setSettingsOpen(true);
    setAnchorEl(null);
  };

  const handleSettingsClose = () => {
    setSettingsOpen(false);
    setSettingsTab(0);
  };

  const handleSettingsTabChange = (event, newValue) => {
    setSettingsTab(newValue);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: { 
        main: mode === 'dark' ? '#4ade80' : '#10b981',
        light: '#86efac',
        dark: '#059669'
      },
      secondary: { 
        main: mode === 'dark' ? '#60a5fa' : '#3b82f6',
        light: '#93c5fd',
        dark: '#1d4ed8'
      },
      success: { main: '#10b981', light: '#6ee7b7', dark: '#047857' },
      info: { main: '#0ea5e9', light: '#7dd3fc', dark: '#0369a1' },
      warning: { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
      error: { main: '#ef4444', light: '#f87171', dark: '#dc2626' },
      background: {
        default: mode === 'dark' ? '#0f172a' : '#f8fafc',
        paper: mode === 'dark' ? '#1e293b' : '#ffffff'
      },
      text: {
        primary: mode === 'dark' ? '#f1f5f9' : '#0f172a',
        secondary: mode === 'dark' ? '#cbd5e1' : '#475569'
      }
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: {
        fontWeight: 700,
        letterSpacing: '-0.02em'
      },
      h5: {
        fontWeight: 600,
        letterSpacing: '-0.01em'
      },
      h6: {
        fontWeight: 600,
        letterSpacing: '-0.01em'
      },
      button: {
        textTransform: 'none',
        fontWeight: 600
      }
    },
    shape: { borderRadius: 16 },
    components: {
      MuiPaper: { 
        styleOverrides: { 
          root: { 
            backgroundImage: 'none',
            boxShadow: mode === 'dark' 
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            transition: 'all 0.3s ease'
          } 
        } 
      },
      MuiCard: { 
        styleOverrides: { 
          root: { 
            boxShadow: mode === 'dark'
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: mode === 'dark'
                ? '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)'
                : '0 10px 15px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.1)'
            }
          } 
        } 
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: '10px 24px',
            boxShadow: 'none',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: mode === 'dark'
                ? '0 4px 12px rgba(74, 222, 128, 0.3)'
                : '0 4px 12px rgba(16, 185, 129, 0.3)'
            }
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 8
          }
        }
      }
    }
  }), [mode]);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealthStatus(data);
      setLoading(false);
    } catch (error) {
      console.error('Health check failed:', error);
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const serviceChip = (name, svc) => {
    const status = svc?.status || 'offline';
    const colorKey = status === 'healthy' ? 'success' : status === 'degraded' ? 'warning' : 'error';
    const icon = name.toLowerCase() === 'nilm' ? <ElectricBolt sx={{ fontSize: 16 }} /> : <SolarPower sx={{ fontSize: 16 }} />;
    const palette = theme.palette;
    const tone = palette[colorKey].main;
    return (
      <Chip
        icon={icon}
        label={`${name} · ${status}`}
        variant="outlined"
        size="small"
        sx={{
          px: 0.5,
          fontWeight: 600,
          letterSpacing: '-0.5px',
          background: `linear-gradient(135deg, ${tone}22, ${tone}11)`,
          border: `1px solid ${tone}66`,
          color: palette.mode === 'dark' ? palette[colorKey].light : palette[colorKey].dark,
          backdropFilter: 'blur(6px)',
          boxShadow: `0 0 0 2px ${tone}0a, 0 4px 10px -2px ${tone}33`,
          transition: 'all .3s ease',
          '&:hover': {
            background: `linear-gradient(135deg, ${tone}33, ${tone}22)`,
            boxShadow: `0 0 0 2px ${tone}22, 0 6px 14px -2px ${tone}55`,
            transform: 'translateY(-2px)'
          },
          '& .MuiChip-icon': {
            color: tone
          }
        }}
      />
    );
  };

  const toggleMode = () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    localStorage.setItem('themeMode', next);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        flexGrow: 1, 
        minHeight: '100vh', 
        bgcolor: 'background.default',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: mode === 'dark'
            ? 'radial-gradient(circle at 20% 50%, rgba(74, 222, 128, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 50%), radial-gradient(circle at 40% 20%, rgba(168, 85, 247, 0.03) 0%, transparent 50%)'
            : 'radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.06) 0%, transparent 50%), radial-gradient(circle at 40% 20%, rgba(168, 85, 247, 0.04) 0%, transparent 50%)',
          animation: 'gradientShift 15s ease infinite',
          zIndex: 0
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: mode === 'dark'
            ? 'radial-gradient(circle, rgba(74, 222, 128, 0.02) 1px, transparent 1px)'
            : 'radial-gradient(circle, rgba(16, 185, 129, 0.03) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          animation: 'particles 60s linear infinite',
          zIndex: 0
        },
        '@keyframes gradientShift': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' }
        },
        '@keyframes particles': {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(50px, 50px)' }
        }
      }}>
        {/* Neon Lines Background */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          opacity: 0.7
        }}>
          {/* Horizontal moving lines */}
          <Box sx={{
            position: 'absolute',
            width: '100%',
            height: '2px',
            top: '20%',
            background: mode === 'dark'
              ? 'linear-gradient(90deg, transparent, rgba(74, 222, 128, 0.6), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.4), transparent)',
            boxShadow: mode === 'dark'
              ? '0 0 20px rgba(74, 222, 128, 0.5), 0 0 40px rgba(74, 222, 128, 0.3)'
              : '0 0 20px rgba(16, 185, 129, 0.4), 0 0 40px rgba(16, 185, 129, 0.2)',
            animation: 'moveRight 8s linear infinite',
            '@keyframes moveRight': {
              '0%': { transform: 'translateX(-100%)' },
              '100%': { transform: 'translateX(100%)' }
            }
          }} />
          <Box sx={{
            position: 'absolute',
            width: '100%',
            height: '2px',
            top: '45%',
            background: mode === 'dark'
              ? 'linear-gradient(90deg, transparent, rgba(52, 211, 153, 0.5), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.35), transparent)',
            boxShadow: mode === 'dark'
              ? '0 0 20px rgba(52, 211, 153, 0.4), 0 0 40px rgba(52, 211, 153, 0.2)'
              : '0 0 20px rgba(16, 185, 129, 0.3), 0 0 40px rgba(16, 185, 129, 0.15)',
            animation: 'moveLeft 10s linear infinite',
            '@keyframes moveLeft': {
              '0%': { transform: 'translateX(100%)' },
              '100%': { transform: 'translateX(-100%)' }
            }
          }} />
          <Box sx={{
            position: 'absolute',
            width: '100%',
            height: '2px',
            top: '70%',
            background: mode === 'dark'
              ? 'linear-gradient(90deg, transparent, rgba(74, 222, 128, 0.4), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.3), transparent)',
            boxShadow: mode === 'dark'
              ? '0 0 20px rgba(74, 222, 128, 0.3), 0 0 40px rgba(74, 222, 128, 0.2)'
              : '0 0 20px rgba(16, 185, 129, 0.25), 0 0 40px rgba(16, 185, 129, 0.1)',
            animation: 'moveRight 12s linear infinite',
            animationDelay: '2s'
          }} />
          
          {/* Vertical moving lines */}
          <Box sx={{
            position: 'absolute',
            width: '2px',
            height: '100%',
            left: '15%',
            background: mode === 'dark'
              ? 'linear-gradient(180deg, transparent, rgba(74, 222, 128, 0.5), transparent)'
              : 'linear-gradient(180deg, transparent, rgba(16, 185, 129, 0.35), transparent)',
            boxShadow: mode === 'dark'
              ? '0 0 20px rgba(74, 222, 128, 0.4), 0 0 40px rgba(74, 222, 128, 0.2)'
              : '0 0 20px rgba(16, 185, 129, 0.3), 0 0 40px rgba(16, 185, 129, 0.15)',
            animation: 'moveDown 9s linear infinite',
            '@keyframes moveDown': {
              '0%': { transform: 'translateY(-100%)' },
              '100%': { transform: 'translateY(100%)' }
            }
          }} />
          <Box sx={{
            position: 'absolute',
            width: '2px',
            height: '100%',
            left: '60%',
            background: mode === 'dark'
              ? 'linear-gradient(180deg, transparent, rgba(52, 211, 153, 0.4), transparent)'
              : 'linear-gradient(180deg, transparent, rgba(16, 185, 129, 0.3), transparent)',
            boxShadow: mode === 'dark'
              ? '0 0 20px rgba(52, 211, 153, 0.3), 0 0 40px rgba(52, 211, 153, 0.15)'
              : '0 0 20px rgba(16, 185, 129, 0.25), 0 0 40px rgba(16, 185, 129, 0.1)',
            animation: 'moveUp 11s linear infinite',
            '@keyframes moveUp': {
              '0%': { transform: 'translateY(100%)' },
              '100%': { transform: 'translateY(-100%)' }
            }
          }} />
          <Box sx={{
            position: 'absolute',
            width: '2px',
            height: '100%',
            left: '85%',
            background: mode === 'dark'
              ? 'linear-gradient(180deg, transparent, rgba(74, 222, 128, 0.35), transparent)'
              : 'linear-gradient(180deg, transparent, rgba(16, 185, 129, 0.25), transparent)',
            boxShadow: mode === 'dark'
              ? '0 0 20px rgba(74, 222, 128, 0.25), 0 0 40px rgba(74, 222, 128, 0.12)'
              : '0 0 20px rgba(16, 185, 129, 0.2), 0 0 40px rgba(16, 185, 129, 0.08)',
            animation: 'moveDown 13s linear infinite',
            animationDelay: '3s'
          }} />
          
          {/* Diagonal moving lines */}
          <Box sx={{
            position: 'absolute',
            width: '150%',
            height: '2px',
            top: '30%',
            left: '-25%',
            background: mode === 'dark'
              ? 'linear-gradient(90deg, transparent, rgba(74, 222, 128, 0.3), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.25), transparent)',
            boxShadow: mode === 'dark'
              ? '0 0 15px rgba(74, 222, 128, 0.3)'
              : '0 0 15px rgba(16, 185, 129, 0.2)',
            transform: 'rotate(15deg)',
            animation: 'moveDiagonal1 14s linear infinite',
            '@keyframes moveDiagonal1': {
              '0%': { transform: 'rotate(15deg) translateX(-100%)' },
              '100%': { transform: 'rotate(15deg) translateX(100%)' }
            }
          }} />
          <Box sx={{
            position: 'absolute',
            width: '150%',
            height: '2px',
            top: '60%',
            left: '-25%',
            background: mode === 'dark'
              ? 'linear-gradient(90deg, transparent, rgba(52, 211, 153, 0.25), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.2), transparent)',
            boxShadow: mode === 'dark'
              ? '0 0 15px rgba(52, 211, 153, 0.25)'
              : '0 0 15px rgba(16, 185, 129, 0.15)',
            transform: 'rotate(-12deg)',
            animation: 'moveDiagonal2 16s linear infinite',
            '@keyframes moveDiagonal2': {
              '0%': { transform: 'rotate(-12deg) translateX(100%)' },
              '100%': { transform: 'rotate(-12deg) translateX(-100%)' }
            }
          }} />
        </Box>
        
        <AppBar position="static" elevation={0} sx={{
          background: mode === 'dark'
            ? 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)'
            : 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 50%, #6ee7b7 100%)',
          backdropFilter: 'blur(20px)',
          boxShadow: 'none',
          borderBottom: `2px solid ${mode === 'dark' ? 'rgba(74, 222, 128, 0.4)' : 'rgba(16, 185, 129, 0.5)'}`,
          position: 'relative',
          zIndex: 10,
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -2,
            left: 0,
            right: 0,
            height: '2px',
            background: mode === 'dark'
              ? 'linear-gradient(90deg, transparent, rgba(74, 222, 128, 0.6), rgba(59, 130, 246, 0.6), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.6), rgba(59, 130, 246, 0.6), transparent)',
            animation: 'glow 3s ease-in-out infinite',
            '@keyframes glow': {
              '0%, 100%': { opacity: 0.5 },
              '50%': { opacity: 1 }
            }
          }
        }}>
        <Toolbar sx={{ py: 2, minHeight: '80px !important' }}>
          {/* Left: Logo and Title */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: '16px',
              background: mode === 'dark'
                ? 'linear-gradient(135deg, rgba(74, 222, 128, 0.15), rgba(59, 130, 246, 0.15))'
                : 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1))',
              border: `2px solid ${mode === 'dark' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
              boxShadow: mode === 'dark'
                ? '0 0 20px rgba(74, 222, 128, 0.2), inset 0 0 20px rgba(74, 222, 128, 0.1)'
                : '0 0 20px rgba(16, 185, 129, 0.15), inset 0 0 20px rgba(16, 185, 129, 0.05)',
              animation: 'iconPulse 2s ease-in-out infinite',
              '@keyframes iconPulse': {
                '0%, 100%': { transform: 'scale(1)', boxShadow: mode === 'dark' ? '0 0 20px rgba(74, 222, 128, 0.2)' : '0 0 20px rgba(16, 185, 129, 0.15)' },
                '50%': { transform: 'scale(1.05)', boxShadow: mode === 'dark' ? '0 0 30px rgba(74, 222, 128, 0.4)' : '0 0 30px rgba(16, 185, 129, 0.3)' }
              }
            }}>
              <Box
                component="img"
                src="/logo.png"
                alt="PowerPulse Logo"
                sx={{ width: 40, height: 40, objectFit: 'contain' }}
              />
            </Box>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="h5" component="div" sx={{ 
                fontWeight: 800,
                background: mode === 'dark'
                  ? 'linear-gradient(135deg, #4ade80 0%, #60a5fa 100%)'
                  : 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.03em',
                lineHeight: 1.2,
                mb: 0.5
              }}>
                PowerPulse
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'text.secondary',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                fontSize: '0.7rem'
              }}>
                Real-Time Energy Monitoring & Fault Detection
              </Typography>
            </Box>
          </Box>

          {/* Center: Navigation Tabs */}
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', px: 2 }}>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              textColor="inherit"
              TabIndicatorProps={{
                style: {
                  backgroundColor: mode === 'dark' ? '#4ade80' : '#10b981',
                  height: 3,
                  borderRadius: '3px 3px 0 0'
                }
              }}
              sx={{ 
                minHeight: 48,
                '& .MuiTab-root': {
                  color: mode === 'dark' ? 'rgba(241, 245, 249, 0.7)' : 'rgba(15, 23, 42, 0.7)',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  minHeight: 48,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: mode === 'dark' ? '#4ade80' : '#10b981',
                    transform: 'translateY(-2px)'
                  },
                  '&.Mui-selected': {
                    color: mode === 'dark' ? '#4ade80' : '#10b981'
                  }
                }
              }}
            >
              <Tab 
                icon={<DashboardIcon />} 
                label="Overview" 
                iconPosition="start"
              />
              <Tab 
                icon={<PrecisionManufacturing />} 
                label="Machines" 
                iconPosition="start"
              />
              <Tab 
                icon={<ElectricBolt />} 
                label="NILM" 
                iconPosition="start"
              />
              <Tab 
                icon={<SolarPower />} 
                label="PV Monitoring" 
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {/* Right: Health Status and User Menu */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            pr: 1,
            pl: 2,
            py: 1.2,
            borderRadius: 20,
            position: 'relative',
            background: mode === 'dark'
              ? 'linear-gradient(135deg, rgba(15,23,42,0.55), rgba(30,41,59,0.55))'
              : 'linear-gradient(135deg, rgba(255,255,255,0.75), rgba(240,253,244,0.75))',
            backdropFilter: 'blur(14px)',
            boxShadow: mode === 'dark'
              ? '0 4px 18px -4px rgba(74,222,128,0.25)'
              : '0 4px 18px -4px rgba(16,185,129,0.20)',
            border: mode === 'dark'
              ? '1px solid rgba(74,222,128,0.25)'
              : '1px solid rgba(16,185,129,0.25)',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: 20,
              padding: '1px',
              background: mode === 'dark'
                ? 'linear-gradient(135deg, rgba(74,222,128,0.5), rgba(59,130,246,0.4))'
                : 'linear-gradient(135deg, rgba(16,185,129,0.5), rgba(59,130,246,0.4))',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              pointerEvents: 'none'
            }
          }}>
            {healthStatus && (
              <Stack direction="row" spacing={1}>
                {serviceChip('NILM', healthStatus.services?.nilm)}
                {serviceChip('PV', healthStatus.services?.pv)}
              </Stack>
            )}
            <Chip
              icon={<AccountCircle />}
              label={user?.name || 'User'}
              onClick={handleMenuOpen}
              sx={{
                cursor: 'pointer',
                fontWeight: 600,
                background: mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(30,41,59,0.8), rgba(51,65,85,0.8))'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(240,253,244,0.95))',
                border: mode === 'dark'
                  ? '1px solid rgba(74,222,128,0.3)'
                  : '1px solid rgba(16,185,129,0.3)',
                boxShadow: mode === 'dark'
                  ? '0 2px 10px -2px rgba(74,222,128,0.3)'
                  : '0 2px 10px -2px rgba(16,185,129,0.25)',
                transition: 'all .3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: mode === 'dark'
                    ? '0 4px 14px -2px rgba(74,222,128,0.4)'
                    : '0 4px 14px -2px rgba(16,185,129,0.35)'
                }
              }}
            />
            <MuiTooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
              <IconButton
                onClick={toggleMode}
                size="small"
                sx={{
                  ml: 0.5,
                  background: mode === 'dark'
                    ? 'linear-gradient(135deg, rgba(74,222,128,0.15), rgba(59,130,246,0.15))'
                    : 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(59,130,246,0.15))',
                  border: mode === 'dark'
                    ? '1px solid rgba(74,222,128,0.35)'
                    : '1px solid rgba(16,185,129,0.35)',
                  boxShadow: mode === 'dark'
                    ? '0 0 0 2px rgba(74,222,128,0.15), 0 4px 10px -2px rgba(74,222,128,0.3)'
                    : '0 0 0 2px rgba(16,185,129,0.15), 0 4px 10px -2px rgba(16,185,129,0.25)',
                  transition: 'all .3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px) rotate(6deg)',
                    boxShadow: mode === 'dark'
                      ? '0 0 0 2px rgba(74,222,128,0.25), 0 6px 14px -2px rgba(74,222,128,0.4)'
                      : '0 0 0 2px rgba(16,185,129,0.25), 0 6px 14px -2px rgba(16,185,129,0.35)'
                  }
                }}
              >
                {mode === 'dark' ? <LightMode sx={{ color: '#4ade80' }} /> : <DarkMode sx={{ color: '#059669' }} />}
              </IconButton>
            </MuiTooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem disabled>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {user?.email}
                </Typography>
              </MenuItem>
              <MenuItem onClick={handleSettingsOpen}>
                <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
                Settings
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Logout fontSize="small" sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>

            {/* Settings Dialog */}
            <Dialog
              open={settingsOpen}
              onClose={handleSettingsClose}
              maxWidth="md"
              fullWidth
              PaperProps={{
                sx: {
                  borderRadius: 4,
                  background: mode === 'dark'
                    ? 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.95))'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(249,250,251,0.95))',
                  backdropFilter: 'blur(24px)',
                  border: mode === 'dark'
                    ? '1px solid rgba(74,222,128,0.3)'
                    : '1px solid rgba(16,185,129,0.3)',
                  boxShadow: mode === 'dark'
                    ? '0 20px 60px -10px rgba(74,222,128,0.25), 0 0 0 1px rgba(74,222,128,0.1) inset'
                    : '0 20px 60px -10px rgba(16,185,129,0.2), 0 0 0 1px rgba(16,185,129,0.1) inset',
                  overflow: 'hidden',
                  position: 'relative'
                }
              }}
              BackdropProps={{
                sx: {
                  backdropFilter: 'blur(8px)',
                  background: mode === 'dark'
                    ? 'rgba(0,0,0,0.7)'
                    : 'rgba(0,0,0,0.4)'
                }
              }}
            >
              <DialogTitle sx={{ 
                pb: 2,
                pt: 3,
                px: 3,
                background: mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(74,222,128,0.08), rgba(96,165,250,0.08))'
                  : 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(59,130,246,0.08))',
                borderBottom: mode === 'dark'
                  ? '1px solid rgba(74,222,128,0.2)'
                  : '1px solid rgba(16,185,129,0.2)',
                position: 'relative'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <SettingsIcon sx={{ 
                      fontSize: 28,
                      color: mode === 'dark' ? '#4ade80' : '#10b981',
                      filter: 'drop-shadow(0 2px 4px rgba(74,222,128,0.3))'
                    }} />
                    <Typography variant="h5" sx={{ 
                      fontWeight: 700,
                      background: mode === 'dark'
                        ? 'linear-gradient(135deg, #4ade80, #60a5fa)'
                        : 'linear-gradient(135deg, #10b981, #3b82f6)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      letterSpacing: '-0.5px'
                    }}>
                      Settings
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={handleSettingsClose}
                    size="small"
                    sx={{
                      color: mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                      '&:hover': {
                        background: mode === 'dark'
                          ? 'rgba(74,222,128,0.15)'
                          : 'rgba(16,185,129,0.15)',
                        color: mode === 'dark' ? '#4ade80' : '#10b981'
                      }
                    }}
                  >
                    <Box component="span" sx={{ fontSize: 24, fontWeight: 300 }}>×</Box>
                  </IconButton>
                </Box>
              </DialogTitle>
              <Box sx={{ 
                borderBottom: mode === 'dark'
                  ? '1px solid rgba(74,222,128,0.15)'
                  : '1px solid rgba(16,185,129,0.15)',
                px: 3,
                background: mode === 'dark'
                  ? 'rgba(15,23,42,0.3)'
                  : 'rgba(249,250,251,0.5)'
              }}>
                <Tabs 
                  value={settingsTab} 
                  onChange={handleSettingsTabChange}
                  TabIndicatorProps={{
                    sx: {
                      height: 3,
                      borderRadius: '3px 3px 0 0',
                      background: mode === 'dark'
                        ? 'linear-gradient(90deg, #4ade80, #60a5fa)'
                        : 'linear-gradient(90deg, #10b981, #3b82f6)',
                      boxShadow: mode === 'dark'
                        ? '0 -2px 8px rgba(74,222,128,0.4)'
                        : '0 -2px 8px rgba(16,185,129,0.3)'
                    }
                  }}
                  sx={{
                    minHeight: 54,
                    '& .MuiTab-root': {
                      minHeight: 54,
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      textTransform: 'none',
                      color: mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                      transition: 'all 0.3s ease',
                      '&.Mui-selected': {
                        color: mode === 'dark' ? '#4ade80' : '#10b981',
                        fontWeight: 700
                      },
                      '&:hover': {
                        color: mode === 'dark' ? 'rgba(74,222,128,0.8)' : 'rgba(16,185,129,0.8)',
                        background: mode === 'dark'
                          ? 'rgba(74,222,128,0.05)'
                          : 'rgba(16,185,129,0.05)'
                      }
                    }
                  }}
                >
                  <Tab label="Profile Settings" />
                  <Tab label="Machines Settings" />
                  <Tab label="Plans" />
                </Tabs>
              </Box>
              <DialogContent sx={{ 
                pt: 4, 
                pb: 4, 
                px: 4,
                background: mode === 'dark'
                  ? 'rgba(15,23,42,0.2)'
                  : 'rgba(255,255,255,0.3)'
              }}>
                {/* Profile Settings Tab */}
                {settingsTab === 0 && (
                  <Box>
                    <Typography variant="h6" sx={{ 
                      mb: 3, 
                      fontWeight: 700,
                      color: mode === 'dark' ? '#fff' : '#1f2937',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      Profile Information
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Full Name"
                          defaultValue={user?.name || ''}
                          variant="outlined"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              background: mode === 'dark'
                                ? 'rgba(30,41,59,0.5)'
                                : 'rgba(255,255,255,0.8)',
                              '& fieldset': {
                                borderColor: mode === 'dark'
                                  ? 'rgba(74,222,128,0.2)'
                                  : 'rgba(16,185,129,0.2)',
                                borderWidth: 1.5
                              },
                              '&:hover fieldset': {
                                borderColor: mode === 'dark'
                                  ? 'rgba(74,222,128,0.4)'
                                  : 'rgba(16,185,129,0.4)'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: mode === 'dark' ? '#4ade80' : '#10b981',
                                borderWidth: 2
                              }
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: mode === 'dark' ? '#4ade80' : '#10b981'
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          defaultValue={user?.email || ''}
                          variant="outlined"
                          disabled
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              background: mode === 'dark'
                                ? 'rgba(30,41,59,0.3)'
                                : 'rgba(249,250,251,0.8)',
                              '& fieldset': {
                                borderColor: mode === 'dark'
                                  ? 'rgba(74,222,128,0.15)'
                                  : 'rgba(16,185,129,0.15)'
                              }
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          placeholder="+1 (555) 000-0000"
                          variant="outlined"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              background: mode === 'dark'
                                ? 'rgba(30,41,59,0.5)'
                                : 'rgba(255,255,255,0.8)',
                              '& fieldset': {
                                borderColor: mode === 'dark'
                                  ? 'rgba(74,222,128,0.2)'
                                  : 'rgba(16,185,129,0.2)',
                                borderWidth: 1.5
                              },
                              '&:hover fieldset': {
                                borderColor: mode === 'dark'
                                  ? 'rgba(74,222,128,0.4)'
                                  : 'rgba(16,185,129,0.4)'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: mode === 'dark' ? '#4ade80' : '#10b981',
                                borderWidth: 2
                              }
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: mode === 'dark' ? '#4ade80' : '#10b981'
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Company"
                          placeholder="Your Company Name"
                          variant="outlined"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              background: mode === 'dark'
                                ? 'rgba(30,41,59,0.5)'
                                : 'rgba(255,255,255,0.8)',
                              '& fieldset': {
                                borderColor: mode === 'dark'
                                  ? 'rgba(74,222,128,0.2)'
                                  : 'rgba(16,185,129,0.2)',
                                borderWidth: 1.5
                              },
                              '&:hover fieldset': {
                                borderColor: mode === 'dark'
                                  ? 'rgba(74,222,128,0.4)'
                                  : 'rgba(16,185,129,0.4)'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: mode === 'dark' ? '#4ade80' : '#10b981',
                                borderWidth: 2
                              }
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: mode === 'dark' ? '#4ade80' : '#10b981'
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Divider sx={{ 
                          my: 2,
                          borderColor: mode === 'dark'
                            ? 'rgba(74,222,128,0.15)'
                            : 'rgba(16,185,129,0.15)'
                        }} />
                        <Typography variant="h6" sx={{ 
                          mb: 3, 
                          fontWeight: 700,
                          color: mode === 'dark' ? '#fff' : '#1f2937'
                        }}>
                          Notification Preferences
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch 
                              defaultChecked 
                              sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                  color: mode === 'dark' ? '#4ade80' : '#10b981'
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                  backgroundColor: mode === 'dark' ? '#4ade80' : '#10b981'
                                }
                              }}
                            />
                          }
                          label="Email notifications for alerts"
                          sx={{
                            '& .MuiFormControlLabel-label': {
                              fontSize: '0.95rem',
                              fontWeight: 500,
                              color: mode === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)'
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch 
                              defaultChecked 
                              sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                  color: mode === 'dark' ? '#4ade80' : '#10b981'
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                  backgroundColor: mode === 'dark' ? '#4ade80' : '#10b981'
                                }
                              }}
                            />
                          }
                          label="SMS notifications for critical issues"
                          sx={{
                            '& .MuiFormControlLabel-label': {
                              fontSize: '0.95rem',
                              fontWeight: 500,
                              color: mode === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)'
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch 
                              sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                  color: mode === 'dark' ? '#4ade80' : '#10b981'
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                  backgroundColor: mode === 'dark' ? '#4ade80' : '#10b981'
                                }
                              }}
                            />
                          }
                          label="Weekly performance reports"
                          sx={{
                            '& .MuiFormControlLabel-label': {
                              fontSize: '0.95rem',
                              fontWeight: 500,
                              color: mode === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)'
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sx={{ mt: 2 }}>
                        <Button
                          variant="contained"
                          size="large"
                          sx={{
                            background: mode === 'dark'
                              ? 'linear-gradient(135deg, #4ade80, #60a5fa)'
                              : 'linear-gradient(135deg, #10b981, #3b82f6)',
                            color: '#fff',
                            fontWeight: 700,
                            px: 5,
                            py: 1.5,
                            borderRadius: 2.5,
                            textTransform: 'none',
                            fontSize: '1rem',
                            boxShadow: mode === 'dark'
                              ? '0 8px 24px -6px rgba(74,222,128,0.4)'
                              : '0 8px 24px -6px rgba(16,185,129,0.35)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-3px)',
                              boxShadow: mode === 'dark'
                                ? '0 12px 32px -6px rgba(74,222,128,0.5)'
                                : '0 12px 32px -6px rgba(16,185,129,0.45)'
                            }
                          }}
                        >
                          Save Changes
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Machines Settings Tab */}
                {settingsTab === 1 && (
                  <Box>
                    <Typography variant="h6" sx={{ 
                      mb: 3, 
                      fontWeight: 700,
                      color: mode === 'dark' ? '#fff' : '#1f2937'
                    }}>
                      Machine Management
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Card sx={{ 
                          background: mode === 'dark'
                            ? 'linear-gradient(135deg, rgba(30,41,59,0.6), rgba(51,65,85,0.6))'
                            : 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(249,250,251,0.8))',
                          border: mode === 'dark'
                            ? '1.5px solid rgba(74,222,128,0.25)'
                            : '1.5px solid rgba(16,185,129,0.25)',
                          borderRadius: 3,
                          boxShadow: mode === 'dark'
                            ? '0 8px 24px -6px rgba(74,222,128,0.2)'
                            : '0 8px 24px -6px rgba(16,185,129,0.15)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: mode === 'dark'
                              ? '0 12px 32px -6px rgba(74,222,128,0.3)'
                              : '0 12px 32px -6px rgba(16,185,129,0.25)'
                          }
                        }}>
                          <CardContent sx={{ p: 3 }}>
                            <Typography variant="subtitle1" sx={{ 
                              fontWeight: 700, 
                              mb: 3,
                              color: mode === 'dark' ? '#4ade80' : '#10b981',
                              fontSize: '1.05rem'
                            }}>
                              Default Alert Thresholds
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Power Consumption Warning (%)"
                                  type="number"
                                  defaultValue="85"
                                  variant="outlined"
                                  size="small"
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 2,
                                      background: mode === 'dark'
                                        ? 'rgba(15,23,42,0.5)'
                                        : 'rgba(255,255,255,0.9)',
                                      '& fieldset': {
                                        borderColor: mode === 'dark'
                                          ? 'rgba(74,222,128,0.2)'
                                          : 'rgba(16,185,129,0.2)',
                                        borderWidth: 1.5
                                      },
                                      '&:hover fieldset': {
                                        borderColor: mode === 'dark'
                                          ? 'rgba(74,222,128,0.4)'
                                          : 'rgba(16,185,129,0.4)'
                                      },
                                      '&.Mui-focused fieldset': {
                                        borderColor: mode === 'dark' ? '#4ade80' : '#10b981',
                                        borderWidth: 2
                                      }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                      color: mode === 'dark' ? '#4ade80' : '#10b981'
                                    }
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Efficiency Warning (%)"
                                  type="number"
                                  defaultValue="70"
                                  variant="outlined"
                                  size="small"
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 2,
                                      background: mode === 'dark'
                                        ? 'rgba(15,23,42,0.5)'
                                        : 'rgba(255,255,255,0.9)',
                                      '& fieldset': {
                                        borderColor: mode === 'dark'
                                          ? 'rgba(74,222,128,0.2)'
                                          : 'rgba(16,185,129,0.2)',
                                        borderWidth: 1.5
                                      },
                                      '&:hover fieldset': {
                                        borderColor: mode === 'dark'
                                          ? 'rgba(74,222,128,0.4)'
                                          : 'rgba(16,185,129,0.4)'
                                      },
                                      '&.Mui-focused fieldset': {
                                        borderColor: mode === 'dark' ? '#4ade80' : '#10b981',
                                        borderWidth: 2
                                      }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                      color: mode === 'dark' ? '#4ade80' : '#10b981'
                                    }
                                  }}
                                />
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12}>
                        <Card sx={{ 
                          background: mode === 'dark'
                            ? 'linear-gradient(135deg, rgba(30,41,59,0.6), rgba(51,65,85,0.6))'
                            : 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(249,250,251,0.8))',
                          border: mode === 'dark'
                            ? '1.5px solid rgba(74,222,128,0.25)'
                            : '1.5px solid rgba(16,185,129,0.25)',
                          borderRadius: 3,
                          boxShadow: mode === 'dark'
                            ? '0 8px 24px -6px rgba(74,222,128,0.2)'
                            : '0 8px 24px -6px rgba(16,185,129,0.15)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: mode === 'dark'
                              ? '0 12px 32px -6px rgba(74,222,128,0.3)'
                              : '0 12px 32px -6px rgba(16,185,129,0.25)'
                          }
                        }}>
                          <CardContent sx={{ p: 3 }}>
                            <Typography variant="subtitle1" sx={{ 
                              fontWeight: 700, 
                              mb: 3,
                              color: mode === 'dark' ? '#4ade80' : '#10b981',
                              fontSize: '1.05rem'
                            }}>
                              Maintenance Settings
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Default Maintenance Interval (days)"
                                  type="number"
                                  defaultValue="30"
                                  variant="outlined"
                                  size="small"
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 2,
                                      background: mode === 'dark'
                                        ? 'rgba(15,23,42,0.5)'
                                        : 'rgba(255,255,255,0.9)',
                                      '& fieldset': {
                                        borderColor: mode === 'dark'
                                          ? 'rgba(74,222,128,0.2)'
                                          : 'rgba(16,185,129,0.2)',
                                        borderWidth: 1.5
                                      },
                                      '&:hover fieldset': {
                                        borderColor: mode === 'dark'
                                          ? 'rgba(74,222,128,0.4)'
                                          : 'rgba(16,185,129,0.4)'
                                      },
                                      '&.Mui-focused fieldset': {
                                        borderColor: mode === 'dark' ? '#4ade80' : '#10b981',
                                        borderWidth: 2
                                      }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                      color: mode === 'dark' ? '#4ade80' : '#10b981'
                                    }
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <FormControlLabel
                                  control={
                                    <Switch 
                                      defaultChecked 
                                      sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                          color: mode === 'dark' ? '#4ade80' : '#10b981'
                                        },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                          backgroundColor: mode === 'dark' ? '#4ade80' : '#10b981'
                                        }
                                      }}
                                    />
                                  }
                                  label="Auto-schedule maintenance reminders"
                                  sx={{
                                    '& .MuiFormControlLabel-label': {
                                      fontSize: '0.95rem',
                                      fontWeight: 500,
                                      color: mode === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)'
                                    }
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <FormControlLabel
                                  control={
                                    <Switch 
                                      sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                          color: mode === 'dark' ? '#4ade80' : '#10b981'
                                        },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                          backgroundColor: mode === 'dark' ? '#4ade80' : '#10b981'
                                        }
                                      }}
                                    />
                                  }
                                  label="Enable predictive maintenance alerts"
                                  sx={{
                                    '& .MuiFormControlLabel-label': {
                                      fontSize: '0.95rem',
                                      fontWeight: 500,
                                      color: mode === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)'
                                    }
                                  }}
                                />
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sx={{ mt: 2 }}>
                        <Button
                          variant="contained"
                          size="large"
                          sx={{
                            background: mode === 'dark'
                              ? 'linear-gradient(135deg, #4ade80, #60a5fa)'
                              : 'linear-gradient(135deg, #10b981, #3b82f6)',
                            color: '#fff',
                            fontWeight: 700,
                            px: 5,
                            py: 1.5,
                            borderRadius: 2.5,
                            textTransform: 'none',
                            fontSize: '1rem',
                            boxShadow: mode === 'dark'
                              ? '0 8px 24px -6px rgba(74,222,128,0.4)'
                              : '0 8px 24px -6px rgba(16,185,129,0.35)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-3px)',
                              boxShadow: mode === 'dark'
                                ? '0 12px 32px -6px rgba(74,222,128,0.5)'
                                : '0 12px 32px -6px rgba(16,185,129,0.45)'
                            }
                          }}
                        >
                          Save Settings
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Plans Tab */}
                {settingsTab === 2 && (
                  <Box>
                    <Typography variant="h6" sx={{ 
                      mb: 4, 
                      fontWeight: 700,
                      color: mode === 'dark' ? '#fff' : '#1f2937',
                      textAlign: 'center'
                    }}>
                      Subscription Plans
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Card sx={{ 
                          height: '100%',
                          background: mode === 'dark'
                            ? 'linear-gradient(135deg, rgba(30,41,59,0.7), rgba(51,65,85,0.7))'
                            : 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(249,250,251,0.9))',
                          border: mode === 'dark'
                            ? '1.5px solid rgba(74,222,128,0.25)'
                            : '1.5px solid rgba(16,185,129,0.25)',
                          borderRadius: 3,
                          boxShadow: mode === 'dark'
                            ? '0 8px 24px -6px rgba(74,222,128,0.2)'
                            : '0 8px 24px -6px rgba(16,185,129,0.15)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-6px)',
                            boxShadow: mode === 'dark'
                              ? '0 16px 40px -8px rgba(74,222,128,0.35)'
                              : '0 16px 40px -8px rgba(16,185,129,0.3)',
                            border: mode === 'dark'
                              ? '1.5px solid rgba(74,222,128,0.4)'
                              : '1.5px solid rgba(16,185,129,0.4)'
                          }
                        }}>
                          <CardContent sx={{ p: 3.5 }}>
                            <Typography variant="overline" sx={{ 
                              fontWeight: 700,
                              color: mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                              letterSpacing: '1px'
                            }}>
                              STARTER
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, mt: 1 }}>
                              Free
                            </Typography>
                            <Typography variant="h3" sx={{ 
                              fontWeight: 800, 
                              mb: 1,
                              background: mode === 'dark'
                                ? 'linear-gradient(135deg, #4ade80, #60a5fa)'
                                : 'linear-gradient(135deg, #10b981, #3b82f6)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent'
                            }}>
                              $0
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                              mb: 3
                            }}>
                              per month
                            </Typography>
                            <Divider sx={{ 
                              my: 3,
                              borderColor: mode === 'dark'
                                ? 'rgba(74,222,128,0.2)'
                                : 'rgba(16,185,129,0.2)'
                            }} />
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="body2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box component="span" sx={{ color: mode === 'dark' ? '#4ade80' : '#10b981', fontWeight: 700 }}>✓</Box>
                                Up to 5 machines
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box component="span" sx={{ color: mode === 'dark' ? '#4ade80' : '#10b981', fontWeight: 700 }}>✓</Box>
                                Basic monitoring
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box component="span" sx={{ color: mode === 'dark' ? '#4ade80' : '#10b981', fontWeight: 700 }}>✓</Box>
                                Email support
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box component="span" sx={{ color: mode === 'dark' ? '#4ade80' : '#10b981', fontWeight: 700 }}>✓</Box>
                                7-day data retention
                              </Typography>
                            </Box>
                            <Button
                              fullWidth
                              variant="outlined"
                              size="large"
                              sx={{
                                borderColor: mode === 'dark' ? 'rgba(74,222,128,0.5)' : 'rgba(16,185,129,0.5)',
                                color: mode === 'dark' ? '#4ade80' : '#10b981',
                                fontWeight: 700,
                                borderWidth: 1.5,
                                borderRadius: 2,
                                py: 1.25,
                                textTransform: 'none',
                                '&:hover': {
                                  borderColor: mode === 'dark' ? '#4ade80' : '#10b981',
                                  borderWidth: 1.5,
                                  background: mode === 'dark'
                                    ? 'rgba(74,222,128,0.1)'
                                    : 'rgba(16,185,129,0.1)'
                                }
                              }}
                            >
                              Current Plan
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Card sx={{ 
                          height: '100%',
                          background: mode === 'dark'
                            ? 'linear-gradient(135deg, rgba(74,222,128,0.12), rgba(96,165,250,0.12))'
                            : 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(59,130,246,0.12))',
                          border: mode === 'dark'
                            ? '2px solid rgba(74,222,128,0.6)'
                            : '2px solid rgba(16,185,129,0.6)',
                          borderRadius: 3,
                          boxShadow: mode === 'dark'
                            ? '0 12px 36px -6px rgba(74,222,128,0.35)'
                            : '0 12px 36px -6px rgba(16,185,129,0.3)',
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          '&:hover': {
                            transform: 'translateY(-8px) scale(1.02)',
                            boxShadow: mode === 'dark'
                              ? '0 20px 50px -8px rgba(74,222,128,0.5)'
                              : '0 20px 50px -8px rgba(16,185,129,0.45)',
                            border: mode === 'dark'
                              ? '2px solid rgba(74,222,128,0.8)'
                              : '2px solid rgba(16,185,129,0.8)'
                          }
                        }}>
                          <Box sx={{ 
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            background: mode === 'dark'
                              ? 'linear-gradient(135deg, #4ade80, #60a5fa)'
                              : 'linear-gradient(135deg, #10b981, #3b82f6)',
                            color: '#fff',
                            px: 2.5,
                            py: 0.75,
                            borderRadius: 2,
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            letterSpacing: '0.5px',
                            boxShadow: '0 4px 12px -2px rgba(0,0,0,0.3)'
                          }}>
                            POPULAR
                          </Box>
                          <CardContent sx={{ p: 3.5 }}>
                            <Typography variant="overline" sx={{ 
                              fontWeight: 700,
                              color: mode === 'dark' ? '#4ade80' : '#10b981',
                              letterSpacing: '1px'
                            }}>
                              BEST VALUE
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, mt: 1 }}>
                              Professional
                            </Typography>
                            <Typography variant="h3" sx={{ 
                              fontWeight: 800, 
                              mb: 1,
                              background: mode === 'dark'
                                ? 'linear-gradient(135deg, #4ade80, #60a5fa)'
                                : 'linear-gradient(135deg, #10b981, #3b82f6)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent'
                            }}>
                              $49
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                              mb: 3
                            }}>
                              per month
                            </Typography>
                            <Divider sx={{ 
                              my: 3,
                              borderColor: mode === 'dark'
                                ? 'rgba(74,222,128,0.3)'
                                : 'rgba(16,185,129,0.3)'
                            }} />
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="body2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box component="span" sx={{ color: mode === 'dark' ? '#4ade80' : '#10b981', fontWeight: 700 }}>✓</Box>
                                Up to 50 machines
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box component="span" sx={{ color: mode === 'dark' ? '#4ade80' : '#10b981', fontWeight: 700 }}>✓</Box>
                                Advanced analytics
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box component="span" sx={{ color: mode === 'dark' ? '#4ade80' : '#10b981', fontWeight: 700 }}>✓</Box>
                                Priority support
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box component="span" sx={{ color: mode === 'dark' ? '#4ade80' : '#10b981', fontWeight: 700 }}>✓</Box>
                                90-day data retention
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box component="span" sx={{ color: mode === 'dark' ? '#4ade80' : '#10b981', fontWeight: 700 }}>✓</Box>
                                AI predictions
                              </Typography>
                            </Box>
                            <Button
                              fullWidth
                              variant="contained"
                              size="large"
                              sx={{
                                background: mode === 'dark'
                                  ? 'linear-gradient(135deg, #4ade80, #60a5fa)'
                                  : 'linear-gradient(135deg, #10b981, #3b82f6)',
                                color: '#fff',
                                fontWeight: 800,
                                borderRadius: 2,
                                py: 1.5,
                                textTransform: 'none',
                                fontSize: '1rem',
                                boxShadow: mode === 'dark'
                                  ? '0 8px 24px -6px rgba(74,222,128,0.5)'
                                  : '0 8px 24px -6px rgba(16,185,129,0.4)',
                                '&:hover': {
                                  transform: 'translateY(-3px)',
                                  boxShadow: mode === 'dark'
                                    ? '0 12px 32px -6px rgba(74,222,128,0.6)'
                                    : '0 12px 32px -6px rgba(16,185,129,0.5)'
                                }
                              }}
                            >
                              Upgrade
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Card sx={{ 
                          height: '100%',
                          background: mode === 'dark'
                            ? 'linear-gradient(135deg, rgba(30,41,59,0.7), rgba(51,65,85,0.7))'
                            : 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(249,250,251,0.9))',
                          border: mode === 'dark'
                            ? '1.5px solid rgba(74,222,128,0.25)'
                            : '1.5px solid rgba(16,185,129,0.25)',
                          borderRadius: 3,
                          boxShadow: mode === 'dark'
                            ? '0 8px 24px -6px rgba(74,222,128,0.2)'
                            : '0 8px 24px -6px rgba(16,185,129,0.15)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-6px)',
                            boxShadow: mode === 'dark'
                              ? '0 16px 40px -8px rgba(74,222,128,0.35)'
                              : '0 16px 40px -8px rgba(16,185,129,0.3)',
                            border: mode === 'dark'
                              ? '1.5px solid rgba(74,222,128,0.4)'
                              : '1.5px solid rgba(16,185,129,0.4)'
                          }
                        }}>
                          <CardContent sx={{ p: 3.5 }}>
                            <Typography variant="overline" sx={{ 
                              fontWeight: 700,
                              color: mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                              letterSpacing: '1px'
                            }}>
                              ULTIMATE
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, mt: 1 }}>
                              Enterprise
                            </Typography>
                            <Typography variant="h3" sx={{ 
                              fontWeight: 800, 
                              mb: 1,
                              background: mode === 'dark'
                                ? 'linear-gradient(135deg, #4ade80, #60a5fa)'
                                : 'linear-gradient(135deg, #10b981, #3b82f6)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent'
                            }}>
                              Custom
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                              mb: 3
                            }}>
                              tailored pricing
                            </Typography>
                            <Divider sx={{ 
                              my: 3,
                              borderColor: mode === 'dark'
                                ? 'rgba(74,222,128,0.2)'
                                : 'rgba(16,185,129,0.2)'
                            }} />
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="body2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box component="span" sx={{ color: mode === 'dark' ? '#4ade80' : '#10b981', fontWeight: 700 }}>✓</Box>
                                Unlimited machines
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box component="span" sx={{ color: mode === 'dark' ? '#4ade80' : '#10b981', fontWeight: 700 }}>✓</Box>
                                Custom integrations
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box component="span" sx={{ color: mode === 'dark' ? '#4ade80' : '#10b981', fontWeight: 700 }}>✓</Box>
                                24/7 dedicated support
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box component="span" sx={{ color: mode === 'dark' ? '#4ade80' : '#10b981', fontWeight: 700 }}>✓</Box>
                                Unlimited data retention
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box component="span" sx={{ color: mode === 'dark' ? '#4ade80' : '#10b981', fontWeight: 700 }}>✓</Box>
                                White-label options
                              </Typography>
                            </Box>
                            <Button
                              fullWidth
                              variant="outlined"
                              size="large"
                              sx={{
                                borderColor: mode === 'dark' ? 'rgba(74,222,128,0.5)' : 'rgba(16,185,129,0.5)',
                                color: mode === 'dark' ? '#4ade80' : '#10b981',
                                fontWeight: 700,
                                borderWidth: 1.5,
                                borderRadius: 2,
                                py: 1.25,
                                textTransform: 'none',
                                '&:hover': {
                                  borderColor: mode === 'dark' ? '#4ade80' : '#10b981',
                                  borderWidth: 1.5,
                                  background: mode === 'dark'
                                    ? 'rgba(74,222,128,0.1)'
                                    : 'rgba(16,185,129,0.1)'
                                }
                              }}
                            >
                              Contact Sales
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </DialogContent>
            </Dialog>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, position: 'relative', zIndex: 10 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {selectedTab === 0 && <OverviewDashboard />}
            {selectedTab === 1 && <MachinesDashboard />}
            {selectedTab === 2 && <NILMDashboard />}
            {selectedTab === 3 && <PVDashboard />}
          </>
        )}
      </Container>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          background: mode === 'dark'
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderTop: mode === 'dark' ? '1px solid rgba(74, 222, 128, 0.1)' : '1px solid rgba(16, 185, 129, 0.1)',
          textAlign: 'center',
          position: 'relative',
          zIndex: 10
        }}
      >
        <Typography variant="body2" sx={{ 
          color: 'text.secondary',
          fontWeight: 500
        }}>
          PowerPulse © 2025 - Advanced Energy Monitoring & Fault Detection Platform
        </Typography>
      </Box>

      {/* Chatbot Assistant */}
      <ChatbotAssistant />
      
      </Box>
    </ThemeProvider>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <DashboardProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/dashboard/*"
              element={
                <PrivateRoute>
                  <DashboardContent />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DashboardProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
