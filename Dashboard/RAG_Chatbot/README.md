# RAG Chatbot Flask API

This Flask API bridges the frontend with the RAG chatbot implementation located in `../../RAG_Chatbot/`.

## Setup

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Environment**:
   - The `.env` file is already configured with your Gemini API key
   - Server runs on port 5003 by default

3. **Run the Server**:
   ```bash
   python app.py
   ```

   The server will:
   - Start on port 5003 (configurable in `.env`)
   - Automatically load the RAG implementation from `../../RAG_Chatbot/`
   - Build the index on startup using SIDED datasets (may take 1-2 minutes)

## API Endpoints

### POST /chat
Send a chat message and get a response with relevant context.

**Request:**
```json
{
  "message": "What is the energy consumption in Dealer LA for December 2015?"
}
```

**Response:**
```json
{
  "response": "Based on the data...",
  "context": [
    {
      "topic": "Dealer LA - December 2015",
      "content": "Monthly summary: avg=123 kW...",
      "score": 0.95,
      "source": "Dealer_LA"
    }
  ],
  "timestamp": "2025-12-06T..."
}
```

### GET /health
Check if the server is running and RAG is initialized.

**Response:**
```json
{
  "status": "healthy",
  "rag_initialized": true
}
```

### GET /status
Get detailed status including number of documents loaded and chunks created.

**Response:**
```json
{
  "status": "ok",
  "rag_initialized": true,
  "num_documents": 9,
  "num_chunks": 127,
  "timestamp": "2025-12-06T..."
}
```

### POST /rebuild-index
Rebuild the RAG index (admin endpoint). Use this if you update the SIDED datasets.

## Architecture

```
Dashboard/RAG_Chatbot/app.py (Flask API - HTTP interface)
     imports via sys.path
../../RAG_Chatbot/main.py (RAG class - orchestration)
     uses
../../RAG_Chatbot/retreiver.py (Load 9 SIDED CSV files)
../../RAG_Chatbot/chunker.py (Split documents into chunks)
../../RAG_Chatbot/embedder.py (TF-IDF vectorization)
../../RAG_Chatbot/llm_client.py (Gemini LLM wrapper)
     processes
../../SIDED/Dealer/*.csv, Logistic/*.csv, Office/*.csv
```

## How It Works

1. **Startup**: Flask app imports RAG class from root folder using `sys.path` manipulation
2. **Index Building**: RAG loads 9 CSV files from SIDED dataset (Dealer/Logistic/Office  LA/Offenbach/Tokyo)
3. **Document Processing**: Creates monthly summaries with energy metrics (avg, min, max consumption)
4. **Embedding**: Uses TF-IDF vectorizer from scikit-learn for semantic search
5. **Query**: Frontend sends question  Flask retrieves relevant chunks  Gemini generates answer
6. **Response**: Returns answer + context chunks with similarity scores

## Troubleshooting

**Import Errors**: Verify directory structure:
```
PES_Final/
 Dashboard/
    RAG_Chatbot/
        app.py (this Flask API)
        .env
        requirements.txt
 RAG_Chatbot/
    main.py
    retreiver.py
    chunker.py
    embedder.py
    llm_client.py
 SIDED/
     Dealer/
     Logistic/
     Office/
```

**No SIDED datasets found Error**: 
- Check that `../../SIDED/` exists relative to app.py
- Verify CSV files exist: Dealer_LA.csv, Dealer_Offenbach.csv, etc.

**IndexError or Empty Responses**: 
- RAG index building failed
- Check pandas is installed: `pip install pandas>=2.1.0`
- Verify CSV files are readable and contain expected columns

**Gemini API Errors**: 
- Verify GEMINI_API_KEY in `.env`
- Check Google Cloud quota and billing
- Fallback to template responses if API unavailable

**Frontend Connection Issues**:
- Ensure Flask server is running on port 5003
- Check CORS is enabled (already configured in app.py)
- Frontend should connect to `http://localhost:5003/chat`
