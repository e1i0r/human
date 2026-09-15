"""Rewrite \\b for JavaScript, where a word boundary does not see an accented letter.

Python's \\b treats "í" and "ñ" as word characters and JavaScript's does not, so
a pattern that is character for character the same stops matching "Y ahí está"
and "tu sí" once it is moved across. Unicode property escapes say what the \\b
meant, and the u flag turns them on.

Which side a \\b guards has to be worked out from what precedes it, and the
quantifiers get in the way: in `)s?\\b` the word ended at the literal s, and in
`[^.]{5,70}?\\b` nothing literal came before it at all, so the boundary is
asserting the start of whatever follows.
"""
import re

LETTER = r"\p{L}\p{M}\p{N}_"
OPEN = f"(?<![{LETTER}])"
CLOSE = f"(?![{LETTER}])"

_QUANTIFIER = re.compile(r"(?:[?*+]|\{\d+(?:,\d*)?\}\??)$")


def _ends_a_word(prefix: str) -> bool:
    """Whether what comes before a \\b can be the last character of a word.

    A literal, or a group or class of literals, ends a word. A negated class
    like [^.] matches anything at all, so a boundary after one is asserting
    something about what comes next instead.
    """
    while True:
        stripped = _QUANTIFIER.sub("", prefix)
        if stripped == prefix:
            break
        prefix = stripped

    if not prefix:
        return False
    last = prefix[-1]
    if last == "]":
        start = prefix.rfind("[")
        return not prefix[start:start + 2] == "[^"
    if last == ")":
        return True
    return last.isalnum() or last == "_"


def translate(rx: str) -> str:
    """The same pattern, with \\b and \\w spelled out for JavaScript."""
    out = []
    i = 0
    while i < len(rx):
        escaped = i and rx[i - 1] == "\\" and (i < 2 or rx[i - 2] != "\\")
        if rx[i:i + 2] == r"\b" and not escaped:
            out.append(CLOSE if _ends_a_word("".join(out)) else OPEN)
            i += 2
        else:
            out.append(rx[i])
            i += 1
    return "".join(out).replace(r"\w", f"[{LETTER}]")


if __name__ == "__main__":
    CASES = [
        (r"^(?:What)\b", CLOSE),
        (r"\b(?:tu|su)\s+no\b", OPEN),
        (r"[^.]{5,70}?\b(?:es)", OPEN),
        (r"(?:regla|norma)s?\b[^.]", CLOSE),
        (r"(?:s[ií]|no)\b(?!\s)", CLOSE),
    ]
    for pattern, expected in CASES:
        got = translate(pattern)
        where = got.find("(?<") if expected is OPEN else got.find("(?!")
        print(f"  {'ok  ' if where >= 0 else 'FALLA'}  {pattern}")
