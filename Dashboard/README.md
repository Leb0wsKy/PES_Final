# PES Final Project Dashboard

A comprehensive energy monitoring dashboard combining **NILM (Non-Intrusive Load Monitoring)** and **PV (Photovoltaic) Fault Detection** systems.

## 🏗️ Architecture

```
Dashboard/
├── backend/                 # Node.js/Express server
│   ├── server.js           # Main backend server
│   └── package.json        # Node dependencies
├── frontend/               # React dashboard
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── NILMDashboard.js
│   │   │   ├── PVDashboard.js
│   │   │   └── OverviewDashboard.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── flask_api_nilm/         # Flask API for NILM models
│   ├── app.py
│   └── requirements.txt
└── flask_api_pv/           # Flask API for PV models
    ├── app.py
    └── requirements.txt
```

## 🚀 Features

### NILM System
- **Models**: BiLSTM, TCN, ATCN (Attention + TCN)
- **Appliances**: EVSE, PV, CS, CHP, BA
- **Data**: SIDED dataset with AMDA augmentation
- **Real-time**: Load disaggregation from aggregate power

### PV System
- **Models**: Random Forest (98.9% accuracy), XGBoost, LSTM
- **Faults**: Normal, Open Circuit, Short Circuit, Partial Shadowing
- **Features**: Irradiance, Temperature, I-V characteristics
- **System**: 18.7 kW PV Array (45 panels)

## 📦 Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- pip
- npm

### 1. Install Flask API Dependencies

#### NILM API
```bash
cd Dashboard/flask_api_nilm
pip install -r requirements.txt
```

#### PV API
```bash
cd Dashboard/flask_api_pv
pip install -r requirements.txt
```

### 2. Install Node.js Backend
```bash
cd Dashboard/backend
npm install
```

### 3. Install React Frontend
```bash
cd Dashboard/frontend
npm install
```

## 🎯 Running the Dashboard

You need to run **three servers** simultaneously:

### Terminal 1: NILM Flask API (Port 5001)
```bash
cd Dashboard/flask_api_nilm
python app.py
```

### Terminal 2: PV Flask API (Port 5002)
```bash
cd Dashboard/flask_api_pv
python app.py
```

### Terminal 3: Node.js Backend (Port 3001)
```bash
cd Dashboard/backend
npm start
```

### Terminal 4: React Frontend (Port 3000)
```bash
cd Dashboard/frontend
npm start
```

The dashboard will be available at: **http://localhost:3000**

## 🔌 API Endpoints

### Node.js Backend (Port 3001)

#### Health Check
- `GET /api/health` - Check all services status

#### NILM Endpoints
- `POST /api/nilm/predict` - Single prediction
- `POST /api/nilm/batch-predict` - Batch prediction
- `GET /api/nilm/models` - Get available models
- `GET /api/nilm/mock-data?hours=24` - Generate mock data

#### PV Endpoints
- `POST /api/pv/predict` - Single fault prediction
- `POST /api/pv/batch-predict` - Batch fault prediction
- `GET /api/pv/models` - Get available models
- `GET /api/pv/mock-data?hours=24` - Generate mock data
- `POST /api/pv/theoretical` - Calculate theoretical power

### Flask APIs

#### NILM API (Port 5001)
- `GET /health` - Health check
- `POST /predict` - Predict appliance consumption
- `POST /batch_predict` - Batch prediction
- `GET /models` - Model information

#### PV API (Port 5002)
- `GET /health` - Health check
- `POST /predict` - Predict fault type
- `POST /batch_predict` - Batch prediction
- `GET /models` - Model information
- `POST /calculate_theoretical` - Calculate theoretical PV power

## 📊 Dashboard Features

### Overview Tab
- System status for both NILM and PV
- Key performance metrics
- Quick data visualization
- Project information

### NILM Tab
- Model selection (BiLSTM, TCN, ATCN)
- Real-time power disaggregation
- Appliance-level consumption charts
- Energy distribution pie chart
- Time series visualization

### PV Tab
- Model selection (Random Forest, XGBoost, LSTM)
- Fault detection and classification
- Manual input for single predictions
- Power, voltage, and current monitoring
- Irradiance and temperature tracking
- Fault distribution analysis

## 🔧 Configuration

### Model Paths
Update model paths in Flask API files if needed:
- NILM: `flask_api_nilm/app.py` - Line 22
- PV: `flask_api_pv/app.py` - Line 18

### Backend Ports
Update in `backend/server.js`:
```javascript
const NILM_API = 'http://localhost:5001';
const PV_API = 'http://localhost:5002';
const PORT = 3001;
```

## 🧪 Testing

### Test NILM Prediction
```bash
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{
    "model": "atcn",
    "aggregate_power": [list of 288+ power values],
    "normalize": true
  }'
```

### Test PV Prediction
```bash
curl -X POST http://localhost:5002/predict \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

## 📝 Notes

### Model Files Required
Ensure these model files exist:
- `NILM_SIDED-master/saved_models/BiLSTM_best.pth`
- `NILM_SIDED-master/saved_models/TCN_best.pth`
- `NILM_SIDED-master/saved_models/ATCN_best.pth`
- `PV/ML_Models/PV_Folder/random_forest_pv_model.pkl`
- `PV/ML_Models/PV_Folder/xgboost_pv_model.json`
- `PV/ML_Models/PV_Folder/lstm_pytorch_model.pth`

### Mock Data
The dashboard includes mock data generators for testing without real sensors. In production, replace with actual data sources.

## 🛠️ Technologies Used

### Backend
- **Node.js** with Express.js
- **Flask** for ML model serving
- **axios** for API communication

### Frontend
- **React** 18
- **Material-UI** for components
- **Recharts** for visualizations
- **React Router** for navigation

### ML/AI
- **PyTorch** for deep learning models
- **scikit-learn** for ML algorithms
- **XGBoost** for gradient boosting
- **pandas** & **numpy** for data processing

## 📄 License

MIT License - See LICENSE file for details

## 👥 Authors

PES Final Project 2024

## 🙏 Acknowledgments

- SIDED Dataset for NILM data
- PV Array simulation data
- Material-UI for UI components
- Recharts for visualization library
