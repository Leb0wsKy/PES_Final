import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  useTheme,
  alpha,
  Fade,
  Grow
} from '@mui/material';
import {
  ChatBubbleOutline,
  NotificationsActive,
  ShowChart,
  Security,
  BoltOutlined,
  ElectricBolt,
  SolarPower
} from '@mui/icons-material';

const FeatureCard = ({ icon: Icon, title, description, delay }) => {
  const theme = useTheme();
  
  return (
    <Grow in={true} timeout={800} style={{ transformOrigin: '0 0 0' }} {...{ timeout: delay }}>
      <Card
        sx={{
          height: '100%',
          background: theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${alpha('#1e3a34', 0.5)} 0%, ${alpha('#0d2818', 0.3)} 100%)`
            : `linear-gradient(135deg, ${alpha('#f0fdf4', 0.95)} 0%, ${alpha('#dcfce7', 0.8)} 100%)`,
          backdropFilter: 'blur(20px)',
          border: theme.palette.mode === 'dark'
            ? `1px solid ${alpha('#6ee7b7', 0.25)}`
            : `1px solid ${alpha('#86efac', 0.3)}`,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: theme.palette.mode === 'dark'
            ? `0 4px 20px ${alpha('#000', 0.5)}, inset 0 1px 0 ${alpha('#6ee7b7', 0.1)}`
            : `0 4px 20px ${alpha('#10b981', 0.08)}, inset 0 1px 0 ${alpha('#fff', 0.9)}`,
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: theme.palette.mode === 'dark'
              ? `0 12px 48px ${alpha('#6ee7b7', 0.5)}, 0 0 80px ${alpha('#6ee7b7', 0.25)}, inset 0 1px 0 ${alpha('#6ee7b7', 0.2)}`
              : `0 12px 40px ${alpha('#34d399', 0.3)}, 0 0 60px ${alpha('#6ee7b7', 0.2)}`,
            border: theme.palette.mode === 'dark'
              ? `1px solid ${alpha('#6ee7b7', 0.5)}`
              : `1px solid ${alpha('#6ee7b7', 0.5)}`,
            background: theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, ${alpha('#1e3a34', 0.7)} 0%, ${alpha('#0d2818', 0.5)} 100%)`
              : `linear-gradient(135deg, ${alpha('#dcfce7', 1)} 0%, ${alpha('#bbf7d0', 0.9)} 100%)`,
          }
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #4ade80 0%, #60a5fa 100%)'
                : 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
              boxShadow: theme.palette.mode === 'dark'
                ? `0 8px 32px ${alpha('#4ade80', 0.5)}, 0 8px 32px ${alpha('#60a5fa', 0.3)}`
                : `0 8px 24px ${alpha('#10b981', 0.4)}, 0 8px 24px ${alpha('#3b82f6', 0.3)}`,
              animation: 'iconGlow 3s ease-in-out infinite',
            }}
          >
            <Icon sx={{ fontSize: 32, color: '#fff' }} />
          </Box>
          <style>
            {`
              @keyframes iconGlow {
                0%, 100% { 
                  box-shadow: ${theme.palette.mode === 'dark' 
                    ? `0 8px 32px ${alpha('#4ade80', 0.5)}, 0 8px 32px ${alpha('#60a5fa', 0.3)}`
                    : `0 8px 24px ${alpha('#10b981', 0.4)}, 0 8px 24px ${alpha('#3b82f6', 0.3)}`};
                }
                50% { 
                  box-shadow: ${theme.palette.mode === 'dark'
                    ? `0 8px 40px ${alpha('#4ade80', 0.7)}, 0 8px 40px ${alpha('#60a5fa', 0.5)}`
                    : `0 8px 32px ${alpha('#10b981', 0.6)}, 0 8px 32px ${alpha('#3b82f6', 0.5)}`};
                }
              }
            `}
          </style>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              fontWeight: 700,
              mb: 2,
              color: theme.palette.mode === 'dark' ? '#6ee7b7' : '#047857',
              textShadow: theme.palette.mode === 'dark'
                ? `0 0 20px ${alpha('#6ee7b7', 0.6)}, 0 0 40px ${alpha('#6ee7b7', 0.3)}`
                : 'none',
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.mode === 'dark' ? '#e0f2e9' : '#065f46',
              lineHeight: 1.7,
              fontWeight: 500
            }}
          >
            {description}
          </Typography>
        </CardContent>
      </Card>
    </Grow>
  );
};

const LandingPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const features = [
    {
      icon: ElectricBolt,
      title: 'Real-Time Monitoring',
      description: 'Track energy consumption of all your factory machines and PV panels with live updates and detailed analytics.',
      delay: 200
    },
    {
      icon: ChatBubbleOutline,
      title: 'AI Chatbot Assistant',
      description: 'Get instant answers about machine status and performance through our intelligent chatbot interface.',
      delay: 400
    },
    {
      icon: NotificationsActive,
      title: 'Smart Alerts',
      description: 'Receive instant notifications when machines need attention or energy consumption patterns change.',
      delay: 600
    },
    {
      icon: ShowChart,
      title: 'Performance Analytics',
      description: 'Visualize trends and patterns with comprehensive charts and graphs for data-driven decisions.',
      delay: 800
    },
    {
      icon: Security,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security ensures your factory data is protected and always accessible.',
      delay: 1000
    },
    {
      icon: BoltOutlined,
      title: 'Energy Optimization',
      description: 'Identify opportunities to reduce energy costs and improve efficiency across your operations.',
      delay: 1200
    }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 22%, #0f2419 45%, #1a3a2e 65%, #0f172a 82%)'
          : 'linear-gradient(135deg, #f0fff4 0%, #ecfdf5 22%, #d9fbe9 45%, #c8f9dc 65%, #bbf7d0 82%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme.palette.mode === 'dark'
            ? 'radial-gradient(circle at 18% 52%, rgba(110,231,183,0.28) 0%, transparent 60%), radial-gradient(circle at 78% 78%, rgba(52,211,153,0.22) 0%, transparent 58%), radial-gradient(circle at 42% 18%, rgba(16,185,129,0.20) 0%, transparent 56%)'
            : 'radial-gradient(circle at 18% 52%, rgba(16,185,129,0.20) 0%, transparent 60%), radial-gradient(circle at 78% 78%, rgba(34,197,94,0.16) 0%, transparent 58%), radial-gradient(circle at 42% 18%, rgba(74,222,128,0.14) 0%, transparent 56%)',
          animation: 'gradientShift 18s ease-in-out infinite',
          mixBlendMode: 'screen'
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: theme.palette.mode === 'dark'
            ? 'repeating-linear-gradient(55deg, rgba(110,231,183,0.08) 0px, rgba(110,231,183,0.08) 2px, transparent 2px, transparent 11px)'
            : 'repeating-linear-gradient(55deg, rgba(16,185,129,0.04) 0px, rgba(16,185,129,0.04) 2px, transparent 2px, transparent 11px)',
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
        opacity: theme.palette.mode === 'dark' ? 0.6 : 0.3,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}>
        {[...Array(8)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              left: `${i * 15}%`,
              top: '-50%',
              width: '2px',
              height: '200%',
              background: `linear-gradient(180deg, transparent 0%, ${theme.palette.mode === 'dark' ? '#6ee7b7' : '#10b981'} 50%, transparent 100%)`,
              boxShadow: theme.palette.mode === 'dark' 
                ? `0 0 20px ${alpha('#6ee7b7', 0.7)}, 0 0 40px ${alpha('#6ee7b7', 0.5)}`
                : `0 0 15px ${alpha('#10b981', 0.4)}`,
              transform: `rotate(${15 + i * 3}deg)`,
              animation: `neonPulse ${3 + i * 0.5}s ease-in-out infinite ${i * 0.2}s`,
            }}
          />
        ))}
      </Box>

      <style>
        {`
          @keyframes neonPulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
          }
        `}
      </style>

      {/* Animated Background Circles */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: theme.palette.mode === 'dark'
            ? `radial-gradient(circle, ${alpha('#6ee7b7', 0.30)} 0%, transparent 70%)`
            : `radial-gradient(circle, ${alpha('#10b981', 0.20)} 0%, transparent 70%)`,
          filter: 'blur(80px)',
          animation: 'float 20s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
            '50%': { transform: 'translate(-30px, -30px) scale(1.1)' }
          }
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-10%',
          left: '-5%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: theme.palette.mode === 'dark'
            ? `radial-gradient(circle, ${alpha('#34d399', 0.25)} 0%, transparent 70%)`
            : `radial-gradient(circle, ${alpha('#22c55e', 0.15)} 0%, transparent 70%)`,
          filter: 'blur(80px)',
          animation: 'float 15s ease-in-out infinite reverse',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Hero Section */}
        <Box
          sx={{
            pt: { xs: 12, md: 16 },
            pb: { xs: 8, md: 12 },
            textAlign: 'center'
          }}
        >
          <Fade in={true} timeout={1000}>
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 2,
                  mb: 3
                }}
              >
                <SolarPower
                  sx={{
                    fontSize: 48,
                    color: theme.palette.mode === 'dark' ? '#6ee7b7' : '#10b981',
                    filter: theme.palette.mode === 'dark'
                      ? `drop-shadow(0 0 20px ${alpha('#6ee7b7', 0.9)}) drop-shadow(0 0 40px ${alpha('#6ee7b7', 0.6)})`
                      : `drop-shadow(0 4px 12px ${alpha('#10b981', 0.6)})`,
                    animation: 'solarPulse 2s ease-in-out infinite'
                  }}
                />
                <style>
                  {`
                    @keyframes solarPulse {
                      0%, 100% { 
                        filter: ${theme.palette.mode === 'dark'
                          ? `drop-shadow(0 0 20px ${alpha('#6ee7b7', 0.9)}) drop-shadow(0 0 40px ${alpha('#6ee7b7', 0.6)})`
                          : `drop-shadow(0 4px 12px ${alpha('#10b981', 0.6)})`};
                      }
                      50% { 
                        filter: ${theme.palette.mode === 'dark'
                          ? `drop-shadow(0 0 35px ${alpha('#6ee7b7', 1)}) drop-shadow(0 0 70px ${alpha('#6ee7b7', 0.8)})`
                          : `drop-shadow(0 4px 20px ${alpha('#10b981', 0.9)})`};
                      }
                    }
                  `}
                </style>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    background: theme.palette.mode === 'dark'
                      ? 'linear-gradient(135deg, #4ade80 0%, #60a5fa 100%)'
                      : 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: theme.palette.mode === 'dark'
                      ? `drop-shadow(0 0 30px ${alpha('#4ade80', 0.4)}) drop-shadow(0 0 30px ${alpha('#60a5fa', 0.3)})`
                      : 'none',
                  }}
                >
                  PowerPulse
                </Typography>
              </Box>
            </Box>
          </Fade>

          <Fade in={true} timeout={1200}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                mb: 3,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                lineHeight: 1.2,
                color: theme.palette.mode === 'dark' ? '#f8fafc' : '#0f172a',
                textShadow: theme.palette.mode === 'dark'
                  ? `0 2px 20px ${alpha('#000', 0.5)}`
                  : 'none'
              }}
            >
              Monitor Your Factory's Energy
              <br />
              <Box
                component="span"
                sx={{
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #4ade80 0%, #60a5fa 100%)'
                    : 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: theme.palette.mode === 'dark'
                    ? `drop-shadow(0 0 30px ${alpha('#4ade80', 0.5)}) drop-shadow(0 0 30px ${alpha('#60a5fa', 0.4)})`
                    : 'none',
                  position: 'relative',
                  '&::after': theme.palette.mode === 'dark' ? {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, transparent, #4ade80 25%, #60a5fa 75%, transparent)',
                    boxShadow: `0 0 15px ${alpha('#4ade80', 0.6)}, 0 0 15px ${alpha('#60a5fa', 0.6)}`,
                  } : {}
                }}
              >
                with Precision
              </Box>
            </Typography>
          </Fade>

          <Fade in={true} timeout={1400}>
            <Typography
              variant="h6"
              sx={{
                mb: 5,
                color: theme.palette.mode === 'dark' ? '#cbd5e1' : '#065f46',
                maxWidth: 800,
                mx: 'auto',
                lineHeight: 1.8,
                fontSize: { xs: '1rem', md: '1.25rem' },
                fontWeight: 500
              }}
            >
              PowerPulse helps you track energy consumption of factory machines and PV panels in
              real-time, with AI-powered insights and instant alerts.
            </Typography>
          </Fade>

          <Fade in={true} timeout={1600}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 700,
                borderRadius: 3,
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #4ade80 0%, #60a5fa 100%)'
                  : 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                boxShadow: theme.palette.mode === 'dark'
                  ? `0 8px 32px ${alpha('#4ade80', 0.4)}, 0 8px 32px ${alpha('#60a5fa', 0.3)}`
                  : `0 8px 32px ${alpha('#10b981', 0.3)}, 0 8px 32px ${alpha('#3b82f6', 0.25)}`,
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-50%',
                  left: '-50%',
                  width: '200%',
                  height: '200%',
                  background: theme.palette.mode === 'dark'
                    ? `linear-gradient(45deg, transparent 30%, ${alpha('#fff', 0.15)} 50%, transparent 70%)`
                    : `linear-gradient(45deg, transparent 30%, ${alpha('#fff', 0.3)} 50%, transparent 70%)`,
                  animation: 'shimmer 3s linear infinite'
                },
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.palette.mode === 'dark'
                    ? `0 12px 48px ${alpha('#4ade80', 0.6)}, 0 12px 48px ${alpha('#60a5fa', 0.5)}`
                    : `0 12px 40px ${alpha('#10b981', 0.5)}, 0 12px 40px ${alpha('#3b82f6', 0.4)}`,
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #22c55e 0%, #3b82f6 100%)'
                    : 'linear-gradient(135deg, #059669 0%, #1d4ed8 100%)'
                },
                '@keyframes shimmer': {
                  '0%': { transform: 'translateX(-100%) translateY(-100%) rotate(45deg)' },
                  '100%': { transform: 'translateX(100%) translateY(100%) rotate(45deg)' }
                }
              }}
            >
              Get Started Today
            </Button>
          </Fade>
        </Box>

        {/* Features Grid */}
        <Box sx={{ pb: 12 }}>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <FeatureCard {...feature} />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            pb: 6,
            textAlign: 'center',
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            pt: 4
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.mode === 'dark' ? '#94a3b8' : '#6b7280',
              '& a': {
                color: theme.palette.mode === 'dark' ? '#6ee7b7' : '#059669',
                textDecoration: 'none',
                fontWeight: 600,
                textShadow: theme.palette.mode === 'dark'
                  ? `0 0 10px ${alpha('#6ee7b7', 0.4)}`
                  : 'none',
                '&:hover': {
                  textDecoration: 'underline',
                  textShadow: theme.palette.mode === 'dark'
                    ? `0 0 20px ${alpha('#6ee7b7', 0.6)}`
                    : 'none'
                }
              }
            }}
          >
            © 2025 PowerPulse. Enterprise Energy Monitoring Solution.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;
