# Quick Reference Guide

## 🚀 Quick Start Commands

### Install Everything
```bash
cd Dashboard
install_all.bat
```

### Start Everything
```bash
start_all.bat
```

### Access Dashboard
```
http://localhost:3000
```

---

## 🔌 Service URLs

| Service | URL | Status Check |
|---------|-----|--------------|
| Dashboard | http://localhost:3000 | Open in browser |
| Backend | http://localhost:3001 | curl http://localhost:3001/api/health |
| NILM API | http://localhost:5001 | curl http://localhost:5001/health |
| PV API | http://localhost:5002 | curl http://localhost:5002/health |

---

## 🎯 Common Tasks

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

### Rebuild Frontend
```bash
cd Dashboard/frontend
npm run build
```

### Check Running Services
```bash
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :5001
netstat -ano | findstr :5002
```

### Kill Process on Port
```bash
# Find PID
netstat -ano | findstr :PORT

# Kill process
taskkill /PID <pid> /F
```

---

## 📁 Important Files

### Configuration
- `backend/server.js` - Backend server & API routes
- `frontend/src/App.js` - Main React app
- `flask_api_nilm/app.py` - NILM model API
- `flask_api_pv/app.py` - PV model API

### Documentation
- `README.md` - Main documentation
- `SETUP_GUIDE.md` - Setup instructions
- `PROJECT_STRUCTURE.md` - Architecture details
- `CREATION_SUMMARY.md` - What was created

### Scripts
- `install_all.bat` - Install dependencies
- `start_all.bat` - Start all services

---

## 🔧 Quick Fixes

### "Module not found"
```bash
# Backend/Frontend
cd backend  # or frontend
npm install

# Flask APIs
cd flask_api_nilm  # or flask_api_pv
pip install -r requirements.txt
```

### "Port already in use"
```bash
# Find and kill process
netstat -ano | findstr :PORT
taskkill /PID <pid> /F
```

### "Model files not found"
Update paths in:
- `flask_api_nilm/app.py` line 22
- `flask_api_pv/app.py` line 18

### "Cannot connect to API"
1. Check if Flask API is running
2. Check firewall settings
3. Verify port numbers in `backend/server.js`

---

## 📊 Model Files Required

### NILM Models
```
NILM_SIDED-master/saved_models/
├── BiLSTM_best.pth
├── TCN_best.pth
└── ATCN_best.pth
```

### PV Models
```
PV/ML_Models/PV_Folder/
├── random_forest_pv_model.pkl
├── xgboost_pv_model.json
└── lstm_pytorch_model.pth
```

---

## 🎨 Dashboard Features

### Overview Tab
- System health status
- Key metrics
- Quick data preview

### NILM Tab
- Select model: BiLSTM, TCN, ATCN
- View appliance consumption
- Time series charts
- Energy distribution

### PV Tab
- Select model: RF, XGBoost, LSTM
- Fault detection
- Manual input testing
- System monitoring

---

## 🧪 API Testing

### NILM Prediction
```bash
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{
    "model": "atcn",
    "aggregate_power": [array of 288+ numbers],
    "normalize": true
  }'
```

### PV Fault Detection
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

---

## 📦 Dependencies

### Python (Flask APIs)
```
Flask==3.0.0
flask-cors==4.0.0
torch==2.1.1
numpy==1.24.3
pandas==2.0.3
scikit-learn==1.3.2
xgboost==2.0.3  # PV only
lightgbm==4.1.0  # PV only
```

### Node.js (Backend)
```
express
cors
axios
morgan
```

### React (Frontend)
```
react
@mui/material
recharts
axios
```

---

## ⚡ Troubleshooting Checklist

- [ ] Python 3.8+ installed?
- [ ] Node.js 16+ installed?
- [ ] All dependencies installed?
- [ ] Model files exist?
- [ ] Ports 3000, 3001, 5001, 5002 available?
- [ ] Flask APIs running?
- [ ] Backend running?
- [ ] No errors in terminals?

---

## 📞 Help Resources

### Documentation
1. **README.md** - Overview & features
2. **SETUP_GUIDE.md** - Detailed setup
3. **PROJECT_STRUCTURE.md** - Architecture
4. **CREATION_SUMMARY.md** - Implementation details

### Check Logs
- Flask APIs: Terminal output
- Backend: Terminal output
- Frontend: Browser console (F12)

### Common Issues
- Port conflicts → Kill process
- Module errors → Reinstall dependencies
- Model errors → Check file paths
- CORS errors → Check if all services running

---

## 🎯 Production Checklist

Before deploying:
- [ ] Build React: `npm run build`
- [ ] Set environment variables
- [ ] Enable authentication
- [ ] Add rate limiting
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Add error logging
- [ ] Set up monitoring
- [ ] Add database
- [ ] Create backups

---

## 📝 Notes

- Mock data generators included (no sensors needed)
- All services must run simultaneously
- Use separate terminals for each service
- Frontend proxies to backend in development
- Models load on Flask API startup
- First prediction may be slow (model loading)

---

## 🎉 Success Indicators

Dashboard working correctly when:
- ✅ All 4 services running without errors
- ✅ Dashboard loads at localhost:3000
- ✅ All three tabs display correctly
- ✅ Health status shows all services "healthy"
- ✅ Predictions return results
- ✅ Charts render properly
- ✅ No console errors

---

**For detailed information, see the full documentation files!**
