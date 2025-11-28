# PES Final Project - Energy Monitoring System

A comprehensive energy management and monitoring system integrating **NILM (Non-Intrusive Load Monitoring)** for appliance-level energy disaggregation and **PV (Photovoltaic) Fault Detection** for solar panel system diagnostics.

## 📋 Project Overview

This project combines cutting-edge machine learning models with real-time web dashboards to provide:
- **Smart Energy Monitoring**: Disaggregate total household power consumption into individual appliance usage
- **Solar System Health**: Detect and classify faults in photovoltaic systems
- **Interactive Dashboard**: Web-based interface for real-time monitoring and analysis

## 🏗️ Project Structure

```
PES_Final/
├── Dashboard/              # Full-stack web application
│   ├── backend/           # Node.js/Express API server
│   ├── frontend/          # React dashboard UI
│   ├── flask_api_nilm/    # NILM ML model API
│   └── flask_api_pv/      # PV fault detection API
│
├── NILM_SIDED-master/     # NILM model training & inference
│   ├── saved_models/      # Trained PyTorch models (BiLSTM, TCN, ATCN)
│   ├── data_augmentation.py
│   └── workspace.ipynb
│
├── PV/                    # PV system simulation & ML models
│   ├── ML_Models/         # Trained models (Random Forest, XGBoost, LSTM)
│   ├── PIL/              # STM32 embedded system code
│   └── Simulink_Matlab/  # PV array simulation
│
└── SIDED/                # SIDED dataset for NILM
    └── SIDED/
        ├── DataforNILMTK/ # Preprocessed H5 files
        ├── Dealer/        # Commercial building data
        ├── Logistic/      # Logistics center data
        └── Office/        # Office building data
```

## 🎯 Key Features

### NILM System
- **Deep Learning Models**: 
  - BiLSTM (Bidirectional LSTM)
  - TCN (Temporal Convolutional Network)
  - ATCN (Attention-based TCN)
- **Supported Appliances**: 
  - EVSE (Electric Vehicle Supply Equipment)
  - PV (Photovoltaic)
  - CS (Charging Station)
  - CHP (Combined Heat & Power)
  - BA (Battery)
- **Dataset**: SIDED dataset with AMDA augmentation
- **Capabilities**: Real-time load disaggregation from aggregate power measurements

### PV Fault Detection
- **ML Models**:
  - Random Forest (98.9% accuracy)
  - XGBoost
  - LSTM (PyTorch)
- **Fault Types**:
  - Normal Operation
  - Open Circuit
  - Short Circuit
  - Partial Shadowing
- **System Specs**: 18.7 kW PV Array (45 panels)
- **Features**: I-V curve analysis, irradiance/temperature monitoring

### Web Dashboard
- **Authentication**: JWT-based user authentication
- **Overview**: System health and performance metrics
- **NILM Dashboard**: Real-time appliance consumption visualization
- **PV Dashboard**: Fault detection and system monitoring
- **Charts**: Interactive time-series and distribution plots

## 🚀 Quick Start

### Prerequisites
- **Python** 3.8 or higher
- **Node.js** 16 or higher
- **pip** package manager
- **npm** package manager

### Installation

1. **Clone the repository**
   ```bash
   cd C:\Users\Admin\Desktop\PES_Final
   ```

2. **Install all dependencies**
   
   Navigate to the Dashboard folder:
   ```bash
   cd Dashboard
   ```

   #### Install Python dependencies:
   ```bash
   cd flask_api_nilm
   pip install -r requirements.txt
   cd ..\flask_api_pv
   pip install -r requirements.txt
   cd ..
   ```

   #### Install Node.js dependencies:
   ```bash
   cd backend
   npm install
   cd ..\frontend
   npm install
   cd ..
   ```

3. **Verify model files exist**
   
   Ensure these trained models are in place:
   - `NILM_SIDED-master/saved_models/BiLSTM_best.pth`
   - `NILM_SIDED-master/saved_models/TCN_best.pth`
   - `NILM_SIDED-master/saved_models/ATCN_best.pth`
   - `PV/ML_Models/PV_Folder/random_forest_pv_model.pkl`
   - `PV/ML_Models/PV_Folder/xgboost_pv_model.json`
   - `PV/ML_Models/PV_Folder/lstm_pytorch_model.pth`

### Running the System

You need to run **4 servers** simultaneously. Open 4 separate terminals:

#### Terminal 1: NILM Flask API
```bash
cd Dashboard\flask_api_nilm
python app.py
```
*Runs on: http://localhost:5001*

#### Terminal 2: PV Flask API
```bash
cd Dashboard\flask_api_pv
python app.py
```
*Runs on: http://localhost:5002*

#### Terminal 3: Node.js Backend
```bash
cd Dashboard\backend
npm start
```
*Runs on: http://localhost:3001*

#### Terminal 4: React Frontend
```bash
cd Dashboard\frontend
npm start
```
*Runs on: http://localhost:3000*

**Access the dashboard at**: http://localhost:3000

## 📊 System Architecture

```
┌─────────────────┐
│  React Frontend │ (Port 3000)
│   Dashboard UI  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Node.js Backend│ (Port 3001)
│  Express Server │
└────┬───────┬────┘
     │       │
     ▼       ▼
┌─────────┐ ┌─────────┐
│ NILM API│ │  PV API │
│ Flask   │ │ Flask   │
│(Pt 5001)│ │(Pt 5002)│
└────┬────┘ └────┬────┘
     │           │
     ▼           ▼
┌─────────┐ ┌─────────┐
│  NILM   │ │   PV    │
│ Models  │ │ Models  │
│(PyTorch)│ │ (ML)    │
└─────────┘ └─────────┘
```

## 🔌 API Documentation

### Node.js Backend API (Port 3001)

#### Health Check
- `GET /api/health` - Check status of all services

#### NILM Endpoints
- `POST /api/nilm/predict` - Single prediction
  ```json
  {
    "model": "atcn",
    "aggregate_power": [array of power values],
    "normalize": true
  }
  ```
- `POST /api/nilm/batch-predict` - Batch predictions
- `GET /api/nilm/models` - List available models
- `GET /api/nilm/mock-data?hours=24` - Generate test data

#### PV Endpoints
- `POST /api/pv/predict` - Fault detection
  ```json
  {
    "model": "random_forest",
    "data": {
      "Irradiance": 1000,
      "Temperature": 25,
      "Current(A)": 30,
      "Power(W)": 18000,
      "Voltage(V)": 600
    }
  }
  ```
- `POST /api/pv/batch-predict` - Batch fault detection
- `GET /api/pv/models` - List available models
- `GET /api/pv/mock-data?hours=24` - Generate test data

## 🧪 Testing

### Test NILM API
```bash
curl -X POST http://localhost:5001/health
```

### Test PV API
```bash
curl -X POST http://localhost:5002/health
```

### Test Backend
```bash
curl http://localhost:3001/api/health
```

## 📚 Documentation

Detailed documentation available in the `Dashboard/` folder:
- **[README.md](Dashboard/README.md)** - Dashboard setup and usage
- **[SETUP_GUIDE.md](Dashboard/SETUP_GUIDE.md)** - Detailed installation guide
- **[ARCHITECTURE.md](Dashboard/ARCHITECTURE.md)** - System architecture
- **[PROJECT_STRUCTURE.md](Dashboard/PROJECT_STRUCTURE.md)** - File organization
- **[AUTH_SETUP.md](Dashboard/AUTH_SETUP.md)** - Authentication system
- **[QUICK_REFERENCE.md](Dashboard/QUICK_REFERENCE.md)** - Quick reference guide

## 🛠️ Technology Stack

### Machine Learning
- **PyTorch** - Deep learning framework (NILM models)
- **scikit-learn** - ML algorithms (Random Forest)
- **XGBoost** - Gradient boosting
- **pandas** & **numpy** - Data manipulation

### Backend
- **Flask** - Python API framework for ML models
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **axios** - HTTP client

### Frontend
- **React** 18 - UI framework
- **Material-UI** - Component library
- **Recharts** - Data visualization
- **React Router** - Navigation

### Embedded Systems
- **STM32** - Microcontroller platform
- **MATLAB/Simulink** - PV array simulation

## 📈 Model Performance

### NILM Models
- **BiLSTM**: Baseline bidirectional LSTM model
- **TCN**: Temporal convolutional network with dilated convolutions
- **ATCN**: Attention mechanism + TCN (best performance)

### PV Models
- **Random Forest**: 98.9% accuracy on fault classification
- **XGBoost**: High-speed gradient boosting
- **LSTM**: Sequential pattern recognition

## 🗂️ Dataset Information

### SIDED Dataset
- **Buildings**: Dealer, Logistic, Office
- **Locations**: LA, Offenbach, Tokyo
- **Appliances**: EVSE, PV, CS, CHP, BA
- **Sampling**: 1-minute intervals
- **Format**: CSV and H5 (NILMTK compatible)

### PV Dataset
- **Source**: Simulink simulation + real-world data
- **Parameters**: Irradiance, Temperature, I-V characteristics
- **Fault Scenarios**: Normal, OC, SC, Partial Shadowing
- **System Size**: 18.7 kW (45 panels)

## 🔐 Security

- JWT-based authentication
- MongoDB for user management
- Password hashing with bcrypt
- Protected API routes

## 🚧 Future Enhancements

- [ ] Real-time data streaming from IoT sensors
- [ ] Historical data analysis and trends
- [ ] Mobile application
- [ ] Advanced anomaly detection
- [ ] Energy cost optimization recommendations
- [ ] Multi-building support
- [ ] Cloud deployment

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributors

PES Final Project Team - 2024/2025

## 🙏 Acknowledgments

- **SIDED Dataset** - For providing comprehensive NILM data
- **Material-UI** - For beautiful UI components
- **Recharts** - For powerful data visualization
- **PyTorch Community** - For excellent deep learning tools
- **scikit-learn** - For robust ML algorithms

## 📞 Support

For questions or issues:
1. Check the documentation in the `Dashboard/` folder
2. Review the API endpoint documentation
3. Verify all services are running correctly
4. Check model files are in the correct locations

## 🎓 Academic Context

This project was developed as part of the PES (Power and Energy Systems) final project, demonstrating the integration of:
- Machine learning for energy analytics
- Full-stack web development
- Real-time data processing
- Embedded systems (STM32)
- Simulation and modeling (MATLAB/Simulink)

---

**Built with ❤️ for sustainable energy management**
