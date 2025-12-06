"""Lightweight retriever for local numeric datasets.

Loads 9 SIDED CSV files with hardcoded paths for speed.
Creates monthly summaries for accurate time-based queries.
"""
import os
from pathlib import Path
from typing import List, Dict

try:
    import pandas as pd
    PANDAS_AVAILABLE = True
except Exception:
    PANDAS_AVAILABLE = False


ROOT = Path(__file__).resolve().parent.parent  # PES_Final/RAG_Chatbot -> go up 1 -> PES_Final

# Hardcoded dataset paths for the 9 SIDED CSV files
DATASET_PATHS = [
    ROOT / 'SIDED' / 'Dealer' / 'Dealer_LA.csv',
    ROOT / 'SIDED' / 'Dealer' / 'Dealer_Offenbach.csv',
    ROOT / 'SIDED' / 'Dealer' / 'Dealer_Tokyo.csv',
    ROOT / 'SIDED' / 'Logistic' / 'Logistic_LA.csv',
    ROOT / 'SIDED' / 'Logistic' / 'Logistic_Offenbach.csv',
    ROOT / 'SIDED' / 'Logistic' / 'Logistic_Tokyo.csv',
    ROOT / 'SIDED' / 'Office' / 'Office_LA.csv',
    ROOT / 'SIDED' / 'Office' / 'Office_Offenbach.csv',
    ROOT / 'SIDED' / 'Office' / 'Office_Tokyo.csv',
]


def load_sided_documents() -> List[Dict]:
    """Load the 9 SIDED CSV files and create one document per month per file.
    
    Returns list of dicts: { 'topic': str, 'content': str, 'source': filepath }
    Each document represents one month of data from one location.
    """
    docs = []
    
    if not PANDAS_AVAILABLE:
        print("Warning: pandas not available, cannot load datasets")
        return docs
    
    for csv_path in DATASET_PATHS:
        if not csv_path.exists():
            print(f"Warning: File not found: {csv_path}")
            continue
        
        try:
            # Extract building type and location from filename
            filename = csv_path.stem  # e.g., "Office_LA"
            parts = filename.split('_')
            building = parts[0]  # Dealer, Logistic, Office
            location = parts[1] if len(parts) > 1 else 'Unknown'  # LA, Offenbach, Tokyo
            
            print(f"Loading {filename}...")
            
            # Load entire CSV (these files are manageable size ~50MB)
            df = pd.read_csv(csv_path)
            
            # Parse timestamp column
            time_col = None
            for col in df.columns:
                if 'time' in col.lower():
                    time_col = col
                    break
            
            if not time_col:
                print(f"  No timestamp column found in {filename}")
                continue
            
            # Convert to datetime
            df['_datetime'] = pd.to_datetime(df[time_col], unit='s', errors='coerce')
            df['_month'] = df['_datetime'].dt.to_period('M')
            
            # Get numeric columns (energy metrics)
            numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
            numeric_cols = [c for c in numeric_cols if c != time_col]
            
            # Create one document per month
            for month_period in df['_month'].dropna().unique():
                month_df = df[df['_month'] == month_period]
                month_name = month_period.strftime('%B %Y')
                
                topic = f"{building} {location} - {month_name}"
                content = f"Building: {building}\nLocation: {location}\nMonth: {month_name}\n"
                content += f"Data points: {len(month_df)}\n\n"
                content += "Energy Metrics:\n"
                
                for col in numeric_cols[:15]:  # Limit to key metrics
                    vals = month_df[col].dropna()
                    if len(vals) > 0:
                        content += f"{col}:\n"
                        content += f"  Average: {vals.mean():.2f}\n"
                        content += f"  Min: {vals.min():.2f}\n"
                        content += f"  Max: {vals.max():.2f}\n"
                
                docs.append({
                    'topic': topic,
                    'content': content,
                    'source': str(csv_path)
                })
            
            print(f"  Created {len(df['_month'].dropna().unique())} monthly documents")
            
        except Exception as e:
            print(f"Error loading {csv_path}: {e}")
            continue
    
    return docs
def load_pv_simulink_documents() -> List[Dict]:
    """Load CSVs from `PV/Simulink_Matlab` (e.g., `Irr_temp_ariana.csv`) and summarize."""
    docs = []
    pv_sim_dir = ROOT / 'PV' / 'Simulink_Matlab'
    if not pv_sim_dir.exists():
        print(f"Warning: PV Simulink directory not found at {pv_sim_dir}")
        return docs

    csvs = list(pv_sim_dir.glob('*.csv'))
    for f in csvs:
        topic = f"PV Simulink - {f.name}"
        content = f"File: {f.name}\nPath: {str(f)}\n"
        try:
            if PANDAS_AVAILABLE:
                df = pd.read_csv(f)
                content += f"Total rows: {len(df)}\n"
                
                # Get numeric stats
                numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
                content += '\nNumeric Summary:\n'
                for col in numeric_cols[:10]:
                    vals = df[col].dropna()
                    if len(vals) > 0:
                        content += f"{col}: mean={vals.mean():.2f}, min={vals.min():.2f}, max={vals.max():.2f}\n"
            else:
                content += f"File size (bytes): {f.stat().st_size}\n"
        except Exception as e:
            content += f"Failed to read file: {e}\n"

        docs.append({'topic': topic, 'content': content, 'source': str(f)})

    return docs


def load_all_documents() -> List[Dict]:
    """Aggregate all retrievable documents from SIDED and PV Simulink."""
    docs = []
    docs.extend(load_sided_documents())
    docs.extend(load_pv_simulink_documents())
    print(f"Loaded {len(docs)} documents total")
    return docs


if __name__ == '__main__':
    # quick CLI check
    all_docs = load_all_documents()
    print(f"Loaded {len(all_docs)} documents")
    for d in all_docs[:5]:
        print('---')
        print(d['topic'])
        print(d['content'][:400])
