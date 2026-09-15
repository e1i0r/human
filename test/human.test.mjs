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
import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";

import { check, DETECTORS } from "../src/index.js";
import { defaults, merge } from "../src/config.js";
import { declared, load, names } from "../src/registers.js";
import { parse } from "../src/toml.js";
import { ES, RHYTHM_ES, UI_ES } from "../src/i18n/es.js";
import { GROUPS_EN, RHYTHM_EN, UI_EN } from "../src/i18n/en.js";
import { isProse, reportOn } from "../hook/common.js";
import { extract, split } from "../src/units/index.js";
import { measure } from "../src/rhythm/index.js";
import { FIXES, applyFix, fixFor } from "../src/fixes.js";
import { diff } from "../src/diff.js";

const HERE = import.meta.dirname;
const ROOT = dirname(HERE);
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

test("detectors: each one documents what it catches and what it must not", () => {
  // The "Not this" line is the one that matters. A REVIEW detector exists to be
  // argued with, and a reader who cannot tell the legitimate version from the
  // tell will either fix good prose or stop reading the report.
  const dir = join(ROOT, "src", "detectors");
  for (const d of DETECTORS) {
    const file = readdirSync(dir).find((n) =>
      new RegExp(`^\\s*id:\\s*"${d.id}"`, "m").test(readFileSync(join(dir, n), "utf8")));
    assert.ok(file, `${d.id} has no file`);
    const doc = readFileSync(join(dir, file), "utf8").split("*/")[0];
    for (const field of ["Detects", "Fix", "Why"]) {
      assert.match(doc, new RegExp(`^ \\* ${field}$`, "m"), `${d.id} has no ${field}`);
    }
    if (d.level === "REVIEW") {
      assert.match(doc, /^ \* Not this$/m, `${d.id} never says what the legitimate version is`);
    }
  }
});

test("detectors: both generated documents list every one of them", () => {
  // Two renderings of one source. The version this was ported from kept a
  // second copy by hand, translated, and either could go stale in silence.
  for (const doc of [join(ROOT, "src", "detectors", "README.md"), join(ROOT, "SKILL.md")]) {
    const text = readFileSync(doc, "utf8");
    for (const d of DETECTORS) {
      assert.ok(text.includes(`### ${d.id}\n`), `${d.id} is missing from ${doc}`);
    }
  }
});

test("skill: the four fields a fixer needs survive the generation", () => {
  const skill = readFileSync(join(ROOT, "SKILL.md"), "utf8");
  for (const d of DETECTORS) {
    const section = skill.split(`### ${d.id}\n`)[1].split("\n### ")[0];
    assert.match(section, /\*\*Detects\.\*\* \S/, `${d.id}: nothing detected`);
    assert.match(section, /\*\*Fix\.\*\* \S/, `${d.id}: no fix`);
    if (d.level === "REVIEW") {
      assert.match(section, /\*\*Not this\.\*\* \S/, `${d.id}: no legitimate version`);
    }
  }
});

test("fixes: only the ones a pattern can actually settle have one", () => {
  // Five of thirty-two, and nearly the same five as HARD. Rewriting a
  // pseudo-cleft needs to know what the sentence meant, and a button there
  // would be promising a rewrite that does not exist.
  const withFix = DETECTORS.filter((d) => fixFor(d.id));
  assert.equal(withFix.length, FIXES.length);
  for (const f of FIXES) {
    assert.ok(DETECTORS.some((d) => d.id === f.id), `${f.id} is not a detector`);
    for (const code of ["es", "en"]) {
      assert.ok(f.what?.[code]?.length > 10, `${f.id}: el botón no dice qué hace en ${code}`);
    }
  }
});

test("fixes: an applied fix removes its own finding", () => {
  const cases = [
    ["em-dash", "La tarea corre sola — y deja el registro."],
    ["curly-quotes", "Dijo “hola” y se fue."],
    ["semicolon", "No es una plataforma; robusta y clara."],
    ["ai-transition", "Además, el equipo trabaja todos los días sin parar."],
    ["banned-vocabulary", "Vamos a utilizar el motor en aras de reducir el fraude."],
  ];
  for (const [id, text] of cases) {
    const before = check(text, "a.md").findings.find((f) => f.detector.id === id);
    assert.ok(before.hits.length, `${id}: el caso de prueba no lo dispara`);
    const after = check(applyFix(id, text), "a.md").findings.find((f) => f.detector.id === id);
    assert.equal(after.hits.length, 0, `${id}: el arreglo no lo quita`);
  }
});

test("fixes: an applied fix does not write a new one", () => {
  // The whole reason the fixing loop re-runs over the document: a fix writes
  // tells while it removes them. A fix this offers with one click has to be one
  // that does not, or the page hands somebody a worse draft than they had.
  const cases = [
    ["em-dash", "La tarea corre sola — y deja el registro escrito para el que venga."],
    ["curly-quotes", "Dijo “hola” y se fue sin mirar a nadie de los que estaban."],
    ["semicolon", "No es una plataforma cualquiera; aguanta cuatro mil corridas al día."],
    ["ai-transition", "Además, el equipo revisa cada regla antes de dejarla entrar."],
    ["banned-vocabulary", "Vamos a utilizar el motor en aras de reducir el fraude del mes."],
  ];
  const hard = (text) => check(text, "a.md").findings
    .filter((f) => f.detector.level === "HARD" && f.hits.length)
    .flatMap((f) => f.hits.map(() => f.detector.id));

  for (const [id, text] of cases) {
    const before = new Set(hard(text));
    const after = hard(applyFix(id, text));
    const born = after.filter((x) => !before.has(x));
    assert.deepEqual(born, [], `${id}: el arreglo escribió ${born.join(", ")}`);
  }
});

test("fixes: nothing changes when there is nothing to change", () => {
  // A hyphen in a range, and a banned word with no plain equivalent. Guessing
  // is worse than leaving it: "robusto" becomes whatever the thing does, and
  // only the person writing knows that.
  assert.equal(applyFix("em-dash", "Un rango de 10-20 palabras."), "Un rango de 10-20 palabras.");
  assert.equal(applyFix("banned-vocabulary", "Una plataforma robusta."), "Una plataforma robusta.");
  assert.equal(applyFix("aphorism-closer", "Y eso fue todo."), "Y eso fue todo.");
});

test("diff: the pieces put both versions back together", () => {
  // The one thing it must never do is lose a word. A diff that drops text and
  // is shown as "antes" is a page lying about what the draft says.
  const cases = [
    ["La tarea corre sola — y deja el registro.", "em-dash"],
    ["Vamos a utilizar el motor en aras de reducir el fraude.", "banned-vocabulary"],
    ["Dijo “hola” y se fue, con su ‘cosa’.", "curly-quotes"],
    ["Además, el equipo trabaja.", "ai-transition"],
  ];
  for (const [before, id] of cases) {
    const after = applyFix(id, before);
    const parts = diff(before, after);
    const back = (kind) => parts.filter((p) => p.kind !== kind).map((p) => p.text).join("");
    assert.equal(back("in"), before, `${id}: el antes no se reconstruye`);
    assert.equal(back("out"), after, `${id}: el después no se reconstruye`);
    assert.ok(parts.some((p) => p.kind === "out"), `${id}: no marcó nada`);
  }
});

test("diff: two changes in one sentence are two changes", () => {
  // Trimming only the shared ends turns "utilizar ... en aras de" into one
  // block covering the words between them, which reads as a rewrite of the
  // whole sentence rather than as two substitutions.
  const before = "Vamos a utilizar el motor en aras de reducir el fraude.";
  const parts = diff(before, applyFix("banned-vocabulary", before));
  assert.equal(parts.filter((p) => p.kind === "out").length, 2);
  assert.ok(parts.some((p) => p.kind === "same" && p.text.includes("el motor")),
    "lo que no cambió tiene que quedar marcado como igual");
});

test("diff: nothing changed is nothing marked", () => {
  assert.deepEqual(diff("Igual.", "Igual."), [{ text: "Igual.", kind: "same" }]);
});

test("es: every detector says in Spanish what it looks for", () => {
  // The browser editor is a Spanish page and "banned vocabulary" tells a first
  // reader nothing. A row nobody understands is a row nobody acts on, and then
  // the whole report is decoration.
  const missing = DETECTORS.filter((d) => !ES[d.id]).map((d) => d.id);
  assert.deepEqual(missing, [], `sin español: ${missing.join(", ")}`);
  const extra = Object.keys(ES).filter((id) => !DETECTORS.some((d) => d.id === id));
  assert.deepEqual(extra, [], `español de detectores que no existen: ${extra.join(", ")}`);
  for (const [id, e] of Object.entries(ES)) {
    assert.ok(e.label?.length, `${id}: sin etiqueta`);
    assert.ok(e.what?.length > 40, `${id}: la explicación no dice lo suficiente`);
    assert.ok(e.fix?.length > 15, `${id}: sin arreglo`);
    assert.ok(e.not?.length > 15, `${id}: no dice con qué no confundirlo`);
  }
});

test("es: the four rhythm measures have Spanish too", () => {
  const names = measure(extract("Una frase corta. Y otra bastante mas larga que la anterior, con sus palabras.", "a.md"), defaults())
    .rows.map((r) => r.name);
  const missing = names.filter((n) => !RHYTHM_ES[n]);
  assert.deepEqual(missing, [], `sin español: ${missing.join(", ")}`);
});

test("i18n: the two languages say the same things", () => {
  // A page half in the reader's language and half in the other is worse than
  // one language honestly, and a missing key shows up as an empty label that
  // nobody notices until somebody screenshots it.
  const missing = Object.keys(UI_ES).filter((k) => !UI_EN[k]);
  assert.deepEqual(missing, [], `sin inglés: ${missing.join(", ")}`);
  const extra = Object.keys(UI_EN).filter((k) => !UI_ES[k]);
  assert.deepEqual(extra, [], `sin español: ${extra.join(", ")}`);
  for (const key of Object.keys(RHYTHM_ES)) {
    assert.ok(RHYTHM_EN[key], `ritmo sin inglés: ${key}`);
  }
  for (const level of ["HARD", "REVIEW", "RHYTHM"]) {
    assert.ok(GROUPS_EN[level]?.what?.length > 40, `${level}: sin explicación en inglés`);
  }
});

test("registers: each one says what it is, what it is for, and how it sounds", () => {
  const found = names();
  assert.ok(found.length >= 13, `only ${found.length} registers`);
  for (const n of found) {
    const r = load(n);
    assert.equal(r.name, n, `${n}.toml calls itself ${r.name}`);
    assert.ok(r.label?.length, `${n} has no label`);
    assert.ok(r.voice?.trim().length > 100, `${n}: the voice is too short to steer a draft`);
  }
});

test("registers: a watched pattern is a pattern that exists", () => {
  // A typo in a watch list is silent in a way nothing else here is: the register
  // prints, the report prints, and the pattern the writer was told to watch was
  // never marked once.
  const ids = new Set(DETECTORS.map((d) => d.id));
  for (const n of names()) {
    for (const id of load(n).watch ?? []) {
      assert.ok(ids.has(id), `${n} watches "${id}", which is not a detector`);
    }
  }
});

test("registers: a name nobody knows lists the ones that exist", () => {
  assert.throws(() => load("saels"), /no register called "saels".*sales/s);
});

test("nothing measured from a person's own history ships", () => {
  // It was in the first tarball. .gitignore keeps a voice profile out of git and
  // npm ignores .gitignore entirely once package.json declares "files", so the
  // whole registers directory went in, profile included.
  const listed = execFileSync("npm", ["pack", "--dry-run", "--json"], {
    cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"],
  });
  const shipped = JSON.parse(listed)[0].files.map((f) => f.path);
  const leaked = shipped.filter((p) => /voice-/.test(p));
  assert.deepEqual(leaked, [], `these would be published: ${leaked.join(", ")}`);
  // And the guard is worthless if the directory stopped shipping at all.
  assert.ok(shipped.some((p) => p === "registers/blog.toml"), "the registers are missing");
});

test("registers: declaring none is not declaring a broken one", () => {
  assert.equal(declared(defaults()), null);
  assert.equal(declared({ write: { register: "sales" } }).name, "sales");
});

test("units: a code fence is not prose", () => {
  const units = extract("Uno dos tres.\n\n```\nconst x = 1;\n```\n\nCuatro cinco.\n", "a.md");
  const text = units.map((u) => u.text).join(" ");
  assert.ok(!text.includes("const x"), "the fence leaked into the prose");
});

test("hook: what counts as prose somebody meant to publish", () => {
  const here = join(HERE, "fixtures", "fixture-es.md");
  // Under test/fixtures, which is a directory this never argues with.
  assert.equal(isProse(here), false);

  assert.equal(isProse("/no/such/file.md"), false, "a path that is not there");
  assert.equal(isProse(join(HERE, "human.test.mjs")), false, "source is not prose");
  const readme = join(ROOT, "registers", "README.md");
  assert.equal(isProse(readme), true, "a readme is prose");
  assert.equal(isProse(readme, ["registers/"]), false, "the project said not to");
  assert.equal(isProse(join(ROOT, "node_modules", "x", "README.md")), false, "not ours");
});

test("hook: a clean page is a page the hook says nothing about", () => {
  // The one thing a hook must not do is talk after every edit, because then it
  // gets uninstalled. Silence is the ordinary case and has to stay free.
  const said = [];
  const log = console.log;
  console.log = (...a) => said.push(a.join(" "));
  try {
    // A page with nothing to say about it, and a path that is not there.
    reportOn([join(ROOT, "registers", "README.md"), "/no/such/file.md"]);
  } finally {
    console.log = log;
  }
  assert.deepEqual(said, []);
});

test("units: a catalogue of the patterns is not a page full of them", () => {
  const prose = "Y ahí está el punto: es robusto, comprehensivo y exhaustivo.";
  assert.equal(extract(prose, "a.md").length, 1);
  for (const marker of ["<!-- human: specimen -->", "<!-- tells: specimen -->"]) {
    assert.equal(extract(`${marker}\n\n${prose}`, "a.md").length, 0, marker);
  }
});

test("units: a sentence is not cut at an abbreviation", () => {
  assert.equal(split("Costó 3.5 millones. Nadie lo revisó.").length, 2);
});
