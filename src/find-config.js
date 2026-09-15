/**
 * Find a project's thresholds on disk.
 *
 * Separate from config.js because that file has to stay readable in a browser:
 * the editor imports the defaults and the merge, and a node:fs at the top of
 * them takes the whole page down. Everything that touches a filesystem is here.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve, sep } from "node:path";

import { CONFIG_NAMES, merge } from "./config.js";
import { parse } from "./toml.js";

/**
 * Every config file from the repository root down to the file, in that order.
 *
 * Nearest wins per key, and only per key: a landing inside a blog sets its own
 * register without losing the rhythm the blog calibrated. Taking only the
 * nearest file looks the same until the day a directory adds one line and
 * silently drops twenty.
 *
 * @param {string} from a file, or a directory
 * @returns {string[]}
 */
export function configFiles(from) {
  const found = [];
  let dir = dirname(resolve(from));
  for (;;) {
    // One file per directory: two in the same place would fight over the same
    // keys with nothing on the page saying which of them won.
    const here = CONFIG_NAMES.map((n) => `${dir}${sep}${n}`).find(existsSync);
    if (here) found.push(here);
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return found.reverse();
}

/**
 * The defaults with every file above `from` merged in.
 *
 * @param {string} [from]
 */
export function loadConfig(from) {
  const files = from ? configFiles(from) : [];
  return merge(files.map((f) => {
    // A config that cannot be read stops the run. Falling back to the defaults
    // prints a clean report against numbers the project overrode months ago,
    // and nothing in the output says the file was skipped.
    try {
      return parse(readFileSync(f, "utf8"));
    } catch (e) {
      throw new Error(`${f}: ${e.message}`);
    }
  }));
}
