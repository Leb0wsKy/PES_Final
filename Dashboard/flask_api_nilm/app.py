"""
Flask API for NILM (Non-Intrusive Load Monitoring) Models
Serves BiLSTM, TCN, and ATCN models for appliance disaggregation
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torch.nn as nn
import numpy as np
from sklearn.preprocessing import StandardScaler
import joblib
import os
from pathlib import Path

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Device configuration
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Model configurations
MODELS_DIR = Path('../../NILM_SIDED-master/saved_models')
CONFIG = {
    'input_size': 1,
    'output_size': 5,
    'hidden_size': 128,
    'num_layers': 3,
    'num_channels': [64, 64, 64, 64, 128, 128, 128, 128],
    'seq_length': 288,
    'dropout': 0.33
}

APPLIANCE_NAMES = ['EVSE', 'PV', 'CS', 'CHP', 'BA']

# ==================== Model Definitions ====================

class Chomp1d(nn.Module):
    def __init__(self, chomp_size):
        super(Chomp1d, self).__init__()
        self.chomp_size = chomp_size

    def forward(self, x):
        return x[:, :, :-self.chomp_size].contiguous()

class TemporalBlock(nn.Module):
    def __init__(self, n_inputs, n_outputs, kernel_size, stride, dilation, padding, dropout=0.2):
        super(TemporalBlock, self).__init__()
        self.conv1 = nn.Conv1d(n_inputs, n_outputs, kernel_size,
                               stride=stride, padding=padding, dilation=dilation)
        self.chomp1 = Chomp1d(padding)
        self.relu1 = nn.ReLU()
        self.dropout1 = nn.Dropout(dropout)
        
        self.conv2 = nn.Conv1d(n_outputs, n_outputs, kernel_size,
                               stride=stride, padding=padding, dilation=dilation)
        self.chomp2 = Chomp1d(padding)
        self.relu2 = nn.ReLU()
        self.dropout2 = nn.Dropout(dropout)
        
        self.net = nn.Sequential(self.conv1, self.chomp1, self.relu1, self.dropout1,
                                self.conv2, self.chomp2, self.relu2, self.dropout2)
        self.downsample = nn.Conv1d(n_inputs, n_outputs, 1) if n_inputs != n_outputs else None
        self.relu = nn.ReLU()

    def forward(self, x):
        out = self.net(x)
        res = x if self.downsample is None else self.downsample(x)
        return self.relu(out + res)

class TCNModel(nn.Module):
    def __init__(self, input_size, num_channels, kernel_size=3, dropout=0.2, output_size=5):
        super(TCNModel, self).__init__()
        layers = []
        num_levels = len(num_channels)
        
        for i in range(num_levels):
            dilation_size = 2 ** i
            in_channels = input_size if i == 0 else num_channels[i-1]
            out_channels = num_channels[i]
            padding = (kernel_size - 1) * dilation_size
            
            layers.append(TemporalBlock(in_channels, out_channels, kernel_size,
                                       stride=1, dilation=dilation_size,
                                       padding=padding, dropout=dropout))
        
        self.network = nn.Sequential(*layers)
        self.fc = nn.Linear(num_channels[-1], output_size)
        
    def forward(self, x):
        x = x.permute(0, 2, 1)
        x = self.network(x)
        x = x.mean(dim=2)
        return self.fc(x)

class AttentionLayer(nn.Module):
    def __init__(self, hidden_size):
        super(AttentionLayer, self).__init__()
        self.attention = nn.Sequential(
            nn.Linear(hidden_size, hidden_size),
            nn.Tanh(),
            nn.Linear(hidden_size, 1)
        )
    
    def forward(self, x):
        attention_weights = self.attention(x)
        attention_weights = torch.softmax(attention_weights, dim=1)
        weighted = x * attention_weights
        return weighted.sum(dim=1)

class ATCNModel(nn.Module):
    def __init__(self, input_size, num_channels, kernel_size=3, dropout=0.2, output_size=5):
        super(ATCNModel, self).__init__()
        layers = []
        num_levels = len(num_channels)
        
        for i in range(num_levels):
            dilation_size = 2 ** i
            in_channels = input_size if i == 0 else num_channels[i-1]
            out_channels = num_channels[i]
            padding = (kernel_size - 1) * dilation_size
            
            layers.append(TemporalBlock(in_channels, out_channels, kernel_size,
                                       stride=1, dilation=dilation_size,
                                       padding=padding, dropout=dropout))
        
        self.network = nn.Sequential(*layers)
        self.attention = AttentionLayer(num_channels[-1])
        self.fc = nn.Linear(num_channels[-1], output_size)
        
    def forward(self, x):
        x = x.permute(0, 2, 1)
        x = self.network(x)
        x = x.permute(0, 2, 1)
        x = self.attention(x)
        return self.fc(x)

class BiLSTMModel(nn.Module):
    def __init__(self, input_size, hidden_size=128, num_layers=3, output_size=5):
        super(BiLSTMModel, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        
        self.lstm = nn.LSTM(input_size=input_size,
                           hidden_size=hidden_size,
                           num_layers=num_layers,
                           batch_first=True,
                           bidirectional=True,
                           dropout=0.2)
        
        self.fc = nn.Linear(hidden_size * 2, output_size)
        
    def forward(self, x):
        lstm_out, (_h_n, _c_n) = self.lstm(x)
        out = self.fc(lstm_out[:, -1, :])
        return out

# ==================== Load Models ====================

models = {}
scaler_X = None
scaler_y = None

def load_models():
    global models, scaler_X, scaler_y
    
    try:
        # Load BiLSTM
        bilstm_path = MODELS_DIR / 'BiLSTM_best.pth'
        if bilstm_path.exists():
            bilstm = BiLSTMModel(
                input_size=CONFIG['input_size'],
                hidden_size=CONFIG['hidden_size'],
                num_layers=CONFIG['num_layers'],
                output_size=CONFIG['output_size']
            ).to(device)
            bilstm.load_state_dict(torch.load(bilstm_path, map_location=device))
            bilstm.eval()
            models['bilstm'] = bilstm
            print("✓ BiLSTM model loaded")
        
        # Load TCN
        tcn_path = MODELS_DIR / 'TCN_best.pth'
        if tcn_path.exists():
            tcn = TCNModel(
                input_size=CONFIG['input_size'],
                num_channels=CONFIG['num_channels'],
                dropout=CONFIG['dropout'],
                output_size=CONFIG['output_size']
            ).to(device)
            tcn.load_state_dict(torch.load(tcn_path, map_location=device))
            tcn.eval()
            models['tcn'] = tcn
            print("✓ TCN model loaded")
        
        # Load ATCN
        atcn_path = MODELS_DIR / 'ATCN_best.pth'
        if atcn_path.exists():
            atcn = ATCNModel(
                input_size=CONFIG['input_size'],
                num_channels=CONFIG['num_channels'],
                dropout=CONFIG['dropout'],
                output_size=CONFIG['output_size']
            ).to(device)
            atcn.load_state_dict(torch.load(atcn_path, map_location=device))
            atcn.eval()
            models['atcn'] = atcn
            print("✓ ATCN model loaded")
        
        # Initialize scalers (would need to be saved during training)
        scaler_X = StandardScaler()
        scaler_y = StandardScaler()
        
        print(f"\nLoaded {len(models)} models successfully on {device}")
        
    except Exception as e:
        print(f"Error loading models: {e}")

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
    Predict appliance power consumption from aggregate power
    Request: {
        "model": "bilstm|tcn|atcn",
        "aggregate_power": [list of power values],
        "normalize": true|false
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        model_name = data.get('model', 'atcn').lower()
        aggregate_power = data.get('aggregate_power', [])
        normalize = data.get('normalize', True)
        
        if model_name not in models:
            return jsonify({'error': f'Model {model_name} not available. Available: {list(models.keys())}'}), 400
        
        if not aggregate_power or len(aggregate_power) < CONFIG['seq_length']:
            return jsonify({'error': f'Need at least {CONFIG["seq_length"]} data points'}), 400
        
        # Prepare input
        aggregate_array = np.array(aggregate_power[-CONFIG['seq_length']:]).reshape(-1, 1)
        
        # Normalize if requested
        if normalize:
            # Use simple normalization (ideally should use fitted scaler)
            mean = aggregate_array.mean()
            std = aggregate_array.std() + 1e-8
            aggregate_scaled = (aggregate_array - mean) / std
        else:
            aggregate_scaled = aggregate_array
        
        # Convert to tensor
        input_tensor = torch.FloatTensor(aggregate_scaled).unsqueeze(0).to(device)
        
        # Predict
        model = models[model_name]
        with torch.no_grad():
            prediction = model(input_tensor).cpu().numpy()[0]
        
        # Denormalize if needed
        if normalize:
            # Simple denormalization (ideally use fitted scaler)
            prediction = prediction * std + mean
        
        # Format response
        result = {
            'model': model_name,
            'appliances': {
                name: float(value) for name, value in zip(APPLIANCE_NAMES, prediction)
            },
            'total_predicted': float(prediction.sum()),
            'aggregate_input': float(aggregate_power[-1])
        }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/batch_predict', methods=['POST'])
def batch_predict():
    """
    Batch prediction for time series data
    Request: {
        "model": "bilstm|tcn|atcn",
        "aggregate_power": [list of power values],
        "window_size": 288
    }
    """
    try:
        data = request.get_json()
        
        model_name = data.get('model', 'atcn').lower()
        aggregate_power = data.get('aggregate_power', [])
        window_size = data.get('window_size', CONFIG['seq_length'])
        
        if model_name not in models:
            return jsonify({'error': f'Model {model_name} not available'}), 400
        
        if len(aggregate_power) < window_size:
            return jsonify({'error': f'Need at least {window_size} data points'}), 400
        
        # Create sliding windows
        predictions = []
        for i in range(len(aggregate_power) - window_size + 1):
            window = aggregate_power[i:i+window_size]
            window_array = np.array(window).reshape(-1, 1)
            
            # Simple normalization
            mean = window_array.mean()
            std = window_array.std() + 1e-8
            window_scaled = (window_array - mean) / std
            
            input_tensor = torch.FloatTensor(window_scaled).unsqueeze(0).to(device)
            
            model = models[model_name]
            with torch.no_grad():
                pred = model(input_tensor).cpu().numpy()[0]
            
            predictions.append({
                'index': i + window_size - 1,
                'appliances': {
                    name: float(value) for name, value in zip(APPLIANCE_NAMES, pred)
                }
            })
        
        return jsonify({
            'model': model_name,
            'predictions': predictions,
            'count': len(predictions)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/models', methods=['GET'])
def get_models():
    """Get available models and their info"""
    return jsonify({
        'available_models': list(models.keys()),
        'appliances': APPLIANCE_NAMES,
        'config': CONFIG
    })

# ==================== Main ====================

if __name__ == '__main__':
    print("="*50)
    print("NILM API Server")
    print("="*50)
    load_models()
    print("\nStarting Flask server...")
    app.run(host='0.0.0.0', port=5001, debug=True)
