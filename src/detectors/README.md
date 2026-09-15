<!-- human: specimen -->

# detectors

32 detectors, one to a file. 6 that a regex settles alone (`HARD`) and 26 it can only point at (`REVIEW`).

Generated from the comments by `scripts/detectors-readme.mjs`. Edit the file, not this.

| id | level | langs | detects |
| --- | --- | --- | --- |
| [`em-dash`](#em-dash) | HARD | es/en | An em dash or en dash anywhere in a unit. |
| [`semicolon`](#semicolon) | HARD | es/en | A semicolon after a letter. Budget: none. |
| [`curly-quotes`](#curly-quotes) | HARD | es/en | Any curly quote or apostrophe in a unit. Budget: none. |
| [`banned-vocabulary`](#banned-vocabulary) | HARD | es/en | 143 terms, both languages, grouped in the source below by what they are |
| [`negation-framing`](#negation-framing) | HARD | es/en | no es X, es Y · no solo · más que X, es Y · it's not X, it's Y · not just. |
| [`ai-transition`](#ai-transition) | HARD | es/en | A sentence opening on Además, · Asimismo, · Por otro lado, · Es evidente |
| [`subjectless-fragment`](#subjectless-fragment) | REVIEW | es/en | A sentence of six words or fewer opening on a preposition or a negation, |
| [`heading-no-subject`](#heading-no-subject) | REVIEW | es/en | A heading opening on an interrogative or a subordinator, carrying no |
| [`agentless-passive`](#agentless-passive) | REVIEW | es | se paga · se decide · se toma · se guarda · se mide and company. |
| [`pseudo-cleft`](#pseudo-cleft) | REVIEW | es/en | A sentence opening Lo que ... es · La que ... es · What ... is. |
| [`anaphora`](#anaphora) | REVIEW | es/en | Two consecutive sentences opening the same way. One shared word is enough |
| [`polyptoton`](#polyptoton) | REVIEW | es/en | One root repeating three or more times close together: within about forty |
| [`mid-sentence-colon`](#mid-sentence-colon) | REVIEW | es/en | A colon followed by a lowercase letter. |
| [`aphorism-closer`](#aphorism-closer) | REVIEW | es/en | The last sentence of a unit over 20 words, itself between 4 and 10 words. |
| [`deictic-pivot`](#deictic-pivot) | REVIEW | es/en | A sentence of eight words or fewer opening on Eso · Esto · Ahí · Y ahí · |
| [`significance`](#significance) | REVIEW | es/en | es la definición de · es el corazón de · es la clave · ahí está la magia · |
| [`tricolon`](#tricolon) | REVIEW | es/en | Exactly three comma-separated members, each six words or fewer, sharing |
| [`stacked-appositive`](#stacked-appositive) | REVIEW | es/en | A clause ending in two comma-flanked add-ons, the first usually one punchy |
| [`thesis-opener`](#thesis-opener) | REVIEW | es/en | A paragraph opening Lo difícil es · La clave es · El problema es · The hard |
| [`pattern-announcement`](#pattern-announcement) | REVIEW | es/en | El patrón es · La regla es · La idea es · El truco está. |
| [`turns-out`](#turns-out) | REVIEW | es/en | resulta que · lo curioso es · turns out. |
| [`participial-setup`](#participial-setup) | REVIEW | es/en | A sentence opening Con X hecho y Y puesto, · Una vez definido X, · Having |
| [`performative-humility`](#performative-humility) | REVIEW | es/en | el límite honesto · para ser justos · hay que reconocer · algunas |
| [`stacked-superlative`](#stacked-superlative) | REVIEW | es/en | todavía más · aún más · muchísimo más · absolutamente esencial, attached to |
| [`parallel-subject-mirror`](#parallel-subject-mirror) | REVIEW | es/en | Two consecutive sentences opening on the same determiner with a different |
| [`hedges`](#hedges) | REVIEW | es/en | generalmente · por lo general · suele + verbo · en muchos casos · quizás · |
| [`negated-echo`](#negated-echo) | REVIEW | es/en | A sentence that lands, then hangs a short negative clause off the end which |
| [`corporate-metaphor`](#corporate-metaphor) | REVIEW | es/en | A consulting-deck word standing where a mechanism belongs. |
| [`peninsular-spanish`](#peninsular-spanish) | REVIEW | es | Peninsular vocabulary in text written for Latin America. The usual way it |
| [`english-calque`](#english-calque) | REVIEW | es | An English idiom translated word for word. It parses, it means something, |
| [`nominalized-particle`](#nominalized-particle) | REVIEW | es | A possessive turning "sí" or "no" into a noun: "esperando tu sí", |
| [`elevated-register`](#elevated-register) | REVIEW | es | A thesis word where the plain one fits: enunciar · dilucidar · esgrimir · |

## Adding one

Copy the nearest file, keep the comment shape, and add it to the list in `index.js`. The list is explicit on purpose: auto-discovery lets a file with a typo silently not register, and a pattern that is never checked reads exactly like a pattern that found nothing.

Then `npm test`, which fails if the id is undocumented, if the detector never fires against the fixtures, or if a register watches an id that is not there.

---

### em-dash

`em-dash.js` · **HARD** · es/en · budget 3 per 1000 words

**Detects.** An em dash or en dash anywhere in a unit.
Budget: one per 300 words. Under 300 words, none.

**Fix.** A period, a comma, parentheses, or cut the aside entirely. Usually the
whole aside was the problem.

```
before   La tarea corre sola — y deja el registro.
after    La tarea corre sola, y deja el registro.
```

**Not this.** The hyphen in a compound word, or in a numeric range (10-20).

**Why.** The most reliable single tell there is. Models use it at three to five
times the human rate, and it survives rewriting because it still looks
elegant to whoever is doing the rewriting.


### semicolon

`semicolon.js` · **HARD** · es/en

**Detects.** A semicolon after a letter. Budget: none.

**Fix.** A period, almost always. "y" / "pero" / "así que" when the relation matters.

```
before   Nadie mide; nadie lo nota.
after    Nadie mide, así que nadie lo nota.
```

**Not this.** A list whose items already carry commas: "Caracas, Venezuela; Bogotá, Colombia".

**Why.** Prose outside academic or legal writing almost never uses one, so every
appearance is worth treating as a bug until proven otherwise.


### curly-quotes

`curly-quotes.js` · **HARD** · es/en

**Detects.** Any curly quote or apostrophe in a unit. Budget: none.

**Fix.** Find and replace with straight quotes before shipping.

```
before   Dijo “hola”.
after    Dijo "hola".
```

**Not this.** Nothing. Unless the house style is typographic quotes, in which case turn
this one off for that project.

**Why.** A single character that gives it away and survives any amount of rewriting,
because nobody reaches for it while typing.


### banned-vocabulary

`banned-vocabulary.js` · **HARD** · es/en

**Detects.** 143 terms, both languages, grouped in the source below by what they are
doing: core vocabulary, hedges and filler, formula openers and closers,
significance inflation, promotional register. Spanish carries its gender
and number endings, because robusto did not match robusta for an afternoon.

en: delve · comprehensive · foster · pivotal · showcase · a myriad of ·
in conclusion · at the end of the day · breathtaking
es: profundizar · exhaustivo · fomentar · piedra angular · cabe señalar ·
en síntesis · a día de hoy · juega un papel clave

**Fix.** The concrete word the domain would use. utilizar becomes usar. robusto
becomes whatever it actually does: "aguanta 4.000 corridas al día".

```
before   Una plataforma robusta y comprehensiva.
after    Aguanta 4.000 corridas al día.
```

**Not this.** "Integral" in its mathematical sense. "Crucial" inside a quotation. And
"leverage", which is out on the evidence: every occurrence across 34,000
words was the noun, most with a number beside it. The verb still counts
when it takes an object.

**Why.** These sit at the top of the model's distribution and nowhere near the top
of a person's. Across 58 pieces by one author the whole list fired sixteen
times and every hit was real, which is the density a closed list has to
keep: one that fires on every page gets turned off.


### negation-framing

`negation-framing.js` · **HARD** · es/en

**Detects.** no es X, es Y · no solo · más que X, es Y · it's not X, it's Y · not just.

**Fix.** Say what the thing is. The negated half almost never carries anything.

```
before   No es una herramienta, es una plataforma.
after    Es una plataforma.
```

**Not this.** A negation with content of its own: "se envuelve y se pasa, o se registra
y se detiene".

**Why.** The pivot manufactures contrast where there is only one claim, and it
survives into poetry and marketing copy wearing a nicer coat.


### ai-transition

`ai-transition.js` · **HARD** · es/en

**Detects.** A sentence opening on Además, · Asimismo, · Por otro lado, · Es evidente
que · Como se mencionó · Furthermore, · Moreover, · Additionally,.

**Fix.** Delete it. The next sentence stands on its own, and if a bridge is needed,
"Y" is the bridge.

```
before   Además, el equipo trabaja.
after    El equipo trabaja.
```

**Not this.** "además" mid-sentence, which is ordinary speech.

**Why.** Connective scaffolding a person does not need and a model reaches for by
default. The pattern must not end in a word boundary: after a comma one
never holds, and this matched nothing at all until that was found.


### subjectless-fragment

`subjectless-fragment.js` · **REVIEW** · es/en

**Detects.** A sentence of six words or fewer opening on a preposition or a negation,
with nobody in it doing anything.

**Fix.** Give it back its subject, or fold it into the sentence beside it. Do not
delete it: the rhythm rules want short sentences. What is wrong is the
missing actor, never the length.

```
before   Nunca de un modelo. Corre en cada fase futura.
after    Lo escribes tú, nunca un modelo. Corre en cada fase futura.
```

**Not this.** A short sentence with a subject: "Me pasa seguido."
A list of names: "Claude Code, Codex."
An answer to a when: "Siempre." · "Antes del pull request."

**Why.** The thing a humanizing pass most often introduces while fixing something
else, because compressing and landing feels like good editing. With a
subject it is a sentence; without one it is a slogan.

> printed beside the count: an answer to a when (Antes del pull request.) is legitimate


### heading-no-subject

`heading-no-subject.js` · **REVIEW** · es/en

**Detects.** A heading opening on an interrogative or a subordinator, carrying no
determiner and no proper noun. Vive qué. Va qué. Atraviesa qué.

**Fix.** Put the noun in.

```
before   Dónde vive · Cuando se te atraviesa
after    Dónde vive cada regla · Cuando una regla te frena
```

**Not this.** A heading that already names the thing: "En qué va Orbit", "Qué es una
regla".

**Why.** A reader skimming headings should not have to reconstruct the noun from
the section body. It is the dangling-antecedent bug in a bigger font, and
headings get skipped in review more than any other unit.

> printed beside the count: lives where? goes where? crosses what?


### agentless-passive

`agentless-passive.js` · **REVIEW** · es

**Detects.** se paga · se decide · se toma · se guarda · se mide and company.

**Fix.** Name who. Especially when the paragraph is about there being somebody who
does it.

```
before   ese precio se paga a sabiendas
after    ese precio lo pagas sabiendo
```

**Not this.** A real impersonal where the actor does not matter: "se parte por la costura".

**Why.** It removes the actor from a sentence whose point is that there is one, and
it usually hides that no concrete method was ever named.

> printed beside the count: only counts where the sentence is about what somebody does


### pseudo-cleft

`pseudo-cleft.js` · **REVIEW** · es/en

**Detects.** A sentence opening Lo que ... es · La que ... es · What ... is.

**Fix.** Put the subject first and open on the concrete case.

```
before   Lo que se guarda es la fricción.
after    Orbit solo escribe lo que estorbó.
```

**Not this.** A definition that was asked for, or a name: "Lo que Orbit sabe" as a screen title.

**Why.** Glossary syntax. The subject sits behind a relative clause so a term can
arrive like a reveal, and the section slips into explainer mode instead of
saying something.


### anaphora

`anaphora.js` · **REVIEW** · es/en

**Detects.** Two consecutive sentences opening the same way. One shared word is enough
when it carries weight ("Nadie mira. Nadie revisa."); with a determiner it
takes two.

**Fix.** Vary the second opener, or join them into one sentence.

```
before   Activa entra. Pausada la frenaste. Apagada decidiste que no.
after    Solo la activa entra al prompt. La pausada la frenaste tú, y la
apagada se queda sin decirse.
```

**Not this.** A table or a list, where the parallel is the structure.

**Why.** It reads as cadence rather than argument, and three in a row is a signature.


### polyptoton

`polyptoton.js` · **REVIEW** · es/en

**Detects.** One root repeating three or more times close together: within about forty
words of running text.

**Fix.** Name the two things separately, in plain words.

```
before   Un número que se imprime y se ignora es un número que se va.
after    Un número que se imprime y nadie mira se va cayendo de a poco.
```

**Not this.** The canonical noun repeating on purpose. A paragraph about rules says
"regla" many times, and cycling synonyms for it is the worse tell. Nor a
word coming back three sentences later: a subject stays the subject.

**Why.** Circularity reads as insight and says nothing. Density is what separates it
from ordinary repetition, which is why the window exists: counting across a
whole paragraph flagged "cambias ... cambia el motor ... cambias", a
sentence each apart in a paragraph about changing engines, and the rewrite
that followed was worse than what it replaced.

> printed beside the count: the canonical noun repeats on purpose


### mid-sentence-colon

`mid-sentence-colon.js` · **REVIEW** · es/en

**Detects.** A colon followed by a lowercase letter.

**Fix.** Split in two, or rewrite. At most one per paragraph outside lists.

```
before   La respuesta es: empezar antes.
after    Empieza antes.
```

**Not this.** A colon after a complete clause, which is correct and common: "Cuatro
comandos, y el único que tienes que pensar es el tercero: apuntar la sala
de control."

**Why.** Mid-thought it is a reveal device. At the end of a clause it is punctuation.

> printed beside the count: fine when a complete clause comes before it


### aphorism-closer

`aphorism-closer.js` · **REVIEW** · es/en

**Detects.** The last sentence of a unit over 20 words, itself between 4 and 10 words.

**Fix.** Cut it, or fold it into the sentence before.

```
before   Un gate que pasa no se anota. Se guarda la fricción.
after    Un gate que pasa ni se anota. Orbit solo escribe lo que estorbó.
```

**Not this.** A paragraph ending on its last fact. The test: if the sentence can be
lifted out and quoted alone, it is this.

**Why.** The strongest habit in generated prose and the one an edit pass most often
introduces: a paragraph feels unfinished without a bow, so one gets
appended. Re-check the last sentence of every paragraph on every pass.

> printed beside the count: a paragraph may end on its last fact


### deictic-pivot

`deictic-pivot.js` · **REVIEW** · es/en

**Detects.** A sentence of eight words or fewer opening on Eso · Esto · Ahí · Y ahí ·
Así es.

**Fix.** Cut it and let the next sentence carry the weight, or fold it into the one
before.

```
before   Ahí un modelo ayuda.
after    (gone)
```

**Not this.** An "Eso" that really points at something just named and the sentence
continues from it.

**Why.** A drumbeat the prose did not earn: it delivers a tidy verdict on what was
just said, or ushers in the next subject, and adds nothing either way.


### significance

`significance.js` · **REVIEW** · es/en

**Detects.** es la definición de · es el corazón de · es la clave · ahí está la magia ·
stands as a testament.

**Fix.** A plain functional lead-in, and let the reader judge.

```
before   make check, que es la definición de terminado.
after    Todos se corren con make check.
```

**Not this.** A direct quotation of somebody else saying it.

**Why.** The label tells the reader how to rate the thing instead of letting the
thing land, and it reads as ceremony the artifact never asked for.


### tricolon

`tricolon.js` · **REVIEW** · es/en

**Detects.** Exactly three comma-separated members, each six words or fewer, sharing
their grammar.

**Fix.** Break the third into its own sentence, join two with "y", or reduce to two.

```
before   Rápido, barato, confiable.
after    Rápido y barato. Confiable es otra conversación.
```

**Not this.** A real inventory of six things, which is content: "todo, un lenguaje, un
repositorio, un directorio, un archivo, un símbolo".

**Why.** Three parallel beats escalating in weight is cadence. Counting every comma
series instead finds the inventories and buries the two real hits.

> printed beside the count: a real inventory of three things is not one


### stacked-appositive

`stacked-appositive.js` · **REVIEW** · es/en

**Detects.** A clause ending in two comma-flanked add-ons, the first usually one punchy
word.

**Fix.** Keep one, and make it the concrete one.

```
before   explica por qué, en palabras, en tu idioma
after    explica por qué, en tu idioma
```

**Not this.** A single aside, which is ordinary punctuation.

**Why.** Cadence, not content: the short one is an intensifier standing in for a
measurement, and the second repeats it.


### thesis-opener

`thesis-opener.js` · **REVIEW** · es/en

**Detects.** A paragraph opening Lo difícil es · La clave es · El problema es · The hard
part.

**Fix.** Start on the concrete case and let the thesis emerge.

```
before   Lo difícil fue el despliegue.
after    En 2019 subí un rate limiter que se cayó a la hora.
```

**Not this.** A heading, where stating the claim is right.

**Why.** The frame arrives before the thing it frames, so the reader is told how to
read something they have not seen yet.


### pattern-announcement

`pattern-announcement.js` · **REVIEW** · es/en

**Detects.** El patrón es · La regla es · La idea es · El truco está.

**Fix.** Describe it directly, without introducing it.

```
before   La regla es simple: no toques migraciones.
after    Las migraciones no se editan a mano.
```

**Not this.** A rule quoted verbatim from a document.

**Why.** Naming a pattern before describing it spends a sentence on ceremony.


### turns-out

`turns-out.js` · **REVIEW** · es/en

**Detects.** resulta que · lo curioso es · turns out.

**Fix.** State the finding directly.

```
before   Resulta que la causa era otra.
after    La causa era el índice, no la consulta.
```

**Not this.** "resultar" as an ordinary verb: "el gate resulta en error".

**Why.** Reveal-narrative framing laid over a plain fact.


### participial-setup

`participial-setup.js` · **REVIEW** · es/en

**Detects.** A sentence opening Con X hecho y Y puesto, · Una vez definido X, · Having
done X,.

**Fix.** Lead with the subject and the action. If the clause restates the heading in
fancier words, cut the sentence.

```
before   Con la definición hecha y los límites puestos, el modelo produce.
after    El modelo produce más rápido de lo que alcanzas a leer.
```

**Not this.** A real temporal condition the reader needs.

**Why.** The symmetry is the tell: two balanced participles stacking conditions and
holding the reader off before the subject arrives.


### performative-humility

`performative-humility.js` · **REVIEW** · es/en

**Detects.** el límite honesto · para ser justos · hay que reconocer · algunas
salvedades · to be fair · a few caveats.

**Fix.** Fold the caveat that genuinely qualifies a claim into the sentence making
it, and delete the rest.

```
before   El límite honesto: no lo he probado a escala.
after    Lo he corrido hasta 4.000 al día.
```

**Not this.** Nothing. A section announcing that you are about to be honest was not being
honest.

**Why.** Announcing the virtue replaces demonstrating it, and what follows is
usually a defence against a criticism nobody made.


### stacked-superlative

`stacked-superlative.js` · **REVIEW** · es/en

**Detects.** todavía más · aún más · muchísimo más · absolutamente esencial, attached to
a claim already at the top of its scale.

**Fix.** Keep the first claim and replace the escalation with the concrete mechanism.

```
before   La decisión más difícil, y eso la hace todavía más dura.
after    La decisión más difícil, porque hay más cosas que podrían encajar.
```

**Not this.** A comparison with numbers behind it.

**Why.** The second escalation is unearned and costs the first claim its credibility.


### parallel-subject-mirror

`parallel-subject-mirror.js` · **REVIEW** · es/en

**Detects.** Two consecutive sentences opening on the same determiner with a different
noun.

**Fix.** Vary one of the two subjects, or join them.

```
before   El código es una cosa. El mantenimiento es otra.
after    Escribir el código cuesta una semana, y mantenerlo cuesta los tres
años siguientes.
```

**Not this.** A table, or an enumeration where the mirror is the structure.

**Why.** Mirrored openers read as a rhetorical figure rather than two facts, and the
symmetry usually hides that the second half adds nothing.


### hedges

`hedges.js` · **REVIEW** · es/en

**Detects.** generalmente · por lo general · suele + verbo · en muchos casos · quizás ·
generally · typically · often.

**Fix.** Assert directly. If a real exception exists, name it: "esto se rompe cuando X".

```
before   Generalmente los equipos suelen ignorar esto.
after    De los seis equipos con los que he trabajado, cinco no lo miraban.
```

**Not this.** Real uncertainty stated with its conditions, which is honesty rather than a
softener.

**Why.** Hedge density is one of the measured signals, and a softener is what goes in
when the writer has no number to put there. "suele" took any verb after the
list only caught "suele ser", and "suele venir" walked past it.

> printed beside the count: real uncertainty is stated with its conditions, not with a softener


### negated-echo

`negated-echo.js` · **REVIEW** · es/en

**Detects.** A sentence that lands, then hangs a short negative clause off the end which
echoes what it just said: "y esta vez no vino" after "qué suele venir".

**Fix.** End on the landing. If the negative half carries a fact, give it its own
sentence and its own subject.

```
before   te dice qué suele venir junto con estos archivos y esta vez no vino
after    te dice qué viene junto con estos archivos. Esta vez el test no vino.
```

**Not this.** A negation that carries new information rather than mirroring the clause
before it. Nor "decidió no hacer", where the infinitive is the object.

**Why.** The mirrored negative is cadence, not content: the sentence had finished
and the tail exists to close it with a beat. It survives editing because
the symmetry reads as precision.

> printed beside the count: a negation carrying its own half is not this


### corporate-metaphor

`corporate-metaphor.js` · **REVIEW** · es/en

**Detects.** A consulting-deck word standing where a mechanism belongs.
es: silo · ecosistema · sinergia · palanca · hoja de ruta · bala de plata ·
estado del arte · disruptivo · empoderar · holístico · salsa secreta
en: silo · ecosystem · synergy · low-hanging fruit · move the needle ·
silver bullet · game-changer · state of the art · holistic · empower ·
north star · secret sauce

**Fix.** Say the mechanism. The metaphor is usually covering for a fact the writer
had and did not reach for.

```
before   CLAUDE.md y AGENTS.md son silos que se vacían el día que cambia el motor.
after    CLAUDE.md lo lee Claude y AGENTS.md lo lee Codex. Cambias de motor y el
nuevo no sabe nada de lo que decía el otro.
```

**Not this.** The word used on purpose, about the thing it names: "cada área en su silo"
is a sentence about organisations, not a metaphor hiding a mechanism.

**Why.** REVIEW and never HARD, because a regex finds the word and the word is not
the tell. What makes it one is standing in for a mechanism the writer could
have described, and only a reader can see that. "roadmap" is not on the
list: in a corpus of 58 pieces it appeared six times, always as the plain
name of a plan, which is what a word earns its place back by doing.

> printed beside the count: the word used about the thing it names is not this


### peninsular-spanish

`peninsular-spanish.js` · **REVIEW** · es

**Detects.** Peninsular vocabulary in text written for Latin America. The usual way it
arrives is translation: an English word has one obvious Spanish equivalent
and it is the Madrid one.

tirar (botar) · coger (agarrar) · ordenador (computadora) · móvil (celular)
vale (dale) · zumo (jugo) · piso (apartamento) · conducir (manejar)
aparcar (estacionar) · fichero (archivo) · ratón (mouse) · gafas (lentes)
billete (boleto) · patata (papa) · nevera (refrigerador) · grifo (llave)

**Fix.** The word the reader would use. It is one substitution and it costs nothing.

```
before   y nada se tira porque te molestó una vez
after    y no pierdes una regla porque te molestó una vez
```

**Not this.** The word in a sense both regions share: "tirar de la cuerda", "coger el
ritmo", "un piso de la torre", "cuánto vale" from the verb valer. Nor a
quotation of somebody who talks that way.

**Why.** It does not read as a mistake. It reads as somebody who is not from here,
which is a worse thing for a page whose whole argument is that a person
wrote it. And it is the cheapest tell to fix and the hardest to notice,
because the sentence is grammatical and the meaning arrives.

> printed beside the count: the sense both regions share is not this


### english-calque

`english-calque.js` · **REVIEW** · es

**Detects.** An English idiom translated word for word. It parses, it means something,
and nobody says it.

dar contra una pared (trabarse) · aplicar para (postularse a)
en la misma página (de acuerdo)
tomar un paso atrás (dar un paso atrás) · al final del día (a fin de cuentas)
correr un test (pasar un test) · manejar un error (gestionar un error)
remover (quitar) · asumir que (suponer que) · realizar que (darse cuenta)
soportar (mantener, en el sentido de support) · consistente con (acorde a)
regla ancha / estrecha (amplia, general / acotada), de wide y narrow

**Fix.** The phrase somebody here would say. If none exists, the idea was borrowed
along with the words and is worth restating.

```
before   Un agente que se da contra una pared a mitad de tarea
after    Un agente que se traba a mitad de tarea
```

**Not this.** A term the industry uses in English on purpose: commit, deploy, pull
request, chargeback. Nor a calque that won: "hacer sentido" and "librería"
are what Spanish-speaking programmers say, and a detector that argues with
an entire profession is one that gets turned off. A corpus check settles
which is which: four uses across 29 pieces by one careful writer means the
word is theirs, not a slip.

**Why.** This is what translation leaves behind, and it is the tell a reader feels
without naming: the grammar is Spanish and the thinking is not. It is
worse than a wrong word because nothing is technically wrong.

> printed beside the count: an English term the industry keeps on purpose is not this


### nominalized-particle

`nominalized-particle.js` · **REVIEW** · es

**Detects.** A possessive turning "sí" or "no" into a noun: "esperando tu sí",
"un correo con su no", "espera mi no".

**Fix.** Say the thing being waited for. Approval, permission, an answer, a refusal.

```
before   Queda esperando tu sí.
after    Queda esperando tu aprobación.
```

**Not this.** "dar el sí" and "un sí o un no", which are ordinary Spanish, or a "tu no"
that is a negated verb: "tu no sabe nada".

**Why.** Compression a writer reaches for and a speaker does not. It reads as
composed rather than said, and it costs the sentence its concrete noun: the
reader has to work out whether what is being waited for is approval,
permission or a decision. Across 6,871 sentences of one author it appeared
zero times, which is the shape a useful detector has.

> printed beside the count: dar el si and un si o un no are ordinary Spanish


### elevated-register

`elevated-register.js` · **REVIEW** · es

**Detects.** A thesis word where the plain one fits: enunciar · dilucidar · esgrimir ·
plasmar · ostentar · propiciar · aunar · vislumbrar · coadyuvar ·
subyacer · devenir · acaecer · conllevar · ergo · empero · asimismo ·
en aras de · a la sazón · por ende · no obstante · habida cuenta.

**Fix.** The word somebody would say out loud. enunciar becomes decir or escribir,
conllevar becomes traer, en aras de becomes para.

```
before   es una regla que nadie enunció
after    es una regla que nunca escribiste
```

**Not this.** The word in a register that asks for it: a legal clause, a quotation, an
academic paper. Nor a term with no plain equivalent in its field.

**Why.** A model reaches for the formal synonym because it is the safer token, and
the sentence lands a register above the rest of the page. One of these in
a casual paragraph is heard the way a tie is seen at a barbecue.

> printed beside the count: a register that asks for it is not this

