/**
 * Qué es cada detector, en español y en una línea.
 *
 * El id y la etiqueta del código están en inglés porque el código lo está, y
 * "banned vocabulary" no le dice nada a quien abre la página por primera vez.
 * Una fila que el lector no entiende es una fila que no puede atender, y el
 * reporte entero se vuelve decoración.
 *
 * Esto es el español, no una segunda fuente. El comentario de cada detector
 * sigue siendo de donde salen SKILL.md y el índice, y un test falla si aquí
 * sobra o falta un id.
 */

/**
 * Cada entrada: el nombre que se muestra, qué busca, cómo se arregla, y con qué
 * no hay que confundirlo. Ese último es el que hace falta. Un detector REVIEW
 * existe para que alguien lo discuta, y quien no distingue la versión legítima
 * o arregla prosa buena o deja de abrir el reporte.
 *
 * @type {Record<string, {label: string, what: string, fix: string, not: string}>}
 */
export const ES = {
  "em-dash": {
    label: "raya",
    what: "La raya larga (—). El tic más medido que hay: los modelos la usan de tres a cinco veces más que las personas.",
    fix:
      "Un punto, una coma, paréntesis, o quita el inciso entero. Casi siempre el inciso era el problema.",
    not:
      "El guion de una palabra compuesta, o el de un rango (10-20).",
  },
  semicolon: {
    label: "punto y coma",
    what: "Punto y coma después de una letra. Fuera de lo académico y lo legal casi nadie escribe uno.",
    fix:
      "Un punto, casi siempre. \"y\" / \"pero\" / \"así que\" cuando la relación importa.",
    not:
      "Una lista cuyos elementos ya llevan comas: \"Caracas, Venezuela; Bogotá, Colombia\".",
  },
  "curly-quotes": {
    label: "comillas curvas",
    what: "Comillas y apóstrofes tipográficos. Un solo carácter que delata el origen y sobrevive a cualquier reescritura.",
    fix:
      "Buscar y reemplazar por comillas rectas antes de publicar.",
    not:
      "Nada. Salvo que el estilo de la casa sean comillas tipográficas, y entonces se apaga en ese proyecto.",
  },
  "banned-vocabulary": {
    label: "vocabulario vetado",
    what: "143 palabras que un modelo pone y una persona casi nunca: robusto, integral, exhaustivo, aprovechar, crucial, delve, leverage.",
    fix:
      "La palabra concreta que usaría el oficio. utilizar es usar. robusto es lo que de verdad hace: \"aguanta 4.000 corridas al día\".",
    not:
      "\"Integral\" en su sentido matemático. \"Crucial\" dentro de una cita. Y \"leverage\", que sale por evidencia: las 34.000 palabras revisadas lo traen siempre como sustantivo, casi siempre con un número al lado.",
  },
  "negation-framing": {
    label: "no es X, es Y",
    what: "Decir lo que la cosa no es antes de decir lo que es. También \"no solo\" y \"más que X, es Y\".",
    fix:
      "Di lo que la cosa es. La mitad negada casi nunca carga nada.",
    not:
      "Una negación con contenido propio: \"se envuelve y se pasa, o se registra y se detiene\".",
  },
  "ai-transition": {
    label: "conector de IA",
    what: "Frases que abren con Además, Asimismo, Por otro lado, Es evidente que, Como se mencionó.",
    fix:
      "Bórralo. La frase siguiente se sostiene sola, y si hace falta un puente, el puente es \"Y\".",
    not:
      "\"además\" a media frase, que es habla corriente.",
  },
  "subjectless-fragment": {
    label: "fragmento sin sujeto",
    what: "Frase de seis palabras o menos que abre con preposición o negación y no tiene a nadie haciendo algo.",
    fix:
      "Devuélvele el sujeto, o fúndela con la frase de al lado. No la borres: el ritmo pide frases cortas. Lo que sobra es que no haya nadie haciendo algo, nunca el largo.",
    not:
      "Una frase corta con sujeto: \"Me pasa seguido.\" Una lista de nombres: \"Claude Code, Codex.\" Una respuesta a un cuándo: \"Siempre.\" · \"Antes del pull request.\"",
  },
  "heading-no-subject": {
    label: "encabezado sin sujeto",
    what: "Encabezado que abre con interrogativo y no nombra la cosa. Vive qué. Va qué. Atraviesa qué.",
    fix:
      "Mete el sustantivo.",
    not:
      "Un encabezado que ya nombra la cosa: \"En qué va Orbit\", \"Qué es una regla\".",
  },
  "agentless-passive": {
    label: "pasiva refleja",
    what: "se paga, se decide, se toma, se guarda. La acción sin nadie que la haga, en un párrafo que trata justamente de quién la hace.",
    fix:
      "Nombra a quién. Sobre todo si el párrafo trata justamente de que hay alguien que lo hace.",
    not:
      "Una impersonal legítima donde el agente da igual: \"se parte por la costura\".",
  },
  "pseudo-cleft": {
    label: "lo que X es Y",
    what: "Frase que abre \"Lo que ... es\". Sintaxis de glosario: el sujeto queda detrás para que el término llegue como revelación.",
    fix:
      "Pon el sujeto primero y abre con el caso concreto.",
    not:
      "Una definición que te pidieron, o un nombre: \"Lo que Orbit sabe\" como título de pantalla.",
  },
  anaphora: {
    label: "arranque repetido",
    what: "Dos frases seguidas que abren igual. Una palabra compartida basta cuando carga la frase.",
    fix:
      "Varía el segundo arranque, o júntalas en una sola frase.",
    not:
      "Una tabla o una lista, donde el paralelismo es la estructura.",
  },
  polyptoton: {
    label: "raíz repetida",
    what: "Una misma raíz tres veces o más en unas cuarenta palabras: regla, reglas, reglar.",
    fix:
      "Nombra las dos cosas por separado, en palabras llanas.",
    not:
      "El sustantivo canónico repitiéndose a propósito. Un párrafo sobre reglas dice \"regla\" muchas veces, y ciclar sinónimos es el tic peor. Tampoco una palabra que vuelve tres frases después: un sujeto sigue siendo el sujeto.",
  },
  "mid-sentence-colon": {
    label: "dos puntos a media frase",
    what: "Dos puntos seguidos de minúscula. Válido si lo que va antes es una oración completa.",
    fix:
      "Pártela en dos, o reescríbela. Como mucho uno por párrafo fuera de listas.",
    not:
      "Dos puntos después de una oración completa, que es correcto y común: \"Cuatro comandos, y el único que tienes que pensar es el tercero: apuntar la sala de control.\"",
  },
  "aphorism-closer": {
    label: "cierre con aforismo",
    what: "Párrafo largo que termina en una frase corta y redonda, escrita para sonar, no para decir.",
    fix:
      "Quítala, o fúndela con la frase anterior.",
    not:
      "Un párrafo que cierra con su último dato. La prueba: si la frase se puede sacar y citar sola, es esto.",
  },
  "deictic-pivot": {
    label: "giro deíctico",
    what: "Frase corta que abre con Eso, Esto, Ahí, Y ahí, Así es. Hace de bisagra sin aportar nada.",
    fix:
      "Quítala y deja que la frase siguiente cargue el peso, o fúndela con la anterior.",
    not:
      "Un \"Eso\" que de verdad señala algo recién nombrado y la frase sigue desde ahí.",
  },
  significance: {
    label: "declaración de importancia",
    what: "es la clave de, es el corazón de, ahí está la magia. Anunciar que algo importa en vez de mostrarlo.",
    fix:
      "Una entrada funcional y llana, y que el lector juzgue.",
    not:
      "Una cita directa de otra persona diciéndolo.",
  },
  tricolon: {
    label: "tríada",
    what: "Exactamente tres miembros separados por comas, cortos y con la misma forma. Cadencia, no inventario.",
    fix:
      "Parte el tercero en su propia frase, une dos con \"y\", o déjalo en dos.",
    not:
      "Un inventario real de seis cosas, que es contenido: \"todo, un lenguaje, un repositorio, un directorio, un archivo, un símbolo\".",
  },
  "stacked-appositive": {
    label: "aposiciones apiladas",
    what: "Una frase que termina con dos añadidos entre comas, el primero casi siempre de una palabra.",
    fix:
      "Quédate con uno, y que sea el concreto.",
    not:
      "Un solo inciso, que es puntuación corriente.",
  },
  "thesis-opener": {
    label: "tesis de entrada",
    what: "Párrafo que abre con Lo difícil es, La clave es, El problema es. La conclusión antes del argumento.",
    fix:
      "Arranca con el caso concreto y deja que la tesis salga sola.",
    not:
      "Un encabezado, donde enunciar la afirmación es lo correcto.",
  },
  "pattern-announcement": {
    label: "anuncio de patrón",
    what: "El patrón es, La regla es, La idea es, El truco está. Presentar la regla en vez de enunciarla.",
    fix:
      "Descríbelo directo, sin presentarlo.",
    not:
      "Una regla citada tal cual de un documento.",
  },
  "turns-out": {
    label: "resulta que",
    what: "resulta que, lo curioso es. El giro que convierte un dato en anécdota.",
    fix:
      "Enuncia el hallazgo directo.",
    not:
      "\"resultar\" como verbo corriente: \"el gate resulta en error\".",
  },
  "participial-setup": {
    label: "arranque con participio",
    what: "Frase que abre \"Con X hecho y Y puesto,\" o \"Una vez definido X,\". Un resumen del párrafo anterior disfrazado de transición.",
    fix:
      "Abre con el sujeto y la acción. Si la cláusula repite el encabezado en palabras más finas, quita la frase.",
    not:
      "Una condición temporal real que el lector necesita.",
  },
  "performative-humility": {
    label: "humildad de adorno",
    what: "el límite honesto, para ser justos, hay que reconocer. Una salvedad puesta para parecer equilibrado.",
    fix:
      "Mete la salvedad que de verdad matiza dentro de la frase que afirma, y borra el resto.",
    not:
      "Nada. Una sección que anuncia que vas a ser honesto no estaba siéndolo.",
  },
  "stacked-superlative": {
    label: "superlativo apilado",
    what: "todavía más, aún más, absolutamente esencial, pegado a una afirmación que ya era fuerte.",
    fix:
      "Quédate con la primera afirmación y cambia la escalada por el mecanismo concreto.",
    not:
      "Una comparación con números detrás.",
  },
  "parallel-subject-mirror": {
    label: "sujetos en espejo",
    what: "Dos frases seguidas que abren con el mismo determinante y distinto sustantivo: El producto que... El 75% del día...",
    fix:
      "Varía uno de los dos sujetos, o júntalos.",
    not:
      "Una tabla, o una enumeración donde el espejo es la estructura.",
  },
  hedges: {
    label: "atenuantes",
    what: "generalmente, por lo general, suele, en muchos casos, quizás. Suavizar donde no hay incertidumbre real.",
    fix:
      "Afirma directo. Si hay una excepción real, nómbrala: \"esto se rompe cuando X\".",
    not:
      "Incertidumbre real enunciada con sus condiciones, que es honestidad y no un suavizante.",
  },
  "negated-echo": {
    label: "eco negado",
    what: "Una frase que ya cerró y le cuelgan una coletilla negativa que repite lo que acaba de decir.",
    fix:
      "Cierra donde cerró. Si la mitad negativa carga un dato, dale su propia frase y su propio sujeto.",
    not:
      "Una negación que trae información nueva en vez de reflejar la cláusula anterior. Tampoco \"decidió no hacer\", donde el infinitivo es el objeto.",
  },
  "corporate-metaphor": {
    label: "metáfora corporativa",
    what: "silo, ecosistema, sinergia, palanca, mover la aguja. Una palabra de presentación donde iba un mecanismo.",
    fix:
      "Di el mecanismo. La metáfora suele tapar un dato que quien escribe tenía y no fue a buscar.",
    not:
      "La palabra usada a propósito, sobre la cosa que nombra: \"cada área en su silo\" es una frase sobre organizaciones, no una metáfora escondiendo un mecanismo.",
  },
  "peninsular-spanish": {
    label: "español peninsular",
    what: "Vocabulario de España en un texto para Latinoamérica: vale, chaval, ordenador, coger, gilipollas.",
    fix:
      "La palabra que usaría el lector. Es una sustitución y no cuesta nada.",
    not:
      "La palabra en un sentido que ambas regiones comparten: \"tirar de la cuerda\", \"coger el ritmo\", \"un piso de la torre\", \"cuánto vale\". Tampoco la cita de alguien que habla así.",
  },
  "english-calque": {
    label: "calco del inglés",
    what: "Un modismo inglés traducido palabra por palabra. Se entiende, y nadie lo dice así.",
    fix:
      "La frase que diría alguien de aquí. Si no existe, la idea vino prestada junto con las palabras y vale la pena volver a decirla.",
    not:
      "Un término que el oficio usa en inglés a propósito: commit, deploy, pull request, chargeback. Tampoco un calco que ya ganó: \"hacer sentido\" y \"librería\" son lo que dicen los programadores hispanohablantes, y un detector que discute con toda una profesión es uno que se apaga.",
  },
  "nominalized-particle": {
    label: "sí y no como sustantivo",
    what: "Un posesivo que vuelve sustantivo a sí o a no: \"esperando tu sí\", \"un correo con su no\".",
    fix:
      "Di la cosa que se está esperando. La aprobación, el permiso, una respuesta, una negativa.",
    not:
      "\"dar el sí\" y \"un sí o un no\", que son español corriente, o un \"tu no\" que es un verbo negado: \"tu no sabe nada\".",
  },
  "elevated-register": {
    label: "registro elevado",
    what: "enunciar, dilucidar, esgrimir, plasmar, ostentar. La palabra de tesis donde cabía la llana.",
    fix:
      "La palabra que alguien diría en voz alta. enunciar es decir o escribir, conllevar es traer, en aras de es para.",
    not:
      "La palabra en un registro que la pide: una cláusula legal, una cita, una tesis. Tampoco un término sin equivalente llano en su campo.",
  },
};

/**
 * Las cuatro medidas de ritmo, que no son detectores y no tienen comentario.
 * La clave es el nombre con el que rhythm/index.js las devuelve.
 */
export const RHYTHM_ES = {
  "spread, longest to shortest": {
    label: "rango largo-corto",
    what: "La frase más larga menos la más corta, en palabras. La prosa generada se queda en una banda estrecha.",
  },
  "share in the 10-20 band": {
    label: "banda 10-20",
    what: "Qué porcentaje de las frases mide entre 10 y 20 palabras. El tic medido más estable que hay.",
  },
  "shortest sentence": {
    label: "frase más corta",
    what: "Tiene que haber una frase de seis palabras o menos por cada 150 de texto.",
  },
  "runs of three within 5": {
    label: "tríos seguidos",
    what: "Tres frases seguidas dentro del mismo párrafo con menos de cinco palabras de diferencia. El tamborileo.",
  },
};

/** Los tres grupos, con lo que significa cada uno. */
export const GROUPS_ES = {
  HARD: {
    label: "Duros",
    head: "Lo que el patrón zanja",
    what: "Aquí no hay nada que interpretar: una raya es una raya. Pasarse del presupuesto rompe la corrida, y el código de salida los cuenta.",
  },
  REVIEW: {
    label: "A criterio",
    head: "Lo que decide una persona",
    what: "El patrón señala y no puede fallar. Si es un tic depende de qué está haciendo la frase, así que cada uno trae la versión legítima con la que no hay que confundirlo.",
  },
  RHYTHM: {
    label: "Ritmo",
    head: "La forma de la página",
    what: "Se mide sobre prosa corrida. Un encabezado no tiene ritmo, y contarlo arrastra todos los números hacia corto.",
  },
};
