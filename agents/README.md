<!-- human: specimen -->
# agents

Lo que un agente lee cuando llega a la herramienta por la web, en vez de por npm
o por la skill.

`llms.txt` no es un índice de enlaces. Es lo que hay que hacer con la
herramienta: cómo correrla, qué significa el código de salida, cuáles hallazgos
se pueden arreglar solos y cuáles necesitan a alguien. Un agente que sigue una
lista de enlaces termina raspando una landing de tres columnas, y eso sale mal.

Vive aquí y no en el repositorio del sitio porque es documentación de la
herramienta. El sitio lo publica, no lo escribe: `tools/agent_files.py` en el
blog lo copia junto a `SKILL.md` y al índice de detectores, que también se
generan acá.

Un idioma por archivo, con el mismo nombre que usa el sitio para sus cuerpos.
