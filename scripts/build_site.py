#!/usr/bin/env python3
"""Validate bilingual day/news JSON and emit a JS fallback for local file:// opens."""
from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
NEWS = ROOT / "data" / "news.json"
DAYS_DIR = ROOT / "data" / "days"
MANIFEST = ROOT / "data" / "days.json"
FALLBACK = ROOT / "data" / "news.js"
REQUIRED = ("title_en", "title_zh", "hook_en", "hook_zh", "summary_en", "summary_zh", "body_en", "body_zh")

def validate_items(items, label):
    missing = []
    for i, it in enumerate(items):
        for k in REQUIRED:
            if not it.get(k):
                missing.append(f"{label}[{i}].{k} (id={it.get('id')})")
    return missing

def main():
    if not NEWS.exists():
        print(f"ERROR: missing {NEWS}", file=sys.stderr)
        sys.exit(1)
    data = json.loads(NEWS.read_text(encoding="utf-8"))
    items = data.get("items") or []
    count = data.get("count") or len(items)
    if count < 30:
        print(f"WARNING: only {count} items (want >= 30)", file=sys.stderr)
    missing = validate_items(items, "news.items")
    if missing:
        print("ERROR: bilingual fields required:", file=sys.stderr)
        for m in missing[:20]:
            print(f"  - {m}", file=sys.stderr)
        sys.exit(1)

    if MANIFEST.exists():
        manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
        latest = manifest.get("latest")
        days = manifest.get("days") or []
        if latest and (DAYS_DIR / f"{latest}.json").exists():
            day_data = json.loads((DAYS_DIR / f"{latest}.json").read_text(encoding="utf-8"))
            if (day_data.get("count") or len(day_data.get("items") or [])) != count:
                print(
                    f"WARNING: days/{latest}.json count differs from news.json "
                    f"({day_data.get('count')} vs {count})",
                    file=sys.stderr,
                )
        print(f"manifest: latest={latest} days={len(days)}")

    FALLBACK.write_text(
        "window.__X_NEWS__ = " + json.dumps(data, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )
    print(f"OK: {count} bilingual items, wrote {FALLBACK.relative_to(ROOT)}")

if __name__ == "__main__":
    main()
