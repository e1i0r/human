/**
 * The detectors, one to a file, listed here on purpose.
 *
 * Auto-discovery was the other option and it fails in the direction that hurts:
 * a file with a typo in it simply never registers, the report comes back with
 * one fewer pattern, and a pattern that is not checked reads exactly like a
 * pattern that found nothing. An import list breaks loudly instead.
 *
 * The order here is the order of the report.
 */
export { HARD, REVIEW, detector, sentenceHits } from "./base.js";

// HARD: a regex settles it alone.
import emDash from "./em-dash.js";
import semicolon from "./semicolon.js";
import curlyQuotes from "./curly-quotes.js";
import bannedVocabulary from "./banned-vocabulary.js";
import negationFraming from "./negation-framing.js";
import aiTransition from "./ai-transition.js";

// REVIEW: a regex points at it; a person rules on it.
import subjectlessFragment from "./subjectless-fragment.js";
import agentlessPassive from "./agentless-passive.js";
import pseudoCleft from "./pseudo-cleft.js";
import midSentenceColon from "./mid-sentence-colon.js";
import deicticPivot from "./deictic-pivot.js";
import significance from "./significance.js";
import stackedAppositive from "./stacked-appositive.js";
import thesisOpener from "./thesis-opener.js";
import patternAnnouncement from "./pattern-announcement.js";
import turnsOut from "./turns-out.js";
import participialSetup from "./participial-setup.js";
import performativeHumility from "./performative-humility.js";
import stackedSuperlative from "./stacked-superlative.js";
import hedges from "./hedges.js";
import corporateMetaphor from "./corporate-metaphor.js";
import peninsularSpanish from "./peninsular-spanish.js";
import englishCalque from "./english-calque.js";
import nominalizedParticle from "./nominalized-particle.js";
import elevatedRegister from "./elevated-register.js";

// REVIEW: the ones a regex cannot express on its own.
import headingNoSubject from "./heading-no-subject.js";
import anaphora from "./anaphora.js";
import polyptoton from "./polyptoton.js";
import aphorismCloser from "./aphorism-closer.js";
import tricolon from "./tricolon.js";
import parallelSubjectMirror from "./parallel-subject-mirror.js";
import negatedEcho from "./negated-echo.js";


/** @type {import("./base.js").Detector[]} */
export const DETECTORS = [
  emDash,
  semicolon,
  curlyQuotes,
  bannedVocabulary,
  negationFraming,
  aiTransition,

  subjectlessFragment,
  headingNoSubject,
  agentlessPassive,
  pseudoCleft,
  anaphora,
  polyptoton,
  midSentenceColon,
  aphorismCloser,
  deicticPivot,
  significance,
  tricolon,
  stackedAppositive,
  thesisOpener,
  patternAnnouncement,
  turnsOut,
  participialSetup,
  performativeHumility,
  stackedSuperlative,
  hedges,
  corporateMetaphor,
  peninsularSpanish,
  englishCalque,
  nominalizedParticle,
  parallelSubjectMirror,
  elevatedRegister,
  negatedEcho,
];

/** @param {string} id */
export function byId(id) {
  const d = DETECTORS.find((x) => x.id === id);
  if (!d) throw new Error(`no detector called ${id}`);
  return d;
}
