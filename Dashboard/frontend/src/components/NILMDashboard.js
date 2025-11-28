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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stack
} from '@mui/material';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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
  const WINDOW_SIZE = 288; // target number of points for model prediction
  const [fullRangeData, setFullRangeData] = useState([]); // full user-selected range
  const [wasSampled, setWasSampled] = useState(false); // indicates downsampling occurred

  // Downsample to exactly WINDOW_SIZE evenly spaced points (inclusive endpoints)
  const sampleWindow = (data, target = WINDOW_SIZE) => {
    if (!data || data.length === 0) return [];
    if (data.length <= target) return data.slice();
    const n = data.length;
    const sampled = [];
    for (let i = 0; i < target; i++) {
      const idx = Math.round(i * (n - 1) / (target - 1));
      sampled.push(data[idx]);
    }
    return sampled;
  };
  const [selectedModel, setSelectedModel] = useState('atcn');
  const [selectedBuilding, setSelectedBuilding] = useState('Office');
  const [selectedLocation, setSelectedLocation] = useState('LA');

  // City coordinates for map
  const cityCoordinates = {
    'LA': { lat: 34.0522, lng: -118.2437, name: 'Los Angeles' },
    'Offenbach': { lat: 50.1002, lng: 8.7663, name: 'Offenbach' },
    'Tokyo': { lat: 35.6762, lng: 139.6503, name: 'Tokyo' }
  };

  // Fix for default marker icon issue in Leaflet
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
  const [mockData, setMockData] = useState([]);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [realTimeData, setRealTimeData] = useState([]);
  const [modelInfo, setModelInfo] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [dataAvailableRange, setDataAvailableRange] = useState({ min: null, max: null });

  useEffect(() => {
    loadMockData();
    fetchModelInfo();
  }, [selectedBuilding, selectedLocation]);

  const fetchModelInfo = async () => {
    try {
      const response = await fetch('/api/nilm/models');
      const data = await response.json();
      setModelInfo(data);
    } catch (err) {
      console.error('Error fetching model info:', err);
    }
  };

  // Helper: format for human display (DD/MM/YYYY HH:MM)
  const formatDisplayDate = (date) => {
    const d = new Date(date);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  };

  // Format date for datetime-local input (YYYY-MM-DDTHH:MM)
  const formatDateTimeLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Apply custom date range filter
  const applyDateRangeFilter = async () => {
    if (!dateRange.start || !dateRange.end) return;
    const startTs = new Date(dateRange.start).getTime();
    const endTs = new Date(dateRange.end).getTime();
    try {
      setLoading(true);
      const url = `/api/data/nilm?limit=0&sort=1&building=${selectedBuilding}&location=${selectedLocation}&startTime=${startTs}&endTime=${endTs}`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = await resp.json();
      const chronologicalData = json.data; // already sort=1 ascending
      setMockData(chronologicalData);
      setFullRangeData(chronologicalData);
      const sampled = sampleWindow(chronologicalData);
      setRealTimeData(sampled);
      setWasSampled(chronologicalData.length > WINDOW_SIZE);
      setError(null);
    } catch (err) {
      console.error('Error applying date range:', err);
      setError(`Failed to apply time range: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = async () => {
    try {
      // 1) Fetch full available range for selected building/location
      const rangeUrl = `/api/data/nilm/range?building=${selectedBuilding}&location=${selectedLocation}`;
      const rangeResp = await fetch(rangeUrl);
      if (!rangeResp.ok) throw new Error(`Range HTTP ${rangeResp.status}`);
      const rangeJson = await rangeResp.json();
      if (!rangeJson.range) throw new Error('No data available for this selection');
      const minDate = new Date(rangeJson.range.minDate);
      const maxDate = new Date(rangeJson.range.maxDate);
      setDataAvailableRange({ min: minDate, max: maxDate });

      // 2) Default to last 6 hours of that range
      const endTs = maxDate.getTime();
      const startTs = endTs - 6 * 60 * 60 * 1000;

      // 3) Fetch NILM data within that window in chronological order
      const dataUrl = `/api/data/nilm?limit=0&sort=1&building=${selectedBuilding}&location=${selectedLocation}&startTime=${startTs}&endTime=${endTs}`;
      console.log('Fetching NILM data:', dataUrl);
      const dataResp = await fetch(dataUrl);
      if (!dataResp.ok) throw new Error(`HTTP error! status: ${dataResp.status}`);
      const result = await dataResp.json();

      const chronologicalData = result.data || [];
      setMockData(chronologicalData);
      setFullRangeData(chronologicalData);
      const sampled = sampleWindow(chronologicalData);
      setRealTimeData(sampled);
      setWasSampled(chronologicalData.length > WINDOW_SIZE);

      // Set default date range picker values to last 6 hours
      setDateRange({
        start: formatDateTimeLocal(new Date(startTs)),
        end: formatDateTimeLocal(maxDate)
      });

      setError(null);
    } catch (err) {
      console.error('Error loading NILM data:', err);
      setError(`Failed to load data: ${err.message}`);
      setMockData([]);
      setRealTimeData([]);
    }
  };

  const runPrediction = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validate sufficient data points
      if (!realTimeData || realTimeData.length < WINDOW_SIZE) {
        setLoading(false);
        setError(`Need at least ${WINDOW_SIZE} data points for prediction. Currently have ${realTimeData.length}. Please expand the time range.`);
        return;
      }
      // Get aggregate power values
      const aggregatePower = realTimeData.map(d => d.aggregate);
      
      console.log('Running prediction with:', {
        model: selectedModel,
        dataPoints: aggregatePower.length,
        firstValue: aggregatePower[0],
        lastValue: aggregatePower[aggregatePower.length - 1]
      });

      // Call batch prediction API
      const response = await fetch('/api/nilm/batch-predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          aggregate_power: aggregatePower,
          window_size: WINDOW_SIZE
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Prediction error:', errorData);
        throw new Error(errorData.error || `Prediction failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('Prediction result:', result);
      setPredictions(result);
      
      // Update dashboard context for chatbot
      setNilmData({
        predictions: result.predictions,
        aggregate_power: aggregatePower.slice(-1)[0],
        model: selectedModel,
        timestamp: new Date().toISOString()
      });

      // Update real-time data with predictions
      const updatedData = realTimeData.map((item, idx) => {
        const pred = result.predictions.find(p => p.index === idx);
        if (pred) {
          return {
            ...item,
            predicted: pred.appliances
          };
        }
        return item;
      });

      // Preserve current selected range after prediction
      setRealTimeData(updatedData);
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
  
    // Use predicted values if available, otherwise use actual appliance data
    const applianceValues = latest.predicted || latest.appliances;

    // Calculate total consumption (sum of absolute values of all appliances)
    // This gives us the base for percentage calculation
    const totalConsumption = Object.values(applianceValues).reduce((sum, val) => sum + Math.abs(val), 0);

    return {
      totalPower: totalPower.toFixed(2),
      appliances: Object.entries(applianceValues).map(([name, value]) => ({
        name,
        value: value.toFixed(2),
        percentage: totalConsumption > 0 ? ((Math.abs(value) / totalConsumption) * 100).toFixed(1) : 0
      })),
      isPredicted: !!latest.predicted
    };
  };

  const stats = calculateStats();

  // Prepare chart data - numeric values for dynamic scaling
  const chartData = realTimeData.map((item) => {
    const applianceData = item.predicted || item.appliances;
    const date = new Date(item.timestamp);
    return {
      timestamp: date.getTime(),
      aggregate: +(item.aggregate / 1000).toFixed(2),
      EVSE: +(applianceData.EVSE / 1000).toFixed(2),
      PV: +(applianceData.PV / 1000).toFixed(2),
      CS: +(applianceData.CS / 1000).toFixed(2),
      CHP: +(applianceData.CHP / 1000).toFixed(2),
      BA: +(applianceData.BA / 1000).toFixed(2)
    };
  });

  // Dynamic axis calculations
  const xMin = chartData.length ? chartData[0].timestamp : 0;
  const xMax = chartData.length ? chartData[chartData.length - 1].timestamp : 0;
  const timeSpanMs = xMax - xMin;
  const timeSpanHours = timeSpanMs > 0 ? timeSpanMs / 3600000 : 0;

  function timeTickFormatter(ts) {
    const d = new Date(ts);
    if (timeSpanHours > 48) {
      return `${d.getDate()}/${d.getMonth() + 1}`; // DD/M
    } else if (timeSpanHours > 24) {
      return `${d.getDate()}/${d.getMonth() + 1} ${d.getHours()}:00`;
    } else {
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    }
  }

  // Gather Y values across all series for domain
  const yValues = chartData.flatMap(d => [d.aggregate, d.EVSE, d.PV, d.CS, d.CHP, d.BA]);
  let yMin = yValues.length ? Math.min(...yValues) : 0;
  let yMax = yValues.length ? Math.max(...yValues) : 0;
  if (yMin === yMax) {
    yMin = yMin - 1;
    yMax = yMax + 1;
  }
  const yPadding = (yMax - yMin) * 0.05;
  const yDomainMin = yMin - yPadding;
  const yDomainMax = yMax + yPadding;

  const rangeLabel = timeSpanHours >= 24
    ? `${Math.floor(timeSpanHours / 24)}d ${Math.round(timeSpanHours % 24)}h`
    : `${Math.max(1, Math.round(timeSpanHours))}h`;

  const pieData = stats?.appliances.map(app => ({
    name: app.name,
    value: Math.abs(parseFloat(app.value))
  })) || [];

  return (
    <Box>
      <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>
            NILM - Non-Intrusive Load Monitoring
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Appliance-level energy disaggregation using deep learning models
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }} sx={{ mt: { xs: 1, md: 0 } }}>
            <TextField
              size="small"
              label="Start"
              type="datetime-local"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: dataAvailableRange.min ? formatDateTimeLocal(dataAvailableRange.min) : undefined,
                max: dataAvailableRange.max ? formatDateTimeLocal(dataAvailableRange.max) : undefined
              }}
              sx={{ minWidth: 220 }}
            />
            <TextField
              size="small"
              label="End"
              type="datetime-local"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: dataAvailableRange.min ? formatDateTimeLocal(dataAvailableRange.min) : undefined,
                max: dataAvailableRange.max ? formatDateTimeLocal(dataAvailableRange.max) : undefined
              }}
              sx={{ minWidth: 220 }}
            />
            <Button variant="outlined" onClick={applyDateRangeFilter} disabled={!dateRange.start || !dateRange.end || loading}>
              Apply Time Range
            </Button>
          </Stack>
          {dataAvailableRange.min && dataAvailableRange.max && (
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5, textAlign: { xs: 'left', md: 'right' } }}>
              Available: {formatDisplayDate(dataAvailableRange.min)} - {formatDisplayDate(dataAvailableRange.max)}
            </Typography>
          )}
        </Grid>
      </Grid>

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
              <Grid item xs={12} md={2.4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Building Type</InputLabel>
                  <Select
                    value={selectedBuilding}
                    label="Building Type"
                    onChange={(e) => setSelectedBuilding(e.target.value)}
                  >
                    <MenuItem value="Office">Office</MenuItem>
                    <MenuItem value="Dealer">Dealership</MenuItem>
                    <MenuItem value="Logistic">Logistic</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2.4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Location</InputLabel>
                  <Select
                    value={selectedLocation}
                    label="Location"
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  >
                    <MenuItem value="LA">Los Angeles</MenuItem>
                    <MenuItem value="Offenbach">Offenbach</MenuItem>
                    <MenuItem value="Tokyo">Tokyo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
              <Grid item xs={12} md={3.6}>
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
              <Grid item xs={12} md={3.6}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={runPrediction}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
                >
                  {loading ? 'Running...' : 'Run Prediction'}
                </Button>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary">
                <strong>{selectedBuilding}</strong> in <strong>{selectedLocation === 'LA' ? 'Los Angeles' : selectedLocation}</strong> | 
                Model: <strong>{selectedModel.toUpperCase()}</strong> | 
                Range Points: <strong>{fullRangeData.length}</strong>{wasSampled ? <> → Sampled: <strong>{realTimeData.length}</strong></> : ''}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Map Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Facility Location
            </Typography>
            <MapView location={selectedLocation} cityCoordinates={cityCoordinates} />
          </Paper>
        </Grid>

        {/* Statistics Cards */}
        {stats && (
          <Grid item xs={12} md={8} sx={{ display: 'flex' }}>
            <Grid container spacing={2} sx={{ alignContent: 'flex-start' }}>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ height: '100%', minHeight: 160, bgcolor: stats.isPredicted ? 'success.light' : 'background.paper' }}>
                  <CardContent sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    height: '100%',
                    py: 2.5
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography color="textSecondary" gutterBottom variant="body2" fontWeight={600}>
                        Total Power
                      </Typography>
                      {stats.isPredicted && (
                        <Chip 
                          label="ML Predicted" 
                          size="small" 
                          color="success"
                          sx={{ 
                            fontWeight: 700,
                            fontSize: '0.65rem',
                            height: 20
                          }} 
                        />
                      )}
                    </Box>
                    <Typography variant="h5" fontWeight={700} sx={{ my: 1 }}>
                      {stats.totalPower} W
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              {stats.appliances.map((app) => (
                <Grid item xs={12} sm={6} md={4} key={app.name}>
                  <Card sx={{ 
                    bgcolor: APPLIANCE_COLORS[app.name] + '20',
                    height: '100%',
                    minHeight: 160
                  }}>
                    <CardContent sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between',
                      height: '100%',
                      py: 2.5
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
              Power Consumption Over Time ({rangeLabel} Window)
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  type="number"
                  domain={[xMin, xMax]}
                  tickFormatter={timeTickFormatter}
                  label={{ value: 'Time', position: 'insideBottom', offset: -5 }}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  domain={[yDomainMin, yDomainMax]}
                  label={{ value: 'Power (kW)', angle: -90, position: 'insideLeft' }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value) => [`${value} kW`, 'Power']}
                  labelFormatter={(label) => `Time: ${timeTickFormatter(label)}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="aggregate"
                  stroke="#000"
                  strokeWidth={2.5}
                  dot={false}
                  name="Aggregate"
                />
                {Object.keys(APPLIANCE_COLORS).map((appliance) => (
                  <Line
                    key={appliance}
                    type="monotone"
                    dataKey={appliance}
                    stroke={APPLIANCE_COLORS[appliance]}
                    strokeWidth={2}
                    dot={false}
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

// Map component that updates view when location changes
const MapView = ({ location, cityCoordinates }) => {
  const city = cityCoordinates[location];
  
  return (
    <Box sx={{ height: 250, width: '100%', borderRadius: 1, overflow: 'hidden' }}>
      <MapContainer 
        center={[city.lat, city.lng]} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
        key={location} // Force re-render when location changes
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[city.lat, city.lng]}>
          <Popup>
            <Typography variant="body2">
              <strong>{city.name}</strong>
            </Typography>
          </Popup>
        </Marker>
      </MapContainer>
    </Box>
  );
};

export default NILMDashboard;
