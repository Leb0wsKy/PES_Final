"""
Test script for PV API
"""
import requests
import json

BASE_URL = "http://localhost:5002"

def test_health():
    """Test health endpoint"""
    print("Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}\n")

def test_models():
    """Test models endpoint"""
    print("Testing models endpoint...")
    response = requests.get(f"{BASE_URL}/models")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}\n")

def test_predict():
    """Test prediction endpoint"""
    print("Testing prediction endpoint...")
    
    # Normal operation test data
    payload = {
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
    
    response = requests.post(f"{BASE_URL}/predict", json=payload)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(f"Response: {json.dumps(response.json(), indent=2)}\n")
    else:
        print(f"Error: {response.text}\n")

def test_theoretical():
    """Test theoretical power calculation"""
    print("Testing theoretical power calculation...")
    
    payload = {
        "irradiance": 1000,
        "temperature": 25
    }
    
    response = requests.post(f"{BASE_URL}/calculate_theoretical", json=payload)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(f"Response: {json.dumps(response.json(), indent=2)}\n")
    else:
        print(f"Error: {response.text}\n")

if __name__ == "__main__":
    print("="*50)
    print("PV API Test Suite")
    print("="*50 + "\n")
    
    try:
        test_health()
        test_models()
        test_theoretical()
        test_predict()
        print("All tests completed!")
    except requests.exceptions.ConnectionError:
        print("Error: Cannot connect to PV API. Make sure it's running on port 5002")
    except Exception as e:
        print(f"Error: {e}")
