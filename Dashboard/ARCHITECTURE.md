# System Architecture Diagram

## Complete System Overview

```
┌───────────────────────────────────────────────────────────────────────────┐
│                                                                           │
│                         PES FINAL PROJECT                                 │
│                    Energy Monitoring Dashboard                            │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘

                                  │
                                  ▼
                                  
┌───────────────────────────────────────────────────────────────────────────┐
│                                                                           │
│                      WEB BROWSER (User Interface)                         │
│                       http://localhost:3000                               │
│                                                                           │
│   ┌─────────────┬─────────────────────┬───────────────────────────┐       │
│   │  Overview   │    NILM Dashboard   │    PV Dashboard           │       │
│   │    Tab      │                     │                           │       │
│   ├─────────────┼─────────────────────┼───────────────────────────┤       │
│   │ • Health    │ • Model Selection   │ • Model Selection         │       │
│   │ • Stats     │   - BiLSTM          │   - Random Forest         │       │
│   │ • Charts    │   - TCN             │   - XGBoost               │       │
│   │ • Info      │   - ATCN            │   - LSTM                  │       │
│   │             │ • Power Charts      │ • Fault Detection         │       │
│   │             │ • Pie Charts        │ • Manual Input            │       │
│   │             │ • Statistics        │ • System Monitoring       │       │
│   └─────────────┴─────────────────────┴───────────────────────────┘       │
│                                                                           │
│                    React 18 + Material-UI + Recharts                      │
│                                                                           │
└───────────────────────────────┬───────────────────────────────────────────┘
                                │
                                │ HTTP REST API (JSON)
                                │
                                ▼
                                
┌───────────────────────────────────────────────────────────────────────────┐
│                                                                           │
│                    NODE.JS BACKEND SERVER                                 │
│                      http://localhost:3001                                │
│                                                                           │
│   ┌──────────────────────────────────────────────────────────────┐        │
│   │                    API Routes                                │        │
│   │                                                              │        │
│   │  /api/health              - Check all services               │        │
│   │  /api/analytics/summary   - Get system summary               │        │
│   │                                                              │        │
│   │  NILM Routes:                                                │        │
│   │  /api/nilm/predict        - Single prediction                │        │
│   │  /api/nilm/batch-predict  - Batch prediction                 │        │
│   │  /api/nilm/models         - Model info                       │        │
│   │  /api/nilm/mock-data      - Generate test data               │        │
│   │                                                              │        │
│   │  PV Routes:                                                  │        │
│   │  /api/pv/predict          - Fault detection                  │        │
│   │  /api/pv/batch-predict    - Batch detection                  │        │
│   │  /api/pv/models           - Model info                       │        │
│   │  /api/pv/mock-data        - Generate test data               │        │
│   │  /api/pv/theoretical      - Theoretical power                │        │
│   │                                                              │        │
│   └──────────────────────────────────────────────────────────────┘        │
│                                                                           │
│              Express.js + CORS + Axios + Morgan                           │
│                                                                           │
└──────────────┬────────────────────────────────────────┬───────────────────┘
               │                                        │
               │ HTTP                                   │ HTTP
               │                                        │
               ▼                                        ▼
               
┌──────────────────────────────┐        ┌──────────────────────────────┐
│                              │        │                              │
│   NILM FLASK API SERVER      │        │   PV FLASK API SERVER        │
│   http://localhost:5001      │        │   http://localhost:5002      │
│                              │        │                              │
│  ┌────────────────────────┐  │        │  ┌────────────────────────┐  │
│  │   Flask Endpoints      │  │        │  │   Flask Endpoints      │  │
│  │                        │  │        │  │                        │  │
│  │ /health                │  │        │  │ /health                │  │
│  │ /predict               │  │        │  │ /predict               │  │
│  │ /batch_predict         │  │        │  │ /batch_predict         │  │
│  │ /models                │  │        │  │ /models                │  │
│  │                        │  │        │  │ /calculate_theoretical │  │
│  └────────────────────────┘  │        │  └────────────────────────┘  │
│                              │        │                              │
│  ┌────────────────────────┐  │        │  ┌────────────────────────┐  │
│  │   Model Loading        │  │        │  │   Model Loading        │  │
│  │                        │  │        │  │                        │  │
│  │ • BiLSTM Model         │  │        │  │ • Random Forest        │  │
│  │ • TCN Model            │  │        │  │ • XGBoost              │  │
│  │ • ATCN Model           │  │        │  │ • LSTM Model           │  │
│  │                        │  │        │  │                        │  │
│  └────────────────────────┘  │        │  └────────────────────────┘  │
│                              │        │                              │
│  ┌────────────────────────┐  │        │  ┌────────────────────────┐  │
│  │   Data Processing      │  │        │  │   Data Processing      │  │
│  │                        │  │        │  │                        │  │
│  │ • Sequence Creation    │  │        │  │ • Feature Engineering  │  │
│  │ • Normalization        │  │        │  │ • Power Calculation    │  │
│  │ • Tensor Conversion    │  │        │  │ • Fault Classification │  │
│  │                        │  │        │  │                        │  │
│  └────────────────────────┘  │        │  └────────────────────────┘  │
│                              │        │                              │
│    Flask + PyTorch +         │        │    Flask + PyTorch +         │
│    scikit-learn              │        │    XGBoost + scikit-learn    │
│                              │        │                              │
└──────────────┬───────────────┘        └──────────────┬───────────────┘
               │                                       │
               ▼                                       ▼
               
┌──────────────────────────────┐        ┌──────────────────────────────┐
│                              │        │                              │
│    NILM MODEL FILES          │        │    PV MODEL FILES            │
│                              │        │                              │
│  NILM_SIDED-master/          │        │  PV/ML_Models/PV_Folder/     │
│  saved_models/               │        │                              │
│                              │        │                              │
│  ├── BiLSTM_best.pth         │        │  ├── random_forest_pv_       │
│  │   (PyTorch weights)       │        │  │   model.pkl               │
│  │                           │        │  │   (scikit-learn)          │
│  ├── TCN_best.pth            │        │  │                           │
│  │   (PyTorch weights)       │        │  ├── xgboost_pv_model.json   │
│  │                           │        │  │   (XGBoost)               │
│  └── ATCN_best.pth           │        │  │                           │
│      (PyTorch weights)       │        │  └── lstm_pytorch_model.pth  │
│                              │        │      (PyTorch weights)       │
│                              │        │                              │
│  Model Details:              │        │  Model Details:              │
│  • Input: 288 sequence       │        │  • Input: 10 features        │
│  • Output: 5 appliances      │        │  • Output: 4 fault types     │
│  • Appliances:               │        │  • Faults:                   │
│    - EVSE                    │        │    - Normal                  │
│    - PV                      │        │    - Open Circuit            │
│    - CS                      │        │    - Short Circuit           │
│    - CHP                     │        │    - Partial Shadowing       │
│    - BA                      │        │  • Accuracy: 98.9%           │
│                              │        │                              │
└──────────────────────────────┘        └──────────────────────────────┘
```

## Data Flow Diagram

### NILM Prediction Flow

```
┌──────────────┐
│ User Action  │ Select model + Click "Run Prediction"
└──────┬───────┘
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ React Component (NILMDashboard.js)                     │
│ • Prepare aggregate power data (288+ points)           │
│ • Send POST request                                    │
└──────┬─────────────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ Node.js Backend (server.js)                            │
│ POST /api/nilm/batch-predict                           │
│ • Validate request                                     │
│ • Forward to Flask API                                 │
└──────┬─────────────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ NILM Flask API (app.py)                                │
│ POST /batch_predict                                    │
│ • Create sliding windows (288 points each)             │
│ • Normalize data                                       │
│ • Convert to PyTorch tensor                            │
└──────┬─────────────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ PyTorch Model (BiLSTM/TCN/ATCN)                        │
│ • Load model from .pth file                            │
│ • Run inference                                        │
│ • Return predictions [EVSE, PV, CS, CHP, BA]           │
└──────┬─────────────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ Flask Response                                         │
│ • Format predictions as JSON                           │
│ • Include metadata                                     │
│ • Return to backend                                    │
└──────┬─────────────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ Backend Response                                       │
│ • Forward to React                                     │
└──────┬─────────────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ React UI Update                                        │
│ • Update state with predictions                        │
│ • Render charts (time series, pie)                     │
│ • Display statistics                                   │
└────────────────────────────────────────────────────────┘
```

### PV Fault Detection Flow

```
┌──────────────┐
│ User Action  │ Input sensor data or Click "Analyze"
└──────┬───────┘
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ React Component (PVDashboard.js)                       │
│ • Prepare sensor readings                              │
│ • Send POST request                                    │
└──────┬─────────────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ Node.js Backend (server.js)                            │
│ POST /api/pv/predict                                   │
│ • Validate request                                     │
│ • Forward to Flask API                                 │
└──────┬─────────────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ PV Flask API (app.py)                                  │
│ POST /predict                                          │
│ • Calculate theoretical power                          │
│ • Calculate power ratio                                │
│ • Feature engineering                                  │
└──────┬─────────────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ ML Model (RF/XGBoost/LSTM)                             │
│ • Load model from file                                 │
│ • Run prediction                                       │
│ • Calculate probabilities                              │
│ • Return fault type + confidence                       │
└──────┬─────────────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ Flask Response                                         │
│ • Format prediction as JSON                            │
│ • Include probabilities                                │
│ • Return to backend                                    │
└──────┬─────────────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ Backend Response                                       │
│ • Forward to React                                     │
└──────┬─────────────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ React UI Update                                        │
│ • Display fault type                                   │
│ • Show confidence score                                │
│ • Render probability bars                              │
│ • Update charts                                        │
└────────────────────────────────────────────────────────┘
```

## Technology Stack Layers

```
┌──────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│                                                              │
│   React 18 + Material-UI + Recharts                          │
│   • Component-based architecture                             │
│   • State management with hooks                              │
│   • Responsive design                                        │
│   • Interactive visualizations                               │
└───────────────────────────┬──────────────────────────────────┘
                            │
┌──────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                        │
│                                                              │
│   Node.js + Express.js                                       │
│   • REST API orchestration                                   │
│   • Request routing                                          │
│   • Mock data generation                                     │
│   • Static file serving                                      │
└───────────────────────────┬──────────────────────────────────┘
                            │
┌──────────────────────────────────────────────────────────────┐
│                     SERVICE LAYER                            │
│                                                              │
│   Flask + Flask-CORS                                         │
│   • ML model serving                                         │
│   • Data preprocessing                                       │
│   • Inference execution                                      │
│   • Response formatting                                      │
└───────────────────────────┬──────────────────────────────────┘
                            │
┌──────────────────────────────────────────────────────────────┐
│                     MODEL LAYER                              │
│                                                              │
│   PyTorch + scikit-learn + XGBoost + LightGBM                │
│   • Deep learning models (BiLSTM, TCN, ATCN, LSTM)           │
│   • ML classifiers (Random Forest, XGBoost)                  │
│   • Model loading & inference                                │
│   • Prediction generation                                    │
└───────────────────────────┬──────────────────────────────────┘
                            │
┌──────────────────────────────────────────────────────────────┐
│                     DATA LAYER                               │
│                                                              │
│   pandas + numpy                                             │
│   • Data transformation                                      │
│   • Feature engineering                                      │
│   • Normalization                                            │
│   • Array operations                                         │
└──────────────────────────────────────────────────────────────┘
```

## Port Allocation

```
Port 3000  →  React Frontend
   ↓ proxies to
Port 3001  →  Node.js Backend
   ↓ forwards to
Port 5001  →  NILM Flask API
Port 5002  →  PV Flask API
```

## File Organization

```
Dashboard/
├── Executable Scripts
│   ├── install_all.bat      → Install all dependencies
│   └── start_all.bat         → Start all 4 services
│
├── Documentation
│   ├── README.md             → Main documentation
│   ├── SETUP_GUIDE.md        → Setup instructions
│   ├── PROJECT_STRUCTURE.md  → Architecture details
│   ├── CREATION_SUMMARY.md   → What was built
│   ├── QUICK_REFERENCE.md    → Quick commands
│   └── ARCHITECTURE.md       → This file
│
├── Backend Service
│   └── backend/
│       ├── server.js         → Express server
│       ├── package.json      → Dependencies
│       └── .env.example      → Config template
│
├── Frontend Service
│   └── frontend/
│       ├── src/
│       │   ├── App.js                     → Main app
│       │   ├── components/
│       │   │   ├── OverviewDashboard.js   → Overview
│       │   │   ├── NILMDashboard.js       → NILM UI
│       │   │   └── PVDashboard.js         → PV UI
│       │   └── index.js                   → Entry point
│       ├── public/index.html              → HTML template
│       └── package.json                   → Dependencies
│
├── NILM API Service
│   └── flask_api_nilm/
│       ├── app.py            → Flask server
│       ├── requirements.txt  → Python deps
│       └── test_api.py       → Test script
│
└── PV API Service
    └── flask_api_pv/
        ├── app.py            → Flask server
        ├── requirements.txt  → Python deps
        └── test_api.py       → Test script
```
