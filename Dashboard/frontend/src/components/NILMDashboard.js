import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Refresh } from '@mui/icons-material';
import { useDashboard } from '../context/DashboardContext';

const APPLIANCE_COLORS = {
  EVSE: '#FF6384',
  PV: '#36A2EB',
  CS: '#FFCE56',
  CHP: '#4BC0C0',
  BA: '#9966FF'
};

const NILMDashboard = () => {
  const { setNilmData } = useDashboard();
  const [selectedModel, setSelectedModel] = useState('atcn');
  const [mockData, setMockData] = useState([]);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [realTimeData, setRealTimeData] = useState([]);
  const [modelInfo, setModelInfo] = useState(null);

  useEffect(() => {
    loadMockData();
    fetchModelInfo();
  }, []);

  const fetchModelInfo = async () => {
    try {
      const response = await fetch('/api/nilm/models');
      const data = await response.json();
      setModelInfo(data);
    } catch (err) {
      console.error('Error fetching model info:', err);
    }
  };

  const loadMockData = async () => {
    try {
      const response = await fetch('/api/nilm/mock-data?hours=24');
      const data = await response.json();
      setMockData(data.data);
      
      // Set initial real-time display data (last 48 points = 4 hours)
      setRealTimeData(data.data.slice(-48));
    } catch (err) {
      setError('Failed to load mock data');
      console.error(err);
    }
  };

  const runPrediction = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get aggregate power values
      const aggregatePower = mockData.map(d => d.aggregate);

      // Call batch prediction API
      const response = await fetch('/api/nilm/batch-predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          aggregate_power: aggregatePower,
          window_size: 288
        })
      });

      if (!response.ok) {
        throw new Error('Prediction failed');
      }

      const result = await response.json();
      setPredictions(result);
      
      // Update dashboard context for chatbot
      setNilmData({
        predictions: result.predictions,
        aggregate_power: aggregatePower.slice(-1)[0],
        model: selectedModel,
        timestamp: new Date().toISOString()
      });

      // Update real-time data with predictions
      const updatedData = mockData.map((item, idx) => {
        const pred = result.predictions.find(p => p.index === idx);
        if (pred) {
          return {
            ...item,
            predicted: pred.appliances
          };
        }
        return item;
      });

      setRealTimeData(updatedData.slice(-48));
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = () => {
    if (!realTimeData || realTimeData.length === 0) return null;

    const latest = realTimeData[realTimeData.length - 1];
    const totalPower = latest.aggregate;
    const appliances = latest.appliances;

    return {
      totalPower: totalPower.toFixed(2),
      appliances: Object.entries(appliances).map(([name, value]) => ({
        name,
        value: value.toFixed(2),
        percentage: ((Math.abs(value) / Math.abs(totalPower)) * 100).toFixed(1)
      }))
    };
  };

  const stats = calculateStats();

  // Prepare chart data
  const chartData = realTimeData.map((item, idx) => ({
    time: new Date(item.timestamp).toLocaleTimeString(),
    aggregate: item.aggregate,
    EVSE: item.appliances.EVSE,
    PV: item.appliances.PV,
    CS: item.appliances.CS,
    CHP: item.appliances.CHP,
    BA: item.appliances.BA,
    ...item.predicted
  }));

  const pieData = stats?.appliances.map(app => ({
    name: app.name,
    value: Math.abs(parseFloat(app.value))
  })) || [];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        NILM - Non-Intrusive Load Monitoring
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Appliance-level energy disaggregation using deep learning models
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Control Panel */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={5}>
                <ToggleButtonGroup
                  fullWidth
                  color="primary"
                  size="small"
                  value={selectedModel}
                  exclusive
                  onChange={(e, v) => v && setSelectedModel(v)}
                >
                  <ToggleButton value="bilstm">BiLSTM</ToggleButton>
                  <ToggleButton value="tcn">TCN</ToggleButton>
                  <ToggleButton value="atcn">ATCN</ToggleButton>
                </ToggleButtonGroup>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={runPrediction}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
                >
                  {loading ? 'Running Prediction...' : 'Run Prediction'}
                </Button>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="textSecondary">
                  Model: <strong>{selectedModel.toUpperCase()}</strong>
                  <br />
                  Data Points: <strong>{mockData.length}</strong>
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Statistics Cards */}
        {stats && (
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={12/6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    height: '100%',
                    minHeight: 140
                  }}>
                    <Typography color="textSecondary" gutterBottom variant="body2" fontWeight={600}>
                      Total Power
                    </Typography>
                    <Typography variant="h5" fontWeight={700} sx={{ my: 1 }}>
                      {stats.totalPower} W
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              {stats.appliances.map((app) => (
                <Grid item xs={12} sm={6} md={12/6} key={app.name}>
                  <Card sx={{ 
                    bgcolor: APPLIANCE_COLORS[app.name] + '20',
                    height: '100%'
                  }}>
                    <CardContent sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between',
                      height: '100%',
                      minHeight: 140
                    }}>
                      <Typography color="textSecondary" gutterBottom variant="body2" fontWeight={600}>
                        {app.name}
                      </Typography>
                      <Typography variant="h5" fontWeight={700} sx={{ my: 1 }}>
                        {app.value} W
                      </Typography>
                      <Chip
                        label={`${app.percentage}%`}
                        size="small"
                        sx={{ 
                          fontWeight: 600,
                          alignSelf: 'flex-start'
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        )}

        {/* Time Series Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Power Consumption Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="aggregate"
                  stroke="#000"
                  strokeWidth={2}
                  name="Aggregate"
                />
                {Object.keys(APPLIANCE_COLORS).map((appliance) => (
                  <Line
                    key={appliance}
                    type="monotone"
                    dataKey={appliance}
                    stroke={APPLIANCE_COLORS[appliance]}
                    name={appliance}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Pie Chart */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Energy Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value.toFixed(0)}W`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={APPLIANCE_COLORS[entry.name]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Model Information */}
        {modelInfo && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Model Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2">
                    <strong>Available Models:</strong> {modelInfo.available_models.join(', ')}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2">
                    <strong>Appliances:</strong> {modelInfo.appliances.join(', ')}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2">
                    <strong>Sequence Length:</strong> {modelInfo.config.seq_length} points
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default NILMDashboard;
