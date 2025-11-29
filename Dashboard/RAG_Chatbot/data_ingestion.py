import os
from datetime import datetime
from typing import List, Dict

try:
    from pymongo import MongoClient
    PYMONGO_AVAILABLE = True
except ImportError:
    PYMONGO_AVAILABLE = False

def _parse_db_name(mongo_uri: str) -> str:
    """Extract database name from a MongoDB URI (fallback to pes_dashboard)."""
    if not mongo_uri:
        return 'pes_dashboard'
    # mongodb://host:port/dbname or mongodb+srv://host/dbname
    parts = mongo_uri.rsplit('/', 1)
    if len(parts) == 2 and parts[1]:
        db_part = parts[1].split('?')[0].strip()
        if db_part:
            return db_part
    return 'pes_dashboard'

def _safe_number(val):
    try:
        return float(val)
    except Exception:
        return 0.0

def load_dataset_documents(mongo_uri: str, limit: int = 300) -> List[Dict]:
    """
    Connect to MongoDB and build textual documents summarizing NILM and PV datasets.
    Returns a list of dicts with keys: topic, content.
    Gracefully handles missing dependencies or connection errors.
    """
    if not PYMONGO_AVAILABLE:
        print("⚠️  pymongo not installed; skipping dataset ingestion.")
        return []

    db_name = _parse_db_name(mongo_uri)
    try:
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=4000)
        # Trigger server selection
        client.admin.command('ping')
    except Exception as e:
        print(f"⚠️  MongoDB connection failed: {e}")
        return []

    db = client[db_name]
    nilm_col = db.get_collection('nilmdatas')
    pv_col = db.get_collection('pvdatas')

    documents: List[Dict] = []

    # NILM dataset summaries
    try:
        nilm_cursor = nilm_col.find({}, {'timestamp': 1, 'aggregate': 1, 'appliances': 1, 'building': 1, 'location': 1}) 
        nilm_cursor = nilm_cursor.sort('timestamp', -1).limit(limit)
        nilm_docs = list(nilm_cursor)
        if nilm_docs:
            # Group by building/location
            grouped = {}
            for d in nilm_docs:
                b = d.get('building', 'Unknown')
                l = d.get('location', 'Unknown')
                key = f"{b}-{l}"
                grouped.setdefault(key, []).append(d)

            for key, rows in grouped.items():
                aggregates = [_safe_number(r.get('aggregate')) for r in rows]
                latest_ts = max(r.get('timestamp') for r in rows if r.get('timestamp'))
                appliances_totals = {}
                for r in rows:
                    ap = r.get('appliances', {}) or {}
                    for k_ap, v_ap in ap.items():
                        appliances_totals.setdefault(k_ap, []).append(_safe_number(v_ap))

                appliance_avgs = {k_ap: (sum(vs)/len(vs) if vs else 0.0) for k_ap, vs in appliances_totals.items()}
                content_lines = [
                    f"NILM Historical Summary ({key})",
                    f"Samples: {len(rows)} | Latest Timestamp: {latest_ts}",
                    f"Average Aggregate Power: {sum(aggregates)/len(aggregates):.2f} W" if aggregates else "Average Aggregate Power: N/A",
                    "Average Appliance Power (W):"
                ]
                for ap_name, avg_val in appliance_avgs.items():
                    content_lines.append(f"  - {ap_name}: {avg_val:.2f} W")
                content_lines.append("Peak Aggregate Observed: {:.2f} W".format(max(aggregates) if aggregates else 0.0))
                documents.append({
                    'topic': f'Historical NILM {key}',
                    'content': "\n".join(content_lines)
                })
        else:
            print("ℹ️  No NILM documents found in MongoDB.")
    except Exception as e:
        print(f"⚠️  NILM ingestion error: {e}")

    # PV dataset summaries
    try:
        pv_cursor = pv_col.find({}, {'timestamp': 1, 'P': 1, 'Gb_i': 1, 'Gd_i': 1, 'T2m': 1, 'Gt': 1})
        pv_cursor = pv_cursor.sort('timestamp', -1).limit(limit)
        pv_docs = list(pv_cursor)
        if pv_docs:
            power_vals = [_safe_number(d.get('P')) for d in pv_docs]
            irr_vals = [_safe_number(d.get('Gb_i')) + _safe_number(d.get('Gd_i')) for d in pv_docs]
            temp_vals = [_safe_number(d.get('T2m')) for d in pv_docs]
            gt_vals = [_safe_number(d.get('Gt')) for d in pv_docs]
            latest_ts = max(d.get('timestamp') for d in pv_docs if d.get('timestamp'))
            content_lines = [
                "PV Historical Summary",
                f"Samples: {len(pv_docs)} | Latest Timestamp: {latest_ts}",
                f"Average Power (P): {sum(power_vals)/len(power_vals):.2f} W" if power_vals else "Average Power: N/A",
                f"Peak Power Observed: {max(power_vals):.2f} W" if power_vals else "Peak Power: N/A",
                f"Average Irradiance (Gb_i+Gd_i): {sum(irr_vals)/len(irr_vals):.2f} W/m²" if irr_vals else "Average Irradiance: N/A",
                f"Average Temperature (T2m): {sum(temp_vals)/len(temp_vals):.2f} °C" if temp_vals else "Average Temperature: N/A",
                f"Average Global Tilt (Gt): {sum(gt_vals)/len(gt_vals):.2f} W/m²" if gt_vals else "Average Global Tilt: N/A"
            ]
            documents.append({
                'topic': 'Historical PV Metrics',
                'content': "\n".join(content_lines)
            })
        else:
            print("ℹ️  No PV documents found in MongoDB.")
    except Exception as e:
        print(f"⚠️  PV ingestion error: {e}")

    print(f"✅ Built {len(documents)} dataset-derived documents for retrieval.")
    return documents

__all__ = ["load_dataset_documents"]