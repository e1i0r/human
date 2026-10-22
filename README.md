# human

[![npm](https://img.shields.io/npm/v/@e1i0/human?color=f06262)](https://www.npmjs.com/package/@e1i0/human)
[![ci](https://github.com/e1i0r/human/actions/workflows/ci.yml/badge.svg)](https://github.com/e1i0r/human/actions/workflows/ci.yml)
![deps](https://img.shields.io/badge/dependencies-0-78d28c)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![human](https://img.shields.io/badge/human-passing-78d28c)](https://github.com/e1i0r/human)

**A linter for AI writing tells.** It counts them, and fails the build when one goes over budget.

You know the voice. *Let's dive in.* *It's not X, it's Y.* *And that changes everything.*
human finds every one, by line, in Markdown and HTML, in Spanish and English.
It needs no model, API key or dependency. It counts patterns, so the same draft gets the same answer twice.

<p align="center"><img src="assets/demo.gif" alt="human flagging AI tells in a blog post and exiting with code 6" width="720"></p>

```
npm install -g @e1i0/human
human post.md
```

To skip the install, paste text in the [browser editor](https://human.e1i0.com/app). Same detectors, nothing leaves your machine.

## What it catches

**6 HARD** checks settle it alone: em dashes, semicolons, curly quotes, model vocabulary, negation framing, AI transitions.
**28 REVIEW** checks point and you rule: tricolons, aphorism closers, pseudo-clefts, hedges, corporate metaphors.
**4 rhythm measures** catch the metronome, sentence after sentence of the same length.
Five REVIEW checks are Spanish-only. All 34 are in [`src/detectors/`](src/detectors/README.md).

It does the mechanical part, like a code formatter. Judgement, intent and friction kept on purpose stay with you.

## In CI

The exit code is the number of budgets exceeded, so it drops into a pre-commit hook or a pipeline as is.

```yaml
# .github/workflows/prose.yml
on: [pull_request]
jobs:
  human:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: e1i0r/human@main
        with:
          files: "docs/**/*.md posts/*.md"
          args: --only=HARD
```

Clean? Say so in your README:

```markdown
[![human](https://img.shields.io/badge/human-passing-78d28c)](https://github.com/e1i0r/human)
```

This README carries it, and CI checks that it still earns it.

Flags: `--only=REVIEW`, `--brief`, `--ignore=quotes.txt`.

## With Claude Code

```
curl -fsSL https://raw.githubusercontent.com/e1i0r/human/main/install.sh | bash
human-hooks --remove   # undoes it
```

Three `~/.claude/settings.json` entries: the register goes in before a write, the counts come back after it, and prose in the tree gets checked after Bash.
Silent when clean.

## Registers

A word can be right in one register and wrong in another. *Enunciar* fits a thesis, not a landing page.

```
human --registers
human --register=sales    # or in .human.toml: [write] register = "sales"
```

Twelve ship.

## Making it yours

```
human-calibrate posts/*.md --write .
human-voice ~/.claude/projects --write=yourname
```

`human-calibrate` writes `.human.toml` from prose you trust.
`human-voice` profiles you from your chat history.
Both stay on your machine.

## What a pattern cannot do

It never compares parts, so it misses contradicting numbers and terms explained too late.
[`SKILL.md`](SKILL.md) has the cold-reader prompt for that (nine questions).
Re-run after fixing, because fixes write new tells.

## Contributing

`npm test` fires every detector against fixtures and compares hits by line and text.
A missed tell makes a good first issue. Open one with the sentence and the language.

## Licence

[MIT](LICENSE), © 2026 Elio Rincón. Use it, change it, ship it in something you sell. Keep the notice.

Catalogue from [harshaneel/humanize](https://github.com/harshaneel/humanize).
Added: Spanish forms, item-by-item checks, counting instead of asking a model.
