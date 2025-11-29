const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const morgan = require('morgan');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Flask API endpoints
const NILM_API = 'http://localhost:5001';
const PV_API = 'http://localhost:5002';
const CHATBOT_API = 'http://localhost:5003';

// Import routes
const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');

// ==================== Authentication Routes ====================

app.use('/api/auth', authRoutes);

// ==================== Data Routes (MongoDB) ====================

app.use('/api/data', dataRoutes);

// ==================== Health Check ====================

app.get('/api/health', async (req, res) => {
  try {
    const nilmHealth = await axios.get(`${NILM_API}/health`).catch(() => ({ data: { status: 'offline' } }));
    const pvHealth = await axios.get(`${PV_API}/health`).catch(() => ({ data: { status: 'offline' } }));
    const chatbotHealth = await axios.get(`${CHATBOT_API}/health`).catch(() => ({ data: { status: 'offline' } }));

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        nilm: nilmHealth.data,
        pv: pvHealth.data,
        chatbot: chatbotHealth.data
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== NILM Endpoints ====================

app.post('/api/nilm/predict', async (req, res) => {
  try {
    const response = await axios.post(`${NILM_API}/predict`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || error.message
    });
  }
});

app.post('/api/nilm/batch-predict', async (req, res) => {
  try {
    const response = await axios.post(`${NILM_API}/batch_predict`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || error.message
    });
  }
});

app.get('/api/nilm/models', async (req, res) => {
  try {
    const response = await axios.get(`${NILM_API}/models`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || error.message
    });
  }
});

// ==================== PV Endpoints ====================

app.post('/api/pv/predict', async (req, res) => {
  try {
    const response = await axios.post(`${PV_API}/predict`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || error.message
    });
  }
});

app.post('/api/pv/batch-predict', async (req, res) => {
  try {
    const response = await axios.post(`${PV_API}/batch_predict`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || error.message
    });
  }
});

app.get('/api/pv/models', async (req, res) => {
  try {
    const response = await axios.get(`${PV_API}/models`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || error.message
    });
  }
});

app.post('/api/pv/theoretical', async (req, res) => {
  try {
    const response = await axios.post(`${PV_API}/calculate_theoretical`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || error.message
    });
  }
});

// ==================== Chatbot Endpoints ====================

app.post('/api/chatbot/chat', async (req, res) => {
  try {
    const response = await axios.post(`${CHATBOT_API}/chat`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || error.message
    });
  }
});

app.post('/api/chatbot/clear', async (req, res) => {
  try {
    const response = await axios.post(`${CHATBOT_API}/clear`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || error.message
    });
  }
});

app.get('/api/chatbot/suggest', async (req, res) => {
  try {
    const response = await axios.get(`${CHATBOT_API}/suggest`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || error.message
    });
  }
});

app.post('/api/chatbot/refresh', async (req, res) => {
  try {
    const response = await axios.post(`${CHATBOT_API}/refresh_dataset_index`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || error.message
    });
  }
});

// ==================== Mock Data Generation ====================

// Generate mock NILM data
app.get('/api/nilm/mock-data', (req, res) => {
  const hours = parseInt(req.query.hours) || 24;
  const dataPoints = hours * 12; // 5-min intervals
  
  const data = [];
  const baseTime = new Date();
  
  for (let i = 0; i < dataPoints; i++) {
    const time = new Date(baseTime.getTime() - (dataPoints - i) * 5 * 60 * 1000);
    
    // Simulate realistic power consumption patterns
    const hour = time.getHours();
    const isDay = hour >= 6 && hour <= 22;
    const isPeak = (hour >= 7 && hour <= 9) || (hour >= 18 && hour <= 21);
    
    const evse = isPeak ? Math.random() * 7000 + 3000 : Math.random() * 2000;
    const pv = isDay ? -(Math.random() * 8000 + 2000) : 0; // Negative = generation
    const cs = isDay ? Math.random() * 3000 + 1000 : Math.random() * 500;
    const chp = Math.random() * 2000 + 500;
    const ba = Math.random() * 1500 + 300;
    
    data.push({
      timestamp: time.toISOString(),
      aggregate: evse + pv + cs + chp + ba,
      appliances: {
        EVSE: parseFloat(evse.toFixed(2)),
        PV: parseFloat(pv.toFixed(2)),
        CS: parseFloat(cs.toFixed(2)),
        CHP: parseFloat(chp.toFixed(2)),
        BA: parseFloat(ba.toFixed(2))
      }
    });
  }
  
  res.json({ data, count: data.length });
});

// Generate mock PV data
app.get('/api/pv/mock-data', (req, res) => {
  const hours = parseInt(req.query.hours) || 24;
  const dataPoints = hours * 60; // 1-min intervals
  
  const data = [];
    // Force daytime data (12:00 PM) instead of current time to avoid nighttime zeros
    const baseTime = new Date();
    baseTime.setHours(12, 0, 0, 0);
  
  // Fault scenarios
  const faultTypes = ['Normal', 'Normal', 'Normal', 'Open Circuit', 'Short Circuit', 'Partial Shadowing'];
  
  for (let i = 0; i < dataPoints; i++) {
    const time = new Date(baseTime.getTime() - (dataPoints - i) * 60 * 1000);
    const hour = time.getHours();
    const minute = time.getMinutes();
    
    // Solar irradiance pattern (bell curve during day)
    let irradiance = 0;
    if (hour >= 6 && hour <= 18) {
      const solarNoon = 12;
      const hourAngle = hour + minute / 60 - solarNoon;
      irradiance = 1000 * Math.cos((hourAngle / 6) * Math.PI / 2);
      irradiance = Math.max(0, irradiance) * (0.8 + Math.random() * 0.4); // Add variance
    }
    
    // Temperature pattern
    const baseTemp = 25;
    const tempVariation = 15 * Math.sin((hour - 6) / 12 * Math.PI);
    const temperature = baseTemp + tempVariation + (Math.random() - 0.5) * 5;
    
    // Determine fault (bias towards normal)
    const faultType = faultTypes[Math.floor(Math.random() * faultTypes.length)];
    
    // Calculate power based on fault
    let current = irradiance > 0 ? (irradiance / 1000) * 30 : 0;
    let voltage = irradiance > 0 ? 600 + (Math.random() - 0.5) * 50 : 0;
    let power = current * voltage;
    
    if (faultType === 'Open Circuit') {
      current = 0;
      power = 0;
    } else if (faultType === 'Short Circuit') {
      voltage *= 0.1;
      power *= 0.1;
    } else if (faultType === 'Partial Shadowing') {
      power *= 0.4 + Math.random() * 0.3;
      current *= 0.5;
    }
    
    data.push({
      timestamp: time.toISOString(),
      Irradiance: parseFloat(irradiance.toFixed(2)),
      Temperature: parseFloat(temperature.toFixed(2)),
      'Current(A)': parseFloat(current.toFixed(2)),
      'Power(W)': parseFloat(power.toFixed(2)),
      'Voltage(V)': parseFloat(voltage.toFixed(2)),
      'LoadCurrent(A)': parseFloat((current * 0.95).toFixed(2)),
      'LoadPower(W)': parseFloat((power * 0.95).toFixed(2)),
      'LoadVoltage(V)': parseFloat((voltage * 0.98).toFixed(2)),
      actualFault: faultType
    });
  }
  
  res.json({ data, count: data.length });
});

// ==================== Analytics Endpoints ====================

app.get('/api/analytics/summary', async (req, res) => {
  try {
    // Get summary statistics for the dashboard
    const summary = {
      nilm: {
        totalAppliances: 5,
        monitoringStatus: 'active',
        lastUpdate: new Date().toISOString()
      },
      pv: {
        totalPanels: 45, // 15 modules * 3 strings
        systemCapacity: '18.7 kW',
        faultDetectionStatus: 'active',
        lastUpdate: new Date().toISOString()
      }
    };
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== Serve React Frontend ====================
// Note: Frontend runs separately on port 3000 in development
// Uncomment below lines for production (single port deployment)

// Serve static files from React build
// app.use(express.static(path.join(__dirname, '../frontend/build')));

// All other routes should serve the React app
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
// });

// ==================== Error Handling ====================

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ==================== Start Server ====================

const server = app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('PES Dashboard Backend Server');
  console.log('='.repeat(50));
  console.log(`Server running on port ${PORT}`);
  console.log(`NILM API: ${NILM_API}`);
  console.log(`PV API: ${PV_API}`);
  console.log('='.repeat(50));
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
  }
});

// Prevent the process from exiting
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;
