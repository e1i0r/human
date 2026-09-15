<!-- human: specimen -->
# registers

What a piece of writing is for, so the drafting knows before the checking does.

A register is read **before** anything is written. It does not move a threshold
or turn a detector off: it says what this text is trying to do, and half of what
reads as generated is a word that belongs to a different one. "Enunciar" is
right in a thesis. "Oferta" is right in sales copy. "Palanca" is right in a
business deck. None of them is wrong, and all of them are wrong somewhere.

Pick one in the project's `.human.toml`:

```toml
[write]
register = "sales"
```

`human --registers` lists them. `human --register=sales` prints one.

A register that names patterns in `watch` marks those rows in the report with a
`·`, so the four that cost most in this kind of writing stop looking like the
other twenty-eight.

Adding one is a file in this directory with `name`, `label`, `voice`, and
optionally `watch`. Every name in `watch` has to be a real detector id, and the
tests fail if it is not: a typo there is silent everywhere else.
