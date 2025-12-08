# PES Final Project - Energy Monitoring System

cd .\Dashboard\
.\start_all_with_chatbot.bat

> **Last Updated**: November 28, 2025  
> **Version**: 2.0 - RAG Chatbot Integration

A comprehensive energy management and monitoring system integrating **NILM (Non-Intrusive Load Monitoring)** for appliance-level energy disaggregation, **PV (Photovoltaic) Fault Detection** for solar panel system diagnostics, and an **AI-Powered RAG Chatbot** for intelligent system assistance.

## 📋 Project Overview

This project combines cutting-edge machine learning models with real-time web dashboards to provide:
- **Smart Energy Monitoring**: Disaggregate total household power consumption into individual appliance usage
- **Solar System Health**: Detect and classify faults in photovoltaic systems
- **AI Assistant**: RAG-based chatbot providing real-time insights and troubleshooting guidance
- **Interactive Dashboard**: Web-based interface for real-time monitoring and analysis with dark mode support

## 🏗️ Project Structure

```
PES_Final/
├── Dashboard/              # Full-stack web application
│   ├── backend/           # Node.js/Express API server (Port 3001)
│   │   ├── config/        # Database configuration
│   │   ├── middleware/    # Authentication middleware
│   │   ├── models/        # MongoDB user model
│   │   ├── routes/        # API routes
│   │   └── server.js      # Main server file
│   │
│   ├── frontend/          # React dashboard UI (Port 3000)
│   │   ├── public/        # Static assets
│   │   ├── src/
│   │   │   ├── components/  # React components
│   │   │   │   ├── Login.js
│   │   │   │   ├── Signup.js
│   │   │   │   ├── NILMDashboard.js
│   │   │   │   ├── PVDashboard.js
│   │   │   │   ├── OverviewDashboard.js
│   │   │   │   └── ChatbotAssistant.js  # AI Chatbot UI
│   │   │   ├── context/     # React contexts
│   │   │   │   ├── AuthContext.js
│   │   │   │   └── DashboardContext.js  # Shared dashboard state
│   │   │   └── App.js       # Main application
│   │   └── build/         # Production build
│   │
│   ├── flask_api_nilm/    # NILM ML model API (Port 5001)
│   │   ├── app.py         # Flask server with PyTorch models
│   │   └── requirements.txt
│   │
│   ├── flask_api_pv/      # PV fault detection API (Port 5002)
│   │   ├── app.py         # Flask server with ML models
│   │   └── requirements.txt
│   │
│   ├── RAG_Chatbot/       # AI Assistant API (Port 5003) ✨ NEW
│   │   ├── app.py         # RAG chatbot with Gemini/OpenAI
│   │   ├── requirements.txt
│   │   ├── .env.example   # Environment variables template
│   │   ├── README.md      # Chatbot documentation
│   │   └── CHATBOT_GUIDE.md
│   │
│   └── Documentation/
│       ├── README.md
│       ├── SETUP_GUIDE.md
│       ├── ARCHITECTURE.md
│       └── ...
│
├── NILM_SIDED-master/     # NILM model training & inference
│   ├── saved_models/      # Trained PyTorch models (BiLSTM, TCN, ATCN)
│   ├── data_augmentation.py
│   └── workspace.ipynb
│
├── PV/                    # PV system simulation & ML models
│   ├── ML_Models/         # Trained models (Random Forest, XGBoost, LSTM)
│   │   ├── PV_Array.py
│   │   └── PV_Folder/     # Model files
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
  - LightGBM
  - LSTM (PyTorch)
- **Fault Types**:
  - Normal Operation
  - Open Circuit
  - Short Circuit
  - Partial Shadowing
- **System Specs**: 18.7 kW PV Array (45 panels)
- **Features**: I-V curve analysis, irradiance/temperature monitoring, real-time probability distribution

### AI-Powered RAG Chatbot ✨ NEW
- **LLM Integration**:
  - Gemini (Google Generative AI) - Primary
  - OpenAI GPT - Fallback
  - Template-based responses - Ultimate fallback
- **Real-time Data Integration**:
  - Live NILM predictions and appliance consumption
  - Current PV system status and fault detection
  - Sensor readings (irradiance, temperature, voltage, current)
- **Knowledge Base**: 8 curated documents covering NILM, PV systems, fault types, and troubleshooting
- **Features**:
  - Context-aware responses using RAG (Retrieval-Augmented Generation)
  - Conversation history management
  - Suggested questions for quick access
  - Dark mode support
  - Real-time system status integration

### Web Dashboard
- **Authentication**: JWT-based user authentication with MongoDB
- **Overview**: System health and performance metrics
- **NILM Dashboard**: Real-time appliance consumption visualization
- **PV Dashboard**: Fault detection and system monitoring
- **AI Assistant**: Popup chatbot with real-time insights
- **Charts**: Interactive time-series and distribution plots
- **Dark Mode**: Full theme support across all components
- **Responsive Design**: Mobile-friendly interface

## 🚀 Quick Start

### Prerequisites
- **Python** 3.8 or higher
- **Node.js** 16 or higher
- **MongoDB** (local or cloud instance)
- **pip** package manager
- **npm** package manager
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Leb0wsKy/PES_Final.git
   cd PES_Final
   ```

2. **Install all dependencies**
   
   Navigate to the Dashboard folder:
   ```bash
   cd Dashboard
   ```

   #### Install Python dependencies:
   ```bash
   # NILM API
   cd flask_api_nilm
   pip install -r requirements.txt
   
   # PV API
   cd ..\flask_api_pv
   pip install -r requirements.txt
   
   # RAG Chatbot
   cd ..\RAG_Chatbot
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

3. **Configure environment variables**
   
   Create `.env` files:
   
   **Backend** (`Dashboard/backend/.env`):
   ```env
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/pes_dashboard
   JWT_SECRET=your-secret-key-here
   ```
   
   **RAG Chatbot** (`Dashboard/RAG_Chatbot/.env`):
   ```env
   GEMINI_API_KEY=your-gemini-api-key
   OPENAI_API_KEY=your-openai-api-key  # Optional fallback
   PORT=5003
   ```

4. **Build the frontend**
   ```bash
   cd Dashboard\frontend
   npm run build
   cd ..\..
   ```

5. **Verify model files exist**
   
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

#### Terminal 3: RAG Chatbot API ✨ NEW
```bash
cd Dashboard\RAG_Chatbot
python app.py
```
*Runs on: http://localhost:5003*

#### Terminal 4: Node.js Backend (serves frontend)
```bash
cd Dashboard\backend
node server.js
```
*Runs on: http://localhost:3001*

**Access the dashboard at**: http://localhost:3001

### Alternative: Use Batch Scripts (Windows)

```bash
# Start all services
cd Dashboard
start_all_with_chatbot.bat
```

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Browser Interface                        │
│                     http://localhost:3001                        │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                ┌───────────▼──────────┐
                │   React Frontend     │
                │   - Dashboard UI     │
                │   - Authentication   │
                │   - Dark Mode        │
                │   - Chatbot UI       │
                │   - Charts & Graphs  │
                └───────────┬──────────┘
                            │
                ┌───────────▼──────────┐
                │  Node.js Backend     │ (Port 3001)
                │  Express + MongoDB   │
                │  - JWT Auth          │
                │  - API Proxy         │
                │  - Static Serving    │
                └─────┬────┬────┬──────┘
                      │    │    │
        ┌─────────────┘    │    └─────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  NILM API    │  │   PV API     │  │ RAG Chatbot  │
│  Flask       │  │   Flask      │  │    Flask     │
│ (Port 5001)  │  │ (Port 5002)  │  │ (Port 5003)  │
│              │  │              │  │              │
│ - BiLSTM     │  │ - Random     │  │ - Gemini LLM │
│ - TCN        │  │   Forest     │  │ - OpenAI     │
│ - ATCN       │  │ - XGBoost    │  │ - Knowledge  │
│              │  │ - LightGBM   │  │   Base       │
│              │  │ - LSTM       │  │ - Context    │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ PyTorch      │  │ ML Models    │  │ Real-time    │
│ Models       │  │ (sklearn,    │  │ Dashboard    │
│ (BiLSTM,     │  │  XGBoost,    │  │ Data         │
│  TCN, ATCN)  │  │  PyTorch)    │  │ Integration  │
└──────────────┘  └──────────────┘  └──────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Data Flow                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User Input → Frontend → Backend Proxy → Flask APIs             │
│                                              ↓                   │
│                                         ML Models                │
│                                              ↓                   │
│                                         Predictions              │
│                                              ↓                   │
│  User sees result ← Frontend ← Backend ← Flask APIs             │
│                                                                  │
│  Chatbot Query → Frontend → Backend → RAG Chatbot               │
│                                              ↓                   │
│                                    Retrieve Context              │
│                                    + Live Dashboard Data         │
│                                              ↓                   │
│                                         LLM (Gemini)             │
│                                              ↓                   │
│  User sees answer ← Frontend ← Backend ← RAG Response           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Component Communication

1. **Frontend Layer**:
   - React components for UI
   - DashboardContext shares state between components
   - AuthContext manages user authentication
   - ChatbotAssistant sends real-time data with queries

2. **Backend Layer**:
   - Express server handles authentication
   - Proxies requests to Flask APIs
   - Serves static frontend build
   - Manages MongoDB connections

3. **ML Service Layer**:
   - Independent Flask APIs for each service
   - PyTorch/scikit-learn model inference
   - Real-time prediction generation

4. **AI Assistant Layer**:
   - RAG pipeline with vector search
   - LLM integration (Gemini/OpenAI)
   - Real-time dashboard data injection
   - Context-aware response generation

## 🔌 API Documentation

### Node.js Backend API (Port 3001)

#### Health Check
- `GET /api/health` - Check status of all services (NILM, PV, Chatbot)

#### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login (returns JWT token)
- `GET /api/auth/me` - Get current user info (requires auth)

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

#### PV Endpoints
- `POST /api/pv/predict` - Fault detection
  ```json
  {
    "model": "lightgbm",
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

#### Chatbot Endpoints ✨ NEW
- `GET /api/chatbot/suggest` - Get suggested questions
- `POST /api/chatbot/chat` - Send message to chatbot
  ```json
  {
    "message": "How is my PV system doing?",
    "session_id": "unique-session-id",
    "pv_data": { /* current PV predictions */ },
    "nilm_data": { /* current NILM predictions */ }
  }
  ```
- `POST /api/chatbot/clear` - Clear conversation history

## 🧪 Testing

### Test All Services Health
```bash
curl http://localhost:3001/api/health
```

### Test NILM API
```bash
curl http://localhost:5001/health
```

### Test PV API
```bash
curl http://localhost:5002/health
```

### Test Chatbot API ✨ NEW
```bash
curl http://localhost:5003/health
```

### Test Chatbot Conversation
```bash
curl -X POST http://localhost:3001/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explain PV fault types",
    "session_id": "test-session"
  }'
```

## 📚 Documentation

Detailed documentation available in the `Dashboard/` folder:
- **[README.md](Dashboard/README.md)** - Dashboard setup and usage
- **[SETUP_GUIDE.md](Dashboard/SETUP_GUIDE.md)** - Detailed installation guide
- **[ARCHITECTURE.md](Dashboard/ARCHITECTURE.md)** - System architecture
- **[PROJECT_STRUCTURE.md](Dashboard/PROJECT_STRUCTURE.md)** - File organization
- **[AUTH_SETUP.md](Dashboard/AUTH_SETUP.md)** - Authentication system
- **[QUICK_REFERENCE.md](Dashboard/QUICK_REFERENCE.md)** - Quick reference guide
- **[CHATBOT_GUIDE.md](Dashboard/RAG_Chatbot/CHATBOT_GUIDE.md)** - RAG Chatbot documentation ✨ NEW

## ✨ Recent Updates (v2.0)

### RAG Chatbot Integration (November 2025)
- ✅ Implemented AI-powered assistant with Gemini/OpenAI LLM
- ✅ Real-time dashboard data integration for context-aware responses
- ✅ Knowledge base with 8 curated documents
- ✅ Conversation history and session management
- ✅ Suggested questions for quick assistance
- ✅ Full dark mode support for chatbot UI
- ✅ Fallback mechanisms (Gemini → OpenAI → Templates)

### UI/UX Improvements
- ✅ Dark mode support across entire dashboard
- ✅ Aligned and organized NILM power consumption cards
- ✅ Enhanced PV fault probability visualization
- ✅ Improved mobile responsiveness
- ✅ Popup chat interface with smooth animations

### Backend Enhancements
- ✅ Backend now serves frontend build (single port deployment)
- ✅ Extended health check to include all 4 services
- ✅ Dashboard context sharing between components
- ✅ Improved API proxy architecture

## 🛠️ Technology Stack

### Machine Learning & AI
- **PyTorch** - Deep learning framework (NILM models)
- **scikit-learn** - ML algorithms (Random Forest, preprocessing)
- **XGBoost** - Gradient boosting for PV fault detection
- **LightGBM** - Fast gradient boosting framework
- **pandas** & **numpy** - Data manipulation and analysis
- **Gemini (Google Generative AI)** - Large language model for chatbot
- **OpenAI GPT** - Backup LLM provider
- **SentenceTransformers** - Optional embeddings for RAG

### Backend
- **Flask** - Python API framework for ML models
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database for user management
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **axios** - HTTP client
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** 18 - UI framework
- **Material-UI (MUI)** - Component library
- **Recharts** - Data visualization library
- **React Router** - Client-side routing
- **React Context API** - State management
- **Dark Mode** - Theme switching support

### Development Tools
- **npm** - Node package manager
- **pip** - Python package manager
- **dotenv** - Environment variable management
- **nodemon** - Development server auto-reload

### Embedded Systems & Simulation
- **STM32** - Microcontroller platform
- **MATLAB/Simulink** - PV array simulation
- **PIL (Processor-in-the-Loop)** - Hardware testing

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
- [ ] Mobile application (React Native)
- [ ] Advanced anomaly detection algorithms
- [ ] Energy cost optimization recommendations
- [ ] Multi-building support
- [ ] Cloud deployment (AWS/Azure/GCP)
- [ ] Voice interface for chatbot
- [ ] Predictive maintenance alerts
- [ ] Energy consumption forecasting
- [ ] Integration with smart home systems
- [ ] PDF report generation
- [ ] Admin dashboard for user management
- [ ] Multi-language support
- [ ] Enhanced embeddings for RAG with semantic search

## 📞 Support & Troubleshooting

### Common Issues

1. **Port already in use**
   - Check if services are already running: `netstat -ano | findstr "3001 5001 5002 5003"`
   - Kill processes or change ports in configuration

2. **MongoDB connection error**
   - Ensure MongoDB is running locally or update connection string
   - Check `.env` file in backend folder

3. **Model files not found**
   - Verify model files are in correct paths
   - Re-download models if necessary

4. **Chatbot not responding**
   - Check if API keys are set in `.env`
   - Verify chatbot service is running on port 5003
   - Check browser console for errors

5. **Frontend build issues**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again
   - Clear browser cache

For more issues, check the documentation in the `Dashboard/` folder.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributors

PES Final Project Team - 2025
IEEE SUP'COM Student Branch

## 🙏 Acknowledgments

- **SIDED Dataset** - For providing comprehensive NILM data
- **Google Gemini** - For powerful LLM capabilities in the chatbot
- **OpenAI** - For GPT model integration
- **Material-UI** - For beautiful UI components
- **Recharts** - For powerful data visualization
- **PyTorch Community** - For excellent deep learning tools
- **scikit-learn** - For robust ML algorithms
- **Flask Community** - For lightweight API framework
- **React Team** - For modern frontend development

## 🎓 Academic Context

This project was developed as part of the PES (Power and Energy Systems) final project, demonstrating the integration of:
- Machine learning for energy analytics
- RAG (Retrieval-Augmented Generation) for intelligent assistance
- Full-stack web development
- Real-time data processing
- Embedded systems (STM32)
- Simulation and modeling (MATLAB/Simulink)
- Modern AI/LLM integration

## 📈 Project Stats

- **Services**: 4 (Backend, NILM API, PV API, RAG Chatbot)
- **ML Models**: 7+ (BiLSTM, TCN, ATCN, Random Forest, XGBoost, LightGBM, LSTM)
- **LLM Integration**: 2 providers (Gemini, OpenAI)
- **Frontend Components**: 10+ React components
- **API Endpoints**: 15+ RESTful endpoints
- **Lines of Code**: 10,000+ (excluding dependencies)
- **Supported Appliances**: 5 (EVSE, PV, CS, CHP, BA)
- **Fault Types**: 4 for PV systems
- **Knowledge Base**: 8 curated documents

---

**Built with ❤️ for sustainable energy management**

*Last Updated: November 28, 2025 - Version 2.0*
