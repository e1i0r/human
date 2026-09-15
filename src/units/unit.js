/**
 * One piece of text a reader reads, and where it came from.
 */
import { split } from "./sentences.js";

/**
 * Running prose. A heading or a table cell has no rhythm to speak of, and
 * counting them drags every measurement toward "short".
 */
export const PROSE = new Set(["paragraph", "quote"]);

export class Unit {
  /**
   * @param {"heading"|"paragraph"|"item"|"cell"|"quote"|"caption"} kind
   * @param {string} text
   * @param {number} line the line in the source file, so a report can be followed
   */
  constructor(kind, text, line) {
    this.kind = kind;
    this.text = text;
    this.line = line;
  }

  /** @returns {string[]} */
  sentences() {
    return split(this.text);
  }

  /** @returns {number} */
  words() {
    return this.text.split(/\s+/).filter(Boolean).length;
  }
}
