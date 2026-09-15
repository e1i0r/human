"""Write one JS file per plain-regex detector, around the pattern already pulled."""
import json
from pathlib import Path

JS = Path.home() / "Mi/jobs/personal/repos/human/src/detectors"
ported = json.loads(Path("/tmp/ported.json").read_text(encoding="utf-8"))

# How the pattern is applied to a sentence. "short" also asks the config for the
# length past which the shape stops being the tell.
CALL = {
    "search": "(s) => PATTERN.test(s)",
    "match": "(s) => PATTERN.test(s)",
    "short": ("(s) => s.split(/\\s+/).filter(Boolean).length <= cfg[ID].max_words\n"
              "    && PATTERN.test(s)"),
}


import sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
from boundary import translate as unicode_boundaries  # noqa: E402


def comment(doc):
    lines = [f" * {ln}".rstrip() for ln in doc.split("\n")]
    return "/**\n" + "\n".join(lines) + "\n */"


for d in ported:
    call = CALL[d["how"]].replace("ID", json.dumps(d["id"]))
    needs_cfg = d["how"] == "short"
    args = "(units, cfg)" if needs_cfg else "(units)"
    note = f"\n  note: {json.dumps(d['note'])}," if d["note"] else ""

    body = f"""{comment(d["doc"])}
import {{ REVIEW, detector, sentenceHits }} from "./base.js";

const PATTERN = /{unicode_boundaries(d["regex"])}/{"iu" if d["ignorecase"] else "u"};

export default detector({{
  id: {json.dumps(d["id"])},
  label: {json.dumps(d["label"])},
  level: REVIEW,
  langs: {json.dumps(d["langs"])},{note}
  find: {args} => sentenceHits(units, {call}),
}});
"""
    (JS / d["file"]).write_text(body, encoding="utf-8")

print(f"  {len(ported)} archivos escritos")
