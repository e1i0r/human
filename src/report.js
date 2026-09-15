/**
 * Print the report.
 *
 * Its own file so the colour codes live in one place. Scattered through the
 * counting they made every line hard to read and the output impossible to test,
 * and they have to disappear when the output is piped: a log full of escape
 * sequences is a log nobody greps.
 */

const RESET = "\u001b[0m";
const BOLD = "\u001b[1m";
const DIM = "\u001b[2m";
const RED = "\u001b[31m";
const YELLOW = "\u001b[33m";

export class Report {
  /**
   * @param {object} cfg
   * @param {{colour?: boolean, brief?: boolean, write?: (line: string) => void}} options
   */
  constructor(cfg, { colour = true, brief = false, write = console.log, register = null } = {}) {
    this.colour = colour;
    // Brief prints only what is not zero. The zeros are the point of the full
    // report, and a wall of them is the point of nothing when the report
    // arrives unasked after every edit.
    this.brief = brief;
    this.write = write;
    this.shown = cfg.report.hits_shown;
    this.width = cfg.report.quote_width;
    this.pendingLevel = null;
    // The register a project declared. Until this was read, [write] register
    // was a line in a config file that nothing in the program ever opened.
    this.register = register;
    this.watched = new Set(register?.watch ?? []);
  }

  #c(code, text) {
    return this.colour ? `${code}${text}${RESET}` : text;
  }

  header(path, units, sentences, words) {
    this.write(`\n${this.#c(BOLD, String(path))}   `
      + `${units} units · ${sentences} sentences · ${words} words`);
    if (this.register && !this.brief) {
      this.write(`  ${this.#c(DIM, `written as ${this.register.name}: `
        + `${this.register.label.toLowerCase()}`)}`);
    }
  }

  level(name) {
    if (this.brief) {
      this.pendingLevel = name; // printed only if something lands under it
      return;
    }
    this.write(`\n  ${name}`);
  }

  /**
   * One line per detector, always, including the zeros.
   *
   * The zeros are the point. An unenumerated "looks clean" always passes, and a
   * detector that quietly stopped matching reads exactly like one that found
   * nothing.
   */
  detector(d, hits, budget, over) {
    if (this.brief) {
      if (!hits.length) return;
      if (this.pendingLevel) {
        this.write(`\n  ${this.pendingLevel}`);
        this.pendingLevel = null;
      }
    }
    let mark = " ";
    if (over) mark = this.#c(d.level === "HARD" ? RED : YELLOW, d.level === "HARD" ? "!" : "?");
    const cap = d.budget ? ` / ${budget}` : "";
    const note = hits.length && d.note ? `   ${this.#c(DIM, `(${d.note})`)}` : "";
    // A register names the patterns that cost more in this kind of writing. Two
    // hits of corporate metaphor is a shrug in a blog post and the reason a
    // sales page does not land, and the same row of the report said neither.
    //
    // Its own column rather than a bolder label: the hook runs with the colour
    // off, and a mark that only exists in colour is a mark the log never carries.
    const watch = this.watched.has(d.id) ? this.#c(DIM, "·") : " ";
    this.write(`  ${mark}${watch} ${d.label.padEnd(30)} `
      + `${String(hits.length).padStart(3)}${cap}${note}`);

    for (const h of hits.slice(0, this.shown)) {
      this.write(`        ${this.#c(DIM, `L${String(h.unit.line).padEnd(5)}`)} `
        + h.quote.slice(0, this.width));
    }
    if (hits.length > this.shown) {
      this.write(`        ${this.#c(DIM, `... and ${hits.length - this.shown} more`)}`);
    }
  }

  /**
   * The four measurements, then the sentence lengths that produced them.
   *
   * The list of lengths is printed because a writer who sees [7, 18, 8, 28, 3]
   * argues with the shape of their own page, and one who sees only "ok" has
   * been told an answer they cannot check.
   */
  rhythm(rows, counts) {
    if (this.brief && rows.every((r) => r.ok)) return;
    this.write("\n  RHYTHM");
    for (const r of rows) {
      if (this.brief && r.ok) continue;
      const mark = r.ok ? " " : this.#c(RED, "!");
      this.write(`  ${mark} ${r.name.padEnd(30)} ${String(r.got).padStart(3)}   `
        + `${this.#c(DIM, r.want)}   ${r.ok ? "ok" : "FAIL"}`);
    }
    if (this.brief) return;
    const tail = counts.length > 24 ? " ..." : "";
    this.write(`    ${this.#c(DIM, `${counts.length} prose sentences: `
      + `[${counts.slice(0, 24).join(", ")}]${tail}`)}`);
  }

  footer(failures) {
    if (this.brief && !failures) return;
    this.write(`\n${this.#c(BOLD, failures ? `${failures} failing` : "nothing failing")}\n`);
  }
}
