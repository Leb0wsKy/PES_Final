"""Simple chunker for textual documents.

Splits long documents into overlapping chunks suitable for embedding and retrieval.
"""
from typing import List, Dict


def chunk_text(text: str, chunk_size: int = 300, overlap: int = 30) -> List[str]:
    """Split `text` into chunks of approximately `chunk_size` characters with `overlap`."""
    if not text:
        return []
    text = text.replace('\r', '')
    chunks = []
    start = 0
    n = len(text)
    while start < n:
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk.strip())
        if end >= n:
            break
        start = end - overlap
    return [c for c in chunks if c]


def chunk_documents(docs: List[Dict], chunk_size: int = 300, overlap: int = 30) -> List[Dict]:
    """Given docs [{'topic','content','source'}], returns list of chunk dicts:
    {'topic','content','source','chunk_id'}
    """
    out = []
    for doc in docs:
        content = doc.get('content', '')
        chunks = chunk_text(content, chunk_size=chunk_size, overlap=overlap)
        for i, c in enumerate(chunks):
            out.append({
                'topic': doc.get('topic'),
                'content': c,
                'source': doc.get('source'),
                'chunk_id': f"{doc.get('topic')}_chunk_{i}"
            })
    return out


if __name__ == '__main__':
    d = [{'topic': 't', 'content': 'a'*1200, 'source': 's'}]
    print(len(chunk_documents(d)))
