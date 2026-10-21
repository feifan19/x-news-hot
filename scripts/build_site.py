#!/usr/bin/env python3
"""Validate bilingual news.json and emit a JS fallback for local file:// opens."""
from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
NEWS = ROOT / "data" / "news.json"
FALLBACK = ROOT / "data" / "news.js"
REQUIRED = ("title_en", "title_zh", "hook_en", "hook_zh", "summary_en", "summary_zh")

def main():
    if not NEWS.exists():
        print(f"ERROR: missing {NEWS}", file=sys.stderr)
        sys.exit(1)
    data = json.loads(NEWS.read_text(encoding="utf-8"))
    items = data.get("items") or []
    count = data.get("count") or len(items)
    if count < 30:
        print(f"WARNING: only {count} items (want >= 30)", file=sys.stderr)
    missing = []
    for i, it in enumerate(items):
        for k in REQUIRED:
            if not it.get(k):
                missing.append(f"items[{i}].{k} (id={it.get('id')})")
    if missing:
        print("ERROR: bilingual fields required:", file=sys.stderr)
        for m in missing[:20]:
            print(f"  - {m}", file=sys.stderr)
        sys.exit(1)
    FALLBACK.write_text(
        "window.__X_NEWS__ = " + json.dumps(data, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )
    print(f"OK: {count} bilingual items, wrote {FALLBACK.relative_to(ROOT)}")

if __name__ == "__main__":
    main()
