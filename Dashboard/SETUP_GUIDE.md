# PES Final Project Dashboard - Quick Start Guide

## 📋 Overview

This dashboard integrates:
1. **NILM System** - Non-Intrusive Load Monitoring with BiLSTM, TCN, and ATCN models
2. **PV System** - Photovoltaic Fault Detection with Random Forest, XGBoost, and LSTM models
3. **React Frontend** - Interactive web dashboard with real-time visualizations
4. **Node.js Backend** - API orchestration layer
5. **Flask APIs** - ML model serving endpoints

## 🚀 Quick Start (Automated)

### Step 1: Install All Dependencies
```bash
cd Dashboard
install_all.bat
```

This will install:
- Node.js packages for backend and frontend
- Python packages for both Flask APIs

### Step 2: Start All Services
```bash
start_all.bat
```

This will open 4 terminal windows and start:
- NILM Flask API on port 5001
- PV Flask API on port 5002
- Node.js Backend on port 3001
- React Frontend on port 3000

### Step 3: Access Dashboard
Open your browser and navigate to:
```
http://localhost:3000
```

## 📝 Manual Setup (Step-by-Step)

### Prerequisites
- Python 3.8+ with pip
- Node.js 16+ with npm
- Git (optional)

### 1. Install NILM API Dependencies

```bash
cd Dashboard/flask_api_nilm
pip install -r requirements.txt
```

**Required packages:**
- Flask 3.0.0
- flask-cors 4.0.0
- PyTorch 2.1.1
- numpy, pandas, scikit-learn

### 2. Install PV API Dependencies

```bash
cd ../flask_api_pv
pip install -r requirements.txt
```

**Required packages:**
- Flask 3.0.0
- flask-cors 4.0.0
- PyTorch 2.1.1
- XGBoost 2.0.3
- LightGBM 4.1.0
- numpy, pandas, scikit-learn

### 3. Install Backend Dependencies

```bash
cd ../backend
npm install
```

**Required packages:**
- express
- cors
- axios
- morgan

### 4. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

**Required packages:**
- React 18
- Material-UI
- Recharts
- axios

## 🎮 Running the Dashboard

You need **4 terminal windows** running simultaneously:

### Terminal 1: NILM Flask API
```bash
cd Dashboard/flask_api_nilm
python app.py
```
Server will start on `http://localhost:5001`

### Terminal 2: PV Flask API
```bash
cd Dashboard/flask_api_pv
python app.py
```
Server will start on `http://localhost:5002`

### Terminal 3: Node.js Backend
```bash
cd Dashboard/backend
npm start
```
Server will start on `http://localhost:3001`

### Terminal 4: React Frontend
```bash
cd Dashboard/frontend
npm start
```
Dashboard will open at `http://localhost:3000`

## 🧪 Testing the APIs

### Test NILM API
```bash
cd Dashboard/flask_api_nilm
python test_api.py
```

### Test PV API
```bash
cd Dashboard/flask_api_pv
python test_api.py
```

### Test Backend
```bash
curl http://localhost:3001/api/health
```

## 📊 Dashboard Features

### Overview Tab
- System health status
- Key metrics for both systems
- Quick data visualization
- Project information

### NILM Tab
- **Select Model**: BiLSTM, TCN, or ATCN
- **View**: Real-time power disaggregation
- **Charts**: Time series, pie charts
- **Appliances**: EVSE, PV, CS, CHP, BA

### PV Tab
- **Select Model**: Random Forest, XGBoost, or LSTM
- **View**: Fault detection results
- **Manual Input**: Test with custom sensor values
- **Charts**: Power, voltage, current, irradiance
- **Faults**: Normal, Open Circuit, Short Circuit, Partial Shadowing

## 🔧 Configuration

### Model Files Location

**NILM Models** (required):
```
PES_Final/NILM_SIDED-master/saved_models/
├── BiLSTM_best.pth
├── TCN_best.pth
└── ATCN_best.pth
```

**PV Models** (required):
```
PES_Final/PV/ML_Models/PV_Folder/
├── random_forest_pv_model.pkl
├── xgboost_pv_model.json
└── lstm_pytorch_model.pth
```

### Update Model Paths

If your models are in different locations, update these files:

**NILM API** (`flask_api_nilm/app.py`, Line 22):
```python
MODELS_DIR = Path('../../NILM_SIDED-master/saved_models')
```

**PV API** (`flask_api_pv/app.py`, Line 18):
```python
MODELS_DIR = Path('../../PV/ML_Models/PV_Folder')
```

### Change Ports

**Backend** (`backend/server.js`):
```javascript
const PORT = process.env.PORT || 3001;
const NILM_API = 'http://localhost:5001';
const PV_API = 'http://localhost:5002';
```

**Frontend** (`frontend/package.json`):
```json
"proxy": "http://localhost:3001"
```

## 🐛 Troubleshooting

### Issue: "Model files not found"
**Solution**: 
1. Ensure model files exist in correct locations
2. Update `MODELS_DIR` in Flask API files
3. Check file permissions

### Issue: "Port already in use"
**Solution**:
1. Find process using port: `netstat -ano | findstr :PORT`
2. Kill process: `taskkill /PID <pid> /F`
3. Or change port in configuration

### Issue: "Cannot connect to Flask API"
**Solution**:
1. Ensure Flask APIs are running
2. Check if port 5001 and 5002 are open
3. Verify firewall settings
4. Check API health: `curl http://localhost:5001/health`

### Issue: "React app won't start"
**Solution**:
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Clear npm cache: `npm cache clean --force`

### Issue: "CORS errors"
**Solution**:
- Flask APIs already have CORS enabled
- Ensure all services are running on correct ports
- Check browser console for specific errors

## 📈 Performance Tips

1. **Use GPU**: If you have CUDA-compatible GPU, PyTorch will automatically use it
2. **Batch Size**: Reduce if running out of memory
3. **Data Points**: Start with smaller datasets for testing
4. **Mock Data**: Dashboard includes mock data generators - no real sensors needed initially

## 🔐 Production Deployment

For production deployment:

1. **Build React App**:
```bash
cd frontend
npm run build
```

2. **Update Backend**: Configure to serve built React app

3. **Environment Variables**: Set production values in `.env`

4. **Security**: 
   - Add authentication
   - Enable HTTPS
   - Secure API endpoints
   - Add rate limiting

5. **Scaling**:
   - Use process manager (PM2 for Node.js)
   - Set up reverse proxy (nginx)
   - Consider containerization (Docker)

## 📞 Support

### Check Logs
- **NILM API**: Check terminal running `python app.py`
- **PV API**: Check terminal running `python app.py`
- **Backend**: Check terminal running `npm start`
- **Frontend**: Check browser console (F12)

### Common Commands
```bash
# Check Python version
python --version

# Check Node version
node --version

# Check npm version
npm --version

# List running processes
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :5001
netstat -ano | findstr :5002

# Install specific package version
pip install package==version
npm install package@version
```

## 📚 API Documentation

### NILM API Endpoints

#### Health Check
```bash
GET http://localhost:5001/health
```

#### Get Models
```bash
GET http://localhost:5001/models
```

#### Predict
```bash
POST http://localhost:5001/predict
Content-Type: application/json

{
  "model": "atcn",
  "aggregate_power": [array of 288+ numbers],
  "normalize": true
}
```

### PV API Endpoints

#### Health Check
```bash
GET http://localhost:5002/health
```

#### Predict Fault
```bash
POST http://localhost:5002/predict
Content-Type: application/json

{
  "model": "random_forest",
  "data": {
    "Irradiance": 1000,
    "Temperature": 25,
    "Current(A)": 30,
    "Power(W)": 18000,
    "Voltage(V)": 600,
    "LoadCurrent(A)": 28.5,
    "LoadPower(W)": 17100,
    "LoadVoltage(V)": 588
  }
}
```

## 🎓 Educational Notes

### NILM System
- **Purpose**: Disaggregate total power into individual appliances
- **Input**: Aggregate power consumption (single sensor)
- **Output**: Power consumption per appliance
- **Models**: Deep learning (BiLSTM, TCN, ATCN)
- **Dataset**: SIDED with AMDA augmentation

### PV System
- **Purpose**: Detect and classify faults in PV arrays
- **Input**: Sensor readings (I-V characteristics, environmental)
- **Output**: Fault type and confidence
- **Models**: ML classifiers (RF, XGBoost, LSTM)
- **Accuracy**: Up to 98.9% with Random Forest

## 📄 Files Structure

```
Dashboard/
├── README.md                    # Main documentation
├── SETUP_GUIDE.md              # This file
├── install_all.bat             # Automated installation
├── start_all.bat               # Automated startup
├── .gitignore                  # Git ignore rules
│
├── backend/                    # Node.js server
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/                   # React app
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── NILMDashboard.js
│   │   │   ├── PVDashboard.js
│   │   │   └── OverviewDashboard.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
├── flask_api_nilm/            # NILM API
│   ├── app.py
│   ├── requirements.txt
│   └── test_api.py
│
└── flask_api_pv/              # PV API
    ├── app.py
    ├── requirements.txt
    └── test_api.py
```

## ✅ Checklist

Before starting:
- [ ] Python 3.8+ installed
- [ ] Node.js 16+ installed
- [ ] pip and npm available
- [ ] Model files in correct locations
- [ ] All dependencies installed
- [ ] Ports 3000, 3001, 5001, 5002 available

After starting:
- [ ] NILM API responding on port 5001
- [ ] PV API responding on port 5002
- [ ] Backend responding on port 3001
- [ ] Frontend loaded on port 3000
- [ ] No errors in any terminal
- [ ] Dashboard displays correctly

## 🎉 Success!

If you can see the dashboard at `http://localhost:3000` with all three tabs working, you're all set!

Enjoy exploring the PES Final Project Dashboard! 🚀
