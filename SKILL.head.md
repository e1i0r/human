---
name: human
description: >
  Use when a draft has to be checked for AI tells before it ships: the user asks
  "does this sound like AI", "revisa si esto suena a IA", "check this before I
  publish", or has just finished writing or rewriting anything that will be read
  by someone else. Also use after any humanizing pass, because a rewrite
  introduces tells at the same rate as a first draft. Counts the patterns with a
  program instead of reading for them, in Spanish and English.
---

<!-- human: specimen -->

# human

Counts the AI tells in a draft, names them, and fails when one is over budget.

It exists because the usual way of checking does not work. The usual way is to
read the text and ask "does anything here look generated?", which puts the
writer in charge of deciding what is suspicious. Nothing is suspicious to the
person who wrote it. Every miss this was built from had the same shape:
draft read, nothing jumped out, pass declared clean, four tells still in it.

So nothing here asks you to read for a pattern. A detector goes item by item,
scans every unit in the document for that one pattern, and prints the count.
Including the zeros. You judge what the report hands you, and nothing else.

---

## Before writing: the register

Half of what reads as generated is a word that belongs somewhere else.
*Enunciar* is right in a thesis. *Oferta* is right in sales copy. *Palanca* is
right in a business deck. None of them is wrong, and all of them are wrong
somewhere, so what the text is for has to be settled before a line of it exists.

**Read the register first, not after.** If the project has a `.human.toml` with
a `[write] register`, print it and follow it:

```bash
human --registers          # what a piece of writing can be for
human --register=sales     # the one this project picked
```

Twelve ship with the tool: blog, sales, product, linkedin, technical, docs,
narrative, opinion, academic, formal, informal, announcement. Each is a file in
`registers/`, so adding one is writing a file.

With the hooks installed this arrives on its own: a `PreToolUse` hook hands over
the declared register the first time in a session that you write prose. A
register moves nothing in the counting. It steers the drafting, and it names the
patterns that cost more in that register than elsewhere, which the report marks
with a `·`. A hedge in a thesis is precision. The same hedge in sales copy is a
writer with no number to put there.

---

## The writer's own voice

If `registers/voice-<name>.toml` exists, read it before drafting. It is measured
from that person's chat history, which is the only writing of theirs no model
touched, and it carries the shape to write toward: sentence lengths, how they
open a thought, the words they reach for.

```bash
human-voice ~/.claude/projects --write=yourname
```

It never leaves the machine it was made on. Nothing to share and nothing to
publish: whoever clones this runs it against their own history and gets theirs.

---

## Run it

```bash
human FILE [FILE...]        # markdown or html
human FILE --only=REVIEW    # skip what a regex already settled
human FILE --ignore=ok.txt  # one exact sentence per line, skipped
```

Exit code is the number of budgets exceeded, so it works as a pre-commit hook or
a CI gate. That is the point of it: "is this clean?" stops being a question the
writer answers about their own draft.

---

## The cold read

A regex counts patterns. It does not read, so it never catches a number that
contradicts another number, a term used ninety lines before it is explained, or
an example borrowed from a domain the page never mentioned. On one landing page
that passed every detector clean, a reader found thirty of those.

That reader must not be whoever wrote the draft. Rewriting your own text anchors
you to what you meant rather than what is on the page, which is the same failure
this whole thing exists to work around. So a subagent gets the file and nothing
else.

**Run it after the counts are clean, before showing anybody.** Dispatch a
general-purpose subagent with this, filling in the file and what the piece is:

> Lee este archivo como lector, no como revisor de estilo: `PATH`
>
> DESCRIPTION OF WHAT IT IS AND WHO READS IT.
>
> NO revises ortografía, gramática ni patrones de estilo: eso ya lo hace un
> script. Tu trabajo es leerlo de arriba abajo como alguien que llega por
> primera vez.
>
> Reporta solo estas cinco cosas, y solo donde de verdad ocurran:
>
> 1. **Dónde tropiezas.** Una frase que tuviste que releer. Cita la frase y di
>    qué te hizo parar.
> 2. **Qué palabra no entiendes.** Un término que se usa antes de explicarse, o
>    que nunca se explica. Cita dónde aparece por primera vez.
> 3. **Qué referencia no tiene antecedente.** Un "esto", "eso", "la que" que
>    apunta a algo poco claro.
> 4. **Qué contradicción encuentras.** Un número o una afirmación que no cuadra
>    con otra parte.
> 5. **Qué te suena a escrito y no a dicho.** Una frase que nadie diría en voz
>    alta. Cita y di cómo la dirías tú.
>
> Para cada hallazgo: la frase exacta entre comillas, una línea de por qué te
> hizo parar, y cómo lo dirías. Si una categoría está limpia, omítela entera. No
> resumas, no elogies, no des veredicto general, no listes lo que está bien.

The five categories are doing the work. A general "does this read as AI?" comes
back with style notes the counting already covers, and a request for a verdict
comes back with a verdict. Asking where a reader stopped gets the places a
reader stopped.

**Then re-run the counts.** Fixing thirty findings introduced six new tells on
that page: a deictic pivot, two polyptotons, a parallel-subject mirror, an
agentless passive and a negated echo, every one of them written while fixing
something else.

---

## The hooks

A skill cannot make anybody follow it, which is the gap everything above sits
in. `human-hooks` adds three entries to Claude Code's settings: the register
before a write, and the counts after every write to prose, unasked.

```bash
human-hooks            # asks first
human-hooks --remove   # undoes it
```

**When the report arrives on its own, act on it before writing the next
sentence.** The failure it was built for is not skipping the check. It is
reading the counts and carrying on. On the session this came from, a detector
was written for a pattern and the pattern left in the page it was found on.

---

## The loop

A report on its own changes nothing. The cycle is:

```
run  →  fix  →  run again  →  until everything is under budget
```

**The program accepts, the model fixes.** Rewriting takes judgement and a regex
has none. Deciding whether it is now clean takes counting and a writer has none
about their own prose. Neither half works alone.

**Re-run over the whole document, never only the lines you touched.** A fix
writes new tells while it removes old ones, and they are harder to see because
they feel like corrections. Most third-pass hits were written by the second-pass
fix for something else.

**Scope each fix to the flagged sentence and its neighbour.** Rewriting the
whole paragraph every round drifts the meaning, and by the fourth round the text
says something the author never approved.

**Stop at three rounds.** Past three you are over-editing into choppy, voiceless
prose. Whatever is left, report it with its count and let the author decide.

**Put the author's own lines in `--ignore`.** A quoted sentence from a project's
own docs trips several detectors and is right as it stands. Without the ignore
file it gets flagged every round forever, and a report that repeats a
non-finding is a report that stops being opened.

---

## The two levels

**HARD.** The regex settles it, and no reading of the sentence changes the
answer. Over budget means broken, and the exit code counts it.

**REVIEW.** The regex can point but cannot rule. Whether it is a tell depends on
what the sentence is doing, so every one of these carries a **Not this** that
says what the legitimate version looks like. Read only these, and only the lines
printed under them.

The split is load-bearing. Mixed together, the real findings sit under a pile of
false positives and the report gets opened once.

---

## Calibrating

Every threshold is a judgement somebody made once. Defensible, not universal: a
technical reference repeats its subject nouns more than an essay does, and a
writer who never writes a four-word sentence will not start because a tool asked.

```bash
human-calibrate posts/*.md              # what the corpus actually does
human-calibrate posts/*.md --write .    # write .human.toml there
```

The corpus has to be prose nobody edited with this tool. Calibrating on text
these thresholds already shaped measures the thresholds, not the writer.

Run against 34,000 words of one author it found two things worth the trouble.
The hard rules held: em dashes, semicolons, curly quotes and AI transitions came
back at exactly zero across 29 pieces, so a single one is worth stopping for.
And `trios` was set to zero when that author's own median is three, which means
the rule had been rewriting their rhythm rather than catching a fault in it.

One judgement the calibrator makes for you: thresholds come from the corpus p90,
except `trios`, which comes from the median. The p90 of any corpus is its worst
pages, and a threshold set there only speaks up once a draft is past saving.

---

## RHYTHM

Measured over running prose, which is paragraphs and quotes. A heading or a
table cell has no rhythm, and counting them drags every number toward "short".

### spread, longest to shortest

**Detects.** The longest sentence minus the shortest, in words.
**Fix.** Join two middling sentences into one that earns its length, and break
another into a fragment.
**Before → after.** `[16, 13, 17, 14]` → `[29, 4, 17, 14]`
**Not this.** A text under 80 words, where it does not apply.

### share in the 10-20 band

**Detects.** Percentage of sentences between 10 and 20 words.
**Fix.** Break half of them. Meeting the spread with one fragment and one long
sentence while everything else sits at 12-16 still reads uniform.
**Before → after.** `[5, 12, 14, 16, 13, 31]` (67%) → `[5, 26, 14, 16, 13, 31]` (50%)
**Not this.** Nothing. It is the most stable measured tell there is.

### shortest sentence

**Detects.** The shortest sentence in the text. There has to be one of six words
or fewer for every 150 words of output.
**Fix.** Cut a middling sentence in two. The short half stands alone.
**Before → after.** `Me viene pasando seguido, en varios proyectos.` → `Me pasa seguido.`
**Not this.** A subjectless fragment, which is a different tell. A short sentence
still needs somebody doing something.

### runs of three within 5

**Detects.** Three consecutive sentences **inside one paragraph** within five
words of each other.
**Fix.** Merge two, or split one. One is enough to break the drumming.
**Before → after.** `[11, 12, 8]` → `[11, 17, 8]`
**Not this.** Three spread across two sections, which a reader never meets in a row.

---
