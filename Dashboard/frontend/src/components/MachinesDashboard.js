import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  useTheme,
  alpha,
  Tooltip
} from '@mui/material';
import {
  Search,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Power,
  BoltOutlined,
  TrendingUp,
  TrendingDown,
  Refresh
} from '@mui/icons-material';

const MachinesDashboard = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [machines, setMachines] = useState([
    {
      id: 1,
      name: 'Injection Molding Machine #1',
      status: 'operational',
      location: 'Production Floor A',
      consumption: 1250,
      efficiency: 94,
      lastMaintenance: '2024-10-15',
      trend: 'up'
    },
    {
      id: 2,
      name: 'CNC Machine #3',
      status: 'operational',
      location: 'Production Floor B',
      consumption: 980,
      efficiency: 89,
      lastMaintenance: '2024-11-01',
      trend: 'stable'
    },
    {
      id: 3,
      name: 'Assembly Line Conveyor #2',
      status: 'warning',
      location: 'Assembly Zone',
      consumption: 760,
      efficiency: 76,
      lastMaintenance: '2024-09-20',
      trend: 'down'
    },
    {
      id: 4,
      name: 'Packaging Unit #1',
      status: 'operational',
      location: 'Packaging Area',
      consumption: 540,
      efficiency: 92,
      lastMaintenance: '2024-11-10',
      trend: 'up'
    },
    {
      id: 5,
      name: 'HVAC System #2',
      status: 'error',
      location: 'Building B',
      consumption: 820,
      efficiency: 65,
      lastMaintenance: '2024-08-15',
      trend: 'down'
    },
    {
      id: 6,
      name: 'Welding Robot #4',
      status: 'operational',
      location: 'Production Floor A',
      consumption: 680,
      efficiency: 88,
      lastMaintenance: '2024-10-28',
      trend: 'stable'
    },
    {
      id: 7,
      name: 'Paint Booth #1',
      status: 'operational',
      location: 'Finishing Area',
      consumption: 450,
      efficiency: 91,
      lastMaintenance: '2024-11-05',
      trend: 'up'
    },
    {
      id: 8,
      name: 'Laser Cutter #2',
      status: 'warning',
      location: 'Production Floor C',
      consumption: 1100,
      efficiency: 78,
      lastMaintenance: '2024-09-12',
      trend: 'down'
    }
  ]);

  const filteredMachines = machines.filter(machine =>
    machine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    machine.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: machines.length,
    operational: machines.filter(m => m.status === 'operational').length,
    warning: machines.filter(m => m.status === 'warning').length,
    error: machines.filter(m => m.status === 'error').length,
    avgConsumption: Math.round(machines.reduce((sum, m) => sum + m.consumption, 0) / machines.length),
    avgEfficiency: Math.round(machines.reduce((sum, m) => sum + m.efficiency, 0) / machines.length)
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'operational':
        return {
          color: 'success',
          icon: <CheckCircle sx={{ fontSize: 18 }} />,
          label: 'Operational',
          bgColor: theme.palette.mode === 'dark' ? alpha('#10b981', 0.15) : alpha('#10b981', 0.1),
          borderColor: alpha('#10b981', 0.3)
        };
      case 'warning':
        return {
          color: 'warning',
          icon: <Warning sx={{ fontSize: 18 }} />,
          label: 'Warning',
          bgColor: theme.palette.mode === 'dark' ? alpha('#f59e0b', 0.15) : alpha('#f59e0b', 0.1),
          borderColor: alpha('#f59e0b', 0.3)
        };
      case 'error':
        return {
          color: 'error',
          icon: <ErrorIcon sx={{ fontSize: 18 }} />,
          label: 'Error',
          bgColor: theme.palette.mode === 'dark' ? alpha('#ef4444', 0.15) : alpha('#ef4444', 0.1),
          borderColor: alpha('#ef4444', 0.3)
        };
      default:
        return {
          color: 'default',
          icon: <Power sx={{ fontSize: 18 }} />,
          label: 'Unknown',
          bgColor: alpha('#64748b', 0.1),
          borderColor: alpha('#64748b', 0.3)
        };
    }
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp sx={{ fontSize: 16, color: theme.palette.success.main }} />;
    if (trend === 'down') return <TrendingDown sx={{ fontSize: 16, color: theme.palette.error.main }} />;
    return null;
  };

  const StatCard = ({ title, value, subtitle, icon, gradient }) => (
    <Card
      sx={{
        height: '100%',
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(135deg, ${alpha('#1e293b', 0.6)} 0%, ${alpha('#0f172a', 0.4)} 100%)`
          : `linear-gradient(135deg, ${alpha('#ffffff', 0.9)} 0%, ${alpha('#f8fafc', 0.7)} 100%)`,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.palette.mode === 'dark'
            ? `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`
            : `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '120px',
          height: '120px',
          background: gradient,
          borderRadius: '50%',
          filter: 'blur(40px)',
          opacity: 0.3,
          zIndex: 0
        }
      }}
    >
      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {title}
          </Typography>
          {icon}
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5, color: 'text.primary' }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            mb: 1,
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #4ade80 0%, #60a5fa 100%)'
              : 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Machines
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          Monitor and manage all factory machines
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Machines"
            value={stats.total}
            icon={<Power sx={{ color: theme.palette.primary.main }} />}
            gradient={`radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.4)} 0%, transparent 70%)`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Operational"
            value={stats.operational}
            subtitle={`${Math.round((stats.operational / stats.total) * 100)}% of fleet`}
            icon={<CheckCircle sx={{ color: theme.palette.success.main }} />}
            gradient={`radial-gradient(circle, ${alpha(theme.palette.success.main, 0.4)} 0%, transparent 70%)`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Consumption"
            value={`${stats.avgConsumption} kWh`}
            subtitle="Per machine"
            icon={<BoltOutlined sx={{ color: theme.palette.warning.main }} />}
            gradient={`radial-gradient(circle, ${alpha(theme.palette.warning.main, 0.4)} 0%, transparent 70%)`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Efficiency"
            value={`${stats.avgEfficiency}%`}
            subtitle="Fleet-wide"
            icon={<TrendingUp sx={{ color: theme.palette.info.main }} />}
            gradient={`radial-gradient(circle, ${alpha(theme.palette.info.main, 0.4)} 0%, transparent 70%)`}
          />
        </Grid>
      </Grid>

      {/* Search and Table */}
      <Paper
        sx={{
          background: theme.palette.mode === 'dark'
            ? alpha('#1e293b', 0.6)
            : alpha('#ffffff', 0.9),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          borderRadius: 3,
          overflow: 'hidden'
        }}
      >
        {/* Search Bar */}
        <Box sx={{ p: 3, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search machines by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <Refresh sx={{ fontSize: 20 }} />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                background: theme.palette.mode === 'dark'
                  ? alpha('#0f172a', 0.3)
                  : alpha('#f8fafc', 0.5),
                '&:hover': {
                  background: theme.palette.mode === 'dark'
                    ? alpha('#0f172a', 0.4)
                    : alpha('#f8fafc', 0.7)
                }
              }
            }}
          />
        </Box>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  background: theme.palette.mode === 'dark'
                    ? alpha('#4ade80', 0.05)
                    : alpha('#10b981', 0.05)
                }}
              >
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Machine Name</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Consumption</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Efficiency</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Last Maintenance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMachines.map((machine) => {
                const statusConfig = getStatusConfig(machine.status);
                return (
                  <TableRow
                    key={machine.id}
                    sx={{
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: theme.palette.mode === 'dark'
                          ? alpha('#4ade80', 0.05)
                          : alpha('#10b981', 0.03),
                        transform: 'scale(1.001)'
                      }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: theme.palette.mode === 'dark'
                              ? `linear-gradient(135deg, ${alpha('#4ade80', 0.2)} 0%, ${alpha('#60a5fa', 0.1)} 100%)`
                              : `linear-gradient(135deg, ${alpha('#10b981', 0.15)} 0%, ${alpha('#3b82f6', 0.1)} 100%)`
                          }}
                        >
                          <Power sx={{ fontSize: 20, color: theme.palette.primary.main }} />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {machine.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={statusConfig.icon}
                        label={statusConfig.label}
                        size="small"
                        sx={{
                          background: statusConfig.bgColor,
                          border: `1px solid ${statusConfig.borderColor}`,
                          color: theme.palette[statusConfig.color].main,
                          fontWeight: 600,
                          '& .MuiChip-icon': {
                            color: theme.palette[statusConfig.color].main
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {machine.location}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <BoltOutlined sx={{ fontSize: 16, color: theme.palette.warning.main }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {machine.consumption} kWh
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: machine.efficiency >= 90
                              ? theme.palette.success.main
                              : machine.efficiency >= 75
                              ? theme.palette.warning.main
                              : theme.palette.error.main
                          }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {machine.efficiency}%
                        </Typography>
                        {getTrendIcon(machine.trend)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {machine.lastMaintenance}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredMachines.length === 0 && (
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
              No machines found
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Try adjusting your search query
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default MachinesDashboard;
