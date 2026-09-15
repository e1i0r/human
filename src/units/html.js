/**
 * Read an HTML file into units.
 *
 * Everything the page renders as text, not only its paragraphs: a heading, a
 * card title, a table cell. The tells concentrate in whatever a reviewer
 * classified as "just a label" and skipped.
 *
 * Code and terminal output are blanked to the same length, keeping their
 * newlines, so every offset after them still resolves to the line it was on.
 */
import { Unit } from "./unit.js";

const TAGS = /<[^>]+>/g;
const SCRIPT = /<(script|style)\b[\s\S]*?<\/\1>/gi;
const CODE = /<(pre|code)\b[\s\S]*?<\/\1>/gi;
const MAIN = /<main\b[^>]*>([\s\S]*?)<\/main>/i;
const SPACE_BEFORE_PUNCT = /\s+([,.;:!?])/g;

const ENTITIES = [["&amp;", "&"], ["&lt;", "<"], ["&gt;", ">"], ["&quot;", '"'],
                  ["&#39;", "'"], ["&nbsp;", " "]];

// Order matters: the first pattern that claims a piece of text keeps it.
const KINDS = [
  [/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, "heading"],
  [/<li[^>]*>([\s\S]*?)<\/li>/gi, "item"],
  [/<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi, "cell"],
  [/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/gi, "caption"],
  [/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, "quote"],
  [/<p[^>]*>([\s\S]*?)<\/p>/gi, "paragraph"],
  [/<span[^>]*class="[^"]*(?:__v|__d|__t|desc|sub)[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, "cell"],
];

function text(s) {
  s = s.replace(SCRIPT, " ").replace(TAGS, " ");
  for (const [a, b] of ENTITIES) s = s.split(a).join(b);
  return s.replace(/\s+/g, " ").replace(SPACE_BEFORE_PUNCT, "$1").trim();
}

const countNewlines = (s) => (s.match(/\n/g) || []).length;

/**
 * @param {string} src
 * @returns {Unit[]}
 */
export function read(src) {
  let body = src;
  let offset = 0;
  const m = MAIN.exec(src);
  if (m) {
    body = m[1];
    offset = m.index + m[0].indexOf(m[1]);
  }
  body = body.replace(CODE, (whole) => whole.replace(/[^\n]/g, " "));
  const before = countNewlines(src.slice(0, offset));

  const units = [];
  const seen = new Set();
  for (const [pattern, kind] of KINDS) {
    pattern.lastIndex = 0;
    let hit;
    while ((hit = pattern.exec(body)) !== null) {
      const t = text(hit[1]);
      const key = `${kind} ${t}`;
      if (!t || seen.has(key)) continue;
      seen.add(key);
      units.push(new Unit(kind, t, before + countNewlines(body.slice(0, hit.index)) + 1));
    }
  }

  // A <p> with no sentence-ending punctuation and five words or fewer is a
  // label the page renders as a paragraph. Left as prose it drags every rhythm
  // number toward "short" and invents runs of same-length sentences.
  for (const u of units) {
    if (u.kind === "paragraph" && u.words() <= 5 && !/[.!?]$/.test(u.text)) u.kind = "heading";
  }
  return units;
}
