"""Orchestration for a minimalist RAG pipeline using local retriever, chunker, embedder and LLM client.

Usage:
    from main import RAG
    rag = RAG()
    rag.build_index()
    resp, used = rag.answer('ask about irradiance in Dealer-LA')
"""
from typing import List, Dict, Tuple
from retreiver import load_all_documents
from chunker import chunk_documents
from embedder import Embedder
from llm_client import generate_response


class RAG:
    def __init__(self):
        self.raw_docs: List[Dict] = []
        self.chunks: List[Dict] = []
        self.embedder = Embedder()

    def build_index(self):
        # Load documents
        self.raw_docs = load_all_documents()
        # Create chunks (smaller size for better granularity)
        self.chunks = chunk_documents(self.raw_docs, chunk_size=400, overlap=50)
        texts = [c['content'] for c in self.chunks]
        self.embedder.fit(texts)

    def retrieve(self, query: str, top_k: int = 5) -> List[Dict]:
        qvec = self.embedder.embed_query(query)
        scores = self.embedder.similarity_scores(qvec, top_k=top_k)
        results = []
        for idx, score in scores:
            if idx < 0 or idx >= len(self.chunks):
                continue
            c = self.chunks[idx].copy()
            c['score'] = float(score)
            results.append(c)
        return results

    def answer(self, query: str, top_k: int = 5) -> Tuple[str, List[Dict]]:
        retrieved = self.retrieve(query, top_k=top_k)
        # Pass retrieved to LLM client
        answer = generate_response(query, retrieved)
        return answer, retrieved


if __name__ == '__main__':
    rag = RAG()
    print('Building index...')
    rag.build_index()
    q = input('Question: ')
    resp, used = rag.answer(q)
    print('\n--- RESPONSE ---')
    print(resp)
    print('\n--- CONTEXT USED ---')
    for u in used:
        print(u['topic'], u.get('score'))
