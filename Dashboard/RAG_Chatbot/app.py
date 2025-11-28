from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import os
from typing import List, Dict
import json
from dotenv import load_dotenv

# Load environment variables from .env if present
load_dotenv()

# For RAG implementation - suppress TensorFlow warnings
import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

try:
    from sentence_transformers import SentenceTransformer
    import numpy as np
    EMBEDDINGS_AVAILABLE = True
except Exception as e:
    EMBEDDINGS_AVAILABLE = False
    print(f"⚠️  Embeddings not available: {str(e)[:100]}")
    print("   Chatbot will use keyword-based search")

try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    print("⚠️  openai not installed. Install with: pip install openai")

# Gemini (Google Generative AI)
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("⚠️  google-generativeai not installed. Install with: pip install google-generativeai")

app = Flask(__name__)
CORS(app)

# Configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')

ACTIVE_LLM = None

if GEMINI_API_KEY and GEMINI_AVAILABLE:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        ACTIVE_LLM = 'gemini'
        print("✅ Gemini LLM configured")
    except Exception as e:
        print(f"⚠️  Failed to configure Gemini: {e}")

if not ACTIVE_LLM and OPENAI_API_KEY and OPENAI_AVAILABLE:
    try:
        openai.api_key = OPENAI_API_KEY
        ACTIVE_LLM = 'openai'
        print("✅ OpenAI LLM configured")
    except Exception as e:
        print(f"⚠️  Failed to configure OpenAI: {e}")

# Knowledge base for RAG
KNOWLEDGE_BASE = [
    {
        "topic": "NILM System",
        "content": """NILM (Non-Intrusive Load Monitoring) is a technology that disaggregates total household 
        power consumption into individual appliance usage without requiring individual sensors on each device. 
        The system uses three deep learning models: BiLSTM (Bidirectional LSTM), TCN (Temporal Convolutional Network), 
        and ATCN (Attention-based TCN). It can identify consumption from EVSE (Electric Vehicle Supply Equipment), 
        PV (Photovoltaic), CS (Charging Station), CHP (Combined Heat & Power), and BA (Battery) systems."""
    },
    {
        "topic": "PV Fault Detection",
        "content": """The PV (Photovoltaic) system uses machine learning to detect faults in solar panels. 
        It monitors an 18.7 kW PV Array with 45 panels and can detect four fault types: Normal Operation, 
        Open Circuit (disconnected panels), Short Circuit (electrical shorts), and Partial Shadowing (reduced sunlight). 
        The system uses models including Random Forest (98.9% accuracy), XGBoost, LightGBM, and LSTM."""
    },
    {
        "topic": "Model Performance",
        "content": """The ATCN model typically performs best for NILM tasks due to its attention mechanism, 
        which helps focus on important temporal patterns. Random Forest achieves 98.9% accuracy for PV fault detection. 
        BiLSTM provides good baseline performance, while TCN offers faster inference with dilated convolutions."""
    },
    {
        "topic": "Fault Types",
        "content": """PV system faults include: 
        1. Normal Operation - System functioning correctly
        2. Open Circuit - Panel disconnection, causes zero output
        3. Short Circuit - Electrical short, causes overcurrent and potential damage
        4. Partial Shadowing - Clouds or obstacles blocking sunlight, reduces efficiency by 20-80%"""
    },
    {
        "topic": "Energy Monitoring",
        "content": """The dashboard provides real-time monitoring of power consumption, irradiance levels, 
        temperature, voltage, and current. Historical data helps identify patterns and anomalies. 
        High consumption during off-peak hours or unexpected fault detections should be investigated."""
    },
    {
        "topic": "System Metrics",
        "content": """Key metrics include: Power (W) - current energy consumption, Irradiance (W/m²) - 
        solar radiation intensity, Temperature (°C) - ambient temperature affecting efficiency, 
        Voltage (V) and Current (A) - electrical parameters, Confidence (%) - model prediction certainty."""
    },
    {
        "topic": "Troubleshooting",
        "content": """Common issues: If NILM predictions seem incorrect, check if aggregate power data is normalized. 
        For PV faults, verify irradiance and temperature readings are realistic. Low confidence scores may indicate 
        edge cases or data quality issues. System offline status means the API service isn't responding."""
    },
    {
        "topic": "Data Augmentation",
        "content": """The NILM system uses AMDA (Appliance-based Mixed Data Augmentation) on the SIDED dataset 
        to improve model robustness. The SIDED dataset includes data from Dealer, Logistic, and Office buildings 
        across LA, Offenbach, and Tokyo with 1-minute sampling intervals."""
    }
]

# Simple vector store for embeddings
class SimpleVectorStore:
    def __init__(self):
        self.documents = []
        self.embeddings = []
        self.model = None
        if EMBEDDINGS_AVAILABLE:
            try:
                self.model = SentenceTransformer('all-MiniLM-L6-v2')
                print("✅ Embedding model loaded successfully")
            except Exception as e:
                print(f"⚠️  Could not load embedding model: {e}")
    
    def add_documents(self, documents: List[Dict]):
        """Add documents to the vector store"""
        self.documents = documents
        if self.model:
            texts = [doc['content'] for doc in documents]
            try:
                self.embeddings = self.model.encode(texts)
                print(f"✅ Indexed {len(texts)} documents")
            except Exception as e:
                print(f"⚠️  Could not create embeddings: {e}")
    
    def search(self, query: str, top_k: int = 3) -> List[Dict]:
        """Search for relevant documents"""
        if not self.model or len(self.embeddings) == 0:
            # Fallback: simple keyword matching
            return self._keyword_search(query, top_k)
        
        try:
            query_embedding = self.model.encode([query])[0]
            similarities = np.dot(self.embeddings, query_embedding)
            top_indices = np.argsort(similarities)[-top_k:][::-1]
            return [self.documents[i] for i in top_indices]
        except Exception as e:
            print(f"⚠️  Search error: {e}")
            return self._keyword_search(query, top_k)
    
    def _keyword_search(self, query: str, top_k: int = 3) -> List[Dict]:
        """Fallback keyword-based search"""
        query_lower = query.lower()
        scored_docs = []
        for doc in self.documents:
            score = sum(1 for word in query_lower.split() 
                       if word in doc['content'].lower() or word in doc['topic'].lower())
            scored_docs.append((score, doc))
        scored_docs.sort(reverse=True, key=lambda x: x[0])
        return [doc for _, doc in scored_docs[:top_k]]

# Initialize vector store
vector_store = SimpleVectorStore()
vector_store.add_documents(KNOWLEDGE_BASE)

def format_live_data_context(nilm_data, pv_data):
    """Format live API data into readable context for the LLM"""
    context_parts = []
    
    if pv_data:
        context_parts.append("=== CURRENT PV SYSTEM STATUS ===")
        predictions = pv_data.get('predictions', {})
        inputs = pv_data.get('inputs', {})
        
        # Get the most confident prediction
        best_model = None
        best_confidence = 0
        best_prediction = None
        
        for model_name, pred in predictions.items():
            if pred.get('confidence', 0) > best_confidence:
                best_confidence = pred.get('confidence', 0)
                best_prediction = pred.get('prediction', 'Unknown')
                best_model = model_name
        
        if best_prediction:
            context_parts.append(f"PV Fault Status: {best_prediction}")
            context_parts.append(f"Confidence: {best_confidence:.1f}% (from {best_model} model)")
        
        context_parts.append(f"Irradiance: {inputs.get('irradiance', 'N/A')} W/m²")
        context_parts.append(f"Temperature: {inputs.get('temp_amb', 'N/A')}°C")
        context_parts.append(f"Voltage: {inputs.get('voltage', 'N/A')} V")
        context_parts.append(f"Current: {inputs.get('current', 'N/A')} A")
        context_parts.append("")
    
    if nilm_data:
        context_parts.append("=== CURRENT NILM SYSTEM STATUS ===")
        predictions = nilm_data.get('predictions', {})
        aggregate_power = nilm_data.get('aggregate_power', 'N/A')
        
        context_parts.append(f"Total Power Consumption: {aggregate_power} W")
        
        if predictions:
            context_parts.append("Individual Appliance Power Consumption:")
            for model_name, pred in predictions.items():
                appliances = pred.get('appliances', {})
                for appliance, power in appliances.items():
                    context_parts.append(f"  • {appliance}: {power:.1f} W")
        context_parts.append("")
    
    return "\n".join(context_parts) if context_parts else None

# Conversation history (in production, use a database)
conversations = {}

def generate_response(query: str, context: List[Dict], conversation_history: List[Dict] = None, live_data: str = None) -> str:
    """Generate response using Gemini or OpenAI LLM; fallback to templates if unavailable"""

    # Prepare context
    context_text = "\n\n".join([f"Topic: {doc['topic']}\n{doc['content']}" for doc in context])
    
    # Add live data to context if available
    if live_data:
        context_text = f"{live_data}\n\n{context_text}"

    # Prefer Gemini if configured
    if ACTIVE_LLM == 'gemini' and GEMINI_AVAILABLE and GEMINI_API_KEY:
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            system_preamble = (
                "You are PowerPulse Assistant, a helpful AI monitoring assistant for an energy dashboard. "
                "Use the provided REAL-TIME system data and documentation context to answer questions about NILM and PV systems. "
                "Always prioritize real-time data when available. Explain faults, provide troubleshooting guidance, "
                "and be specific about current system status. Be concise and technical when needed. If you don't know, say so.\n\n"
                f"Context:\n{context_text}\n\n"
            )
            history_text = "\n\n".join([f"{m['role'].capitalize()}: {m['content']}" for m in (conversation_history or [])[-6:]])
            prompt = f"{system_preamble}{history_text}\n\nUser: {query}\nAssistant:"
            response = model.generate_content(prompt)
            return getattr(response, 'text', '').strip() or generate_fallback_response(query, context, live_data)
        except Exception as e:
            print(f"⚠️  Gemini API error: {e}")
            # Fall through to OpenAI or fallback

    # Use OpenAI if available
    if ACTIVE_LLM == 'openai' and OPENAI_AVAILABLE and OPENAI_API_KEY:
        try:
            messages = [
                {
                    "role": "system",
                    "content": (
                        "You are PowerPulse Assistant, a helpful AI monitoring assistant for an energy management dashboard. "
                        "Use the following REAL-TIME data and context to answer questions. Always prioritize real-time data. "
                        "Be concise and technical when needed.\n\n"
                        f"Context:\n{context_text}"
                    )
                }
            ]

            if conversation_history:
                messages.extend(conversation_history[-6:])

            messages.append({"role": "user", "content": query})

            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=300,
                temperature=0.7
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"⚠️  OpenAI API error: {e}")

    # Fallback
    return generate_fallback_response(query, context, live_data)

def generate_fallback_response(query: str, context: List[Dict], live_data: str = None) -> str:
    """Generate template-based response when LLM is not available"""
    query_lower = query.lower()
    
    # If we have live data, try to answer based on it first
    if live_data:
        if any(word in query_lower for word in ['pv', 'solar', 'panel', 'fault', 'status', 'healthy', 'anomaly']):
            return f"Here's your current PV system status:\n\n{live_data}\n\nWould you like more details about any specific aspect?"
        elif any(word in query_lower for word in ['nilm', 'power', 'consumption', 'appliance', 'energy', 'using']):
            return f"Here's your current power consumption breakdown:\n\n{live_data}\n\nWould you like more details about specific appliances?"
        elif any(word in query_lower for word in ['how', 'doing', 'currently', 'now', 'today']):
            return f"Here's your current system status:\n\n{live_data}"
    
    # Pattern matching for common questions
    if any(word in query_lower for word in ['what is', 'what\'s', 'define', 'explain']):
        if 'nilm' in query_lower:
            return """NILM (Non-Intrusive Load Monitoring) disaggregates your total household power into individual 
            appliance usage without needing sensors on each device. We use deep learning models (BiLSTM, TCN, ATCN) 
            to identify consumption patterns from EVSE, PV, CS, CHP, and Battery systems."""
        elif 'pv' in query_lower or 'photovoltaic' in query_lower or 'solar' in query_lower:
            return """The PV system monitors your 18.7 kW solar array (45 panels) and uses ML to detect faults. 
            It can identify Normal Operation, Open Circuit, Short Circuit, and Partial Shadowing conditions with 
            up to 98.9% accuracy using Random Forest and other models."""
        elif 'atcn' in query_lower or 'tcn' in query_lower or 'lstm' in query_lower:
            return """We use three NILM models: BiLSTM (baseline), TCN (fast with dilated convolutions), 
            and ATCN (best performance with attention mechanism). ATCN typically gives the most accurate results."""
    
    if 'fault' in query_lower:
        return """PV system can detect 4 fault types:
        • Normal - Everything working correctly
        • Open Circuit - Panel disconnection (zero output)
        • Short Circuit - Electrical short (overcurrent risk)
        • Partial Shadowing - Reduced sunlight (20-80% efficiency loss)
        
        Check irradiance and temperature readings to diagnose issues."""
    
    if 'high' in query_lower and 'consumption' in query_lower:
        return """High power consumption could be due to: EVSE charging, heating/cooling systems, or multiple 
        appliances running simultaneously. Check the NILM dashboard to see which appliances are consuming the most. 
        Compare with historical data to identify unusual patterns."""
    
    if 'confidence' in query_lower or 'accuracy' in query_lower:
        return """Confidence scores indicate how certain the model is about its prediction. Scores above 80% are 
        reliable. Lower scores might indicate edge cases or unusual patterns. For PV, Random Forest achieves 98.9% 
        accuracy on fault detection."""
    
    if 'offline' in query_lower or 'not working' in query_lower:
        return """If a service shows as offline, the API isn't responding. Check that all servers are running:
        • NILM API (port 5001)
        • PV API (port 5002)
        • Backend (port 3001)
        Restart the services if needed."""
    
    # Use context from retrieved documents
    if context:
        relevant_info = context[0]['content'][:300]
        return f"Based on the system documentation: {relevant_info}... Would you like more specific information?"
    
    return """I'm here to help with your energy monitoring system! You can ask me about:
    • NILM system and appliance detection
    • PV fault detection and diagnosis
    • Model performance and accuracy
    • Troubleshooting issues
    • System metrics and data interpretation
    
    What would you like to know?"""

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'RAG Chatbot',
        'embeddings_available': EMBEDDINGS_AVAILABLE,
        'llm_provider': ACTIVE_LLM or 'fallback',
        'llm_available': bool(ACTIVE_LLM),
        'knowledge_base_size': len(KNOWLEDGE_BASE),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/chat', methods=['POST'])
def chat():
    """Main chat endpoint"""
    try:
        data = request.json
        user_message = data.get('message', '').strip()
        session_id = data.get('session_id', 'default')
        
        # Accept optional live data from frontend
        pv_data = data.get('pv_data')  # Frontend sends current PV state
        nilm_data = data.get('nilm_data')  # Frontend sends current NILM state
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Initialize conversation history for this session
        if session_id not in conversations:
            conversations[session_id] = []
        
        # Format live data into context
        live_data_context = format_live_data_context(nilm_data, pv_data)
        
        # Retrieve relevant context using RAG
        relevant_docs = vector_store.search(user_message, top_k=3)
        
        # Generate response
        response_text = generate_response(
            user_message, 
            relevant_docs,
            conversations[session_id],
            live_data_context
        )
        
        # Update conversation history
        conversations[session_id].append({"role": "user", "content": user_message})
        conversations[session_id].append({"role": "assistant", "content": response_text})
        
        # Keep only last 10 messages
        if len(conversations[session_id]) > 10:
            conversations[session_id] = conversations[session_id][-10:]
        
        return jsonify({
            'response': response_text,
            'session_id': session_id,
            'timestamp': datetime.now().isoformat(),
            'context_used': [doc['topic'] for doc in relevant_docs],
            'live_data_fetched': {
                'pv': pv_data is not None,
                'nilm': nilm_data is not None
            }
        })
    
    except Exception as e:
        print(f"❌ Chat error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/clear', methods=['POST'])
def clear_conversation():
    """Clear conversation history"""
    try:
        data = request.json
        session_id = data.get('session_id', 'default')
        
        if session_id in conversations:
            del conversations[session_id]
        
        return jsonify({
            'success': True,
            'message': 'Conversation cleared'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/suggest', methods=['GET'])
def suggest_questions():
    """Get suggested questions"""
    suggestions = [
        "What is NILM and how does it work?",
        "Explain PV fault types",
        "Why is my PV system showing a fault?",
        "What does the confidence score mean?",
        "How can I reduce energy consumption?",
        "Which NILM model is most accurate?",
        "What causes partial shadowing in solar panels?",
        "How do I troubleshoot high power usage?"
    ]
    return jsonify({'suggestions': suggestions})

if __name__ == '__main__':
    print("=" * 60)
    print("PowerPulse RAG Chatbot API")
    print("=" * 60)
    print(f"Embeddings: {'✅ Available' if EMBEDDINGS_AVAILABLE else '⚠️  Not available'}")
    print(f"LLM (OpenAI): {'✅ Available' if (OPENAI_AVAILABLE and OPENAI_API_KEY) else '⚠️  Not available'}")
    print(f"Knowledge Base: {len(KNOWLEDGE_BASE)} documents")
    print("=" * 60)
    print("Starting server on port 5003...")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=5003, debug=True)
