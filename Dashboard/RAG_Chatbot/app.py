"""Flask API for RAG Chatbot - Properly configured to use the main RAG implementation.

This Flask server bridges the frontend with the RAG chatbot located in the root RAG_Chatbot folder.
It imports the RAG class from the correct location and provides a /chat endpoint.
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
from pathlib import Path
from datetime import datetime
from threading import Lock
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the root RAG_Chatbot directory to Python path
ROOT_DIR = Path(__file__).resolve().parent.parent.parent  # Go up to PES_Final
RAG_CHATBOT_DIR = ROOT_DIR / 'RAG_Chatbot'
sys.path.insert(0, str(RAG_CHATBOT_DIR))

print(f"🔍 RAG Chatbot Directory: {RAG_CHATBOT_DIR}")
print(f"📂 Adding to Python path: {RAG_CHATBOT_DIR}")

# Now import from the correct RAG implementation
try:
    from main import RAG
    RAG_AVAILABLE = True
    print("✅ Successfully imported RAG class from main.py")
except ImportError as e:
    RAG_AVAILABLE = False
    print(f"❌ Failed to import RAG: {e}")

app = Flask(__name__)
CORS(app)

# Global RAG instance and lock for thread safety
rag_instance = None
rag_lock = Lock()
index_built = False

def initialize_rag():
    """Initialize and build the RAG index (done once at startup)."""
    global rag_instance, index_built
    
    if not RAG_AVAILABLE:
        print("⚠️  RAG not available - chatbot will return error messages")
        return False
    
    try:
        with rag_lock:
            if rag_instance is None:
                print("🚀 Initializing RAG instance...")
                rag_instance = RAG()
                print("📚 Building RAG index (this may take a moment)...")
                rag_instance.build_index()
                index_built = True
                print("✅ RAG index built successfully!")
                print(f"   - Loaded {len(rag_instance.raw_docs)} documents")
                print(f"   - Created {len(rag_instance.chunks)} chunks")
                return True
    except Exception as e:
        print(f"❌ Failed to initialize RAG: {e}")
        import traceback
        traceback.print_exc()
        return False

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'rag_available': RAG_AVAILABLE,
        'index_built': index_built,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/chat', methods=['POST'])
def chat():
    """Handle chat requests from the frontend.
    
    Expected JSON body:
    {
        "message": "user question here",
        "conversation_history": [] (optional)
    }
    
    Returns:
    {
        "response": "chatbot answer",
        "context": [retrieved chunks],
        "timestamp": "ISO timestamp"
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({
                'error': 'Missing "message" field in request body'
            }), 400
        
        user_message = data['message'].strip()
        
        if not user_message:
            return jsonify({
                'error': 'Message cannot be empty'
            }), 400
        
        # Check if RAG is available
        if not RAG_AVAILABLE or not index_built:
            return jsonify({
                'response': "I apologize, but the RAG chatbot is not properly configured. Please contact support.",
                'error': 'RAG system not available',
                'timestamp': datetime.now().isoformat()
            }), 503
        
        # Get answer from RAG
        try:
            with rag_lock:
                answer, retrieved_chunks = rag_instance.answer(user_message, top_k=5)
            
            # Format context for response
            context = []
            for chunk in retrieved_chunks:
                context.append({
                    'topic': chunk.get('topic', 'Unknown'),
                    'content': chunk.get('content', '')[:500],  # Limit content length
                    'score': chunk.get('score', 0.0),
                    'source': chunk.get('source', 'Unknown')
                })
            
            return jsonify({
                'response': answer,
                'context': context,
                'timestamp': datetime.now().isoformat()
            })
            
        except Exception as e:
            print(f"❌ Error generating response: {e}")
            import traceback
            traceback.print_exc()
            
            return jsonify({
                'response': f"I encountered an error while processing your question: {str(e)}",
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }), 500
            
    except Exception as e:
        print(f"❌ Error in /chat endpoint: {e}")
        import traceback
        traceback.print_exc()
        
        return jsonify({
            'error': f'Server error: {str(e)}',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/rebuild-index', methods=['POST'])
def rebuild_index():
    """Rebuild the RAG index (admin endpoint)."""
    try:
        success = initialize_rag()
        
        if success:
            return jsonify({
                'message': 'Index rebuilt successfully',
                'documents': len(rag_instance.raw_docs) if rag_instance else 0,
                'chunks': len(rag_instance.chunks) if rag_instance else 0,
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'error': 'Failed to rebuild index',
                'timestamp': datetime.now().isoformat()
            }), 500
            
    except Exception as e:
        return jsonify({
            'error': f'Error rebuilding index: {str(e)}',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/status', methods=['GET'])
def status():
    """Get detailed status information."""
    status_info = {
        'rag_available': RAG_AVAILABLE,
        'index_built': index_built,
        'timestamp': datetime.now().isoformat()
    }
    
    if rag_instance:
        status_info.update({
            'documents_loaded': len(rag_instance.raw_docs),
            'chunks_created': len(rag_instance.chunks),
            'embedder_ready': hasattr(rag_instance.embedder, 'vectorizer') and rag_instance.embedder.vectorizer is not None
        })
    
    return jsonify(status_info)

if __name__ == '__main__':
    print("=" * 60)
    print("🤖 PowerPulse RAG Chatbot API")
    print("=" * 60)
    
    # Initialize RAG on startup
    print("\n📦 Initializing RAG system...")
    initialize_rag()
    
    # Get port from environment or use default
    port = int(os.getenv('PORT', 5003))
    
    print(f"\n🚀 Starting Flask server on port {port}...")
    print(f"📍 Endpoints:")
    print(f"   - POST http://localhost:{port}/chat")
    print(f"   - GET  http://localhost:{port}/health")
    print(f"   - GET  http://localhost:{port}/status")
    print(f"   - POST http://localhost:{port}/rebuild-index")
    print("=" * 60)
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=True,
        threaded=True
    )

