/**
 * Four measurements over running prose.
 *
 * Separate from the detectors because they are a different kind of thing: a
 * detector answers "is this sentence a tell", and these answer "is the shape of
 * the whole document one a person would have produced". Uniform sentence length
 * is a measured signal on its own, and it survives every other fix, because a
 * draft can pass every pattern check and still beat like a metronome.
 *
 * Measured over paragraphs and quotes only. A heading or a table cell has no
 * rhythm to speak of, and counting them drags every number toward "short".
 */
import { PROSE } from "../units/unit.js";

/**
 * Longest sentence minus shortest, in words. At least 20.
 *
 * Uncorrected output clusters around fifteen words with about six words of
 * deviation. Twenty is the gap that needs both a real fragment and a sentence
 * that earns its length, which is what a person writing produces without trying.
 */
const spread = (perUnit, counts) => Math.max(...counts) - Math.min(...counts);

/**
 * Share of sentences between 10 and 20 words, as a percentage. Under 50.
 *
 * The condition the spread alone cannot catch: one fragment and one long
 * sentence satisfy the range while everything between them sits at 12 to 16
 * words, and the page still reads uniform. The middle has to spread too.
 */
const midBand = (perUnit, counts) =>
  Math.round((100 * counts.filter((n) => n >= 10 && n <= 20).length) / counts.length);

/**
 * The shortest sentence in the document. Six words or fewer.
 *
 * A short sentence is the cheapest way to break a run, so a document without
 * one has not broken any. It must be a sentence with somebody doing something
 * in it: a subjectless fragment satisfies this count and fails elsewhere.
 */
const shortest = (perUnit, counts) => Math.min(...counts);

/**
 * Runs of three sentences within five words of each other. None allowed.
 *
 * Counted inside a paragraph, never across the document: three same-length
 * sentences only beat like a drum when they sit together, and a run that spans
 * a section break is one no reader ever meets as a passage.
 */
function drumbeats(perUnit) {
  let runs = 0;
  for (const c of perUnit) {
    for (let i = 0; i + 2 < c.length; i++) {
      const three = c.slice(i, i + 3);
      if (Math.max(...three) - Math.min(...three) <= 5) runs++;
    }
  }
  return runs;
}

// name, function, comparison, config key holding the limit
const CONDITIONS = [
  ["spread, longest to shortest", spread, ">=", "spread"],
  ["share in the 10-20 band", midBand, "<=", "mid_band"],
  ["shortest sentence", shortest, "<=", "shortest"],
  ["runs of three within 5", drumbeats, "<=", "trios"],
];

/**
 * Run the four conditions.
 *
 * The lengths come back so the report can print them: a writer who sees
 * [7, 18, 8, 28, 3] argues with the shape, and one who sees only "ok" does not.
 *
 * @returns {{rows: {name: string, got: number, want: string, ok: boolean}[], counts: number[]}}
 */
export function measure(units, cfg) {
  const c = cfg.rhythm;
  const perUnit = units
    .filter((u) => PROSE.has(u.kind))
    .map((u) => u.sentences().map((s) => s.split(/\s+/).filter(Boolean).length));
  const counts = perUnit.flat();

  if (counts.length < c.enough_sentences) return { rows: [], counts };

  const rows = CONDITIONS.map(([name, fn, op, key]) => {
    const got = fn(perUnit, counts);
    const limit = c[key];
    return { name, got, want: `${op} ${limit}`, ok: op === ">=" ? got >= limit : got <= limit };
  });
  return { rows, counts };
}
