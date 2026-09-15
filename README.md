<!-- human: specimen -->
# human

Linter of AI patterns. Counts them and fails when one is over budget.
Markdown and HTML, Spanish and English. Node 20+, no dependencies.

## Mechanical cleanup, human writing

**The tool does the mechanical part**: soft transitions, inflated adjectives,
predictable symmetries, model vocabulary. **The rest stays human**: judgement,
intent, friction kept on purpose. Like a code formatter.

```bash
npm install -g @e1i0/human
human post.md
```

```
post.md   77 units · 100 sentences · 1018 words

  HARD
     em dash                          0 / 3
  REVIEW
  ?  subjectless fragment             1   (an answer to a when is legitimate)
        L55    Nada de esa arquitectura existía antes.
  RHYTHM
    share in the 10-20 band         43   <= 55   ok

all under budget
```

Exit code is budgets exceeded: pre-commit hook or CI job. `--only=REVIEW`, `--brief`, `--ignore=quotes.txt`.

**6 HARD** (the pattern settles it), **28 REVIEW** (the pattern points, you rule),
**4 rhythm measures**. 5 REVIEW are Spanish-only. All 34 in
[`src/detectors/`](src/detectors/README.md).

Browser editor, same modules, no server:
[human.e1i0.com/app](https://human.e1i0.com/app).

## The hooks

```bash
curl -fsSL https://raw.githubusercontent.com/e1i0r/human/main/install.sh | bash
human-hooks --remove   # undoes it
```

Three `~/.claude/settings.json` entries: register before a write, counts after,
tree prose after Bash. Silent when clean.

## Registers

A word can be right in one register and wrong in another: *enunciar* fits a
thesis, not a landing page.

```bash
human --registers
human --register=sales    # and in .human.toml: [write] register = "sales"
```

Twelve ship.

## Making it yours

```bash
human-calibrate posts/*.md --write .
human-voice ~/.claude/projects --write=yourname
```

`human-calibrate` writes `.human.toml` from prose you trust. `human-voice`
profiles you from your chat history. Both stay on your machine.

## What a pattern cannot do

It never compares parts: no contradicting numbers, no late-explained terms.
[`SKILL.md`](SKILL.md) has the cold-reader prompt (nine questions). Re-run after
fixing: fixes write new tells.

## Tests

`npm test`: every detector fires against fixtures, hits compared by line and text.

## Licence

[MIT](LICENSE), © 2026 Elio Rincón. Use it, change it, ship it in something you
sell. Keep the notice.

Catalogue from [harshaneel/humanize](https://github.com/harshaneel/humanize).
Added: Spanish forms, item-by-item checks, counting instead of asking a model.
