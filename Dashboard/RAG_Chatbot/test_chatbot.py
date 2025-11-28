import requests
import json

BASE_URL = "http://localhost:5003"

def test_health():
    """Test health endpoint"""
    print("\n" + "="*60)
    print("Testing Health Endpoint")
    print("="*60)
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status Code: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_suggestions():
    """Test suggestions endpoint"""
    print("\n" + "="*60)
    print("Testing Suggestions Endpoint")
    print("="*60)
    try:
        response = requests.get(f"{BASE_URL}/suggest")
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Suggestions: {len(data.get('suggestions', []))}")
        for i, suggestion in enumerate(data.get('suggestions', [])[:3], 1):
            print(f"  {i}. {suggestion}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_chat(message, session_id="test_session"):
    """Test chat endpoint"""
    print("\n" + "="*60)
    print(f"Testing Chat: '{message}'")
    print("="*60)
    try:
        response = requests.post(
            f"{BASE_URL}/chat",
            json={"message": message, "session_id": session_id}
        )
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"\nUser: {message}")
        print(f"Bot: {data.get('response', 'No response')}")
        if 'context_used' in data:
            print(f"Context: {', '.join(data['context_used'])}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_clear(session_id="test_session"):
    """Test clear conversation endpoint"""
    print("\n" + "="*60)
    print("Testing Clear Conversation")
    print("="*60)
    try:
        response = requests.post(
            f"{BASE_URL}/clear",
            json={"session_id": session_id}
        )
        print(f"Status Code: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("\n" + "="*60)
    print("PowerPulse RAG Chatbot API Test Suite")
    print("="*60)
    
    results = []
    
    # Test 1: Health check
    results.append(("Health Check", test_health()))
    
    # Test 2: Suggestions
    results.append(("Suggestions", test_suggestions()))
    
    # Test 3: Chat - NILM question
    results.append(("Chat - NILM", test_chat("What is NILM?")))
    
    # Test 4: Chat - PV question
    results.append(("Chat - PV Fault", test_chat("What are the PV fault types?")))
    
    # Test 5: Chat - Model question
    results.append(("Chat - Models", test_chat("Which model is most accurate?")))
    
    # Test 6: Chat - Troubleshooting
    results.append(("Chat - Help", test_chat("My system is offline")))
    
    # Test 7: Clear conversation
    results.append(("Clear Conversation", test_clear()))
    
    # Summary
    print("\n" + "="*60)
    print("Test Results Summary")
    print("="*60)
    for test_name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    total = len(results)
    passed = sum(1 for _, p in results if p)
    print(f"\nTotal: {passed}/{total} tests passed")
    print("="*60)
