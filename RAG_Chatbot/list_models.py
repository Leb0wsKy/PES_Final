"""Quick script to list available Gemini models"""
import os
from dotenv import load_dotenv
load_dotenv()

try:
    import google.generativeai as genai
    
    api_key = os.getenv('GEMINI_API_KEY')
    if api_key:
        genai.configure(api_key=api_key)
        print("Available Gemini models:")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"  - {m.name}")
    else:
        print("No GEMINI_API_KEY found")
except Exception as e:
    print(f"Error: {e}")
