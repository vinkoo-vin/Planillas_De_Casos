# Requerimientos del cliente — Plataforma de casos clínicos pediátricos (Vinko)

> **Alcance actual:** módulo de **estudiantes de medicina**. El módulo de padres queda para una etapa posterior.
> **Fuentes:** plantilla `Piloro.docx` enviada por el cliente y formulario actual (`vinko-seven.vercel.app/?v=2`).
> **Convención:** lo marcado como *(inferido)* es interpretación mía a partir de la plantilla y debe validarse con el cliente. Del formulario actual solo pude ver la Fase 1 completa y los nombres de las otras tres fases.

---

## 1. Contexto y objetivo

- La app educativa presenta casos clínicos pediátricos que el estudiante recorre como una simulación (la propia web habla de "carga y simulación de casos").
- El cliente es quien carga los casos. Necesita cargarlos **rápido**, **siempre con el mismo formato** y **sin reescribir datos que se repiten** entre casos.
- Objetivo del formulario:
  1. Seguir exactamente la estructura de su plantilla de Word.
  2. Reutilizar datos repetidos mediante desplegables.
  3. Evitar errores de tipeo y elementos duplicados.

---

## 2. Cómo leer la plantilla `Piloro.docx`

| Elemento del Word | Significado | Consecuencia para el formulario |
|---|---|---|
| **Números / títulos** | Apartados que se completan en todos los casos | Cada título es una **fase** del formulario |
| **Texto negro** | Etiquetas fijas (Rx, TAC, Médico, Cirugía…) | Vienen **precargadas**; el cliente no las escribe |
| **Texto rojo** | Contenido que cambia según la patología | Son los **campos de carga** de cada caso |
| **Caso modelo** | Piloro, es decir estenosis hipertrófica del píloro *(inferido por el contenido)* | Sirve como caso de prueba de punta a punta |

Observaciones adicionales del Word:
- El texto rojo del Piloro es solo un ejemplo de lo que iría en cada campo.
- Hay inconsistencias de tildes ("Oclusiòn", "Ecografìa", "Diagnòstico", "Càmara gàstrica"). Es un argumento concreto a favor de los catálogos.
- Algunas líneas tienen contenido vacío en el modelo (Ecografía solo trae una imagen; "Estudio contrastado" está sin completar; Resumen es un marcador "… todo …").

---

## 3. Estructura de un caso: 8 apartados = 8 fases

### Fase 1 — Motivo de consulta
- **En el Word:** "Lactante vomitador. (otros: Abdomen agudo, Oclusión intestinal, etc)".
- **Necesita:** elegir un motivo principal y, opcionalmente, otros motivos con los que el mismo cuadro puede llegar a la consulta.
- **Razonamiento *(inferido)*:** un mismo motivo (p. ej. "Lactante vomitador") sirve para varias patologías, y una misma patología puede presentarse con distintos motivos. Por eso es una relación muchos a muchos y conviene un **catálogo**.
- **Datos:** motivo principal (referencia al catálogo), motivos alternativos (referencias).
- **Nota:** el formulario actual pide además un "Nombre / Título del caso" (diagnóstico final). Ver sección 7.

### Fase 2 — Signos y síntomas
- **En el Word:** video del paciente en la consulta + presentación típica (vómitos no biliosos, luego en proyectil, inicio a las 2–8 semanas, hambre persistente, pérdida de peso, a veces hematemesis).
- **Necesita:** texto libre y un recurso de video.
- **Razonamiento:** el texto es contexto clínico y a la vez guion para el paciente simulado (así lo describe el formulario actual).
- **Datos:** texto, video (link o archivo), campos adicionales opcionales (p. ej. presión arterial, saturación de O2).

### Fase 3 — Examen físico
- **En el Word:** oliva pilórica palpable en cuadrante superior derecho o epigastrio; peristaltismo gástrico visible.
- **Necesita:** describir hallazgos y, en modo interactivo, ubicarlos en un punto anatómico del modelo 3D con su respuesta al estímulo.
- **Razonamiento *(inferido)*:** los puntos anatómicos (cuadrantes, epigastrio, etc.) se repiten entre casos, igual que los niveles de respuesta/dolor.
- **Datos:** modalidad (interactivo / narrativo), punto anatómico, hallazgo, nivel de respuesta, campos adicionales opcionales.

### Fase 4 — Estudios
- **En el Word:** Rx (cámara gástrica distendida), TAC (No), Ecografía (imagen de píloro longitudinal y transversal), Estudio contrastado (sin completar), RNM (No), Laboratorio (alcalosis metabólica hipoclorémica e hipopotasémica, con aciduria paradójica en casos avanzados).
- **Necesita:** para cada estudio, indicar si se realiza; si se realiza, cargar el hallazgo y, cuando corresponda, una imagen.
- **Razonamiento *(inferido)*:** la lista de estudios es siempre la misma; lo que varía es si aplica y qué muestra. Un "No" también es información docente (qué estudio no hace falta pedir).
- **Datos:** tipo de estudio (catálogo cerrado), realizado (Sí/No), hallazgo, imagen(es).

### Fase 5 — Diagnóstico
- **En el Word:** lista numerada del 1 al 5.
- **Necesita:** cargar hasta cinco diagnósticos.
- **Razonamiento *(inferido)*:** son los diagnósticos diferenciales entre los que el estudiante debe elegir. Cada diagnóstico se reutiliza como opción en muchos casos, por lo que va en un **catálogo**.
- **Datos:** lista ordenada de diagnósticos (referencias) y cuál es el correcto.

### Fase 6 — Tratamiento
- **En el Word:**
  - *Médico:* preparación previa (corregir deshidratación, electrolitos y alcalosis, suspender alimentación oral, sonda nasogástrica).
  - *Cirugía:* Piloromiotomía de Ramstedt (tratamiento estándar).
  - *Principios técnicos:* lista de 5 pasos ordenados.
  - *Abierto* y *Miniinvasiva (laparoscópico)*.
- **Necesita:** un bloque médico y un bloque quirúrgico con técnica, pasos ordenados y variantes de abordaje.
- **Razonamiento *(inferido)*:** esta estructura se repite en toda patología quirúrgica; no todas lo serán, así que el bloque de cirugía debe ser **opcional**. Las técnicas se reutilizan, los pasos son propios de cada caso.
- **Datos:** texto médico, ¿incluye cirugía?, técnica (catálogo), nota, pasos ordenados, abordaje abierto, abordaje miniinvasivo.

### Fase 7 — Complicaciones
- **En el Word:** mortalidad excepcional; morbilidad perioperatoria del 8–10%; perforación de la mucosa, infección de la herida, dehiscencia de la herida, laceraciones serosas (más frecuente en cirugía abierta).
- **Necesita:** un texto introductorio y una selección de complicaciones, cada una con nota opcional.
- **Razonamiento *(inferido)*:** complicaciones como "Infección de la herida" aparecen en muchas cirugías, por eso van en un **catálogo**; la aclaración ("más frecuente en cirugía abierta") es una nota por caso.
- **Datos:** texto, lista de (complicación, nota).

### Fase 8 — Resumen
- **En el Word:** "……… todo …" (síntesis final del caso).
- **Necesita:** un texto de cierre.
- **Datos:** texto libre. Falta definir si lo escribe el cliente o se arma a partir de lo cargado (ver sección 8).

---

## 4. Necesidad de reutilización: catálogos

**Por qué los pide el cliente *(inferido)*:**
1. **Velocidad:** elegir de una lista en lugar de tipear lo mismo en cada caso.
2. **Consistencia:** un término se escribe igual en todos los casos (el Word ya mezcla tildes).
3. **Calidad de datos:** para que la app pueda agrupar o filtrar casos ("todos los de Abdomen agudo") los valores deben ser idénticos.
4. **Mantenimiento:** corregir un término una sola vez.

| Catálogo | Se usa en | Quién agrega | Ejemplos del Piloro |
|---|---|---|---|
| Motivos de consulta | Fase 1 | Admin y desde el caso | Lactante vomitador, Abdomen agudo, Oclusión intestinal |
| Diagnósticos | Fase 1 (título) y Fase 5 | Admin y desde el caso | Estenosis hipertrófica del píloro |
| Puntos anatómicos | Fase 3 | Admin y desde el caso | Cuadrante superior derecho, Epigastrio |
| Niveles de dolor / respuesta | Fase 3 | Admin y desde el caso (ya existe "Registrar Nuevo Nivel") | — |
| Tipos de estudio | Fase 4 | Solo admin (lista cerrada) | Rx, TAC, Ecografía, Estudio contrastado, RNM, Laboratorio |
| Técnicas quirúrgicas | Fase 6 | Admin y desde el caso | Piloromiotomía de Ramstedt |
| Complicaciones | Fase 7 | Admin y desde el caso | Perforación de la mucosa, Infección de la herida, Dehiscencia de la herida |
| Campos adicionales | Fases 2 y 3 | Admin y desde el caso | Presión arterial, Saturación O2, Escala Glasgow |

---

## 5. Reglas de los elementos reutilizables

1. **Alta desde el panel admin**, de a uno o pegando una lista completa.
2. **Alta desde el caso:** si el cliente escribe algo que no existe en el desplegable, puede agregarlo en el momento y **queda guardado en el catálogo** para los próximos casos.
3. **Normalización:** primera letra en mayúscula y el resto en minúscula ("Primera segunda"), sin espacios sobrantes.
4. **Sin duplicados:** se comparan sin distinguir mayúsculas, tildes ni espacios extra. "oclusión intestinal", "Oclusion intestinal" y "OCLUSIÓN  INTESTINAL" son el mismo elemento; si ya existe, se selecciona el existente.
5. **Excepción a validar (siglas y nombres propios):** la regla convierte "TAC" en "Tac", "RNM" en "Rnm" y "Piloromiotomía de Ramstedt" en "Piloromiotomía de ramstedt". Propuesta: el admin puede corregir manualmente el **nombre mostrado**; la detección de duplicados sigue usando la clave normalizada, así que no se pierde la unicidad.
6. **Referencia, no copia:** el caso guarda el vínculo al elemento, no el texto. Si se renombra un elemento, se actualiza en todos los casos.
7. **No se borra lo que está en uso:** se **desactiva** (deja de ofrecerse en nuevos casos, pero los casos existentes lo conservan).

---

## 6. Panel de administración

**Qué debe permitir:**
- Ver cada catálogo por separado, con buscador.
- Agregar un elemento o **importar una lista** (uno por línea) con reporte de creados, ya existentes e inválidos.
- Editar el nombre (con control de duplicados) y desactivar o reactivar.
- Ver en cuántos casos se usa cada elemento.
- Identificar los elementos **creados desde un caso** (insignia "Nuevo") para revisarlos.

**Razonamiento *(inferido)*:** el cliente carga rápido mientras trabaja un caso y limpia o corrige después desde el panel.

---

## 7. Qué ve el estudiante y qué carga el cliente

- **El título puede revelar la respuesta.** El formulario actual define el título como "nombre formal del cuadro o diagnóstico final". Ese dato no debería mostrarse al estudiante antes de la fase de diagnóstico. Propuesta: tratarlo como **dato interno** y usar el diagnóstico final del catálogo, evitando cargarlo dos veces.
- **Padres más adelante:** conviene que cada apartado se guarde en campos separados (no en un texto largo) para poder derivar una versión simplificada sin recargar todo.

---

## 8. Supuestos a validar con el cliente

- [ ] Los "otros" del motivo de consulta son otras formas de presentación del mismo caso (define si es selección múltiple).
- [ ] Diagnóstico 1–5 son diferenciales; cuál es el correcto y si el orden importa.
- [ ] El diagnóstico final coincide con el título del caso y no se muestra al estudiante antes de tiempo.
- [ ] Los estudios son siempre esos seis o a veces hay otros (p. ej. endoscopía).
- [ ] No toda patología tiene cirugía, por lo que el bloque quirúrgico es opcional.
- [ ] "Estudio contrastado" y "Ecografía" también admiten texto además de imagen.
- [ ] El Resumen lo escribe él o se arma con lo cargado.
- [ ] Qué hacer con siglas y nombres propios dentro de la regla "Primera segunda" (sección 5, punto 5).

---

## 9. Caso modelo: Piloro cargado en el formulario

| Fase | Contenido de ejemplo |
|---|---|
| 1. Motivo de consulta | Diagnóstico final: Estenosis hipertrófica del píloro · Principal: Lactante vomitador · Alternativos: Abdomen agudo, Oclusión intestinal |
| 2. Signos y síntomas | Vómitos no biliosos posprandiales, luego en proyectil; inicio a las 2–8 semanas; hambre persistente; pérdida de peso y deshidratación. Video: sí |
| 3. Examen físico | Oliva pilórica palpable (cuadrante superior derecho o epigastrio); peristaltismo gástrico visible |
| 4. Estudios | Rx: cámara gástrica distendida · TAC: no · Ecografía: imagen del píloro · Estudio contrastado: a completar · RNM: no · Laboratorio: alcalosis metabólica hipoclorémica e hipopotasémica |
| 5. Diagnóstico | Cinco diagnósticos a completar por el cliente; correcto: estenosis hipertrófica del píloro |
| 6. Tratamiento | Médico: corrección hidroelectrolítica, ayuno, sonda nasogástrica · Cirugía: Piloromiotomía de Ramstedt, 5 principios técnicos, abordaje abierto y laparoscópico |
| 7. Complicaciones | Mortalidad excepcional; morbilidad 8–10%; perforación de mucosa, infección y dehiscencia de herida, laceraciones serosas |
| 8. Resumen | Texto de cierre a completar por el cliente |
