/**
 * The English half of the browser editor.
 *
 * Only the chrome and the group descriptions live here. What each detector is,
 * how to fix it and what not to confuse it with are already written in English
 * beside the pattern, and that comment is the one source: SKILL.md, the index
 * and the page all render it. Copying it here would be a fourth thing to keep
 * true, and the fourth copy is the one that goes stale.
 */

/** The three groups. The label goes on the tab and the rest below it. */
export const GROUPS_EN = {
  HARD: {
    label: "Hard",
    what: "An em dash is an em dash and no reading changes that. Over budget breaks the run, and the exit code counts how many went over.",
  },
  REVIEW: {
    label: "Your call",
    what: "The pattern points and cannot rule. Whether it is a tell depends on what the sentence is doing, so each one carries beside it the legitimate version it gets confused with.",
  },
  RHYTHM: {
    label: "Rhythm",
    what: "Counts paragraphs and quotes, nothing else. A heading has no rhythm, and counting one drags every number toward short.",
  },
};

/** The four rhythm measures, keyed by the name rhythm/index.js returns. */
export const RHYTHM_EN = {
  "spread, longest to shortest": {
    label: "spread, longest to shortest",
    what: "The longest sentence minus the shortest, in words. Generated prose sits in a narrow band.",
  },
  "share in the 10-20 band": {
    label: "share in the 10-20 band",
    what: "What percentage of the sentences run between 10 and 20 words. The most stable measured tell there is.",
  },
  "shortest sentence": {
    label: "shortest sentence",
    what: "There has to be one sentence of six words or fewer for every 150 words of text.",
  },
  "runs of three within 5": {
    label: "runs of three within 5",
    what: "Three consecutive sentences inside one paragraph within five words of each other. The drumming.",
  },
};

/** What the page says on its own, outside the catalogue. */
export const UI_EN = {
  emptyTitle: "Paste a draft",
  emptyWhat: "Every pattern shows up with its count and underlined in the text, the zeros included.",
  tryExample: "Try an example",
  example: "What this system does is coordinate processes — and moreover, it does so robustly.\n\nIt is not just a tool, it is a platform; comprehensive and robust. It is important to note that this is crucial for the team.\n\nFurthermore, the team works. Nobody looks. Nobody measures. Nobody notices.\n\nThe report tells you what usually ships alongside these files and this time it did not.",
  title: "Paste a draft and see what it counts",
  note: "The same counter the CLI runs.",
  format: "Format",
  markdown: "Markdown",
  register: "Register",
  none: "none",
  privacy: "The text never leaves your browser and isn't used for anything else.",
  clearTitle: "The draft is kept in this browser so it is still here when you come back",
  clear: "Clear the draft",
  undo: "Undo",
  placeholder: "Paste the text here. Markdown or HTML.",
  waiting: "Waiting for text.",
  findings: "Findings",
  noFindings: "No findings",
  writtenAs: "written as",
  watched: "this register watches it more than the others",
  notThis: "Not this:",
  apply: "Apply:",
  asks: "wants",
  proseSentences: "prose sentences:",
  overBudget: "over budget",
  failure: "failing",
  failures: "failing",
  noFailures: "nothing failing",
  exitWould: "the CLI would exit with that code",
  exitZero: "the CLI would exit with 0",
  toDecide: "to decide",
  toDecideSub: "the pattern points at these and cannot rule",
  words: "words",
  sentences: "sentences",
  units: "units",
  language: "language",
  metricsNote: "These numbers count patterns. Whether your page has too many is yours to decide.",
};
