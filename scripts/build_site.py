#!/usr/bin/env python3
"""Ensure data/news.json exists and optionally emit a JS fallback for local file:// opens."""
from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
NEWS = ROOT / "data" / "news.json"
FALLBACK = ROOT / "data" / "news.js"

def main():
    if not NEWS.exists():
        print(f"ERROR: missing {NEWS}", file=sys.stderr)
        sys.exit(1)
    data = json.loads(NEWS.read_text(encoding="utf-8"))
    count = data.get("count") or len(data.get("items") or [])
    if count < 30:
        print(f"WARNING: only {count} items (want >= 30)", file=sys.stderr)
    # Optional fallback for environments that cannot fetch JSON via file://
    FALLBACK.write_text(
        "window.__X_NEWS__ = " + json.dumps(data, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )
    print(f"OK: {count} items, wrote {FALLBACK.relative_to(ROOT)}")

if __name__ == "__main__":
    main()
