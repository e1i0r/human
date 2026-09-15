/**
 * Read a config file.
 *
 * Python gets tomllib in the standard library. Node has no TOML parser at all,
 * and the first version of the CLI quietly fell back to the defaults when it
 * could not find one: it printed a clean report against numbers the project had
 * already overridden, which is worse than refusing to run.
 *
 * So this reads the shape these files actually have, and nothing else. Tables,
 * scalars, flat arrays, and the triple-quoted paragraphs the registers are
 * written in. Dotted keys, nested tables, inline tables and dates all raise
 * rather than parse to something plausible, because a config file that
 * half-parses turns a threshold off and says nothing about it.
 */

const BARE = /^[A-Za-z0-9_-]+$/;

/** @param {string} line @param {number} n */
function fail(message, n, line) {
  throw new Error(`${message} (line ${n}: ${line.trim()})`);
}

/**
 * Drop a trailing comment.
 *
 * Only outside a string: the corpus comments sit after the value, and
 * `paths = ["docs/#drafts"]` has to survive a naive split on #.
 */
function uncomment(line) {
  let quote = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quote) {
      if (c === "\\" && quote === '"') i++;
      else if (c === quote) quote = null;
    } else if (c === '"' || c === "'") quote = c;
    else if (c === "#") return line.slice(0, i);
  }
  return line;
}

const ESCAPES = { n: "\n", t: "\t", r: "\r", '"': '"', "\\": "\\" };

/** One scalar. Returns [value, rest] so the array reader can walk a line. */
function scalar(text, n, line) {
  const s = text.trimStart();

  if (s[0] === "'") { // literal string: no escapes, by definition
    const end = s.indexOf("'", 1);
    if (end < 0) fail("unterminated string", n, line);
    return [s.slice(1, end), s.slice(end + 1)];
  }
  if (s[0] === '"') {
    for (let i = 1; i < s.length; i++) {
      if (s[i] === "\\") i++;
      else if (s[i] === '"') return [unescape(s.slice(1, i), n, line), s.slice(i + 1)];
    }
    fail("unterminated string", n, line);
  }

  const token = s.match(/^[^,\]\s]+/)?.[0];
  if (!token) fail("expected a value", n, line);
  const rest = s.slice(token.length);

  if (token === "true") return [true, rest];
  if (token === "false") return [false, rest];
  // Underscores are TOML's digit separators; 1_000 is one number.
  const bare = token.replace(/_/g, "");
  if (/^[+-]?\d+$/.test(bare)) return [Number.parseInt(bare, 10), rest];
  if (/^[+-]?(\d+\.\d+|\d+[eE][+-]?\d+|\d+\.\d+[eE][+-]?\d+)$/.test(bare)) {
    return [Number.parseFloat(bare), rest];
  }
  fail(`cannot read ${JSON.stringify(token)}`, n, line);
}

/**
 * A """ paragraph, which is how a register writes its voice.
 *
 * Read from the raw lines rather than the uncommented ones: a # inside one of
 * these is prose, and stripping it would quietly cut a sentence in half.
 */
function multiline(lines, start) {
  const first = lines[start];
  let body = first.slice(first.indexOf('"""') + 3);
  let n = start;

  for (;;) {
    const end = body.indexOf('"""');
    if (end >= 0) {
      const rest = body.slice(end + 3);
      if (rest.trim()) fail(`trailing ${JSON.stringify(rest.trim())}`, n + 1, lines[n]);
      // TOML drops a newline that comes straight after the opening delimiter,
      // which is why a register can put its voice on its own line and start at
      // column one without the text beginning with a blank one.
      const text = body.slice(0, end).replace(/^\n/, "");
      return [unescape(text, start + 1, first), n - start];
    }
    if (++n >= lines.length) fail("unterminated string", start + 1, first);
    body += `\n${lines[n]}`;
  }
}

/** The escapes a basic string carries, shared by both forms. */
function unescape(text, n, line) {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== "\\") { out += text[i]; continue; }
    const next = text[++i];
    // A backslash at the end of a line eats the whitespace that follows it.
    if (next === "\n") { while (/\s/.test(text[i + 1] ?? "")) i++; continue; }
    const e = ESCAPES[next];
    if (e === undefined) fail(`unsupported escape \\${next}`, n, line);
    out += e;
  }
  return out;
}

/**
 * A flat array, which may run over several lines.
 *
 * `read` hands this the rest of the file so a value can keep going; it returns
 * how many lines it consumed.
 */
function array(text, lines, start) {
  const out = [];
  let rest = text.slice(text.indexOf("[") + 1);
  let n = start;

  for (;;) {
    rest = rest.trimStart();
    if (rest.startsWith("]")) return [out, n - start];
    if (rest === "") {
      if (++n >= lines.length) fail("unterminated array", start + 1, lines[start]);
      rest = uncomment(lines[n]);
      continue;
    }
    if (rest.startsWith(",")) { rest = rest.slice(1); continue; }
    if (rest.startsWith("[")) fail("nested arrays are not read here", n + 1, lines[n]);
    const [value, after] = scalar(rest, n + 1, lines[n]);
    out.push(value);
    rest = after;
  }
}

/**
 * @param {string} source
 * @returns {Record<string, unknown>} the root table; a [header] is a nested one
 */
export function parse(source) {
  const lines = source.split(/\r?\n/);
  // Keys before any header belong to the root table, which is how the registers
  // are written: name and audience sit at the top, above the lists.
  const out = {};
  let table = out;

  for (let i = 0; i < lines.length; i++) {
    const line = uncomment(lines[i]).trim();
    if (!line) continue;
    const n = i + 1;

    if (line.startsWith("[")) {
      if (line.startsWith("[[")) fail("arrays of tables are not read here", n, lines[i]);
      const name = line.slice(1, -1).trim();
      if (!line.endsWith("]") || !BARE.test(name)) fail("bad table header", n, lines[i]);
      // Repeating a header is an error in TOML, and here it would silently
      // discard whichever half of the table came first.
      if (name in out) fail(`[${name}] appears twice`, n, lines[i]);
      table = out[name] = {};
      continue;
    }

    const eq = line.indexOf("=");
    if (eq < 0) fail("expected key = value", n, lines[i]);
    const key = line.slice(0, eq).trim();
    if (!BARE.test(key)) fail(`bad key ${JSON.stringify(key)}`, n, lines[i]);
    if (key in table) fail(`${key} is set twice`, n, lines[i]);

    const value = line.slice(eq + 1).trim();
    if (value.startsWith('"""')) {
      const [read, consumed] = multiline(lines, i);
      table[key] = read;
      i += consumed;
    } else if (value.startsWith("[")) {
      const [read, consumed] = array(value, lines.map(uncomment), i);
      table[key] = read;
      i += consumed;
    } else {
      const [read, rest] = scalar(value, n, lines[i]);
      if (rest.trim()) fail(`trailing ${JSON.stringify(rest.trim())}`, n, lines[i]);
      table[key] = read;
    }
  }
  return out;
}
