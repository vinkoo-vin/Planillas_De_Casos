# Plan de ejecución — Formulario de casos clínicos (Vinko)

> Documento complementario de `requerimientos-cliente-casos-clinicos.md`.
> El plan es **agnóstico del stack**: el sitio está en Vercel y tiene base de datos conectada, pero desconozco el framework y el motor. Adaptá nombres de tablas, rutas y sintaxis a lo que uses.
> Esfuerzo relativo: **S** (poco), **M** (medio), **L** (alto).

---

## 0. Decisiones ya tomadas

1. Los **títulos del Word son las fases** del formulario (8 fases).
2. Existe un **panel de admin** donde el cliente puede subir elementos reutilizables.
3. Cuando el cliente agrega un elemento nuevo **mientras carga un caso**, ese elemento se **guarda en el catálogo** para usos futuros.
4. Los elementos se **normalizan** ("Primera segunda") y **no pueden repetirse**.

---

## 1. Punto de partida y mapeo al formulario nuevo

> Verificar el contenido real de las Fases 2–4 actuales antes de mover campos: solo pude ver la Fase 1 completa.

| Formulario actual | Formulario nuevo | Cambio |
|---|---|---|
| Fase 1 · 1.1 Identificación y motivo de consulta | **Fase 1 · Motivo de consulta** | Motivo pasa de texto libre a selector de catálogo (principal + alternativos) |
| Fase 1 · 1.2 Signos, síntomas y anamnesis | **Fase 2 · Signos y síntomas** | Agregar carga de video cuando "Sí incluye video" |
| Fase 1 · 1.3 Examen físico | **Fase 3 · Examen físico** | Puntos anatómicos y niveles de respuesta pasan a catálogo |
| Campos adicionales (Fase 1) | Opcional en **Fases 2 y 3** | Nombres de campo desde catálogo |
| *(no existe)* | **Fase 4 · Estudios** | Nueva |
| Fase 2 · Diagnóstico | **Fase 5 · Diagnóstico** | 5 selectores de catálogo |
| Fase 3 · Tratamiento | **Fase 6 · Tratamiento** | Bloque médico + bloque quirúrgico opcional |
| *(no existe)* | **Fase 7 · Complicaciones** | Nueva |
| Fase 4 · Resumen | **Fase 8 · Resumen** | Sin cambios de fondo |

---

## 2. Arquitectura general

- **Pantallas:** formulario de caso (stepper de 8 fases) y `/admin/catalogos`.
- **Componente clave:** `SelectorCatalogo` (simple y múltiple), usado en todas las fases y alimentado por la misma API que el panel admin.
- **API:** un único servicio de catálogos con alta tipo *get-or-create*, de modo que formulario y panel compartan las mismas reglas de normalización y duplicados.
- **Acceso:** el cliente carga y administra, así que alcanza con **un acceso protegido** (login) para toda la app. Separar roles es opcional.

---

## 3. Modelo de datos (referencia, sintaxis tipo Postgres)

```sql
-- Un solo catálogo genérico para los 8 tipos de elementos reutilizables
CREATE TYPE catalogo_tipo AS ENUM (
  'motivo_consulta', 'diagnostico', 'punto_anatomico', 'nivel_respuesta',
  'tipo_estudio', 'tecnica_quirurgica', 'complicacion', 'campo_adicional'
);

CREATE TABLE catalogo_item (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalogo   catalogo_tipo NOT NULL,
  nombre     TEXT NOT NULL,                 -- se muestra: "Oclusión intestinal"
  clave      TEXT NOT NULL,                 -- se compara: "oclusion intestinal"
  activo     BOOLEAN NOT NULL DEFAULT TRUE,
  origen     TEXT NOT NULL DEFAULT 'admin', -- 'admin' | 'caso' | 'seed'
  revisado   BOOLEAN NOT NULL DEFAULT TRUE, -- FALSE si lo creó el cliente desde un caso
  creado_en  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (catalogo, clave)                  -- garantía real contra duplicados
);

CREATE TABLE caso (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estado                TEXT NOT NULL DEFAULT 'borrador',   -- 'borrador' | 'publicado'
  diagnostico_final_id  UUID REFERENCES catalogo_item(id),  -- dato interno, no se muestra al estudiante
  motivo_principal_id   UUID REFERENCES catalogo_item(id),
  signos_sintomas       TEXT,
  video_url             TEXT,
  examen_modalidad      TEXT,                               -- 'interactivo' | 'narrativo'
  tratamiento_medico    TEXT,
  incluye_cirugia       BOOLEAN NOT NULL DEFAULT FALSE,
  tecnica_id            UUID REFERENCES catalogo_item(id),
  tecnica_nota          TEXT,
  abordaje_abierto      TEXT,
  abordaje_miniinvasivo TEXT,
  complicaciones_texto  TEXT,
  resumen               TEXT,
  creado_en             TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tablas hijas (todas con caso_id → caso ON DELETE CASCADE)
-- caso_motivo_alterno      (caso_id, item_id)                          PK (caso_id, item_id)
-- caso_hallazgo_examen     (id, caso_id, punto_anatomico_id, hallazgo, nivel_respuesta_id)
-- caso_estudio             (id, caso_id, tipo_estudio_id, realizado, hallazgo)  UNIQUE (caso_id, tipo_estudio_id)
-- caso_estudio_imagen      (id, caso_estudio_id, url, descripcion)
-- caso_diagnostico         (caso_id, item_id, orden 1..5)              UNIQUE (caso_id, orden), PK (caso_id, item_id)
-- caso_principio_tecnico   (id, caso_id, orden, texto)
-- caso_complicacion        (caso_id, item_id, nota)                    PK (caso_id, item_id)
-- caso_campo_adicional     (id, caso_id, fase, campo_id, valor)
```

Decisiones de diseño:
- Los casos **referencian** al catálogo; renombrar un elemento se refleja en todos los casos.
- `UNIQUE (catalogo, clave)` es la protección definitiva; el chequeo en pantalla es solo comodidad.
- Un elemento usado **no se borra**: se pone `activo = FALSE`.
- `diagnostico_final_id` evita cargar dos veces el título y el diagnóstico correcto.

---

## 4. Normalización y duplicados

```ts
export function normalizar(entrada: string) {
  const limpio = entrada
    .trim()
    .replace(/\s+/g, " ")        // espacios múltiples
    .replace(/[.,;:]+$/, "");    // puntuación final ("Ecografía.")
  if (!limpio) return null;

  // Nombre mostrado: "Primera segunda"
  const nombre =
    limpio.charAt(0).toLocaleUpperCase("es") +
    limpio.slice(1).toLocaleLowerCase("es");

  // Clave de comparación: minúsculas, sin tildes, conservando la ñ
  const clave = limpio
    .toLocaleLowerCase("es")
    .replace(/ñ/g, "\u0001")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\u0001/g, "ñ");

  return { nombre, clave };
}
```

Reglas del servicio:
1. Siempre se normaliza **en el servidor**; el cliente solo la usa para previsualizar.
2. Alta = *get-or-create*: insertar con `ON CONFLICT (catalogo, clave) DO NOTHING` y devolver el existente si hubo conflicto. Esto evita duplicados aunque dos pedidos lleguen a la vez.
3. Si el elemento ya existía, la respuesta lo indica (`creado: false`) y el formulario **selecciona el existente** avisando con un mensaje breve.
4. Al renombrar, se recalcula la clave y, si choca con otro elemento, se rechaza con un error 409 claro.
5. **Siglas y nombres propios:** el admin puede editar el `nombre` mostrado (p. ej. "TAC", "Piloromiotomía de Ramstedt"); la `clave` no cambia. Los **tipos de estudio** son una lista cerrada cargada por seed y no se crean desde el caso.

Casos de prueba mínimos:

| Entrada | Resultado esperado |
|---|---|
| `"  oclusión   intestinal "` | nombre `Oclusión intestinal`, clave `oclusion intestinal` |
| `"OCLUSIÓN INTESTINAL"` | mismo elemento que el anterior |
| `"Oclusion intestinal"` (si ya existe el anterior) | devuelve el existente, no crea otro |
| `"Ecografía."` | nombre `Ecografía`, sin punto final |
| `"   "` | inválido (rechazado) |
| `"Niño"` vs `"Nino"` | claves distintas (se conserva la ñ) |
| `"TAC"` | nombre `Tac` (la regla actúa; el admin puede corregirlo) |

---

## 5. Etapas de ejecución

### E0 — Validación con el cliente · S
- Enviar la lista de la sección 8 de los requerimientos y registrar las respuestas.
- Decidir: diagnósticos diferenciales y correcto, orden de los estudios, bloque quirúrgico opcional, tratamiento de siglas.
- **Entregable:** decisiones confirmadas por escrito.
- **Aceptación:** ninguna pregunta de la lista queda sin responder.

### E1 — Base de datos y datos iniciales · M
- [ ] Crear tablas de la sección 3 (migraciones versionadas).
- [ ] Seed de **tipos de estudio**: Rx, TAC, Ecografía, Estudio contrastado, RNM, Laboratorio.
- [ ] Migrar los niveles de dolor que ya existan ("Registrar Nuevo Nivel") al catálogo `nivel_respuesta`.
- [ ] Seed opcional del Piloro (motivos, diagnóstico, técnica, complicaciones) para tener datos desde el primer día.
- **Aceptación:** las migraciones corren de cero y los seeds no generan duplicados al repetirse.

### E2 — Servicio de catálogos y normalización · M
- [ ] Implementar `normalizar()` y sus pruebas unitarias (tabla de la sección 4).
- [ ] Endpoints:
  - `GET /api/catalogos/:catalogo?q=&activos=true` — listar y buscar.
  - `POST /api/catalogos/:catalogo` `{ nombre }` — *get-or-create*, devuelve `{ item, creado }`.
  - `PATCH /api/catalogos/:catalogo/:id` `{ nombre?, activo? }` — editar; `409` si la clave choca.
  - `POST /api/catalogos/:catalogo/importar` `{ lineas: string[] }` — devuelve `{ creados, existentes, invalidos }`.
- [ ] Proteger los endpoints con el acceso de la app.
- **Aceptación:** crear el mismo elemento con 5 variantes de escritura produce **un solo** registro.

### E3 — Componente `SelectorCatalogo` · M
- [ ] Versión simple (un valor) y múltiple (varios valores).
- [ ] Búsqueda mientras se escribe, mostrando coincidencias existentes (ayuda a evitar casi-duplicados como "Vómito" y "Vómitos").
- [ ] Opción **"+ Agregar «texto»"** cuando no hay coincidencia exacta; llama al `POST` y selecciona el resultado.
- [ ] Mensaje cuando ya existe: "Ya existía, se seleccionó".
- [ ] Marcar `origen = 'caso'` y `revisado = false` en los altas desde el formulario.
- [ ] Teclado y accesibilidad (flechas, Enter, Esc, etiquetas).
- [ ] Reemplazar el actual "+ Registrar Nuevo Nivel" por este componente.
- **Aceptación:** un elemento agregado en un caso aparece en el desplegable del siguiente caso sin recargar.

### E4 — Panel admin (`/admin/catalogos`) · M
- [ ] Pestañas o lista por catálogo, con buscador.
- [ ] Alta individual e **importación pegando una lista** (uno por línea) con reporte de resultados.
- [ ] Editar nombre (incluida la corrección manual de siglas y nombres propios), desactivar y reactivar.
- [ ] Columna "Usado en N casos".
- [ ] Insignia **"Nuevo"** en elementos creados desde un caso; acción "Marcar como revisado".
- **Aceptación:** el cliente puede cargar 20 motivos pegando una lista y ver cuáles ya existían.

### E5 — Formulario en 8 fases · L
- [ ] Stepper con las 8 fases, navegación entre fases y validación por fase.
- [ ] **Guardar borrador** (por fase o automático) y estado `borrador` / `publicado`.
- [ ] Construir cada fase:
  - [ ] **F1 Motivo de consulta:** diagnóstico final (selector), motivo principal (selector), motivos alternativos (selector múltiple).
  - [ ] **F2 Signos y síntomas:** textarea, toggle de video con campo de link o carga, campos adicionales.
  - [ ] **F3 Examen físico:** reutilizar el actual (interactivo/narrativo), puntos anatómicos y niveles desde catálogo, campos adicionales.
  - [ ] **F4 Estudios:** seis filas precargadas con realizado Sí/No; si es Sí, hallazgo e imagen (ver E6). Laboratorio solo texto.
  - [ ] **F5 Diagnóstico:** hasta cinco selectores sin repetir dentro del caso; el diagnóstico final queda marcado como correcto.
  - [ ] **F6 Tratamiento:** textarea médico; toggle "¿Incluye cirugía?" que muestra técnica (selector), nota, **lista de pasos reordenable**, abordaje abierto y abordaje miniinvasivo.
  - [ ] **F7 Complicaciones:** texto introductorio y selector múltiple con nota opcional por ítem.
  - [ ] **F8 Resumen:** textarea.
- [ ] Actualizar la página **"Guía del Formulario"** a las 8 fases.
- [ ] Mantener el título del caso como dato interno (no visible al estudiante).
- **Aceptación:** se puede completar un caso entero y volver a editarlo sin perder datos.

### E6 — Archivos: imágenes y video · M
- [ ] Imágenes de estudios (JPG, PNG, WebP) con límite de tamaño y descripción de texto.
- [ ] Video: pegar link de un servicio de video **o** subida directa a almacenamiento. Evitar subir archivos pesados por la API del sitio (las funciones serverless tienen límite de tamaño de pedido).
- [ ] Vista previa en el formulario y borrado de archivos.
- **Aceptación:** la imagen de ecografía del Piloro se carga, se ve y queda asociada al estudio.

### E7 — Caso modelo y pruebas de punta a punta · M
- [ ] Cargar **Piloro completo** desde cero usando solo el formulario (tabla de la sección 9 de los requerimientos).
- [ ] Verificar que lo agregado desde el caso aparece en el panel y en el siguiente caso.
- [ ] Cargar un **segundo caso** reutilizando motivos y complicaciones para confirmar la reutilización.
- [ ] Probar duplicados (variantes de mayúsculas, tildes y espacios), renombrado con choque, desactivación de un elemento en uso.
- **Aceptación:** los dos casos se cargan sin tipear de nuevo ningún dato repetido.

### E8 — Despliegue y entrega · S
- [ ] Respaldo de la base y migraciones en producción.
- [ ] Seed inicial en producción.
- [ ] Guía breve para el cliente (cómo cargar un caso, cómo importar catálogos, qué significa "Nuevo").
- **Aceptación:** el cliente carga un caso real sin ayuda.

**Orden recomendado:** E0 → E1 → E2 → E3 → E4 → E5 (E6 en paralelo desde E5) → E7 → E8.
El panel admin (E4) va antes del formulario completo para que el cliente pueda precargar catálogos mientras se construyen las fases.

---

## 6. Riesgos y decisiones abiertas

| Riesgo / decisión | Mitigación |
|---|---|
| La regla "Primera segunda" deforma siglas y nombres propios (Tac, Rnm, Ramstedt) | Nombre mostrado editable por el admin; unicidad por clave; tipos de estudio como lista cerrada |
| Casi-duplicados que la clave no detecta ("Vómito" / "Vómitos") | Búsqueda con coincidencias mientras se escribe; revisión desde el panel ("Nuevo") |
| Renombrar un elemento en uso cambia casos ya publicados | Es el comportamiento buscado; mostrar "Usado en N casos" antes de confirmar |
| Dos altas simultáneas del mismo elemento | `UNIQUE (catalogo, clave)` + alta *get-or-create* |
| El título revela el diagnóstico al estudiante | Dato interno; no exponerlo en la app hasta la fase de diagnóstico |
| Formulario de 8 fases largo | Borrador automático y navegación libre entre fases |
| Contenido real de las Fases 2–4 actuales no verificado | Revisarlo al inicio de E5 antes de mover campos |

---

## 7. Definición de terminado

- [ ] Las 8 fases reflejan los títulos del Word, en el mismo orden.
- [ ] Todo dato repetido se elige de un desplegable con buscador.
- [ ] Un elemento agregado desde un caso queda guardado y disponible para el siguiente.
- [ ] Ningún elemento puede repetirse, aunque cambien mayúsculas, tildes o espacios.
- [ ] Los nombres se guardan como "Primera segunda" (con corrección manual para siglas y nombres propios).
- [ ] El panel admin permite agregar, importar, renombrar, desactivar y revisar elementos.
- [ ] Piloro se carga completo de punta a punta.
- [ ] La "Guía del Formulario" está actualizada.
- [ ] Las decisiones de la sección 8 de los requerimientos están confirmadas por el cliente.
