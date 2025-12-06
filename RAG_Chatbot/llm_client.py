"""LLM client wrapper that attempts to use Gemini (google.generativeai) when available.

If Gemini is not available or not configured, falls back to a simple template-based
response generator that concatenates the most relevant chunks.
"""
import os
from typing import List, Dict
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except Exception:
    GEMINI_AVAILABLE = False


GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
if GEMINI_API_KEY and GEMINI_AVAILABLE:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        print(f"✅ Gemini configured with API key: {GEMINI_API_KEY[:10]}...")
    except Exception as e:
        print(f"⚠️ Failed to configure Gemini: {e}")
else:
    if not GEMINI_API_KEY:
        print("⚠️ GEMINI_API_KEY not found in environment")
    if not GEMINI_AVAILABLE:
        print("⚠️ google-generativeai not installed")


def _compose_prompt(query: str, chunks: List[Dict]) -> str:
    prompt = [
        "You are PowerPulse Assistant, an expert energy analyst. Provide insightful, interpretive analysis based on the data.",
        "",
        "INSTRUCTIONS:",
        "- Answer the user's question directly and specifically (e.g., if they ask about December, focus ONLY on December data)",
        "- Provide interpretation and insights, not just raw numbers",
        "- Explain what the numbers mean in practical terms",
        "- Compare values when relevant (e.g., 'higher than average', 'significant increase')",
        "- Identify trends, patterns, or anomalies",
        "- Be conversational and helpful, not just a data dump",
        "- If asked about a specific time period, use ONLY that period's data",
        "- Translate technical terms for clarity (e.g., 'EVSE = Electric Vehicle charging')",
        "",
        f"User Question: {query}",
        "",
        "Context Data:"
    ]

    for i, c in enumerate(chunks, 1):
        prompt.append(f"\n[Source {i}: {c.get('topic', 'Unknown')}]")
        prompt.append(c.get('content', ''))
        prompt.append("")

    prompt.append("\nProvide an interpretive answer (NOT a list of raw statistics):")
    return "\n".join(prompt)


def generate_response(query: str, chunks: List[Dict], max_tokens: int = 512) -> str:
    """Generate a response using Gemini if available, otherwise use a simple template."""
    if GEMINI_AVAILABLE and GEMINI_API_KEY:
        try:
            model = genai.GenerativeModel('models/gemini-2.5-flash')
            prompt = _compose_prompt(query, chunks)
            resp = model.generate_content(prompt)
            # different runtimes may return different shapes
            text = getattr(resp, 'text', None)
            if not text:
                # try first candidate
                candidates = getattr(resp, 'candidates', None)
                if candidates and len(candidates) > 0:
                    content = candidates[0].content
                    if hasattr(content, 'parts') and content.parts:
                        text = content.parts[0].text
            return (text or '').strip()
        except Exception as e:
            print(f"Gemini call failed: {e}")

    # Fallback: craft a short answer concatenating top chunks
    out = ["I couldn't call the LLM; here's a summary of the most relevant data:"]
    for c in chunks[:5]:
        header = f"Source: {c.get('source','')} | Topic: {c.get('topic','')}"
        out.append(header)
        out.append(c.get('content','')[:500])
        out.append('---')
    out.append("If you want a more natural language explanation, configure GEMINI_API_KEY and install google-generativeai.")
    return "\n".join(out)


if __name__ == '__main__':
    test_chunks = [{'topic':'t','content':'a numeric summary 1: mean=10, max=20','source':'/tmp/foo.csv'}]
    print(generate_response('What is the average?', test_chunks))
