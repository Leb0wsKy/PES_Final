# Project Structure

## Complete Dashboard Architecture

```
PES_Final/
│
├── Dashboard/                                    # Main dashboard folder
│   │
│   ├── README.md                                # Main documentation
│   ├── SETUP_GUIDE.md                           # Detailed setup instructions
│   ├── PROJECT_STRUCTURE.md                     # This file
│   ├── .gitignore                               # Git ignore patterns
│   ├── install_all.bat                          # Windows: Install all dependencies
│   ├── start_all.bat                            # Windows: Start all services
│   │
│   ├── backend/                                 # Node.js/Express Backend (Port 3001)
│   │   ├── server.js                           # Main server file
│   │   ├── package.json                        # Node dependencies
│   │   ├── .env.example                        # Environment variables template
│   │   └── node_modules/                       # Dependencies (auto-generated)
│   │
│   ├── frontend/                                # React Frontend (Port 3000)
│   │   ├── public/
│   │   │   └── index.html                      # HTML template
│   │   │
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── NILMDashboard.js           # NILM monitoring component
│   │   │   │   ├── PVDashboard.js             # PV fault detection component
│   │   │   │   └── OverviewDashboard.js       # System overview component
│   │   │   │
│   │   │   ├── App.js                          # Main React app
│   │   │   ├── App.css                         # App styles
│   │   │   ├── index.js                        # React entry point
│   │   │   └── index.css                       # Global styles
│   │   │
│   │   ├── package.json                        # React dependencies
│   │   ├── build/                              # Production build (auto-generated)
│   │   └── node_modules/                       # Dependencies (auto-generated)
│   │
│   ├── flask_api_nilm/                          # NILM Flask API (Port 5001)
│   │   ├── app.py                              # Flask application
│   │   ├── requirements.txt                     # Python dependencies
│   │   ├── test_api.py                         # API testing script
│   │   └── __pycache__/                        # Python cache (auto-generated)
│   │
│   └── flask_api_pv/                            # PV Flask API (Port 5002)
│       ├── app.py                              # Flask application
│       ├── requirements.txt                     # Python dependencies
│       ├── test_api.py                         # API testing script
│       └── __pycache__/                        # Python cache (auto-generated)
│
├── NILM_SIDED-master/                           # NILM Project Files
│   ├── data_augmentation.py
│   ├── workspace.ipynb
│   └── saved_models/                           # REQUIRED: Trained models
│       ├── BiLSTM_best.pth                     # BiLSTM model weights
│       ├── TCN_best.pth                        # TCN model weights
│       └── ATCN_best.pth                       # ATCN model weights
│
└── PV/                                          # PV Project Files
    ├── ML_Models/
    │   ├── PV_Array.py
    │   └── PV_Folder/                          # REQUIRED: Trained models
    │       ├── random_forest_pv_model.pkl      # Random Forest model
    │       ├── xgboost_pv_model.json           # XGBoost model
    │       └── lstm_pytorch_model.pth          # LSTM model weights
    │
    └── readme.md
```

## Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│                   http://localhost:3000                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   React Frontend (Port 3000)                 │
│  ┌──────────────┬──────────────┬──────────────────────┐    │
│  │   Overview   │  NILM Tab    │     PV Tab           │    │
│  │  Dashboard   │  Dashboard   │    Dashboard         │    │
│  └──────────────┴──────────────┴──────────────────────┘    │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP REST API
                         ▼
┌─────────────────────────────────────────────────────────────┐
│            Node.js Backend (Port 3001)                       │
│  ┌─────────────────────────────────────────────────┐        │
│  │  API Routes:                                     │        │
│  │  • /api/health                                   │        │
│  │  • /api/nilm/*                                   │        │
│  │  • /api/pv/*                                     │        │
│  │  • /api/analytics/*                              │        │
│  └─────────────────────────────────────────────────┘        │
└──────────┬─────────────────────────────┬────────────────────┘
           │                             │
           ▼                             ▼
┌──────────────────────┐    ┌───────────────────────┐
│  NILM Flask API      │    │  PV Flask API         │
│  (Port 5001)         │    │  (Port 5002)          │
│                      │    │                       │
│  Models:             │    │  Models:              │
│  • BiLSTM            │    │  • Random Forest      │
│  • TCN               │    │  • XGBoost            │
│  • ATCN              │    │  • LSTM               │
│                      │    │                       │
│  Endpoints:          │    │  Endpoints:           │
│  • /health           │    │  • /health            │
│  • /predict          │    │  • /predict           │
│  • /batch_predict    │    │  • /batch_predict     │
│  • /models           │    │  • /models            │
│                      │    │  • /calculate_theo    │
└──────────┬───────────┘    └───────────┬───────────┘
           │                            │
           ▼                            ▼
┌──────────────────────┐    ┌───────────────────────┐
│  NILM Models         │    │  PV Models            │
│  (PyTorch .pth)      │    │  (.pkl, .json, .pth)  │
└──────────────────────┘    └───────────────────────┘
```

## Data Flow

### NILM Prediction Flow
```
1. User selects model (BiLSTM/TCN/ATCN) in React UI
2. React → POST /api/nilm/predict → Node.js Backend
3. Backend → POST /predict → NILM Flask API
4. Flask loads PyTorch model from saved_models/
5. Flask processes aggregate power data
6. Flask runs model inference
7. Flask returns appliance-level predictions
8. Backend forwards to React
9. React displays charts and statistics
```

### PV Fault Detection Flow
```
1. User inputs sensor data or runs batch prediction
2. React → POST /api/pv/predict → Node.js Backend
3. Backend → POST /predict → PV Flask API
4. Flask calculates theoretical power
5. Flask performs feature engineering
6. Flask loads selected model (RF/XGBoost/LSTM)
7. Flask runs fault classification
8. Flask returns fault type and confidence
9. Backend forwards to React
10. React displays fault status and probabilities
```

## Component Responsibilities

### React Frontend
- **OverviewDashboard.js**: System summary, quick stats
- **NILMDashboard.js**: Load disaggregation visualization
- **PVDashboard.js**: Fault detection interface
- **App.js**: Main layout, navigation, health monitoring

### Node.js Backend
- Route requests to appropriate Flask APIs
- Generate mock data for testing
- Serve React production build
- Aggregate analytics from both systems

### NILM Flask API
- Load and serve PyTorch NILM models
- Process time-series aggregate power data
- Return appliance-level consumption predictions
- Support multiple model architectures

### PV Flask API
- Load and serve ML fault detection models
- Calculate theoretical PV power output
- Perform feature engineering
- Classify faults with confidence scores

## Port Assignment

| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| React Frontend | 3000 | HTTP | User interface |
| Node.js Backend | 3001 | HTTP | API orchestration |
| NILM Flask API | 5001 | HTTP | NILM model serving |
| PV Flask API | 5002 | HTTP | PV model serving |

## Technology Stack

### Frontend
- **Framework**: React 18
- **UI Library**: Material-UI (MUI) 5
- **Charts**: Recharts 2
- **HTTP Client**: Axios
- **Routing**: React Router 6

### Backend
- **Runtime**: Node.js 16+
- **Framework**: Express.js 4
- **HTTP Client**: Axios
- **Logging**: Morgan
- **CORS**: cors package

### Flask APIs
- **Framework**: Flask 3.0
- **ML Framework**: PyTorch 2.1 (NILM & PV LSTM)
- **ML Libraries**: 
  - scikit-learn (Random Forest)
  - XGBoost 2.0
  - LightGBM 4.1
- **Data Processing**: pandas, numpy
- **CORS**: flask-cors

## Model Information

### NILM Models
| Model | Type | Architecture | Input | Output |
|-------|------|--------------|-------|--------|
| BiLSTM | RNN | Bidirectional LSTM | Sequence (288) | 5 appliances |
| TCN | CNN | Temporal Conv Net | Sequence (288) | 5 appliances |
| ATCN | Hybrid | TCN + Attention | Sequence (288) | 5 appliances |

**Appliances**: EVSE, PV, CS, CHP, BA

### PV Models
| Model | Type | Features | Classes | Accuracy |
|-------|------|----------|---------|----------|
| Random Forest | Ensemble | 10 features | 4 faults | 98.9% |
| XGBoost | Gradient Boosting | 10 features | 4 faults | ~98% |
| LSTM | Deep Learning | 10 features | 4 faults | ~94% |

**Faults**: Normal, Open Circuit, Short Circuit, Partial Shadowing

## Configuration Files

### package.json (Backend)
```json
{
  "name": "pes-dashboard-backend",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "axios": "^1.6.2",
    "morgan": "^1.10.0"
  }
}
```

### package.json (Frontend)
```json
{
  "name": "pes-dashboard-frontend",
  "dependencies": {
    "@mui/material": "^5.14.19",
    "react": "^18.2.0",
    "recharts": "^2.10.3",
    "axios": "^1.6.2"
  }
}
```

### requirements.txt (NILM)
```
Flask==3.0.0
flask-cors==4.0.0
torch==2.1.1
numpy==1.24.3
pandas==2.0.3
scikit-learn==1.3.2
```

### requirements.txt (PV)
```
Flask==3.0.0
flask-cors==4.0.0
torch==2.1.1
xgboost==2.0.3
lightgbm==4.1.0
numpy==1.24.3
pandas==2.0.3
scikit-learn==1.3.2
```

## Development Workflow

1. **Development Mode**:
   - Each service runs independently
   - React has hot reload
   - Flask runs in debug mode
   - Backend uses nodemon (optional)

2. **Testing**:
   - Test Flask APIs: `python test_api.py`
   - Test Backend: `curl http://localhost:3001/api/health`
   - Test Frontend: Open browser to localhost:3000

3. **Production Build**:
   - Build React: `npm run build`
   - Serve from Node.js backend
   - Use environment variables for configuration
   - Deploy Flask APIs separately or containerize

## Security Considerations

- [ ] No authentication (add for production)
- [ ] CORS enabled for development
- [ ] APIs accept all origins (restrict in production)
- [ ] No rate limiting (add for production)
- [ ] No input validation (basic validation exists)
- [ ] No HTTPS (use reverse proxy in production)

## Future Enhancements

- [ ] User authentication and authorization
- [ ] Database for storing predictions
- [ ] Real-time data streaming (WebSocket)
- [ ] Historical data analysis
- [ ] Alert system for faults
- [ ] Mobile responsive design improvements
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Unit and integration tests
