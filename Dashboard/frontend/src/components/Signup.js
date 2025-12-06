import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff, PersonAdd, ArrowBack } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { name, email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (name.length < 2) {
      setError('Name must be at least 2 characters');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const result = await signup(name, email, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #f0fff4 0%, #ecfdf5 22%, #d9fbe9 45%, #c8f9dc 65%, #bbf7d0 82%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 18% 52%, rgba(16,185,129,0.20) 0%, transparent 60%), radial-gradient(circle at 78% 78%, rgba(34,197,94,0.16) 0%, transparent 58%), radial-gradient(circle at 42% 18%, rgba(74,222,128,0.14) 0%, transparent 56%)',
          animation: 'gradientShift 18s ease-in-out infinite',
          mixBlendMode: 'screen'
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'repeating-linear-gradient(55deg, rgba(16,185,129,0.04) 0px, rgba(16,185,129,0.04) 2px, transparent 2px, transparent 11px)',
          animation: 'gridDrift 28s linear infinite',
          opacity: 0.28,
          pointerEvents: 'none'
        },
        '@keyframes gradientShift': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' }
        },
        '@keyframes gridDrift': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '600px 400px' }
        }
      }}
    >
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
        opacity: 0.55,
        filter: 'drop-shadow(0 0 3px rgba(16,185,129,0.30))'
      }}>
        {/* Horizontal moving lines */}
        <Box sx={{
          position: 'absolute',
          width: '105%',
          height: '3px',
          top: '18%',
          left: '-2.5%',
          background: 'linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.85) 40%, rgba(74,222,128,0.75) 58%, rgba(34,197,94,0.7) 70%, transparent 100%)',
          boxShadow: '0 0 7px rgba(16,185,129,0.45), 0 0 16px rgba(74,222,128,0.32)',
          animation: 'moveRight 7s linear infinite, pulseGlow 3.5s ease-in-out infinite',
          '@keyframes moveRight': {
            '0%': { transform: 'translateX(-100%)' },
            '100%': { transform: 'translateX(100%)' }
          },
          '@keyframes pulseGlow': {
            '0%,100%': { opacity: 0.55, filter: 'blur(0.5px) brightness(1)' },
            '50%': { opacity: 0.9, filter: 'blur(1.5px) brightness(1.35)' }
          }
        }} />
        <Box sx={{
          position: 'absolute',
          width: '110%',
          height: '3px',
          top: '44%',
          left: '-5%',
          background: 'linear-gradient(90deg, transparent 0%, rgba(74,222,128,0.75) 38%, rgba(16,185,129,0.65) 55%, rgba(34,197,94,0.6) 68%, transparent 100%)',
          boxShadow: '0 0 5px rgba(74,222,128,0.42), 0 0 14px rgba(16,185,129,0.30)',
          animation: 'moveLeft 9s linear infinite, pulseGlow 4.2s ease-in-out infinite',
          '@keyframes moveLeft': {
            '0%': { transform: 'translateX(100%)' },
            '100%': { transform: 'translateX(-100%)' }
          }
        }} />
        <Box sx={{
          position: 'absolute',
          width: '105%',
          height: '3px',
          top: '69%',
          left: '-2.5%',
          background: 'linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.6) 40%, rgba(74,222,128,0.55) 58%, rgba(34,197,94,0.5) 70%, transparent 100%)',
          boxShadow: '0 0 4px rgba(16,185,129,0.38), 0 0 11px rgba(74,222,128,0.25)',
          animation: 'moveRight 11s linear infinite',
          animationDelay: '1.5s'
        }} />
        
        {/* Vertical moving lines */}
        <Box sx={{
          position: 'absolute',
          width: '3px',
          height: '100%',
          left: '14%',
          background: 'linear-gradient(180deg, transparent 0%, rgba(16,185,129,0.7) 50%, transparent 100%)',
          boxShadow: '0 0 7px rgba(16,185,129,0.4)',
          animation: 'moveDown 8.5s linear infinite, pulseGlow 3.8s ease-in-out infinite',
          '@keyframes moveDown': {
            '0%': { transform: 'translateY(-100%)' },
            '100%': { transform: 'translateY(100%)' }
          }
        }} />
        <Box sx={{
          position: 'absolute',
          width: '3px',
          height: '100%',
          left: '86%',
          background: 'linear-gradient(180deg, transparent 0%, rgba(74,222,128,0.65) 50%, transparent 100%)',
          boxShadow: '0 0 7px rgba(74,222,128,0.38)',
          animation: 'moveUp 10.5s linear infinite, pulseGlow 4.4s ease-in-out infinite',
          '@keyframes moveUp': {
            '0%': { transform: 'translateY(100%)' },
            '100%': { transform: 'translateY(-100%)' }
          }
        }} />
        
        {/* Diagonal moving lines */}
        <Box sx={{
          position: 'absolute',
          width: '160%',
          height: '3px',
          top: '28%',
          left: '-30%',
          background: 'linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.7) 40%, rgba(74,222,128,0.6) 56%, rgba(34,197,94,0.55) 68%, transparent 100%)',
          boxShadow: '0 0 6px rgba(16,185,129,0.42), 0 0 18px rgba(74,222,128,0.28)',
          transform: 'rotate(15deg)',
          animation: 'moveDiagonal1 13s linear infinite',
          '@keyframes moveDiagonal1': {
            '0%': { transform: 'rotate(15deg) translateX(-100%)' },
            '100%': { transform: 'rotate(15deg) translateX(100%)' }
          }
        }} />
        <Box sx={{
          position: 'absolute',
          width: '160%',
          height: '3px',
          top: '62%',
          left: '-30%',
          background: 'linear-gradient(90deg, transparent 0%, rgba(74,222,128,0.6) 38%, rgba(16,185,129,0.55) 56%, rgba(34,197,94,0.5) 72%, transparent 100%)',
          boxShadow: '0 0 5px rgba(74,222,128,0.4), 0 0 16px rgba(16,185,129,0.26)',
          transform: 'rotate(-12deg)',
          animation: 'moveDiagonal2 15s linear infinite',
          '@keyframes moveDiagonal2': {
            '0%': { transform: 'rotate(-12deg) translateX(100%)' },
            '100%': { transform: 'rotate(-12deg) translateX(-100%)' }
          }
        }} />
      </Box>
      
      {/* Back Button */}
      <IconButton
        onClick={() => navigate('/')}
        sx={{
          position: 'absolute',
          top: 24,
          left: 24,
          zIndex: 10,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(16,185,129,0.3)',
          boxShadow: '0 4px 12px rgba(16,185,129,0.2)',
          transition: 'all 0.3s ease',
          '&:hover': {
            background: 'rgba(16,185,129,0.1)',
            transform: 'translateX(-4px)',
            boxShadow: '0 6px 16px rgba(16,185,129,0.3)',
            borderColor: 'rgba(16,185,129,0.5)'
          }
        }}
      >
        <ArrowBack sx={{ color: '#10b981' }} />
      </IconButton>
      
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={24}
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 0 1px rgba(255,255,255,0.75), 0 2px 16px rgba(16,185,129,0.16), 0 5px 26px rgba(74,222,128,0.12)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              component="img"
              src="/logo.png"
              alt="PowerPulse Logo"
              sx={{ width: 120, height: 120, mb: 2, objectFit: 'contain' }}
            />
            <PersonAdd sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join PowerPulse to monitor your energy systems
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={name}
              onChange={handleChange}
              margin="normal"
              required
              autoFocus
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={email}
              onChange={handleChange}
              margin="normal"
              required
              autoComplete="email"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handleChange}
              margin="normal"
              required
              helperText="Must be at least 6 characters"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={handleChange}
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                mb: 2,
                background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #1d4ed8 100%)',
                }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  to="/login"
                  style={{
                    color: '#10b981',
                    textDecoration: 'none',
                    fontWeight: 600
                  }}
                >
                  Sign In
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default Signup;
