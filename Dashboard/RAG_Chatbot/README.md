# PowerPulse RAG Chatbot

AI-powered monitoring assistant for the PowerPulse Energy Dashboard using Retrieval-Augmented Generation (RAG).

## Features

- **RAG Architecture**: Combines vector search with LLM for accurate, context-aware responses
- **Knowledge Base**: Pre-loaded with NILM and PV system documentation
- **Fallback Responses**: Works without OpenAI API using template-based responses
- **Session Management**: Maintains conversation context
- **Suggested Questions**: Helps users get started

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. (Optional) Set OpenAI API key for enhanced responses:
```bash
# Windows PowerShell
$env:OPENAI_API_KEY="your-api-key-here"

# Linux/Mac
export OPENAI_API_KEY="your-api-key-here"
```

## Running the Service

```bash
python app.py
```

The chatbot API will run on **http://localhost:5003**

## API Endpoints

### Health Check
```
GET /health
```

### Chat
```
POST /chat
Content-Type: application/json

{
  "message": "What is NILM?",
  "session_id": "user123"
}
```

### Clear Conversation
```
POST /clear
Content-Type: application/json

{
  "session_id": "user123"
}
```

### Get Suggestions
```
GET /suggest
```

## How It Works

1. **User Query**: User sends a message
2. **Retrieval**: System searches knowledge base for relevant documents
3. **Augmentation**: Retrieved context is added to the prompt
4. **Generation**: LLM (or fallback) generates a response
5. **Response**: Answer is returned to user

## Knowledge Base Topics

- NILM System overview
- PV Fault Detection
- Model Performance
- Fault Types
- Energy Monitoring
- System Metrics
- Troubleshooting
- Data Augmentation

## Architecture

```
User Query
    ↓
Vector Store (Sentence Transformers)
    ↓
Top-K Documents Retrieved
    ↓
LLM (OpenAI GPT-3.5) OR Template-based Fallback
    ↓
Generated Response
```

## Notes

- Works without OpenAI API using smart fallback responses
- Embedding model downloads automatically on first run (~100MB)
- Session history kept in memory (use database for production)
- Knowledge base can be extended in `KNOWLEDGE_BASE` array
