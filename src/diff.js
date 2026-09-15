/**
 * Qué cambió entre dos versiones de una frase.
 *
 * Existe para que un arreglo se pueda mirar antes de aplicarlo. Enseñar la
 * frase vieja y la nueva enteras obliga a compararlas a ojo, que es justo lo
 * que hace que nadie las lea: lo que hace falta es ver los tres caracteres que
 * se mueven.
 *
 * Por palabras y no por caracteres. Un diff de caracteres sobre "utilizar" y
 * "usar" marca la u, luego se salta, luego marca otro trozo, y el resultado se
 * lee peor que las dos palabras enteras.
 */

// Palabras, espacios y signos por separado, para que cambiar ";" por "," no
// arrastre las palabras de al lado.
const TOKENS = /[\p{L}\p{M}\p{N}_]+|\s+|[^\p{L}\p{M}\p{N}_\s]/gu;

const cut = (text) => text.match(TOKENS) ?? [];

/**
 * El trozo común más largo entre dos listas, con dónde empieza en cada una.
 *
 * Una sola pasada de arreglo puede cambiar dos sitios de la misma frase, y
 * quitando solo lo común de los extremos los dos cambios y todo lo que hay
 * entre ellos salen como un bloque. Partir por lo que comparten en medio los
 * separa, que es lo que un lector necesita ver.
 */
function anchor(a, b) {
  let best = { size: 0, at: 0, to: 0 };
  // Suficiente para una frase. Un texto largo no llega aquí: esto compara una
  // frase con su arreglo, nunca dos documentos.
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      let n = 0;
      while (i + n < a.length && j + n < b.length && a[i + n] === b[j + n]) n++;
      // Un espacio o una coma sueltos coinciden en todas partes y no anclan
      // nada, así que sólo cuenta un trozo con algo escrito dentro.
      if (n > best.size && a.slice(i, i + n).some((t) => /[\p{L}\p{N}]/u.test(t))) {
        best = { size: n, at: i, to: j };
      }
    }
  }
  return best;
}

/** @returns {{text: string, kind: "same"|"out"|"in"}[]} */
function walk(a, b, out) {
  // Lo que comparten por delante y por detrás.
  let head = 0;
  while (head < a.length && head < b.length && a[head] === b[head]) head++;
  let tail = 0;
  while (tail < a.length - head && tail < b.length - head
         && a[a.length - 1 - tail] === b[b.length - 1 - tail]) tail++;

  const push = (tokens, kind) => {
    const text = tokens.join("");
    if (!text) return;
    const last = out.at(-1);
    if (last?.kind === kind) last.text += text;
    else out.push({ text, kind });
  };

  push(a.slice(0, head), "same");
  const midA = a.slice(head, a.length - tail);
  const midB = b.slice(head, b.length - tail);

  const found = midA.length && midB.length ? anchor(midA, midB) : { size: 0 };
  if (found.size) {
    walk(midA.slice(0, found.at), midB.slice(0, found.to), out);
    push(midA.slice(found.at, found.at + found.size), "same");
    walk(midA.slice(found.at + found.size), midB.slice(found.to + found.size), out);
  } else {
    push(midA, "out");
    push(midB, "in");
  }
  push(a.slice(a.length - tail), "same");
  return out;
}

/**
 * @param {string} before
 * @param {string} after
 * @returns {{text: string, kind: "same"|"out"|"in"}[]}
 */
export const diff = (before, after) => walk(cut(before), cut(after), []);
