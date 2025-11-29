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
- **Dynamic Dataset Retrieval**: Builds embeddings from MongoDB collections (`nilmdatas`, `pvdatas`) for historical stats
}
```
2. (Optional) Set API keys and MongoDB URI:

### Clear Conversation
```
$env:GEMINI_API_KEY="your-gemini-key-here"
$env:MONGODB_URI="mongodb://localhost:27017/pes_dashboard"
POST /clear
Content-Type: application/json

export GEMINI_API_KEY="your-gemini-key-here"
export MONGODB_URI="mongodb://localhost:27017/pes_dashboard"
{
  "session_id": "user123"
}
```

### Get Suggestions

### Refresh Dataset Index
```
POST /refresh_dataset_index
```
Rebuilds the Mongo-derived embeddings/documents.
```
GET /suggest
```
1. **User Query**: User sends a message
2. **Retrieval**: Searches static KB + dataset summaries (NILM/PV historical stats) from MongoDB
3. **Augmentation**: Retrieved context + optional live data appended
4. **Generation**: LLM (Gemini/OpenAI) or fallback templates produce answer
5. **Response**: JSON returned to frontend
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
User Query
   ↓
Static KB Vector Store ─┐
                 ├─ Merged Context → LLM / Fallback → Response
Dataset Summary Store ───┘
   ↑
MongoDB (nilmdatas, pvdatas) → Periodic / on-demand indexing
- Troubleshooting
- Data Augmentation

- Knowledge base can be extended in `KNOWLEDGE_BASE` array
- Dataset index built automatically if `MONGODB_URI` reachable
- Refresh dataset docs with `POST /refresh_dataset_index`

```
User Query
    ↓
Vector Store (Sentence Transformers)
    ↓
Top-K Documents Retrieved
### Dataset Retrieval Configuration
Set `MONGODB_URI` in `.env`:
```
MONGODB_URI=mongodb://localhost:27017/pes_dashboard
DATASET_INDEX_LIMIT=300  # Optional override for how many recent docs to summarize
```

Rebuild index manually:
```
curl -X POST http://localhost:5003/refresh_dataset_index
```

If Mongo is unavailable the chatbot still functions using static docs + live data.
    ↓
LLM (OpenAI GPT-3.5) OR Template-based Fallback
    ↓
Generated Response
```

## Notes

- `POST /refresh_dataset_index` - Re-ingest Mongo dataset summaries
- Works without OpenAI API using smart fallback responses
- Embedding model downloads automatically on first run (~100MB)
- Session history kept in memory (use database for production)
### Dataset index size is 0
- Check Mongo running and accessible via `MONGODB_URI`
- Validate collections `nilmdatas`, `pvdatas` have documents
- Rebuild index: `curl -X POST http://localhost:5003/refresh_dataset_index`
- Ensure `pymongo` installed (in `requirements.txt`)
- Knowledge base can be extended in `KNOWLEDGE_BASE` array
