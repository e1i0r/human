#!/usr/bin/env node
/**
 * Measure how somebody actually writes, from what they wrote without help.
 *
 * The problem this solves: a writing corpus that went through a model measures
 * the model. Blog posts, docs, commit messages, anything drafted or edited with
 * an assistant carries its fingerprint, and calibrating against them teaches the
 * tool to accept exactly what it should catch.
 *
 * What is left is the writing nobody touched: what the person typed into a chat.
 * Wrong register for prose, and still the only clean sample there is.
 * Vocabulary, verbal tics, sentence length and how somebody opens a thought
 * survive the move from typing to writing. Formality does not, which is why what
 * comes out is a profile to write toward rather than thresholds to enforce.
 *
 *   human-voice SESSION.jsonl                     one session
 *   human-voice ~/.claude/projects                every session under a directory
 *   human-voice ~/.claude/projects --write=elio   and write registers/voice-elio.toml
 *
 * The result describes a person, so it is written where nothing publishes it:
 * registers/voice-*.toml is ignored by git on purpose.
 */
import { parseArgs } from "node:util";
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { split } from "../src/units/index.js";

// Below this a message is an acknowledgement, not writing: "si", "dale", "ok".
const ENOUGH_WORDS = 4;

// Grammar and harness leftovers. A function word repeated four hundred times
// says nothing about a person, and "image" arrives from pasted screenshots.
const NOISE = new Set(`
image original displayed coordinates multiply eliosf jobs personal repos github
this that with from have what when where which there their they will would should
para pero como esto esta este estos
estas todo toda todos todas algo cada porque entonces cuando donde desde entre
entonces entonce ahora entonces aqui alli pues bien tambien solo mismo otra otro
hace hacer hecho tiene tener tengo estar estoy seria sera puede pueden poder
`.trim().split(/\s+/));

const PASTED = /\[Image #?\d+\]|\[image[^\]]*\]/gi;
const WORD = /[a-záéíóúñü]{4,}/g;

/** Only what the person typed. Tool results and pasted blocks are not theirs. */
function fromJsonl(path) {
  const out = [];
  for (const line of readFileSync(path, "utf8").split("\n")) {
    let row;
    try {
      row = JSON.parse(line);
    } catch {
      continue;
    }
    if (row?.type !== "user") continue;

    let content = row.message?.content;
    if (Array.isArray(content)) {
      content = content.filter((c) => c?.type === "text").map((c) => c.text ?? "").join(" ");
    }
    if (typeof content !== "string") continue;

    let text = content.trim();
    // Anything the harness injected, or the person pasted from elsewhere.
    if (!text) continue;
    if (/^(<|\[Request interrupted|Caveat:|\[Image)/.test(text)) continue;
    text = text.replace(PASTED, " ").trim();
    if (!text || text.includes("```") || text.length > 1200) continue;
    out.push(text);
  }
  return out;
}

const median = (v) => {
  const o = [...v].sort((a, b) => a - b);
  const mid = o.length >> 1;
  return o.length % 2 ? o[mid] : (o[mid - 1] + o[mid]) / 2;
};
const share = (v, ok) => (v.length ? Math.round(100 * v.filter(ok).length / v.length) : 0);
const top = (counts, n) => [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
const bump = (m, k) => m.set(k, (m.get(k) ?? 0) + 1);

function measure(messages) {
  const sentences = [];
  const openers = new Map();
  const words = new Map();

  for (const m of messages) {
    for (const s of split(m)) {
      if (s.split(/\s+/).filter(Boolean).length < 2) continue;
      sentences.push(s);
      bump(openers, s.split(/\s+/)[0].toLowerCase().replace(/^[,.:;]+|[,.:;]+$/g, ""));
    }
    for (const w of m.toLowerCase().match(WORD) ?? []) {
      if (!NOISE.has(w)) bump(words, w);
    }
  }

  const lengths = sentences.map((s) => s.split(/\s+/).filter(Boolean).length);
  const sorted = [...lengths].sort((a, b) => a - b);
  const commas = sentences.reduce((n, s) => n + (s.match(/,/g)?.length ?? 0), 0);

  return {
    messages: messages.length,
    sentences: sentences.length,
    median: lengths.length ? median(lengths) : 0,
    p90: lengths.length ? sorted[Math.floor(0.9 * lengths.length)] : 0,
    shortShare: share(lengths, (n) => n <= 6),
    longShare: share(lengths, (n) => n >= 25),
    openers: top(openers, 12),
    words: top(words, 30),
    questions: share(sentences, (s) => s.includes("?")),
    commas: sentences.length ? Math.round(100 * commas / sentences.length) / 100 : 0,
  };
}

function report(m) {
  console.log(`\n  ${m.messages} messages · ${m.sentences} sentences\n`);
  console.log(`  median sentence        ${Math.round(m.median)} words`);
  console.log(`  p90                    ${m.p90} words`);
  console.log(`  6 words or fewer       ${m.shortShare}%`);
  console.log(`  25 words or more       ${m.longShare}%`);
  console.log(`  commas per sentence    ${m.commas}`);
  console.log(`  questions              ${m.questions}%`);
  console.log(`\n  opens with   ${m.openers.slice(0, 8).map(([w, n]) => `${w} (${n})`).join(" · ")}`);
  console.log(`  reaches for  ${m.words.slice(0, 16).map(([w]) => w).join(" · ")}\n`);
}

function profile(m, name) {
  // Four times or it is a coincidence, not a habit.
  const signature = m.words.filter(([, n]) => n >= 4).slice(0, 14).map(([w]) => w);
  const opens = m.openers.slice(0, 4).map(([w]) => w);
  return `name = "voice-${name}"
label = "How ${name} writes, measured from ${m.sentences} sentences nobody edited"

voice = """
Sentences run ${Math.round(m.median)} words at the median and ${m.p90} at the ninetieth, with
${m.shortShare}% of them at six words or fewer and ${m.longShare}% at twenty-five or more. Match
that shape rather than the smooth middle: the short ones are where this person
puts the thing that matters.

${m.commas} commas per sentence, and ${m.questions}% of sentences are questions. Thoughts open
with ${opens.join(", ")} more than anything else.

Words this person reaches for: ${signature.join(", ")}.

Measured from chat, so the formality does not carry over, only the vocabulary,
the rhythm and the directness. Write prose with this shape, not chat.
"""
`;
}

/** Every .jsonl under a directory, or the one file that was named. */
function sessions(path) {
  if (!statSync(path).isDirectory()) return [path];
  const out = [];
  for (const entry of readdirSync(path, { withFileTypes: true, recursive: true })) {
    if (entry.isFile() && entry.name.endsWith(".jsonl")) {
      out.push(join(entry.parentPath ?? entry.path, entry.name));
    }
  }
  return out.sort();
}

const { values: flags, positionals } = parseArgs({
  allowPositionals: true,
  options: { write: { type: "string" } },
});

if (positionals.length !== 1) {
  console.log("  human-voice SESSION.jsonl|DIR [--write=NAME]");
  process.exit(2);
}

const files = sessions(positionals[0]);
const seen = new Set();
const messages = [];
for (const file of files) {
  for (const m of fromJsonl(file)) {
    // The same instruction typed into twenty projects is one habit, not twenty,
    // and a slash command is the harness talking.
    if (m.split(/\s+/).length < ENOUGH_WORDS || seen.has(m) || m.startsWith("/")) continue;
    seen.add(m);
    messages.push(m);
  }
}

if (files.length > 1) process.stdout.write(`\n  ${files.length} sessions`);
if (!messages.length) {
  console.error("nothing long enough to measure");
  process.exit(1);
}

const m = measure(messages);
report(m);

if (flags.write) {
  const target = join(import.meta.dirname, "..", "registers", `voice-${flags.write}.toml`);
  writeFileSync(target, profile(m, flags.write), "utf8");
  console.log(`  wrote registers/voice-${flags.write}.toml\n`);
}
