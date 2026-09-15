---
name: human
description: >
  Use when a draft has to be checked for AI tells before it ships: the user asks
  "does this sound like AI", "revisa si esto suena a IA", "check this before I
  publish", or has just finished writing or rewriting anything that will be read
  by someone else. Also use after any humanizing pass, because a rewrite
  introduces tells at the same rate as a first draft. Counts the patterns with a
  program instead of reading for them, in Spanish and English.
---

<!-- human: specimen -->

# human

Counts the AI tells in a draft, names them, and fails when one is over budget.

It exists because the usual way of checking does not work. The usual way is to
read the text and ask "does anything here look generated?", which puts the
writer in charge of deciding what is suspicious. Nothing is suspicious to the
person who wrote it. Every miss this was built from had the same shape:
draft read, nothing jumped out, pass declared clean, four tells still in it.

So nothing here asks you to read for a pattern. A detector goes item by item,
scans every unit in the document for that one pattern, and prints the count.
Including the zeros. You judge what the report hands you, and nothing else.

---

## Before writing: the register

Half of what reads as generated is a word that belongs somewhere else.
*Enunciar* is right in a thesis. *Oferta* is right in sales copy. *Palanca* is
right in a business deck. None of them is wrong, and all of them are wrong
somewhere, so what the text is for has to be settled before a line of it exists.

**Read the register first, not after.** If the project has a `.human.toml` with
a `[write] register`, print it and follow it:

```bash
human --registers          # what a piece of writing can be for
human --register=sales     # the one this project picked
```

Twelve ship with the tool: blog, sales, product, linkedin, technical, docs,
narrative, opinion, academic, formal, informal, announcement. Each is a file in
`registers/`, so adding one is writing a file.

With the hooks installed this arrives on its own: a `PreToolUse` hook hands over
the declared register the first time in a session that you write prose. A
register moves nothing in the counting. It steers the drafting, and it names the
patterns that cost more in that register than elsewhere, which the report marks
with a `·`. A hedge in a thesis is precision. The same hedge in sales copy is a
writer with no number to put there.

---

## The writer's own voice

If `registers/voice-<name>.toml` exists, read it before drafting. It is measured
from that person's chat history, which is the only writing of theirs no model
touched, and it carries the shape to write toward: sentence lengths, how they
open a thought, the words they reach for.

```bash
human-voice ~/.claude/projects --write=yourname
```

It never leaves the machine it was made on. Nothing to share and nothing to
publish: whoever clones this runs it against their own history and gets theirs.

---

## Run it

```bash
human FILE [FILE...]        # markdown or html
human FILE --only=REVIEW    # skip what a regex already settled
human FILE --ignore=ok.txt  # one exact sentence per line, skipped
```

Exit code is the number of budgets exceeded, so it works as a pre-commit hook or
a CI gate. That is the point of it: "is this clean?" stops being a question the
writer answers about their own draft.

---

## The cold read

A regex counts patterns. It does not read, so it never catches a number that
contradicts another number, a term used ninety lines before it is explained, or
an example borrowed from a domain the page never mentioned. On one landing page
that passed every detector clean, a reader found thirty of those.

That reader must not be whoever wrote the draft. Rewriting your own text anchors
you to what you meant rather than what is on the page, which is the same failure
this whole thing exists to work around. So a subagent gets the file and nothing
else.

**Run it after the counts are clean, before showing anybody.** Dispatch a
general-purpose subagent with this, filling in the file and what the piece is:

> Lee este archivo como lector, no como revisor de estilo: `PATH`
>
> DESCRIPTION OF WHAT IT IS AND WHO READS IT.
>
> NO revises ortografía, gramática ni patrones de estilo: eso ya lo hace un
> script. Tu trabajo es leerlo de arriba abajo como alguien que llega por
> primera vez.
>
> Reporta solo estas nueve cosas, y solo donde de verdad ocurran:
>
> 1. **Dónde tropiezas.** Una frase que tuviste que releer. Cita la frase y di
>    qué te hizo parar.
> 2. **Qué palabra no entiendes.** Un término que se usa antes de explicarse, o
>    que nunca se explica. Cita dónde aparece por primera vez.
> 3. **Qué referencia no tiene antecedente.** Un "esto", "eso", "la que" que
>    apunta a algo poco claro.
> 4. **Qué contradicción encuentras.** Un número o una afirmación que no cuadra
>    con otra parte.
> 5. **Qué frase está armada para sonar.** Tres moldes concretos. Afirmación,
>    dos puntos, y tres cosas donde la tercera es más abstracta que las dos
>    primeras. La cláusula final que explica el porqué, puesta ahí para rematar.
>    El encabezado que es una frase con remate en vez de una etiqueta. Cita la
>    frase y escríbela plana.
> 6. **Qué se repite a lo largo del texto.** La misma forma de frase o de
>    encabezado tres veces o más. También la misma familia de palabras suelta
>    por toda la página, una vez por sección: "sólo", "solos", "solas". Cita
>    las tres apariciones.
> 7. **Qué frase existe sólo para montar la siguiente.** La primera mitad no
>    aporta nada por sí sola y está ahí para que la segunda caiga bien: "Un hook
>    corre solo, sin que te acuerdes". La versión con "pero" es la misma cosa:
>    "cambia la raya, pero la negación no". Cita el par y escribe sólo la parte
>    que carga el dato.
> 8. **Qué promete el encabezado que el cuerpo no entrega.** El título anuncia
>    una cuenta o una categoría ("Los dos límites", "Tres grupos") y el texto de
>    abajo nunca los nombra como tales. Di qué esperabas encontrar y qué
>    encontraste.
> 9. **Quién habla.** Lo escribió quien hizo la cosa, y suena a un tercero
>    contándola: "hay que reescribirla", "se recomienda", "el usuario debe".
>    Cita la frase y escríbela como se la dirías a alguien de frente.
>
> Para cada hallazgo: la frase exacta entre comillas, una línea de por qué te
> hizo parar, y cómo lo dirías. Si una categoría está limpia, omítela entera. No
> resumas, no elogies, no des veredicto general, no listes lo que está bien.

The nine categories are doing the work. A general "does this read as AI?" comes
back with style notes the counting already covers, and a request for a verdict
comes back with a verdict. Asking where a reader stopped gets the places a
reader stopped.

Five through nine came from a person, not from a counter. Reading the same landing,
he pointed at three sentences in a row that every detector had passed, and all
three were built the same way: a clause at the end doing rhetoric instead of
carrying information. The author of those sentences could not see it, which is
the whole argument for handing the file to somebody else.

**Then re-run the counts.** Fixing thirty findings introduced six new tells on
that page: a deictic pivot, two polyptotons, a parallel-subject mirror, an
agentless passive and a negated echo, every one of them written while fixing
something else.

---

## The hooks

A skill cannot make anybody follow it, which is the gap everything above sits
in. `human-hooks` adds three entries to Claude Code's settings: the register
before a write, and the counts after every write to prose, unasked.

```bash
human-hooks            # asks first
human-hooks --remove   # undoes it
```

**When the report arrives on its own, act on it before writing the next
sentence.** The failure it was built for is not skipping the check. It is
reading the counts and carrying on. On the session this came from, a detector
was written for a pattern and the pattern left in the page it was found on.

---

## The loop

A report on its own changes nothing. The cycle is:

```
run  →  fix  →  run again  →  cold read  →  fix  →  run again  →  until it holds
```

**Every fix is a new draft, so check it like one.** A correction comes from the
same hand that wrote the tell, and it arrives with more pressure to sound right
than the original had. Run the counts again over the whole file, and read your
new sentences against the seven cold-read categories, before you call anything
clean. Never report a pass on a round whose own fixes nobody checked.

**The program accepts, the model fixes.** Rewriting takes judgement and a regex
has none. Deciding whether it is now clean takes counting and a writer has none
about their own prose. Neither half works alone.

**Re-run over the whole document, never only the lines you touched.** A fix
writes new tells while it removes old ones, and they are harder to see because
they feel like corrections. Most third-pass hits were written by the second-pass
fix for something else.

**The counter cannot check the fix you just wrote.** Categories five, six and
seven of the cold read sit outside every detector, so a rewrite that clears a
counted tell can add an uncounted one and the report still comes back at zero.
After each round, read your own new sentences against those three categories,
and hand the file to the cold reader again before it ships. On this page, "un
hook corre solo, sin que te acuerdes" got replaced by a sentence carrying two
fresh flourishes, and the counts never moved.

**Change the flagged words and leave the rest of the sentence alone.** A
rewrite done to fix one thing drops whatever already worked, and the next round
puts it back, and six rounds later the line is worse than round two was. Keep
the corrections as a list and apply them on top of the last version somebody
approved, cumulatively, byte for byte everywhere they do not reach.

**Scope each fix to the flagged sentence and its neighbour.** Rewriting the
whole paragraph every round drifts the meaning, and by the fourth round the text
says something the author never approved.

**If you already explained it clearly in conversation, that is the text.** The
version written to answer a question carries the frame first, then the items,
numbered. Turning it into flowing prose for the page is what loses the reader,
and the round after that is spent putting the numbers back. Paste what worked.

**Stop at three rounds.** Past three you are over-editing into choppy, voiceless
prose. Whatever is left, report it with its count and let the author decide.

**Put the author's own lines in `--ignore`.** A quoted sentence from a project's
own docs trips several detectors and is right as it stands. Without the ignore
file it gets flagged every round forever, and a report that repeats a
non-finding is a report that stops being opened.

---

## The two levels

**HARD.** The regex settles it, and no reading of the sentence changes the
answer. Over budget means broken, and the exit code counts it.

**REVIEW.** The regex can point but cannot rule. Whether it is a tell depends on
what the sentence is doing, so every one of these carries a **Not this** that
says what the legitimate version looks like. Read only these, and only the lines
printed under them.

The split is load-bearing. Mixed together, the real findings sit under a pile of
false positives and the report gets opened once.

---

## Calibrating

Every threshold is a judgement somebody made once. Defensible, not universal: a
technical reference repeats its subject nouns more than an essay does, and a
writer who never writes a four-word sentence will not start because a tool asked.

```bash
human-calibrate posts/*.md              # what the corpus actually does
human-calibrate posts/*.md --write .    # write .human.toml there
```

The corpus has to be prose nobody edited with this tool. Calibrating on text
these thresholds already shaped measures the thresholds, not the writer.

Run against 34,000 words of one author it found two things worth the trouble.
The hard rules held: em dashes, semicolons, curly quotes and AI transitions came
back at exactly zero across 29 pieces, so a single one is worth stopping for.
And `trios` was set to zero when that author's own median is three, which means
the rule had been rewriting their rhythm rather than catching a fault in it.

One judgement the calibrator makes for you: thresholds come from the corpus p90,
except `trios`, which comes from the median. The p90 of any corpus is its worst
pages, and a threshold set there only speaks up once a draft is past saving.

---

## RHYTHM

Measured over running prose, which is paragraphs and quotes. A heading or a
table cell has no rhythm, and counting them drags every number toward "short".

### spread, longest to shortest

**Detects.** The longest sentence minus the shortest, in words.
**Fix.** Join two middling sentences into one that earns its length, and break
another into a fragment.
**Before → after.** `[16, 13, 17, 14]` → `[29, 4, 17, 14]`
**Not this.** A text under 80 words, where it does not apply.

### share in the 10-20 band

**Detects.** Percentage of sentences between 10 and 20 words.
**Fix.** Break half of them. Meeting the spread with one fragment and one long
sentence while everything else sits at 12-16 still reads uniform.
**Before → after.** `[5, 12, 14, 16, 13, 31]` (67%) → `[5, 26, 14, 16, 13, 31]` (50%)
**Not this.** Nothing. It is the most stable measured tell there is.

### shortest sentence

**Detects.** The shortest sentence in the text. There has to be one of six words
or fewer for every 150 words of output.
**Fix.** Cut a middling sentence in two. The short half stands alone.
**Before → after.** `Me viene pasando seguido, en varios proyectos.` → `Me pasa seguido.`
**Not this.** A subjectless fragment, which is a different tell. A short sentence
still needs somebody doing something.

### runs of three within 5

**Detects.** Three consecutive sentences **inside one paragraph** within five
words of each other.
**Fix.** Merge two, or split one. One is enough to break the drumming.
**Before → after.** `[11, 12, 8]` → `[11, 17, 8]`
**Not this.** Three spread across two sections, which a reader never meets in a row.

---

## HARD

### em-dash

**Detects.** An em dash or en dash anywhere in a unit. Budget: one per 300 words. Under 300 words, none.
**Fix.** A period, a comma, parentheses, or cut the aside entirely. Usually the whole aside was the problem.
**Before → after.** `La tarea corre sola — y deja el registro.` → `La tarea corre sola, y deja el registro.`
**Not this.** The hyphen in a compound word, or in a numeric range (10-20).

### semicolon

**Detects.** A semicolon after a letter. Budget: none.
**Fix.** A period, almost always. "y" / "pero" / "así que" when the relation matters.
**Before → after.** `Nadie mide; nadie lo nota.` → `Nadie mide, así que nadie lo nota.`
**Not this.** A list whose items already carry commas: "Caracas, Venezuela; Bogotá, Colombia".

### curly-quotes

**Detects.** Any curly quote or apostrophe in a unit. Budget: none.
**Fix.** Find and replace with straight quotes before shipping.
**Before → after.** `Dijo “hola”.` → `Dijo "hola".`
**Not this.** Nothing. Unless the house style is typographic quotes, in which case turn this one off for that project.

### banned-vocabulary

**Detects.** 143 terms, both languages, grouped in the source below by what they are doing: core vocabulary, hedges and filler, formula openers and closers, significance inflation, promotional register. Spanish carries its gender and number endings, because robusto did not match robusta for an afternoon. en: delve · comprehensive · foster · pivotal · showcase · a myriad of · in conclusion · at the end of the day · breathtaking es: profundizar · exhaustivo · fomentar · piedra angular · cabe señalar · en síntesis · a día de hoy · juega un papel clave
**Fix.** The concrete word the domain would use. utilizar becomes usar. robusto becomes whatever it actually does: "aguanta 4.000 corridas al día".
**Before → after.** `Una plataforma robusta y comprehensiva.` → `Aguanta 4.000 corridas al día.`
**Not this.** "Integral" in its mathematical sense. "Crucial" inside a quotation. And "leverage", which is out on the evidence: every occurrence across 34,000 words was the noun, most with a number beside it. The verb still counts when it takes an object.

### negation-framing

**Detects.** no es X, es Y · no solo · más que X, es Y · it's not X, it's Y · not just.
**Fix.** Say what the thing is. The negated half almost never carries anything.
**Before → after.** `No es una herramienta, es una plataforma.` → `Es una plataforma.`
**Not this.** A negation with content of its own: "se envuelve y se pasa, o se registra y se detiene".

### ai-transition

**Detects.** A sentence opening on Además, · Asimismo, · Por otro lado, · Es evidente que · Como se mencionó · Furthermore, · Moreover, · Additionally,.
**Fix.** Delete it. The next sentence stands on its own, and if a bridge is needed, "Y" is the bridge.
**Before → after.** `Además, el equipo trabaja.` → `El equipo trabaja.`
**Not this.** "además" mid-sentence, which is ordinary speech.

---

## REVIEW

### subjectless-fragment

**Detects.** A sentence of six words or fewer opening on a preposition or a negation, with nobody in it doing anything.
**Fix.** Give it back its subject, or fold it into the sentence beside it. Do not delete it: the rhythm rules want short sentences. What is wrong is the missing actor, never the length.
**Before → after.** `Nunca de un modelo. Corre en cada fase futura.` → `Lo escribes tú, nunca un modelo. Corre en cada fase futura.`
**Not this.** A short sentence with a subject: "Me pasa seguido." A list of names: "Claude Code, Codex." An answer to a when: "Siempre." · "Antes del pull request."

### heading-no-subject

**Detects.** A heading opening on an interrogative or a subordinator, carrying no determiner and no proper noun. Vive qué. Va qué. Atraviesa qué.
**Fix.** Put the noun in.
**Before → after.** `Dónde vive · Cuando se te atraviesa` → `Dónde vive cada regla · Cuando una regla te frena`
**Not this.** A heading that already names the thing: "En qué va Orbit", "Qué es una regla".

### agentless-passive

**Detects.** se paga · se decide · se toma · se guarda · se mide and company.
**Fix.** Name who. Especially when the paragraph is about there being somebody who does it.
**Before → after.** `ese precio se paga a sabiendas` → `ese precio lo pagas sabiendo`
**Not this.** A real impersonal where the actor does not matter: "se parte por la costura".

### pseudo-cleft

**Detects.** A sentence opening Lo que ... es · La que ... es · What ... is.
**Fix.** Put the subject first and open on the concrete case.
**Before → after.** `Lo que se guarda es la fricción.` → `Orbit solo escribe lo que estorbó.`
**Not this.** A definition that was asked for, or a name: "Lo que Orbit sabe" as a screen title.

### anaphora

**Detects.** Two consecutive sentences opening the same way. One shared word is enough when it carries weight ("Nadie mira. Nadie revisa."); with a determiner it takes two.
**Fix.** Vary the second opener, or join them into one sentence.
**Before → after.** `Activa entra. Pausada la frenaste. Apagada decidiste que no.` → `Solo la activa entra al prompt. La pausada la frenaste tú, y la apagada se queda sin decirse.`
**Not this.** A table or a list, where the parallel is the structure.

### polyptoton

**Detects.** One root repeating three or more times close together: within about forty words of running text.
**Fix.** Name the two things separately, in plain words.
**Before → after.** `Un número que se imprime y se ignora es un número que se va.` → `Un número que se imprime y nadie mira se va cayendo de a poco.`
**Not this.** The canonical noun repeating on purpose. A paragraph about rules says "regla" many times, and cycling synonyms for it is the worse tell. Nor a word coming back three sentences later: a subject stays the subject.

### mid-sentence-colon

**Detects.** A colon followed by a lowercase letter.
**Fix.** Split in two, or rewrite. At most one per paragraph outside lists.
**Before → after.** `La respuesta es: empezar antes.` → `Empieza antes.`
**Not this.** A colon after a complete clause, which is correct and common: "Cuatro comandos, y el único que tienes que pensar es el tercero: apuntar la sala de control."

### aphorism-closer

**Detects.** The last sentence of a unit over 20 words, itself between 4 and 10 words.
**Fix.** Cut it, or fold it into the sentence before.
**Before → after.** `Un gate que pasa no se anota. Se guarda la fricción.` → `Un gate que pasa ni se anota. Orbit solo escribe lo que estorbó.`
**Not this.** A paragraph ending on its last fact. The test: if the sentence can be lifted out and quoted alone, it is this.

### deictic-pivot

**Detects.** A sentence of eight words or fewer opening on Eso · Esto · Ahí · Y ahí · Así es.
**Fix.** Cut it and let the next sentence carry the weight, or fold it into the one before.
**Before → after.** `Ahí un modelo ayuda.` → `(gone)`
**Not this.** An "Eso" that really points at something just named and the sentence continues from it.

### significance

**Detects.** es la definición de · es el corazón de · es la clave · ahí está la magia · stands as a testament.
**Fix.** A plain functional lead-in, and let the reader judge.
**Before → after.** `make check, que es la definición de terminado.` → `Todos se corren con make check.`
**Not this.** A direct quotation of somebody else saying it.

### tricolon

**Detects.** Exactly three comma-separated members, each six words or fewer, sharing their grammar.
**Fix.** Break the third into its own sentence, join two with "y", or reduce to two.
**Before → after.** `Rápido, barato, confiable.` → `Rápido y barato. Confiable es otra conversación.`
**Not this.** A real inventory of six things, which is content: "todo, un lenguaje, un repositorio, un directorio, un archivo, un símbolo".

### stacked-appositive

**Detects.** A clause ending in two comma-flanked add-ons, the first usually one punchy word.
**Fix.** Keep one, and make it the concrete one.
**Before → after.** `explica por qué, en palabras, en tu idioma` → `explica por qué, en tu idioma`
**Not this.** A single aside, which is ordinary punctuation.

### thesis-opener

**Detects.** A paragraph opening Lo difícil es · La clave es · El problema es · The hard part.
**Fix.** Start on the concrete case and let the thesis emerge.
**Before → after.** `Lo difícil fue el despliegue.` → `En 2019 subí un rate limiter que se cayó a la hora.`
**Not this.** A heading, where stating the claim is right.

### pattern-announcement

**Detects.** El patrón es · La regla es · La idea es · El truco está.
**Fix.** Describe it directly, without introducing it.
**Before → after.** `La regla es simple: no toques migraciones.` → `Las migraciones no se editan a mano.`
**Not this.** A rule quoted verbatim from a document.

### turns-out

**Detects.** resulta que · lo curioso es · turns out.
**Fix.** State the finding directly.
**Before → after.** `Resulta que la causa era otra.` → `La causa era el índice, no la consulta.`
**Not this.** "resultar" as an ordinary verb: "el gate resulta en error".

### participial-setup

**Detects.** A sentence opening Con X hecho y Y puesto, · Una vez definido X, · Having done X,.
**Fix.** Lead with the subject and the action. If the clause restates the heading in fancier words, cut the sentence.
**Before → after.** `Con la definición hecha y los límites puestos, el modelo produce.` → `El modelo produce más rápido de lo que alcanzas a leer.`
**Not this.** A real temporal condition the reader needs.

### performative-humility

**Detects.** el límite honesto · para ser justos · hay que reconocer · algunas salvedades · to be fair · a few caveats.
**Fix.** Fold the caveat that genuinely qualifies a claim into the sentence making it, and delete the rest.
**Before → after.** `El límite honesto: no lo he probado a escala.` → `Lo he corrido hasta 4.000 al día.`
**Not this.** Nothing. A section announcing that you are about to be honest was not being honest.

### stacked-superlative

**Detects.** todavía más · aún más · muchísimo más · absolutamente esencial, attached to a claim already at the top of its scale.
**Fix.** Keep the first claim and replace the escalation with the concrete mechanism.
**Before → after.** `La decisión más difícil, y eso la hace todavía más dura.` → `La decisión más difícil, porque hay más cosas que podrían encajar.`
**Not this.** A comparison with numbers behind it.

### parallel-subject-mirror

**Detects.** Two consecutive sentences opening on the same determiner with a different noun.
**Fix.** Vary one of the two subjects, or join them.
**Before → after.** `El código es una cosa. El mantenimiento es otra.` → `Escribir el código cuesta una semana, y mantenerlo cuesta los tres años siguientes.`
**Not this.** A table, or an enumeration where the mirror is the structure.

### hedges

**Detects.** generalmente · por lo general · suele + verbo · en muchos casos · quizás · generally · typically · often.
**Fix.** Assert directly. If a real exception exists, name it: "esto se rompe cuando X".
**Before → after.** `Generalmente los equipos suelen ignorar esto.` → `De los seis equipos con los que he trabajado, cinco no lo miraban.`
**Not this.** Real uncertainty stated with its conditions, which is honesty rather than a softener.

### negated-echo

**Detects.** A sentence that lands, then hangs a short negative clause off the end which echoes what it just said: "y esta vez no vino" after "qué suele venir".
**Fix.** End on the landing. If the negative half carries a fact, give it its own sentence and its own subject.
**Before → after.** `te dice qué suele venir junto con estos archivos y esta vez no vino` → `te dice qué viene junto con estos archivos. Esta vez el test no vino.`
**Not this.** A negation that carries new information rather than mirroring the clause before it. Nor "decidió no hacer", where the infinitive is the object.

### negative-punch

**Detects.** A short sentence that opens or closes a paragraph and says what something does not do: "Tampoco lee.", "Un hook no.", "Nada de esto sale del navegador."
**Fix.** Say what the thing does. "Cuenta, pero lee no" becomes "Cuenta patrones". "Nada de esto sale del navegador" becomes "Todo se queda en tu navegador".
**Before → after.** `Tampoco lee. Nunca te agarra un número que contradice a otro.` → `Cuenta, y por eso un número que contradice a otro se le pasa entero.`
**Not this.** A negation that carries the fact itself, where the positive version would say something else: "El sexto no se arregla solo." Nor a long sentence, which is doing work rather than landing a beat.

### unnamed-crowd

**Detects.** A claim about what an unnamed group does or fails to do, used as the ground for the point: "la parte que casi nadie revisa", "lo que todo el mundo hace", "most people never check this".
**Fix.** Say the thing on its own, or name who. "La parte que casi nadie revisa" becomes "el ritmo de las frases". "Nadie mide esto" becomes "lo medí en veintinueve piezas y salió tres veces".
**Before → after.** `Aparte te mide el ritmo, que es la parte que casi nadie revisa.` → `Aparte te mide el ritmo de las frases.`
**Not this.** A group somebody counted or named: "los seis lectores que la probaron", "el equipo de soporte". Nor "nadie" as the object of a real action, as in "no se lo mandé a nadie", where the sentence reports what happened rather than what a crowd habitually does.

### corporate-metaphor

**Detects.** A consulting-deck word standing where a mechanism belongs. es: silo · ecosistema · sinergia · palanca · hoja de ruta · bala de plata · estado del arte · disruptivo · empoderar · holístico · salsa secreta en: silo · ecosystem · synergy · low-hanging fruit · move the needle · silver bullet · game-changer · state of the art · holistic · empower · north star · secret sauce
**Fix.** Say the mechanism. The metaphor is usually covering for a fact the writer had and did not reach for.
**Before → after.** `CLAUDE.md y AGENTS.md son silos que se vacían el día que cambia el motor.` → `CLAUDE.md lo lee Claude y AGENTS.md lo lee Codex. Cambias de motor y el nuevo no sabe nada de lo que decía el otro.`
**Not this.** The word used on purpose, about the thing it names: "cada área en su silo" is a sentence about organisations, not a metaphor hiding a mechanism.

### peninsular-spanish

**Detects.** Peninsular vocabulary in text written for Latin America. The usual way it arrives is translation: an English word has one obvious Spanish equivalent and it is the Madrid one. tirar (botar) · coger (agarrar) · ordenador (computadora) · móvil (celular) vale (dale) · zumo (jugo) · piso (apartamento) · conducir (manejar) aparcar (estacionar) · fichero (archivo) · ratón (mouse) · gafas (lentes) billete (boleto) · patata (papa) · nevera (refrigerador) · grifo (llave)
**Fix.** The word the reader would use. It is one substitution and it costs nothing.
**Before → after.** `y nada se tira porque te molestó una vez` → `y no pierdes una regla porque te molestó una vez`
**Not this.** The word in a sense both regions share: "tirar de la cuerda", "coger el ritmo", "un piso de la torre", "cuánto vale" from the verb valer. Nor a quotation of somebody who talks that way.

### english-calque

**Detects.** An English idiom translated word for word. It parses, it means something, and nobody says it. dar contra una pared (trabarse) · aplicar para (postularse a) en la misma página (de acuerdo) tomar un paso atrás (dar un paso atrás) · al final del día (a fin de cuentas) correr un test (pasar un test) · manejar un error (gestionar un error) remover (quitar) · asumir que (suponer que) · realizar que (darse cuenta) soportar (mantener, en el sentido de support) · consistente con (acorde a) regla ancha / estrecha (amplia, general / acotada), de wide y narrow
**Fix.** The phrase somebody here would say. If none exists, the idea was borrowed along with the words and is worth restating.
**Before → after.** `Un agente que se da contra una pared a mitad de tarea` → `Un agente que se traba a mitad de tarea`
**Not this.** A term the industry uses in English on purpose: commit, deploy, pull request, chargeback. Nor a calque that won: "hacer sentido" and "librería" are what Spanish-speaking programmers say, and a detector that argues with an entire profession is one that gets turned off. A corpus check settles which is which: four uses across 29 pieces by one careful writer means the word is theirs, not a slip.

### nominalized-particle

**Detects.** A possessive turning "sí" or "no" into a noun: "esperando tu sí", "un correo con su no", "espera mi no".
**Fix.** Say the thing being waited for. Approval, permission, an answer, a refusal.
**Before → after.** `Queda esperando tu sí.` → `Queda esperando tu aprobación.`
**Not this.** "dar el sí" and "un sí o un no", which are ordinary Spanish, or a "tu no" that is a negated verb: "tu no sabe nada".

### elevated-register

**Detects.** A thesis word where the plain one fits: enunciar · dilucidar · esgrimir · plasmar · ostentar · propiciar · aunar · vislumbrar · coadyuvar · subyacer · devenir · acaecer · conllevar · ergo · empero · asimismo · en aras de · a la sazón · por ende · no obstante · habida cuenta.
**Fix.** The word somebody would say out loud. enunciar becomes decir or escribir, conllevar becomes traer, en aras de becomes para.
**Before → after.** `es una regla que nadie enunció` → `es una regla que nunca escribiste`
**Not this.** The word in a register that asks for it: a legal clause, a quotation, an academic paper. Nor a term with no plain equivalent in its field.

---
