import { PrismaClient, CatalogType, CatalogOrigin } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Normaliza una cadena para usarla como clave de catalogo.
 * - Minusculas
 * - Sin tildes (conserva la n)
 * - Sin puntuacion final
 * - Sin espacios extras
 */
function normalizar(entrada: string): { nombre: string; clave: string } | null {
  const limpio = entrada
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.,;:]+$/, "");
  if (!limpio) return null;

  const nombre =
    limpio.charAt(0).toLocaleUpperCase("es") +
    limpio.slice(1).toLocaleLowerCase("es");

  const clave = limpio
    .toLocaleLowerCase("es")
    .replace(/n/g, "\u0001")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\u0001/g, "n");

  return { nombre, clave };
}

async function upsertItem(
  catalog: CatalogType,
  raw: string,
  origin: CatalogOrigin = CatalogOrigin.seed
) {
  const norm = normalizar(raw);
  if (!norm) return;
  const { nombre, clave } = norm;

  await prisma.catalogItem.upsert({
    where: { catalog_key: { catalog, key: clave } },
    update: {},
    create: { catalog, name: nombre, key: clave, origin, reviewed: true },
  });
}

async function main() {
  console.log("Iniciando seed del nuevo schema (8 fases)...\n");

  // ─── 1. TIPOS DE ESTUDIO (lista cerrada, solo admin) ───────
  // Los nombres se preservan tal cual (siglas) — el admin puede
  // corregir el "nombre" desde el panel si la regla los deforma.
  const tiposEstudio = [
    "Rx",
    "TAC",
    "Ecografia",
    "Estudio contrastado",
    "RNM",
    "Laboratorio",
  ];
  for (const nombre of tiposEstudio) {
    const clave = nombre.toLocaleLowerCase("es");
    await prisma.catalogItem.upsert({
      where: { catalog_key: { catalog: "tipo_estudio", key: clave } },
      update: {},
      create: {
        catalog: "tipo_estudio",
        name: nombre,
        key: clave,
        origin: CatalogOrigin.seed,
        reviewed: true,
      },
    });
  }
  console.log(`OK ${tiposEstudio.length} tipos de estudio`);

  // ─── 2. MOTIVOS DE CONSULTA (caso Piloro) ──────────────────
  const motivosConsulta = [
    "Lactante vomitador",
    "Abdomen agudo",
    "Oclusion intestinal",
  ];
  for (const m of motivosConsulta) await upsertItem("motivo_consulta", m);
  console.log(`OK ${motivosConsulta.length} motivos de consulta`);

  // ─── 3. DIAGNOSTICOS ────────────────────────────────────────
  const diagnosticos = ["Estenosis hipertrofica del piloro"];
  for (const d of diagnosticos) await upsertItem("diagnostico", d);
  console.log(`OK ${diagnosticos.length} diagnosticos`);

  // ─── 4. PUNTOS ANATOMICOS ───────────────────────────────────
  const puntosAnatomicos = [
    "Cuadrante superior derecho",
    "Epigastrio",
    "Cuadrante inferior derecho",
    "Cuadrante inferior izquierdo",
    "Cuadrante superior izquierdo",
    "Mesogastrio",
    "Hipogastrio",
  ];
  for (const p of puntosAnatomicos) await upsertItem("punto_anatomico", p);
  console.log(`OK ${puntosAnatomicos.length} puntos anatomicos`);

  // ─── 5. NIVELES DE RESPUESTA ────────────────────────────────
  // Migra los niveles de dolor que existian en el schema anterior.
  const nivelesRespuesta = [
    "Sin alteraciones / Indoloro",
    "Dolor leve a la palpacion superficial",
    "Dolor moderado a la palpacion profunda",
    "Dolor agudo / Llanto inconsolable al tacto",
    "Defensa muscular involuntaria / Descompresion dolorosa (Blumberg +)",
    "Masa palpable",
    "Peristaltismo visible",
  ];
  for (const n of nivelesRespuesta) await upsertItem("nivel_respuesta", n);
  console.log(`OK ${nivelesRespuesta.length} niveles de respuesta`);

  // ─── 6. TECNICAS QUIRURGICAS ────────────────────────────────
  const tecnicas = ["Piloromiotomia de Ramstedt"];
  for (const t of tecnicas) await upsertItem("tecnica_quirurgica", t);
  console.log(`OK ${tecnicas.length} tecnicas quirurgicas`);

  // ─── 7. COMPLICACIONES ──────────────────────────────────────
  const complicaciones = [
    "Perforacion de la mucosa",
    "Infeccion de la herida",
    "Dehiscencia de la herida",
    "Laceraciones serosas",
    "Vomitos postoperatorios persistentes",
  ];
  for (const c of complicaciones) await upsertItem("complicacion", c);
  console.log(`OK ${complicaciones.length} complicaciones`);

  // ─── 8. CAMPOS ADICIONALES ──────────────────────────────────
  const camposAdicionales = [
    "Presion arterial",
    "Saturacion de O2",
    "Frecuencia cardiaca",
    "Frecuencia respiratoria",
    "Temperatura",
    "Escala de Glasgow",
    "Peso",
    "Talla",
  ];
  for (const c of camposAdicionales) await upsertItem("campo_adicional", c);
  console.log(`OK ${camposAdicionales.length} campos adicionales`);

  console.log("\nSeed completado con exito.");
}

main()
  .catch((e) => {
    console.error("Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
