<!-- human: specimen -->
# human

Counts the AI tells in a draft and fails when one is over budget.
Markdown and HTML, Spanish and English. Node 20+, no dependencies.

Every other tool in this space asks a model to read a draft and grade it. A
model grading its own prose finds nothing, because the prose sits exactly where
that model would have put it. So this does not read. A detector takes one
pattern, scans every unit for it, prints the count, and the zeros print too.

```bash
npm install -g @e1i0/human
human post.md
```

Or, to get the skill and the hooks along with the commands:

```bash
curl -fsSL https://raw.githubusercontent.com/e1i0r/human/main/install.sh | bash
```

That clones into `~/.claude/skills/human`, links the commands from the checkout,
and offers the hooks on the way out.

```
post.md   77 units · 100 sentences · 1018 words
  written as blog: a personal technical post

  HARD
     em dash                          0 / 3
     semicolon                        0
  REVIEW
  ?  subjectless fragment             1   (an answer to a when is legitimate)
        L55    Nada de esa arquitectura existía antes.
  ?· aphorism closer                  2   (a paragraph may end on its last fact)
        L42    Cuando vuelves ya está escrito lo que hizo.
  RHYTHM
    share in the 10-20 band         43   <= 55   ok
    shortest sentence                3   <= 4    ok

all under budget
```

Exit code is the number of budgets exceeded, so it drops into a pre-commit hook
or a CI job unchanged. `--only=REVIEW`, `--brief`, `--ignore=quotes.txt`.

## What it checks

**HARD**, what a regex settles alone: em dashes, semicolons, curly quotes,
banned vocabulary, negation framing, AI transitions.

**RHYTHM**: sentence-length spread, share in the 10-to-20-word band, whether a
short sentence exists at all, runs of three same-length sentences in a paragraph.

**REVIEW**, twenty-six a regex points at and cannot rule on, each carrying a
line saying what the legitimate version looks like. Four are Spanish only and
exist in no other tool: peninsular vocabulary, English calques, nominalized
particles, elevated register. `src/detectors/` documents each beside its pattern.

## The hooks

A skill cannot make anybody follow it. Over one long session the counts were
skipped before showing a draft, skipped again after fixing what they found, and
once a detector was written and its own finding left in the page.

```bash
human-hooks            # asks first
human-hooks --remove   # undoes it
```

Three entries in `~/.claude/settings.json`, merged rather than written and
backed up the first time. After Write and Edit, the checker runs on that file.
After Bash it asks git what prose the tree changed, because a heredoc rewriting
a page is a Bash call and the first hook never sees it. All silent when there is
nothing to look at.

The third runs *before* a write and hands over the register (below), once per
session, because a register read after the draft exists was read too late.

## Registers

Half of what reads as generated is a word that belongs somewhere else.
*Enunciar* is right in a thesis and wrong on a landing page, and no threshold
settles that, because the word is correct.

```bash
human --registers
human --register=sales
```

```toml
[write]
register = "sales"
```

Twelve ship. A register marks the rows that cost more there than elsewhere
without moving a threshold, and the pre-write hook puts its voice in front of
whoever is drafting, so it steers the writing instead of grading it.

## Making it yours

Every threshold here is a judgement somebody made once. `human-calibrate` puts
measurements of prose you already trust in their place, and writes a
`.human.toml` read from the nearest directory at or above the file, merged
root-down so a landing inside a blog keeps the blog's rhythm and sets its own
register.

```bash
human-calibrate posts/*.md --write .
human-voice ~/.claude/projects --write=yourname
```

The corpus has to be prose nobody edited with this tool, and that rules out most
of what you have. Your chat history does not go through a model, so `human-voice`
reads your own messages out of it and writes `registers/voice-yourname.toml`.
**That file stays on your machine.** It is gitignored, and there is nothing to
publish since running it against your own history gives you yours.

## The cold read

A regex never catches a number contradicting another number, or a term used
ninety lines before it is explained. On one page that passed every detector, a
fresh reader found thirty of those, and that reader cannot be whoever wrote the
draft. `SKILL.md` carries the prompt: a subagent that has seen only the file,
five questions about where a reader stopped, none about style. Then the counts
run again, because fixing what it finds writes new tells.

## Tests

`npm test`. Every detector fires against fixtures built to trip all thirty-two,
every hit is compared with its line and its text rather than its count, and the
hooks have to stay silent on a clean page.

## Credits

Pattern catalogue from
[harshaneel/humanize](https://github.com/harshaneel/humanize) (MIT, © 2026
Harshaneel Gokhale). Added here: the Spanish forms, the item-by-item procedure,
and a program that counts where a model used to read.

MIT.
