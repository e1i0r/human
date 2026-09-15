/**
 * unnamed-crowd · REVIEW · es/en
 *
 * Detects
 *   A claim about what an unnamed group does or fails to do, used as the ground
 *   for the point: "la parte que casi nadie revisa", "lo que todo el mundo
 *   hace", "most people never check this".
 *
 * Fix
 *   Say the thing on its own, or name who. "La parte que casi nadie revisa"
 *   becomes "el ritmo de las frases". "Nadie mide esto" becomes "lo medí en
 *   veintinueve piezas y salió tres veces".
 *
 * Before   Aparte te mide el ritmo, que es la parte que casi nadie revisa.
 * After    Aparte te mide el ritmo de las frases.
 *
 * Not this
 *   A group somebody counted or named: "los seis lectores que la probaron", "el
 *   equipo de soporte". Nor "nadie" as the object of a real action, as in "no se
 *   lo mandé a nadie", where the sentence reports what happened rather than what
 *   a crowd habitually does.
 *
 * Why
 *   The writer invents a crowd and wins against it. The claim costs nothing to
 *   make, nobody can check it, and it flatters whoever is reading, so generated
 *   prose reaches for it whenever a sentence needs weight it has not earned.
 *   Sales copy carries the same habit, which is why the two read alike.
 */
import { REVIEW, detector, sentenceHits } from "./base.js";

// The crowd itself. "todos" and "todo el mundo" go here; "todo" alone does not,
// because it quantifies things rather than people.
const CROWD = new RegExp(
  "\\b(?:"
  + "casi\\s+nadie|nadie|todo\\s+el\\s+mundo|la\\s+gente|la\\s+mayor[ií]a|cualquiera"
  + "|nobody|no\\s+one|everyone|everybody|most\\s+people|anybody|anyone"
  + ")\\b", "iu");

// A habit, not an event: the crowd is the subject of a present-tense verb, or
// the sentence says what it never does.
const HABIT = new RegExp(
  "\\b(?:nunca|jam[aá]s|siempre|rara\\s+vez|casi|suele|suelen|never|always|rarely|usually)\\b"
  + "|\\b(?:nadie|todo\\s+el\\s+mundo|la\\s+gente|la\\s+mayor[ií]a|nobody|no\\s+one|everyone|most\\s+people)\\s+\\p{L}+(?:a|e|an|en|s)\\b",
  "iu");

// "no se lo mandé a nadie" reports one event. The preposition before the crowd
// is what marks it as the object of something that happened.
const OBJECT_OF = /\b(?:a|de|con|para|por|to|for|with|of)\s+(?:nadie|cualquiera|anybody|anyone|nobody)\b/iu;

export default detector({
  id: "unnamed-crowd",
  label: "unnamed crowd",
  level: REVIEW,
  note: "a group somebody counted or named is not this",
  find: (units) => sentenceHits(units, (s) => {
    if (!CROWD.test(s)) return false;
    if (OBJECT_OF.test(s)) return false;
    return HABIT.test(s);
  }),
});
