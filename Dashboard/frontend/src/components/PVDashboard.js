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
  Chip,
  TextField
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
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { Refresh, Warning, CheckCircle } from '@mui/icons-material';

const FAULT_COLORS = {
  'Normal': '#4CAF50',
  'Open Circuit': '#F44336',
  'Short Circuit': '#FF9800',
  'Partial Shadowing': '#FFC107'
};

const PVDashboard = () => {
  const [selectedModel, setSelectedModel] = useState('lightgbm');
  const [mockData, setMockData] = useState([]);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [realTimeData, setRealTimeData] = useState([]);
  const [modelInfo, setModelInfo] = useState(null);
  const [manualInput, setManualInput] = useState({
    Irradiance: 1000,
    Temperature: 25,
    'Current(A)': 30,
    'Power(W)': 18000,
    'Voltage(V)': 600,
    'LoadCurrent(A)': 28.5,
    'LoadPower(W)': 17100,
    'LoadVoltage(V)': 588
  });
  const [singlePrediction, setSinglePrediction] = useState(null);

  useEffect(() => {
    loadMockData();
    fetchModelInfo();
  }, []);

  const fetchModelInfo = async () => {
    try {
      const response = await fetch('/api/pv/models');
      const data = await response.json();
      setModelInfo(data);
    } catch (err) {
      console.error('Error fetching model info:', err);
    }
  };

  const loadMockData = async () => {
    try {
      const response = await fetch('/api/pv/mock-data?hours=24');
      const data = await response.json();
      setMockData(data.data);
      setRealTimeData(data.data.slice(-60)); // Last 60 minutes
    } catch (err) {
      setError('Failed to load mock data');
      console.error(err);
    }
  };

  const runBatchPrediction = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/pv/batch-predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          data: mockData
        })
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Prediction failed');
      }

      const result = await response.json();
      setPredictions(result);

      // Update real-time data with predictions
      const updatedData = mockData.map((item, idx) => {
        const pred = result.predictions[idx];
        if (pred) {
          return {
            ...item,
            predictedFault: pred.prediction,
            confidence: pred.confidence,
            probabilities: pred.probabilities
          };
        }
        return item;
      });

      setRealTimeData(updatedData.slice(-60));
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
        console.error('Batch prediction error:', err);
    }
  };

  const runSinglePrediction = async () => {
    try {
      const response = await fetch('/api/pv/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          data: manualInput
        })
      });

      if (!response.ok) {
        throw new Error('Prediction failed');
      }

      const result = await response.json();
      setSinglePrediction(result);
    } catch (err) {
      setError(err.message);
    }
  };

  // Calculate statistics
  const calculateStats = () => {
    if (!realTimeData || realTimeData.length === 0) return null;

    const latest = realTimeData[realTimeData.length - 1];
    
    // Count fault types in recent data
    const faultCounts = {};
    realTimeData.forEach(item => {
      const fault = item.predictedFault || item.actualFault || 'Unknown';
      faultCounts[fault] = (faultCounts[fault] || 0) + 1;
    });

    return {
      currentPower: latest['Power(W)'].toFixed(2),
      currentIrradiance: latest.Irradiance.toFixed(2),
      currentTemp: latest.Temperature.toFixed(2),
      faultCounts,
      latestFault: latest.predictedFault || latest.actualFault || 'Unknown',
      confidence: latest.confidence ? (latest.confidence * 100).toFixed(1) : 'N/A'
    };
  };

  const stats = calculateStats();

  // Prepare chart data
  const chartData = realTimeData.map((item, idx) => ({
    time: new Date(item.timestamp).toLocaleTimeString(),
    power: item['Power(W)'],
    irradiance: item.Irradiance,
    temperature: item.Temperature,
    voltage: item['Voltage(V)'],
    current: item['Current(A)'],
    fault: item.predictedFault || item.actualFault
  }));

  const faultDistribution = stats ? Object.entries(stats.faultCounts).map(([name, value]) => ({
    name,
    value
  })) : [];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        PV System - Fault Detection
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Real-time photovoltaic system monitoring and fault classification using ML
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
                  <ToggleButton value="gbm">GBM</ToggleButton>
                  <ToggleButton value="lightgbm">LightGBM</ToggleButton>
                  <ToggleButton value="xgboost">XGBoost</ToggleButton>
                  <ToggleButton value="lstm">LSTM</ToggleButton>
                </ToggleButtonGroup>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={runBatchPrediction}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
                >
                  {loading ? 'Analyzing...' : 'Run Batch Prediction'}
                </Button>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2" color="textSecondary">
                  Model: <strong>{selectedModel.replace('_', ' ').toUpperCase()}</strong>
                  <br />
                  Data Points: <strong>{mockData.length}</strong>
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* System Status Cards */}
        {stats && (
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Current Power
                    </Typography>
                    <Typography variant="h5">
                      {stats.currentPower} W
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Irradiance
                    </Typography>
                    <Typography variant="h5">
                      {stats.currentIrradiance} W/m²
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Temperature
                    </Typography>
                    <Typography variant="h5">
                      {stats.currentTemp} °C
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ bgcolor: FAULT_COLORS[stats.latestFault] + '20' }}>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      System Status
                    </Typography>
                    <Typography variant="h6">
                      {stats.latestFault}
                    </Typography>
                    <Chip
                      label={`${stats.confidence}% confidence`}
                      size="small"
                      sx={{ mt: 1 }}
                      icon={stats.latestFault === 'Normal' ? <CheckCircle /> : <Warning />}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        )}

        {/* Power & Environmental Charts */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Power Output & Irradiance
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorIrr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="power"
                  stroke="#8884d8"
                  fillOpacity={1}
                  fill="url(#colorPower)"
                  name="Power (W)"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="irradiance"
                  stroke="#82ca9d"
                  fillOpacity={1}
                  fill="url(#colorIrr)"
                  name="Irradiance (W/m²)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Fault Distribution */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Fault Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={faultDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {faultDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={FAULT_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Manual Input Panel */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Manual Fault Detection
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(manualInput).map(([key, value]) => (
                <Grid item xs={6} key={key}>
                  <TextField
                    fullWidth
                    label={key}
                    type="number"
                    value={value}
                    onChange={(e) =>
                      setManualInput({ ...manualInput, [key]: parseFloat(e.target.value) })
                    }
                    size="small"
                  />
                </Grid>
              ))}
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={runSinglePrediction}
                  color="secondary"
                >
                  Analyze Single Reading
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Single Prediction Result */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Prediction Result
            </Typography>
            {singlePrediction ? (
              <Box>
                <Alert
                  severity={singlePrediction.prediction === 'Normal' ? 'success' : 'warning'}
                  sx={{ mb: 2 }}
                >
                  <Typography variant="h6">{singlePrediction.prediction}</Typography>
                  <Typography variant="body2">
                    Confidence: {(singlePrediction.confidence * 100).toFixed(2)}%
                  </Typography>
                </Alert>
                <Typography variant="subtitle2" gutterBottom>
                  Fault Probabilities:
                </Typography>
                {Object.entries(singlePrediction.probabilities).map(([fault, prob]) => (
                  <Box key={fault} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      {fault}: {(prob * 100).toFixed(2)}%
                    </Typography>
                    <Box
                      sx={{
                        width: '100%',
                        height: 8,
                        bgcolor: '#e0e0e0',
                        borderRadius: 1,
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        sx={{
                          width: `${prob * 100}%`,
                          height: '100%',
                          bgcolor: FAULT_COLORS[fault]
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography color="textSecondary">
                Enter sensor values and click "Analyze Single Reading" to see prediction
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Voltage & Current Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Voltage & Current Monitoring
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="voltage"
                  stroke="#ff7300"
                  name="Voltage (V)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="current"
                  stroke="#387908"
                  name="Current (A)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PVDashboard;
