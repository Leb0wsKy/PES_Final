"""
Flask API for PV Fault Detection Models
Serves Random Forest, XGBoost, and LSTM models for PV fault classification
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torch.nn as nn
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
import joblib
import xgboost as xgb
import os
from pathlib import Path

app = Flask(__name__)
CORS(app)

# Device configuration
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Model paths
MODELS_DIR = Path('../../PV/ML_Models/PV_Folder')

# Feature names
FEATURES = ['Irradiance', 'Temperature', 'Current(A)', 'Power(W)', 'Voltage(V)',
            'LoadCurrent(A)', 'LoadPower(W)', 'LoadVoltage(V)',
            'Power_Ratio', 'Power_Theo']

# Fault types
FAULT_TYPES = ['Healthy', 'No production', 'Open Circuit', 'Partial Shadowing', 'Short Circuit']
STATUS_MAPPING = {
    'Healthy': 0,
    'No production': 1,
    'Open Circuit': 2,
    'Partial Shadowing': 3,
    'Short Circuit': 4
}

# Model names mapping
MODEL_DISPLAY_NAMES = {
    'gbm': 'Gradient Boosting',
    'xgboost': 'XGBoost',
    'lightgbm': 'LightGBM',
    'lstm': 'LSTM'
}

# PV system parameters for theoretical power calculation
PV_PARAMS = {
    'Isc_ref': 11.56,
    'Voc_ref': 49.8,
    'Imp_ref': 10.98,
    'Vmp_ref': 41.1,
    'alpha_isc': 0.102,
    'beta_voc': -0.36099,
    'G_ref': 1000,
    'T_ref': 25,
    'n_s': 60,
    'n_p': 3,
    'modules_per_string': 15,
    'A': 1.9
}

# ==================== Helper Functions ====================

def find_mpp(voltage, current):
    """Find the maximum power point from I-V curve"""
    power = voltage * current
    mpp_idx = np.argmax(power)
    return power[mpp_idx].round(3)

def calculate_theoretical_power(irradiance, temperature):
    """Calculate theoretical PV power output"""
    k = 1.38e-23  # Boltzmann constant
    q = 1.602e-19  # Electron charge
    
    T = temperature + 273.15
    Vt = k * T / q
    
    # Adjust Isc and Voc
    Isc = PV_PARAMS['Isc_ref'] * (irradiance / PV_PARAMS['G_ref']) * \
          (1 + PV_PARAMS['alpha_isc'] * (temperature - PV_PARAMS['T_ref']) / 100)
    
    Voc = PV_PARAMS['Voc_ref'] * \
          (1 + PV_PARAMS['beta_voc'] * (temperature - PV_PARAMS['T_ref']) / 100)
    
    Voc_array = Voc * PV_PARAMS['modules_per_string']
    I0 = Isc / (np.exp(Voc / (PV_PARAMS['A'] * PV_PARAMS['n_s'] * Vt)) - 1)
    
    voltage_range = np.linspace(0, Voc_array * 1.1, 1000)
    photo_current = Isc * PV_PARAMS['n_p']
    saturation_current = I0 * PV_PARAMS['n_p']
    
    voltage_per_module = voltage_range / PV_PARAMS['modules_per_string']
    current_values = photo_current - saturation_current * \
                     (np.exp(voltage_per_module / (PV_PARAMS['A'] * PV_PARAMS['n_s'] * Vt)) - 1)
    current_values = np.maximum(current_values, 0)
    
    return find_mpp(voltage_range, current_values) / 3

def feature_engineering(data):
    """Perform feature engineering on input data"""
    df = pd.DataFrame([data]) if isinstance(data, dict) else pd.DataFrame(data)
    
    # Calculate theoretical power if not present
    if 'Power_Theo' not in df.columns:
        df['Power_Theo'] = df.apply(
            lambda row: calculate_theoretical_power(row['Irradiance'], row['Temperature']),
            axis=1
        ).round(3)
    
    # Calculate power ratio if not present
    if 'Power_Ratio' not in df.columns:
        df['Power_Ratio'] = (df['Power(W)'] / (df['Power_Theo'] + 1)).round(3)
    
    # Clip negative values to zero
    cols = ['Current(A)', 'Power(W)', 'Voltage(V)', 
            'LoadCurrent(A)', 'LoadPower(W)', 'LoadVoltage(V)', 
            'Power_Ratio', 'Power_Theo']
    
    for col in cols:
        if col in df.columns:
            df[col] = df[col].clip(lower=0)
    
    return df

# ==================== LSTM Model Definition ====================

class LSTMModel(nn.Module):
    def __init__(self, input_size, hidden_size1, hidden_size2, output_size, seq_length=1):
        super(LSTMModel, self).__init__()
        self.hidden_size1 = hidden_size1
        self.hidden_size2 = hidden_size2
        self.seq_length = seq_length
        
        self.lstm1 = nn.LSTM(input_size, hidden_size1, batch_first=True)
        self.dropout1 = nn.Dropout(0.2)
        self.lstm2 = nn.LSTM(hidden_size1, hidden_size2, batch_first=True)
        self.dropout2 = nn.Dropout(0.2)
        self.fc1 = nn.Linear(hidden_size2, 32)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(32, output_size)
        
    def forward(self, x):
        # Reshape input to (batch_size, seq_length, input_size)
        x = x.view(-1, self.seq_length, x.shape[-1])
        
        # First LSTM layer
        lstm1_out, _ = self.lstm1(x)
        lstm1_out = self.dropout1(lstm1_out)
        
        # Second LSTM layer
        lstm2_out, _ = self.lstm2(lstm1_out)
        lstm2_out = self.dropout2(lstm2_out[:, -1, :])  # Take the last time step output
        
        # Fully connected layers
        fc1_out = self.relu(self.fc1(lstm2_out))
        output = self.fc2(fc1_out)
        
        return output

# ==================== Load Models ====================

models = {}
scaler = None
lstm_scaler = None
label_encoder = None

def load_models():
    global models, scaler, lstm_scaler, label_encoder, FAULT_TYPES
    
    try:
        # Try to load label encoder and status mapping to set FAULT_TYPES
        try:
            le_path = MODELS_DIR / 'label_encoder.pkl'
            status_map_path = MODELS_DIR / 'lstm_pytorch_status_mapping.pkl'
            if le_path.exists():
                label_encoder = joblib.load(le_path)
                FAULT_TYPES = [str(c) for c in label_encoder.classes_]
                print("✓ Label encoder loaded; classes:", FAULT_TYPES)
            elif status_map_path.exists():
                status_map = joblib.load(status_map_path)
                FAULT_TYPES = [k for k, _ in sorted(status_map.items(), key=lambda kv: kv[1])]
                print("✓ Status mapping loaded; classes:", FAULT_TYPES)
        except Exception as e:
            print("! Could not load label encoder/status mapping:", e)
        
        # Load Gradient Boosting (sklearn)
        gbm_path = MODELS_DIR / 'gbm_pv_model.pkl'
        if gbm_path.exists():
            models['gbm'] = joblib.load(gbm_path)
            print("✓ Gradient Boosting model loaded")
        else:
            print(f"✗ GBM model not found at {gbm_path}")
        
        # Load LightGBM
        lgbm_path = MODELS_DIR / 'lightgbm_model.pkl'
        if lgbm_path.exists():
            models['lightgbm'] = joblib.load(lgbm_path)
            print("✓ LightGBM model loaded")
        else:
            print(f"✗ LightGBM model not found at {lgbm_path}")
        
        # Load XGBoost
        xgb_path = MODELS_DIR / 'xgboost_pv_model.json'
        if xgb_path.exists():
            xgb_model = xgb.Booster()
            xgb_model.load_model(str(xgb_path))
            models['xgboost'] = xgb_model
            print("✓ XGBoost model loaded")
        else:
            print(f"✗ XGBoost model not found at {xgb_path}")
        
        # Load LSTM
        lstm_path = MODELS_DIR / 'lstm_pytorch_model.pth'
        lstm_scaler_path = MODELS_DIR / 'lstm_pytorch_scaler.pkl'
        if lstm_path.exists():
            lstm_model = LSTMModel(
                input_size=len(FEATURES),  # 10 features
                hidden_size1=128,
                hidden_size2=64,
                output_size=len(FAULT_TYPES),  # 5 fault types
                seq_length=1
            ).to(device)
            lstm_model.load_state_dict(torch.load(lstm_path, map_location=device))
            lstm_model.eval()
            models['lstm'] = lstm_model
            print("✓ LSTM model loaded")
            
            # Load LSTM scaler if available
            if lstm_scaler_path.exists():
                lstm_scaler = joblib.load(lstm_scaler_path)
                print("✓ LSTM scaler loaded")
            else:
                print("✗ LSTM scaler not found, using StandardScaler")
                lstm_scaler = StandardScaler()
        else:
            print(f"✗ LSTM model not found at {lstm_path}")
        
        # Initialize general scaler
        scaler = StandardScaler()
        
        print(f"\nLoaded {len(models)} models successfully on {device}")
        
    except Exception as e:
        print(f"Error loading models: {e}")
        import traceback
        traceback.print_exc()

# ==================== API Routes ====================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'models_loaded': list(models.keys()),
        'device': str(device)
    })

@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict PV fault from sensor readings
    Request: {
        "model": "gbm|lightgbm|xgboost|lstm",
        "data": {
            "Irradiance": float,
            "Temperature": float,
            "Current(A)": float,
            "Power(W)": float,
            "Voltage(V)": float,
            "LoadCurrent(A)": float,
            "LoadPower(W)": float,
            "LoadVoltage(V)": float
        }
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        model_name = data.get('model', 'random_forest').lower()
        input_data = data.get('data', {})
        
        if model_name not in models:
            return jsonify({'error': f'Model {model_name} not available. Available: {list(models.keys())}'}), 400
        
        # Feature engineering
        df = feature_engineering(input_data)
        
        # Ensure all features are present
        missing_features = [f for f in FEATURES if f not in df.columns]
        if missing_features:
            return jsonify({'error': f'Missing features: {missing_features}'}), 400
        
        X = df[FEATURES].values
        
        # Predict based on model type
        model = models[model_name]
        
        if model_name in ['gbm', 'lightgbm']:
            # Scikit-learn style models
            prediction_idx = model.predict(X)[0]
            raw_probs = model.predict_proba(X)[0]
            
            # Get class mapping from model
            if hasattr(model, 'classes_'):
                # Model classes might be integers or strings
                model_classes = model.classes_
                
                # Create probability dictionary with correct alignment
                if label_encoder is not None:
                    try:
                        # Try to map model classes to fault type names
                        class_names = []
                        for cls in model_classes:
                            if isinstance(cls, (int, np.integer)):
                                class_names.append(label_encoder.inverse_transform([int(cls)])[0])
                            else:
                                class_names.append(str(cls))
                        
                        # Build probability array aligned with FAULT_TYPES
                        probabilities = np.zeros(len(FAULT_TYPES))
                        name_to_idx = {name: i for i, name in enumerate(FAULT_TYPES)}
                        for i, (cls_name, prob) in enumerate(zip(class_names, raw_probs)):
                            if cls_name in name_to_idx:
                                probabilities[name_to_idx[cls_name]] = prob
                        
                        # Get prediction class name
                        if isinstance(prediction_idx, (int, np.integer)):
                            prediction = int(prediction_idx)
                        else:
                            # If prediction is string, find its index
                            prediction = name_to_idx.get(str(prediction_idx), 0)
                    except Exception as e:
                        print(f"Warning: Label mapping failed: {e}")
                        probabilities = raw_probs
                        prediction = int(prediction_idx) if isinstance(prediction_idx, (int, np.integer)) else 0
                else:
                    probabilities = raw_probs
                    prediction = int(prediction_idx) if isinstance(prediction_idx, (int, np.integer)) else 0
            else:
                probabilities = raw_probs
                prediction = int(prediction_idx) if isinstance(prediction_idx, (int, np.integer)) else 0
            
        elif model_name == 'xgboost':
            dmatrix = xgb.DMatrix(X, feature_names=FEATURES)
            probs = model.predict(dmatrix)
            # Handle both single and batch predictions
            if probs.ndim == 1:
                # Single prediction case - probs is already the probability array
                probabilities = probs
            else:
                # Batch prediction case - take first row
                probabilities = probs[0]
            
            # Ensure we have probabilities for all classes
            if len(probabilities) != len(FAULT_TYPES):
                # If shape mismatch, pad with zeros or handle differently
                print(f"Warning: XGBoost returned {len(probabilities)} probabilities, expected {len(FAULT_TYPES)}")
                temp_probs = np.zeros(len(FAULT_TYPES))
                temp_probs[:len(probabilities)] = probabilities
                probabilities = temp_probs
            
            prediction = np.argmax(probabilities)
            
        elif model_name == 'lstm':
            # Scale features if scaler available
            if lstm_scaler:
                X_scaled = lstm_scaler.transform(X)
            else:
                X_scaled = scaler.fit_transform(X)
            
            # LSTM needs sequence (batch_size, seq_len, features)
            X_tensor = torch.FloatTensor(X_scaled).unsqueeze(0).unsqueeze(0).to(device)
            with torch.no_grad():
                outputs = model(X_tensor)
                probs = torch.softmax(outputs, dim=1).cpu().numpy()[0]
            prediction = np.argmax(probs)
            probabilities = probs
        
        # Format response
        fault_type = FAULT_TYPES[prediction]
        confidence = float(probabilities[prediction])
        
        result = {
            'model': model_name,
            'prediction': fault_type,
            'confidence': confidence,
            'probabilities': {
                fault: float(prob) for fault, prob in zip(FAULT_TYPES, probabilities)
            },
            'input_data': {
                'Irradiance': float(df['Irradiance'].values[0]),
                'Temperature': float(df['Temperature'].values[0]),
                'Power': float(df['Power(W)'].values[0]),
                'Power_Theo': float(df['Power_Theo'].values[0]),
                'Power_Ratio': float(df['Power_Ratio'].values[0])
            }
        }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/batch_predict', methods=['POST'])
def batch_predict():
    """
    Batch prediction for multiple data points
    Request: {
        "model": "gbm|lightgbm|xgboost|lstm",
        "data": [array of sensor readings]
    }
    """
    try:
        data = request.get_json()
        
        model_name = data.get('model', 'random_forest').lower()
        input_data = data.get('data', [])
        
        if not model_name:
            model_name = list(models.keys())[0] if models else 'gbm'
            
        if model_name not in models:
            return jsonify({'error': f'Model {model_name} not available. Available: {list(models.keys())}'}), 400
        
        if not input_data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Feature engineering
        df = feature_engineering(input_data)
        X = df[FEATURES].values
        
        # Predict
        model = models[model_name]
        
        if model_name in ['gbm', 'lightgbm']:
            # Scikit-learn style models
            prediction_indices = model.predict(X)
            raw_probs = model.predict_proba(X)
            
            # Get class mapping from model
            if hasattr(model, 'classes_') and label_encoder is not None:
                try:
                    model_classes = model.classes_
                    # Try to map model classes to fault type names
                    class_names = []
                    for cls in model_classes:
                        if isinstance(cls, (int, np.integer)):
                            class_names.append(label_encoder.inverse_transform([int(cls)])[0])
                        else:
                            class_names.append(str(cls))
                    
                    # Build aligned probability matrix
                    probabilities = np.zeros((raw_probs.shape[0], len(FAULT_TYPES)))
                    name_to_idx = {name: i for i, name in enumerate(FAULT_TYPES)}
                    for col_idx, name in enumerate(class_names):
                        if name in name_to_idx:
                            probabilities[:, name_to_idx[name]] = raw_probs[:, col_idx]
                    
                    # Convert predictions to indices
                    predictions = []
                    for pred_idx in prediction_indices:
                        if isinstance(pred_idx, (int, np.integer)):
                            predictions.append(int(pred_idx))
                        else:
                            pred_name = str(pred_idx)
                            predictions.append(name_to_idx.get(pred_name, 0))
                    predictions = np.array(predictions)
                except Exception as e:
                    print(f"Warning: Batch label mapping failed: {e}")
                    probabilities = raw_probs
                    predictions = np.array([int(p) if isinstance(p, (int, np.integer)) else 0 for p in prediction_indices])
            else:
                probabilities = raw_probs
                predictions = np.array([int(p) if isinstance(p, (int, np.integer)) else 0 for p in prediction_indices])
            
        elif model_name == 'xgboost':
            dmatrix = xgb.DMatrix(X, feature_names=FEATURES)
            probs = model.predict(dmatrix)
            predictions = np.argmax(probs, axis=1)
            probabilities = probs
            
        elif model_name == 'lstm':
            # Scale features
            if lstm_scaler:
                X_scaled = lstm_scaler.transform(X)
            else:
                X_scaled = scaler.fit_transform(X)
            
            # Shape: (batch_size, seq_len=1, features)
            X_tensor = torch.FloatTensor(X_scaled).unsqueeze(1).to(device)
            with torch.no_grad():
                outputs = model(X_tensor)
                probs = torch.softmax(outputs, dim=1).cpu().numpy()
            predictions = np.argmax(probs, axis=1)
            probabilities = probs
        
        # Format results
        results = []
        for i, (pred, prob) in enumerate(zip(predictions, probabilities)):
            results.append({
                'index': i,
                'prediction': FAULT_TYPES[pred],
                'confidence': float(prob[pred]),
                'probabilities': {
                    fault: float(p) for fault, p in zip(FAULT_TYPES, prob)
                }
            })
        
        return jsonify({
            'model': model_name,
            'predictions': results,
            'count': len(results)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/models', methods=['GET'])
def get_models():
    """Get available models and their info"""
    return jsonify({
        'available_models': list(models.keys()),
        'fault_types': FAULT_TYPES,
        'features': FEATURES
    })

@app.route('/calculate_theoretical', methods=['POST'])
def calculate_theoretical():
    """Calculate theoretical PV power output"""
    try:
        data = request.get_json()
        irradiance = data.get('irradiance', 1000)
        temperature = data.get('temperature', 25)
        
        power_theo = calculate_theoretical_power(irradiance, temperature)
        
        return jsonify({
            'irradiance': irradiance,
            'temperature': temperature,
            'theoretical_power': float(power_theo)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== Main ====================

if __name__ == '__main__':
    print("="*50)
    print("PV Fault Detection API Server")
    print("="*50)
    load_models()
    print("\nStarting Flask server...")
    app.run(host='0.0.0.0', port=5002, debug=True)
