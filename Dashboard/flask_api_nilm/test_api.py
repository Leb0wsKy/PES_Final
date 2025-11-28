"""
Test script for NILM API
"""
import requests
import json
import numpy as np

BASE_URL = "http://localhost:5001"

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
    
    # Generate mock aggregate power data (288 points for sequence length)
    aggregate_power = np.random.randn(300) * 1000 + 5000
    aggregate_power = aggregate_power.tolist()
    
    payload = {
        "model": "atcn",
        "aggregate_power": aggregate_power,
        "normalize": True
    }
    
    response = requests.post(f"{BASE_URL}/predict", json=payload)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(f"Response: {json.dumps(response.json(), indent=2)}\n")
    else:
        print(f"Error: {response.text}\n")

if __name__ == "__main__":
    print("="*50)
    print("NILM API Test Suite")
    print("="*50 + "\n")
    
    try:
        test_health()
        test_models()
        test_predict()
        print("All tests completed!")
    except requests.exceptions.ConnectionError:
        print("Error: Cannot connect to NILM API. Make sure it's running on port 5001")
    except Exception as e:
        print(f"Error: {e}")
