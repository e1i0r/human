/**
 * Thresholds, and where a project overrides them.
 *
 * Every number in a detector is a judgement somebody made once: forty words is
 * where repetition stops being felt as one, six words is where a sentence stops
 * having room for a subject. They are defensible and they are not universal, so
 * they live in one place with the argument beside them and a project can say
 * otherwise without touching the code.
 *
 * A project overrides by putting a .human.toml next to the file being checked,
 * or anywhere above it. Every one from the root down is applied in order,
 * nearest winning per key, so a landing inside a blog can set its own register
 * without losing the rhythm the blog calibrated.
 *
 * An unknown key is an error rather than a shrug: a typo in a config file is
 * the kind of thing that silently turns a threshold off and gets noticed months
 * later.
 */

export const CONFIG_NAME = ".human.toml";

/**
 * What counts as a config file, in the order a directory is searched.
 *
 * This was called tells before it was called human, and the projects calibrated
 * under that name did not rename anything. Reading both means a repository keeps
 * its thresholds the day it installs this, and a directory holding both files
 * uses the one named after the tool that is running.
 */
export const CONFIG_NAMES = [CONFIG_NAME, ".tells.toml"];

/**
 * name -> key -> [value, why]. The why is printed by --config and is the reason
 * the number is what it is.
 */
export const DEFAULTS = {
  "em-dash": {
    per_words: [300, "one em dash per this many words; under it, none"],
  },
  "subjectless-fragment": {
    max_words: [6, "at this length a sentence still has room for a subject"],
  },
  "heading-no-subject": {
    max_words: [8, "past this a heading is a sentence and carries its own nouns"],
  },
  "aphorism-closer": {
    min_unit_words: [20, "a shorter paragraph has no landing to close"],
    low: [4, "shortest a closing line can be and still read as composed"],
    high: [10, "past this it is carrying content, not cadence"],
  },
  "deictic-pivot": {
    max_words: [8, "a longer sentence is doing something besides pointing back"],
  },
  "polyptoton": {
    window: [40, "words; beyond this the repetition is not felt as one"],
    enough: [3, "occurrences inside the window"],
    min_len: [5, "shorter words repeat for grammatical reasons"],
  },
  "tricolon": {
    members: [3, "three is cadence; more is an inventory"],
    max_member_words: [6, "a longer member carries content rather than beat"],
  },
  "negative-punch": {
    min_words: [2, "one word is an interjection, not a sentence doing this"],
    max_words: [9, "past this the sentence carries content, not a beat"],
  },
  "negated-echo": {
    landed: [12, "words before the tail; below this the sentence is the tail"],
    max_tail_words: [6, "a longer tail is a clause, not a closing beat"],
  },
  "rhythm": {
    spread: [20, "longest minus shortest; the gap a person produces untrying"],
    mid_band: [49, "percent of sentences between 10 and 20 words, at most"],
    shortest: [6, "there has to be one sentence this short or shorter"],
    trios: [3, "runs of three same-length sentences inside a paragraph; # three is the median of a 34k-word corpus of human prose"],
    enough_sentences: [4, "fewer than this and the numbers say nothing"],
  },
  "skip": {
    paths: [[], "path fragments never checked: notes, drafts, anything that is not going to be read by somebody else"],
  },
  "write": {
    register: ["", "what this text is for; see registers/ and --registers"],
  },
  "report": {
    hits_shown: [6, "hits printed per detector before the count stands in"],
    quote_width: [96, "characters of a hit printed on its line"],
  },
};

/** The defaults alone, without the arguments for them. */
export function defaults() {
  const out = {};
  for (const [section, keys] of Object.entries(DEFAULTS)) {
    out[section] = Object.fromEntries(
      Object.entries(keys).map(([k, [value]]) => [k, value]),
    );
  }
  return out;
}

/**
 * Defaults with a project's overrides merged in, nearest file winning per key.
 *
 * @param {Record<string, Record<string, unknown>>[]} overrides
 *   parsed .human.toml contents, furthest from the file first
 */
export function merge(overrides = []) {
  const cfg = defaults();
  for (const data of overrides) {
    for (const [section, keys] of Object.entries(data)) {
      if (!(section in cfg)) throw new Error(`no detector called [${section}]`);
      for (const [k, v] of Object.entries(keys)) {
        if (!(k in cfg[section])) {
          throw new Error(`[${section}] has no ${JSON.stringify(k)}. `
            + `Known: ${Object.keys(cfg[section]).join(", ")}`);
        }
        cfg[section][k] = v;
      }
    }
  }
  return cfg;
}
