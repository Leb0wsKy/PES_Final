# PowerPulse RAG Chatbot Integration Guide

## Overview

The RAG (Retrieval-Augmented Generation) Chatbot has been successfully integrated into the PowerPulse Dashboard as an AI-powered monitoring assistant.

## 🎯 Features

- **Facebook Messenger-style UI**: Popup chat interface in bottom-right corner
- **Smart Context Retrieval**: Uses semantic search to find relevant documentation
- **LLM Integration**: Supports OpenAI GPT-3.5 or falls back to template responses
- **Session Management**: Maintains conversation history per user
- **Suggested Questions**: Quick-start prompts for common queries
- **Real-time Responses**: Fast, context-aware answers about NILM and PV systems

## 🚀 Getting Started

### 1. Install Chatbot Dependencies

```bash
cd Dashboard/RAG_Chatbot
pip install -r requirements.txt
```

**Dependencies:**
- `flask` - Web framework
- `flask-cors` - CORS support
- `python-dotenv` - Load API keys from `.env`
- `google-generativeai` - Gemini LLM (preferred)
- `openai` - Optional fallback LLM
- `sentence-transformers` and `numpy` - Optional embeddings for RAG (falls back to keywords)

### 2. Configure LLM API Key

The chatbot prefers Gemini. If `GEMINI_API_KEY` is set, it will use Gemini. Otherwise it falls back to OpenAI if available.

Use the provided example:

```powershell
# Windows PowerShell (run from Dashboard/RAG_Chatbot)
Copy-Item .env.example .env
notepad .env  # paste your key(s)
```

`.env` format:

```
GEMINI_API_KEY=your-gemini-api-key
# Optional fallback
OPENAI_API_KEY=your-openai-api-key
```

> The chatbot also works without any LLM using smart fallback responses.

### 3. Start All Services

#### Option A: Use the automated script
```bash
cd Dashboard
start_all_with_chatbot.bat
```

#### Option B: Start manually

**Terminal 1 - NILM API:**
```bash
cd Dashboard/flask_api_nilm
python app.py
```

**Terminal 2 - PV API:**
```bash
cd Dashboard/flask_api_pv
python app.py
```

**Terminal 3 - Chatbot API:**
```bash
cd Dashboard/RAG_Chatbot
python app.py
```

**Terminal 4 - Backend:**
```bash
cd Dashboard/backend
npm start
```

**Terminal 5 - Frontend:**
```bash
cd Dashboard/frontend
npm start
```

### 4. Access the Dashboard

Open your browser to **http://localhost:3000**

The chatbot button will appear in the bottom-right corner! 💬

## 🧪 Testing the Chatbot

Test the API directly:

```bash
cd Dashboard/RAG_Chatbot
python test_chatbot.py
```

Or test via curl:

```bash
# Health check
curl http://localhost:5003/health

# Ask a question
curl -X POST http://localhost:5003/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is NILM?", "session_id": "test"}'

# Get suggestions
curl http://localhost:5003/suggest
```

## 💬 Using the Chatbot

### Opening the Chat
Click the pulsing chat icon in the bottom-right corner of the dashboard.

### Sample Questions
- "What is NILM and how does it work?"
- "Explain PV fault types"
- "Why is my PV system showing a fault?"
- "What does the confidence score mean?"
- "Which NILM model is most accurate?"
- "How can I reduce energy consumption?"
- "What causes partial shadowing?"

### Features
- **Context Awareness**: Bot knows about your NILM and PV systems
- **Suggested Prompts**: Click suggestions to ask common questions
- **Clear History**: Refresh icon to start a new conversation
- **Responsive**: Works on mobile and desktop
- **Always Available**: Minimizes to icon when not needed

## 📊 Architecture

```
Frontend (React)
     ↓
Node.js Backend (Port 3001)
     ↓
Chatbot Flask API (Port 5003)
     ↓
┌─────────────┬──────────────┐
│  Vector DB  │     LLM      │
│ (Semantic   │  (OpenAI     │
│  Search)    │  or Fallback)│
└─────────────┴──────────────┘
```

## 🔧 Configuration

### Knowledge Base
Edit `RAG_Chatbot/app.py` to add more topics to `KNOWLEDGE_BASE`:

```python
{
    "topic": "Your Topic",
    "content": "Detailed information about the topic..."
}
```

### Fallback Responses
Modify `generate_fallback_response()` function to customize template responses.

### Model Selection
Change the embedding model in `SimpleVectorStore.__init__()`:
```python
self.model = SentenceTransformer('all-MiniLM-L6-v2')  # Fast & lightweight
# Or use: 'all-mpnet-base-v2' for better accuracy (larger model)
```

## 🎨 UI Customization

The chatbot UI is in `frontend/src/components/ChatbotAssistant.js`

**Customize appearance:**
- Colors: Modify gradient backgrounds
- Position: Change `bottom` and `right` values
- Size: Adjust `width` and `height`
- Animation: Edit `@keyframes pulse`

## 📝 API Endpoints

### Backend Proxy (Port 3001)
- `POST /api/chatbot/chat` - Send message
- `POST /api/chatbot/clear` - Clear conversation
- `GET /api/chatbot/suggest` - Get suggestions

### Direct Chatbot API (Port 5003)
- `GET /health` - Service health check
- `POST /chat` - Chat endpoint
- `POST /clear` - Clear session
- `GET /suggest` - Get question suggestions

## 🚨 Troubleshooting

### Chatbot button not appearing
- Check browser console for errors
- Verify all 5 services are running
- Clear browser cache and refresh

### "Service not available" error
- Make sure port 5003 is not blocked
- Check chatbot API is running: `curl http://localhost:5003/health`
- Verify backend proxy is forwarding requests

### Slow responses
- First query is slower (model loading)
- Check network tab for API delays
- Consider using OpenAI API for faster responses

### Import errors
- Reinstall dependencies: `pip install -r requirements.txt`
- Check Python version (3.8+ required)
- Use virtual environment to avoid conflicts

## 🔐 Security Notes

- Store OpenAI API key securely (use environment variables)
- Implement rate limiting for production
- Add authentication to chatbot endpoints
- Sanitize user inputs before processing
- Use HTTPS in production

## 📈 Future Enhancements

- [ ] Voice input/output
- [ ] Multi-language support
- [ ] Export conversation history
- [ ] Real-time system data integration
- [ ] Proactive alerts and recommendations
- [ ] User feedback system
- [ ] Persistent conversation storage (database)
- [ ] Analytics dashboard for chatbot usage

## 🙏 Credits

- **Sentence Transformers**: Embeddings model
- **OpenAI**: GPT-3.5 Turbo API
- **Material-UI**: React components
- **Flask**: Python web framework

---

**Built with ❤️ for PowerPulse Energy Management Platform**
