/**
 * Read a Markdown file into units.
 *
 * Headings, paragraphs, list items, table cells and quotes. Front matter and
 * fenced code are blanked rather than deleted: a removed line shifts every
 * number after it, and the whole report is "go and look at line N".
 */
import { Unit } from "./unit.js";

const HEADING = /^\s*#/;
const BULLET = /^\s*(?:[-*+]|\d+\.)\s+/;
const RULE = /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/;
const TABLE_SEP = /^:?-{2,}:?$/;
// The lengths are bounded on purpose. Unbounded, a line of a hundred thousand
// unclosed brackets makes each one scan to the end of the line looking for its
// pair, which is quadratic and took twenty-one seconds. Five hundred characters
// is past any real link text or code span, and it caps the work per opener.
const INLINE = new RegExp(
  "`([^`]{0,500})`"
  + "|\\*\\*([^*]{0,500})\\*\\*"
  + "|\\*([^*]{0,500})\\*"
  + "|\\[([^\\]]{0,500})\\]\\([^)]{0,500}\\)", "g");

const blank = (m) => "\n".repeat((m.match(/\n/g) || []).length);

/**
 * @param {string} src
 * @returns {Unit[]}
 */
export function read(src) {
  src = src.replace(/^---\n[\s\S]*?\n---\n/, blank);        // front matter
  src = src.replace(/^```[\s\S]*?^```/gm, blank);            // fenced code

  const units = [];
  let para = [];
  let start = 1;

  const flush = () => {
    if (para.length) {
      units.push(new Unit("paragraph", para.join(" ").trim(), start));
      para = [];
    }
  };

  src.split("\n").forEach((raw, i) => {
    const n = i + 1;
    // trimEnd and not /\s+$/. A line of two hundred thousand spaces followed by
    // a word makes that pattern backtrack once per starting position, which is
    // quadratic: forty thousand characters took two and a half seconds, two
    // hundred thousand took sixty-seven. In the browser editor, where this runs
    // on every keystroke, one paste freezes the tab.
    const line = raw.trimEnd();
    if (!line.trim()) {
      flush();
    } else if (HEADING.test(line)) {
      flush();
      units.push(new Unit("heading", line.replace(/^\s*#+\s*/, "").trim(), n));
    } else if (BULLET.test(line)) {
      flush();
      units.push(new Unit("item", line.replace(BULLET, ""), n));
    } else if (line.trimStart().startsWith("|")) {
      flush();
      for (const cell of line.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|")) {
        const c = cell.trim();
        if (c && !TABLE_SEP.test(c)) units.push(new Unit("cell", c, n));
      }
    } else if (line.trimStart().startsWith(">")) {
      flush();
      units.push(new Unit("quote", line.replace(/^\s*>\s?/, "").trim(), n));
    } else if (RULE.test(line)) {
      flush();                            // a horizontal rule is not a one-word paragraph
    } else {
      if (!para.length) start = n;
      para.push(line.trim());
    }
  });
  flush();

  for (const u of units) {
    u.text = u.text.replace(INLINE, (...m) => m.slice(1, 5).find((g) => g !== undefined) ?? "");
  }
  return units.filter((u) => u.text.trim());
}
