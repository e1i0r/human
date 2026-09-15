/**
 * Los arreglos que un patrón puede aplicar solo.
 *
 * Cinco de treinta y dos, y no es casualidad que sean casi los mismos HARD: lo
 * que un patrón zanja es lo que un patrón puede reemplazar. Para los otros
 * veintisiete no hay función posible, porque reescribir un pseudo-cleft exige
 * saber qué quiso decir la frase, y un regex no lo sabe. Ofrecer un botón ahí
 * sería prometer una reescritura que no existe.
 *
 * Cada arreglo recibe el texto tal cual y devuelve el texto cambiado, o el
 * mismo texto cuando no hay nada seguro que hacer. Nunca adivina: si una
 * palabra vetada no tiene equivalente de uno a uno, se queda donde está y la
 * decide una persona.
 */

/**
 * @typedef {object} Fix
 * @property {string} id el detector que lo produce
 * @property {(text: string) => string} apply
 * @property {string} what qué hace, para el botón
 */

// Una raya con espacios a los lados separa dos mitades de una frase, así que una
// coma la sustituye sin tocar el sentido. Una raya pegada a las palabras casi
// siempre está haciendo de guion y se deja.
const SPACED_DASH = /\s+[—–]\s+/g;

// Comillas y apóstrofes tipográficos, uno a uno.
const CURLY = { "“": '"', "”": '"', "‘": "'", "’": "'", "«": '"', "»": '"' };

// El conector al principio de la frase y la coma que lo sigue. La mayúscula se
// devuelve a la palabra siguiente, que es lo que hace que el resultado se lea.
const OPENER = new RegExp(
  "^(\\s*)(?:Además|Asimismo|Por otro lado|Por otra parte|En este sentido"
  + "|Cabe destacar que|Es evidente que|Como se mencionó(?: anteriormente)?"
  + "|Furthermore|Moreover|In addition|That said|It is clear that"
  + "|As mentioned(?: earlier| previously)?),?\\s+", "u");

/**
 * Las que tienen un equivalente llano y único.
 *
 * Deliberadamente corta. "robusto" no está: lo que sustituye a robusto es lo que
 * la cosa hace de verdad, y eso no lo sabe nadie más que quien escribe.
 */
const PLAIN = new Map(Object.entries({
  utilizar: "usar", utiliza: "usa", utilizan: "usan", utilizando: "usando",
  utilizamos: "usamos", utilizado: "usado", utilizada: "usada",
  "en aras de": "para", "con el fin de": "para", "con el objetivo de": "para",
  "a fin de": "para", "debido a que": "porque", "dado que": "porque",
  "en el caso de que": "si", "en caso de que": "si",
  "previo a": "antes de", "posterior a": "después de",
  "con respecto a": "sobre", "en relación con": "sobre", "en relación a": "sobre",
  "tiene la capacidad de": "puede", "tiene la posibilidad de": "puede",
  "llevar a cabo": "hacer", "realizar": "hacer",
  utilize: "use", utilizes: "uses", utilizing: "using", utilized: "used",
  leverage: "use", leveraging: "using", leveraged: "used",
  "in order to": "to", "due to the fact that": "because",
  "in the event that": "if", "has the ability to": "can",
  "prior to": "before", "subsequent to": "after",
  "with regard to": "about", "with respect to": "about",
}));

const keepCase = (from, to) =>
  from[0] === from[0].toUpperCase() ? to[0].toUpperCase() + to.slice(1) : to;

/** @type {Fix[]} */
export const FIXES = [
  {
    id: "em-dash",
    what: "cambiar la raya por una coma",
    apply: (text) => text.replace(SPACED_DASH, ", "),
  },
  {
    id: "curly-quotes",
    what: "cambiar las comillas curvas por rectas",
    apply: (text) => text.replace(/[“”‘’«»]/g, (c) => CURLY[c]),
  },
  {
    id: "semicolon",
    // Una coma y no un punto. El punto exige que las dos mitades sean oraciones
    // y eso es justo lo que el patrón no ve: partir "es una plataforma; robusta
    // y comprehensiva" deja un fragmento sin sujeto, que es otro detector.
    what: "cambiar el punto y coma por una coma",
    apply: (text) => text.replace(/;\s+/g, ", "),
  },
  {
    id: "ai-transition",
    what: "quitar el conector y dejar la frase",
    apply: (text) => text.replace(OPENER, (_, space) => space)
      .replace(/^(\s*)(\p{Ll})/u, (_, s, c) => s + c.toUpperCase()),
  },
  {
    id: "banned-vocabulary",
    what: "cambiar por la palabra llana",
    apply: (text) => {
      let out = text;
      // Las de varias palabras primero, o "en relación con" se queda a medias.
      const terms = [...PLAIN.keys()].sort((a, b) => b.length - a.length);
      for (const term of terms) {
        const rx = new RegExp(`(?<![\\p{L}\\p{M}\\p{N}_])${term}(?![\\p{L}\\p{M}\\p{N}_])`, "giu");
        out = out.replace(rx, (m) => keepCase(m, PLAIN.get(term)));
      }
      return out;
    },
  },
];

const BY_ID = new Map(FIXES.map((f) => [f.id, f]));

/** El arreglo de un detector, o nada cuando no hay uno que se pueda aplicar. */
export const fixFor = (id) => BY_ID.get(id) ?? null;

/**
 * El texto cambiado, o el mismo texto cuando el arreglo no encontró nada.
 *
 * Devolver el original en vez de lanzar deja que quien llama compare: un
 * arreglo que no cambia nada es un arreglo que no aplica aquí, y eso es una
 * respuesta, no un error.
 */
export function applyFix(id, text) {
  const fix = fixFor(id);
  return fix ? fix.apply(text) : text;
}
