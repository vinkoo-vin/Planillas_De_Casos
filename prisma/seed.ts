import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed de datos iniciales en Supabase...");

  // 1. PALABRAS CLAVE INICIALES
  const initialKeywords = [
    "Fiebre",
    "Vómito en proyectil",
    "Dolor abdominal",
    "Irritabilidad",
    "Deshidratación",
    "Lactante",
    "Alcalosis metabólica",
    "Estenosis pilórica",
    "Ictericia",
    "Masa palpable"
  ];

  for (const name of initialKeywords) {
    await prisma.keyword.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`✓ ${initialKeywords.length} palabras clave cargadas en el catálogo.`);

  // 2. CATÁLOGO INICIAL DE ESTUDIOS DIAGNÓSTICOS
  const initialStudies = [
    {
      name: "Ecografía Abdominal",
      generalDefinition: "Permite evaluar con ultrasonido de alta resolución el grosor muscular pilórico (>3 mm) y longitud (>15-18 mm) sin radiación ionizante.",
    },
    {
      name: "Radiografía de Abdomen AP",
      generalDefinition: "Permite valorar la presencia de una gran cámara gástrica con escaso o nulo aire distal (signo de obstrucción gástrica).",
    },
    {
      name: "Laboratorio: Ionograma y Gases (EAB)",
      generalDefinition: "Permite diagnosticar la clásica alcalosis metabólica hipoclorémica e hipopotasémica por pérdida continuada de ácido clorhídrico en los vómitos.",
    },
    {
      name: "Tomografía Axial Computarizada (TAC)",
      generalDefinition: "Estudio tomográfico de alta resolución indicado para patología intraabdominal compleja o diagnósticos diferenciales atípicos.",
    },
    {
      name: "Colon por Enema",
      generalDefinition: "Estudio contrastado con fluoroscopia utilizado para evaluar la anatomía colónica y descartar invaginación intestinal o vólvulo.",
    }
  ];

  for (const study of initialStudies) {
    await prisma.studyCatalog.upsert({
      where: { name: study.name },
      update: { generalDefinition: study.generalDefinition },
      create: study,
    });
  }
  console.log(`✓ ${initialStudies.length} estudios diagnósticos cargados en el catálogo.`);

  // 3. NIVELES DE DOLOR / HALLAZGOS FÍSICOS
  const initialPainLevels = [
    "Sin alteraciones / Indoloro",
    "Dolor leve a la palpación superficial",
    "Dolor moderado a la palpación profunda",
    "Dolor agudo / Llanto inconsolable al tacto",
    "Defensa muscular involuntaria / Descompresión dolorosa (Blumberg +)"
  ];

  for (const description of initialPainLevels) {
    await prisma.painLevelCatalog.upsert({
      where: { description },
      update: {},
      create: { description },
    });
  }
  console.log(`✓ ${initialPainLevels.length} niveles de dolor y examen físico registrados.`);

  console.log("¡Seed completado con éxito!");
}

main()
  .catch((e) => {
    console.error("Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
