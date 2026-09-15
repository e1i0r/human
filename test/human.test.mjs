/**
 * Check the checker.
 *
 *   node --test test/
 *
 * Two fixtures written to trip every detector at least once, and the answers
 * recorded when the counting was known good. What is compared is every hit with
 * its line and its text, not just how many there were: a detector that finds the
 * right number of the wrong sentences passes a count and is still broken.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { check, DETECTORS } from "../src/index.js";
import { defaults, merge } from "../src/config.js";
import { parse } from "../src/toml.js";
import { extract, split } from "../src/units/index.js";

const HERE = import.meta.dirname;
const read = (name) => readFileSync(join(HERE, "fixtures", name), "utf8");
const expected = JSON.parse(readFileSync(join(HERE, "expected.json"), "utf8"));

for (const name of ["fixture-es.md", "fixture-en.md"]) {
  const want = expected[name];

  test(`${name}: the document is cut the same way`, () => {
    const got = check(read(name), name);
    assert.equal(got.units.length, want.units);
    assert.equal(got.words, want.words);
    assert.equal(got.sentences, want.sentences);
    assert.equal(got.language, want.language);
  });

  test(`${name}: every detector finds what it found`, () => {
    const got = check(read(name), name);
    const seen = got.findings
      .filter((f) => f.hits.length || f.skipped)
      .map((f) => ({
        id: f.detector.id,
        skipped: f.skipped,
        over: f.over,
        budget: f.budget,
        hits: f.hits.map((h) => [h.unit.line, h.quote]),
      }));
    assert.deepEqual(seen, want.findings);
  });

  test(`${name}: the shape is measured the same`, () => {
    const { rhythm } = check(read(name), name);
    assert.deepEqual(
      rhythm.rows.map((r) => [r.name, r.got, r.want, r.ok]),
      want.rhythm.rows,
    );
    assert.deepEqual(rhythm.counts, want.rhythm.counts);
  });

  test(`${name}: a hit points at the line it came from`, () => {
    // The line numbers were off by eleven for a while, because the front matter
    // was deleted before splitting instead of blanked. Nothing counted wrong,
    // the report just pointed at the wrong lines, and only a reader noticed.
    //
    // Checked against the unit rather than the quote: some detectors quote a
    // label ("raiz 'regla' x3") or two sentences joined by ||, and none of that
    // is text anybody wrote.
    const source = read(name);
    const lines = source.split("\n");
    for (const f of check(source, name).findings) {
      for (const h of f.hits) {
        assert.ok(h.unit.line >= 1 && h.unit.line <= lines.length,
          `${f.detector.id}: L${h.unit.line} is outside a file of ${lines.length} lines`);
        const head = h.unit.text.trim().split(/\s+/).slice(0, 3).join(" ");
        const around = lines.slice(h.unit.line - 1, h.unit.line + 2).join(" ");
        assert.ok(around.includes(head),
          `${f.detector.id}: L${h.unit.line} does not open on ${JSON.stringify(head)}`);
      }
    }
  });
}

test("every detector fires on at least one fixture", () => {
  // A detector that quietly stopped matching reads exactly like one that found
  // nothing, which is why the fixtures carry a specimen of all thirty-two.
  const fired = new Set();
  for (const name of ["fixture-es.md", "fixture-en.md"]) {
    for (const f of check(read(name), name).findings) {
      if (f.hits.length) fired.add(f.detector.id);
    }
  }
  const silent = DETECTORS.map((d) => d.id).filter((id) => !fired.has(id));
  assert.deepEqual(silent, [], `silent: ${silent.join(", ")}`);
});

test("a document with nothing in it is not an error", () => {
  const got = check("", "empty.md");
  assert.equal(got.units.length, 0);
  assert.equal(got.words, 0);
  // Every detector still answers, because its zero is an answer.
  assert.equal(got.findings.length, DETECTORS.length);
});

test("config: a project's numbers win, per key", () => {
  const cfg = merge([
    parse(read("calibrated.toml")),
    parse(read("nested.toml")),
  ]);
  assert.equal(cfg.rhythm.mid_band, expected["calibrated.toml"].rhythm.mid_band);
  assert.equal(cfg.write.register, "product");
  // Inherited from the file further up, not dropped by the nearer one.
  assert.deepEqual(cfg.skip.paths, expected["calibrated.toml"].skip.paths);
  // Untouched by either file.
  assert.equal(cfg["em-dash"].per_words, defaults()["em-dash"].per_words);
});

test("config: a key nobody knows is an error, not a shrug", () => {
  assert.throws(() => merge([{ rhythm: { mid_bnd: 55 } }]), /has no "mid_bnd"/);
  assert.throws(() => merge([{ rythm: { mid_band: 55 } }]), /no detector called/);
});

test("toml: a threshold with a comment beside it is still a number", () => {
  const cfg = parse(read("calibrated.toml"));
  assert.equal(cfg.rhythm.trios, 3);
  assert.equal(typeof cfg.rhythm.trios, "number");
  assert.equal(cfg.write.register, "blog");
});

test("toml: a register's paragraph survives its own punctuation", () => {
  const r = parse(read("register.toml"));
  assert.match(r.voice, /^The reader is going to open the repository/);
  assert.ok(r.voice.includes("\n"), "a multi-line string keeps its lines");
});

test("units: a code fence is not prose", () => {
  const units = extract("Uno dos tres.\n\n```\nconst x = 1;\n```\n\nCuatro cinco.\n", "a.md");
  const text = units.map((u) => u.text).join(" ");
  assert.ok(!text.includes("const x"), "the fence leaked into the prose");
});

test("units: a sentence is not cut at an abbreviation", () => {
  assert.equal(split("Costó 3.5 millones. Nadie lo revisó.").length, 2);
});
