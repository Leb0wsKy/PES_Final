"""Basic embedder using TF-IDF vectors as a lightweight embedding fallback.

Produces vector embeddings for textual chunks and query similarity scoring.
Requires scikit-learn. If not available, falls back to a simple hashing vector.
"""
from typing import List, Tuple

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    import numpy as np
    SKLEARN_AVAILABLE = True
except Exception:
    SKLEARN_AVAILABLE = False
    np = None


class Embedder:
    def __init__(self):
        self.vectorizer = None
        self.embeddings = None

    def fit(self, texts: List[str]):
        if SKLEARN_AVAILABLE:
            # Filter out empty texts
            texts = [t for t in texts if t and t.strip()]
            if not texts:
                print("Warning: No valid texts to embed, using fallback")
                self.embeddings = []
                return
            self.vectorizer = TfidfVectorizer(max_features=2048, min_df=1)
            self.embeddings = self.vectorizer.fit_transform(texts)
        else:
            # fallback: store texts
            self.embeddings = texts

    def embed_query(self, query: str):
        if SKLEARN_AVAILABLE and self.vectorizer is not None:
            return self.vectorizer.transform([query])
        return query

    def similarity_scores(self, query_vec, top_k: int = 5) -> List[Tuple[int, float]]:
        """Return list of (index, score) sorted desc. Uses cosine similarity for TFIDF matrix."""
        if SKLEARN_AVAILABLE and self.embeddings is not None:
            # embeddings may be sparse
            from sklearn.metrics.pairwise import cosine_similarity
            sims = cosine_similarity(query_vec, self.embeddings).flatten()
            idxs = sims.argsort()[::-1][:top_k]
            return [(int(i), float(sims[i])) for i in idxs]
        else:
            # naive fallback: substring match count
            scores = []
            q = str(query_vec).lower()
            for i, text in enumerate(self.embeddings or []):
                s = sum(1 for w in q.split() if w in str(text).lower())
                scores.append((i, float(s)))
            scores.sort(key=lambda x: x[1], reverse=True)
            return scores[:top_k]


if __name__ == '__main__':
    e = Embedder()
    e.fit(['hello world', 'goodbye world', 'hello again'])
    q = e.embed_query('hello')
    print(e.similarity_scores(q, top_k=2))
