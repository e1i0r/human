<!-- human: specimen -->
# human

Sanitary linter for prose. Counts AI tells and fails when one is over budget.
Markdown and HTML, Spanish and English. Node 20+, no dependencies.

## Mechanical cleanup, human writing

**The tool does the mechanical part.** Soft transitions, inflated adjectives,
predictable symmetries, model vocabulary. Like a code formatter: nobody spends
time on mechanical noise.

**The rest stays human.** Judgement, intent, friction kept on purpose. No regex
settles that. The tool clears the table. The person writes.

Every other tool in this space asks a model to read a draft and grade it. A
model grading its own prose finds nothing, because the prose sits exactly where
that model would have put it. So instead of reading it takes one pattern, looks for it
in every unit of the document, and prints the count, zeros included.

```bash
npm install -g @e1i0/human
human post.md
```

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

**Six HARD**, settled by the pattern: em dashes, semicolons, curly quotes,
banned vocabulary, negation framing, AI transitions. **Twenty-eight REVIEW**, which
a pattern points at and cannot rule on, each carrying the legitimate version it
gets confused with. Five of the REVIEW
ones apply to Spanish only. Separately, **four rhythm measures** run over the
prose as a whole, and those are not detectors. All 34 are documented in
[`src/detectors/`](src/detectors/README.md).

There is a browser editor at [human.e1i0.com/app](https://human.e1i0.com/app),
running the same modules with no server behind it.

## The hooks

A skill cannot make anybody follow it. Over one long session the counts were
skipped before showing a draft, skipped again after fixing what they found, and
once a detector was written and its own finding left in the page.

```bash
curl -fsSL https://raw.githubusercontent.com/e1i0r/human/main/install.sh | bash
human-hooks --remove   # undoes it
```

That clones the skill into `~/.claude/skills/human`, links the commands, and
offers three entries for `~/.claude/settings.json`, merged rather than written
and backed up the first time. Before a write it hands over the register, and a
Write or an Edit gets that file counted. The third asks git what prose the tree
changed after a Bash call, because a heredoc rewriting a page is one and the
first hook never sees it. None of them says anything when there is nothing to
look at.

## Registers

Half of what reads as generated is a word that belongs somewhere else.
*Enunciar* is right in a thesis and wrong on a landing page, and no threshold
settles that, because the word is correct.

```bash
human --registers
human --register=sales    # and in .human.toml: [write] register = "sales"
```

Twelve ship. A register marks the rows that cost more there without moving a
threshold, and the pre-write hook puts its voice in front of whoever is drafting.

## Making it yours

Every threshold here is a judgement somebody made once.

```bash
human-calibrate posts/*.md --write .
human-voice ~/.claude/projects --write=yourname
```

`human-calibrate` measures prose you already trust and writes a `.human.toml`,
read from the nearest directory at or above the file and merged root-down. The
corpus has to be prose nobody edited with this tool, which rules out most of
what you have. Your chat history does not go through a model, so `human-voice`
reads your own messages out of it and writes a profile. **That file stays on
your machine**: it is gitignored, and running it against your own history gives
you yours.

## What a pattern cannot do

That is the 20%. No number contradicting another number, no term used ninety
lines before it is explained. On one page that passed every detector, a fresh
reader found thirty of those, and that reader cannot be whoever wrote the draft.
[`SKILL.md`](SKILL.md) carries the prompt: a subagent that has seen only the
file, nine questions about where a reader stopped, none about style. Then the
counts run again, because fixing what it finds writes new tells.

## Tests

`npm test`. Every detector fires against fixtures built to trip all thirty-four,
every hit is compared with its line and its text rather than its count, and the
hooks have to stay silent on a clean page.

## Licence

[MIT](LICENSE), © 2026 Elio Rincón. Use it, change it, ship it in something you
sell. Keep the notice.

It builds on [harshaneel/humanize](https://github.com/harshaneel/humanize), also
MIT and © 2026 Harshaneel Gokhale, which is where the pattern catalogue comes
from. Added here: the Spanish forms, the item-by-item procedure, and a program
that counts where a model used to read.
