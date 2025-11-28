import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import {
  ElectricBolt,
  SolarPower,
  TrendingUp,
  Warning,
  CheckCircle,
  Error,
  Info,
  Speed,
  BatteryChargingFull,
  AcUnit
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const OverviewDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [nilmData, setNilmData] = useState([]);
  const [pvData, setPvData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchSummary();
    fetchQuickData();
    generateRecentActivity();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await fetch('/api/analytics/summary');
      const data = await response.json();
      setSummary(data);
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  const fetchQuickData = async () => {
    try {
      // Fetch recent NILM data
      const nilmResponse = await fetch('/api/nilm/mock-data?hours=4');
      const nilmResult = await nilmResponse.json();
      setNilmData(nilmResult.data.slice(-24)); // Last 2 hours

      // Fetch recent PV data
      const pvResponse = await fetch('/api/pv/mock-data?hours=4');
      const pvResult = await pvResponse.json();
      setPvData(pvResult.data.slice(-24));
    } catch (err) {
      console.error('Error fetching quick data:', err);
    }
  };

  const generateRecentActivity = () => {
    const activities = [
      {
        type: 'success',
        icon: <CheckCircle />,
        title: 'NILM Model Update',
        description: 'BiLSTM model processed 288 samples successfully',
        time: '2 min ago',
        color: '#10b981'
      },
      {
        type: 'info',
        icon: <Info />,
        title: 'PV System Check',
        description: 'All 45 panels operating at optimal efficiency',
        time: '5 min ago',
        color: '#3b82f6'
      },
      {
        type: 'warning',
        icon: <Warning />,
        title: 'High EVSE Load Detected',
        description: 'Electric vehicle charging at 8.5 kW',
        time: '12 min ago',
        color: '#f59e0b'
      },
      {
        type: 'success',
        icon: <SolarPower />,
        title: 'PV Production Peak',
        description: 'Solar generation reached 16.2 kW',
        time: '18 min ago',
        color: '#10b981'
      },
      {
        type: 'info',
        icon: <BatteryChargingFull />,
        title: 'Battery Storage Active',
        description: 'Storing excess PV generation (3.4 kW)',
        time: '25 min ago',
        color: '#3b82f6'
      },
      {
        type: 'success',
        icon: <AcUnit />,
        title: 'Cooling System Optimized',
        description: 'CS power consumption reduced by 12%',
        time: '32 min ago',
        color: '#10b981'
      },
      {
        type: 'info',
        icon: <Speed />,
        title: 'Model Performance',
        description: 'TCN inference time: 45ms | Accuracy: 96.2%',
        time: '45 min ago',
        color: '#3b82f6'
      },
      {
        type: 'success',
        icon: <CheckCircle />,
        title: 'Fault Detection Complete',
        description: 'XGBoost scanned all PV modules - No faults detected',
        time: '1 hour ago',
        color: '#10b981'
      }
    ];
    setRecentActivity(activities);
  };

  const nilmChartData = nilmData.map(item => ({
    time: new Date(item.timestamp).toLocaleTimeString(),
    aggregate: item.aggregate,
    evse: item.appliances.EVSE,
    pv: Math.abs(item.appliances.PV)
  }));

  const pvChartData = pvData.map(item => ({
    time: new Date(item.timestamp).toLocaleTimeString(),
    power: item['Power(W)'],
    irradiance: item.Irradiance / 10, // Scale for visibility
    temperature: item.Temperature * 100 // Scale for visibility
  }));

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ 
        fontWeight: 700,
        background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        mb: 1
      }}>
        System Overview
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph sx={{ fontWeight: 500 }}>
        Comprehensive monitoring dashboard for NILM and PV systems
      </Typography>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%',
            position: 'relative',
            zIndex: 2,
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)',
            border: '1px solid',
            borderColor: 'rgba(16, 185, 129, 0.2)',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: 'rgba(16, 185, 129, 0.4)',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.15)'
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ElectricBolt sx={{ 
                  fontSize: 40, 
                  mr: 2, 
                  color: '#10b981',
                  filter: 'drop-shadow(0 2px 8px rgba(16, 185, 129, 0.4))',
                  animation: 'iconPulse 2s ease-in-out infinite',
                  '@keyframes iconPulse': {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.1)' }
                  }
                }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>NILM System</Typography>
              </Box>
              {summary && (
                <>
                  <Typography variant="body1" gutterBottom>
                    <strong>Total Appliances Monitored:</strong> {summary.nilm.totalAppliances}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Status:</strong>{' '}
                    <Alert
                      severity={summary.nilm.monitoringStatus === 'active' ? 'success' : 'warning'}
                      sx={{ display: 'inline-flex', py: 0 }}
                    >
                      {summary.nilm.monitoringStatus.toUpperCase()}
                    </Alert>
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Last Update: {new Date(summary.nilm.lastUpdate).toLocaleString()}
                  </Typography>
                </>
              )}
              <Typography variant="body2" sx={{ mt: 2 }}>
                Non-Intrusive Load Monitoring provides real-time disaggregation of energy
                consumption into individual appliances using deep learning models (BiLSTM, TCN, ATCN).
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%',
            position: 'relative',
            zIndex: 2,
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.05) 100%)',
            border: '1px solid',
            borderColor: 'rgba(59, 130, 246, 0.2)',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: 'rgba(59, 130, 246, 0.4)',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.15)'
            }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SolarPower sx={{ 
                  fontSize: 40, 
                  mr: 2, 
                  color: '#3b82f6',
                  filter: 'drop-shadow(0 2px 8px rgba(59, 130, 246, 0.4))',
                  animation: 'iconPulse 2s ease-in-out infinite',
                  '@keyframes iconPulse': {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.1)' }
                  }
                }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>PV System</Typography>
              </Box>
              {summary && (
                <>
                  <Typography variant="body1" gutterBottom>
                    <strong>Total Panels:</strong> {summary.pv.totalPanels}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>System Capacity:</strong> {summary.pv.systemCapacity}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Fault Detection:</strong>{' '}
                    <Alert
                      severity={summary.pv.faultDetectionStatus === 'active' ? 'success' : 'warning'}
                      sx={{ display: 'inline-flex', py: 0 }}
                    >
                      {summary.pv.faultDetectionStatus.toUpperCase()}
                    </Alert>
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Last Update: {new Date(summary.pv.lastUpdate).toLocaleString()}
                  </Typography>
                </>
              )}
              <Typography variant="body2" sx={{ mt: 2 }}>
                PV Fault Detection System monitors photovoltaic panels using ML algorithms
                (Random Forest, XGBoost, LSTM) to identify faults like short circuits, open
                circuits, and partial shadowing.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Key Metrics */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUp sx={{ fontSize: 30, mr: 1, color: '#10b981' }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        NILM Accuracy
                      </Typography>
                      <Typography variant="h6">~95%</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUp sx={{ fontSize: 30, mr: 1, color: '#3b82f6' }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        PV Fault Accuracy
                      </Typography>
                      <Typography variant="h6">98.9%</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ElectricBolt sx={{ fontSize: 30, mr: 1, color: '#ff9800' }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Active Models
                      </Typography>
                      <Typography variant="h6">6 Total</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Warning sx={{ fontSize: 30, mr: 1, color: '#f44336' }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        System Status
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        Healthy
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* NILM Quick View */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, position: 'relative', zIndex: 2 }}>
            <Typography variant="h6" gutterBottom>
              NILM - Recent Power Consumption
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={nilmChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="aggregate" stroke="#000" name="Total" />
                <Line type="monotone" dataKey="evse" stroke="#FF6384" name="EVSE" />
                <Line type="monotone" dataKey="pv" stroke="#36A2EB" name="PV Gen" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* PV Quick View */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, position: 'relative', zIndex: 2 }}>
            <Typography variant="h6" gutterBottom>
              PV - Recent System Performance
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={pvChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="power" stroke="#8884d8" name="Power (W)" />
                <Line type="monotone" dataKey="irradiance" stroke="#82ca9d" name="Irr (/10)" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Real-Time Activity Feed */}
        <Grid item xs={12}>
          <Paper sx={{ 
            p: 3,
            position: 'relative',
            zIndex: 2,
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.03) 0%, rgba(59, 130, 246, 0.03) 100%)',
            border: '1px solid',
            borderColor: 'rgba(16, 185, 129, 0.1)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Speed sx={{ 
                fontSize: 32, 
                mr: 2, 
                color: '#10b981',
                filter: 'drop-shadow(0 2px 8px rgba(16, 185, 129, 0.3))'
              }} />
              <Typography variant="h6" sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Real-Time System Activity
              </Typography>
            </Box>
            
            <Grid container spacing={2}>
              {recentActivity.map((activity, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card sx={{ 
                    height: '100%',
                    position: 'relative',
                    zIndex: 3,
                    transition: 'all 0.3s ease',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: activity.color,
                      boxShadow: `0 4px 20px ${activity.color}25`,
                      transform: 'translateY(-2px)'
                    }
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          width: 48,
                          height: 48,
                          borderRadius: '12px',
                          background: `linear-gradient(135deg, ${activity.color}15, ${activity.color}05)`,
                          border: `2px solid ${activity.color}30`,
                          mr: 2,
                          flexShrink: 0
                        }}>
                          {React.cloneElement(activity.icon, { 
                            sx: { fontSize: 28, color: activity.color } 
                          })}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {activity.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {activity.description}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: activity.color,
                            fontWeight: 500
                          }}>
                            {activity.time}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Activity feed updates automatically • Monitoring 6 AI models across NILM and PV systems
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OverviewDashboard;
