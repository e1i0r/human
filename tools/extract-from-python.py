"""Pull every plain-regex REVIEW detector out of the Python, into JSON.

Retyping a regex by hand loses a case ending or an alternation and nothing
complains, so nothing here is retyped: the pattern and the docstring come out
of the source and a second script writes the JS around them.
"""
import json
import re
from pathlib import Path

PY = Path.home() / "Mi/jobs/personal/repos/tells/detectors"

# id, python file, regex variable, label, langs, note, how it is applied
SIMPLE = [
    ("subjectless-fragment", "subjectless_fragment.py", "_NOSUBJ",
     "subjectless fragment", "es/en",
     "an answer to a when (Antes del pull request.) is legitimate", "short"),
    ("agentless-passive", "agentless_passive.py", "_PASSIVE",
     "agentless passive", "es",
     "only counts where the sentence is about what somebody does", "search"),
    ("pseudo-cleft", "pseudo_cleft.py", "_CLEFT", "pseudo-cleft", "es/en", "", "match"),
    ("mid-sentence-colon", "mid_sentence_colon.py", "_COLON",
     "mid-sentence colon", "es/en", "fine when a complete clause comes before it", "search"),
    ("deictic-pivot", "deictic_pivot.py", "_DEICTIC", "deictic pivot", "es/en", "", "short"),
    ("significance", "significance.py", "_SIGNIF",
     "significance pronouncement", "es/en", "", "search"),
    ("stacked-appositive", "stacked_appositive.py", "_STACKED",
     "stacked appositives", "es/en", "", "search"),
    ("pattern-announcement", "pattern_announcement.py", "_ANUNCIO",
     "pattern announcement", "es/en", "", "match"),
    ("turns-out", "turns_out.py", "_RESULTA", "turns-out pivot", "es/en", "", "search"),
    ("participial-setup", "participial_setup.py", "_PARTICIPIAL",
     "participial setup", "es/en", "", "match"),
    ("performative-humility", "performative_humility.py", "_HUMILDAD",
     "performative humility", "es/en", "", "search"),
    ("stacked-superlative", "stacked_superlative.py", "_SUPER",
     "stacked superlative", "es/en", "", "search"),
    ("hedges", "hedges.py", "_HEDGE", "hedges", "es/en",
     "real uncertainty is stated with its conditions, not with a softener", "search"),
    ("corporate-metaphor", "corporate_metaphor.py", "_METAPHOR",
     "corporate metaphor", "es/en",
     "the word used about the thing it names is not this", "search"),
    ("peninsular-spanish", "peninsular_spanish.py", "_PENINSULAR",
     "peninsular spanish", "es", "the sense both regions share is not this", "search"),
    ("english-calque", "english_calque.py", "_CALQUE", "english calque", "es",
     "an English term the industry keeps on purpose is not this", "search"),
    ("nominalized-particle", "nominalized_particle.py", "_PARTICLE",
     "nominalized particle", "es",
     "dar el si and un si o un no are ordinary Spanish", "search"),
    ("elevated-register", "elevated_register.py", "_ELEVATED",
     "elevated register", "es", "a register that asks for it is not this", "search"),
]


def pattern(fname, var):
    """The regex as written, with verbose-mode whitespace and comments removed."""
    src = (PY / fname).read_text(encoding="utf-8")
    m = re.search(rf'{var} = re\.compile\(\s*r"""(.*?)"""', src, re.S)
    if m:
        return "".join(
            line.strip() for line in m.group(1).split("\n")
            if not line.strip().startswith("#")
        )
    # Otherwise it is one or more adjacent r"..." strings.
    m = re.search(rf"{var} = re\.compile\((.*?)\n\n", src, re.S)
    return "".join(re.findall(r'r"((?:[^"\\]|\\.)*)"', m.group(1)))


def docstring(fname):
    return (PY / fname).read_text(encoding="utf-8").split('"""')[1].strip()


out = []
for did, fname, var, label, langs, note, how in SIMPLE:
    rx = pattern(fname, var)
    if how in ("match", "short") and not rx.startswith("^"):
        rx = "^" + rx
    out.append({
        "id": did, "regex": rx, "label": label, "langs": langs,
        "note": note, "how": how, "doc": docstring(fname),
        "file": fname.replace("_", "-").replace(".py", ".js"),
    })

Path("/tmp/ported.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
print(f"  {len(out)} patrones extraidos")
for o in out:
    print(f"    {o['id']:24s} {len(o['regex']):5d} chars  {o['how']}")
