import prisma from "@/lib/prisma";

// ─────────────────────────────────────────────────────────────
// Tipos de entrada para crear/actualizar un caso
// ─────────────────────────────────────────────────────────────

export interface ExamFindingInput {
  puntoAnatomicoId?: string | null;
  hallazgo: string;
  nivelRespuestaId?: string | null;
  order?: number;
}

export interface StudyItemInput {
  studyTypeId: string;
  performed: boolean;
  findingsText?: string | null;
}

export interface DiagnosisInput {
  itemId: string;
  order: number;
  isCorrect?: boolean;
}

export interface SurgicalStepInput {
  order: number;
  text: string;
}

export interface ComplicationInput {
  itemId: string;
  note?: string | null;
}

export interface AdditionalFieldInput {
  phase: number;
  fieldId: string;
  value: string;
}

export interface AltReasonInput {
  itemId: string;
}

export interface CasePayloadData {
  // F1
  finalDiagnosisId?: string | null;
  principalReasonId?: string | null;
  altReasons?: AltReasonInput[];

  // F2
  signsSymptomsText?: string | null;
  hasVideo?: boolean;
  videoUrl?: string | null;

  // F3
  examModality?: "interactive" | "narrative";
  physicalExamNarrative?: string | null;
  examFindings?: ExamFindingInput[];

  // F4
  studies?: StudyItemInput[];

  // F5
  diagnoses?: DiagnosisInput[];

  // F6
  medicalTreatmentText?: string | null;
  includesSurgery?: boolean;
  surgicalTechniqueId?: string | null;
  surgicalNote?: string | null;
  openApproach?: string | null;
  minimInvasiveApproach?: string | null;
  surgicalSteps?: SurgicalStepInput[];

  // F7
  complicationsIntroText?: string | null;
  complications?: ComplicationInput[];

  // F8
  summary?: string | null;

  // Campos adicionales (fases 2 y 3)
  additionalFields?: AdditionalFieldInput[];

  // Estado
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

export interface CasePayloadValidation {
  isValid: boolean;
  error?: string;
}

/**
 * Valida que el payload tenga los campos mínimos requeridos.
 * El caso puede guardarse como borrador sin muchos datos.
 */
export function validateCaseInput(
  body: Record<string, unknown>
): CasePayloadValidation {
  // Un caso puede guardarse como borrador sin campos obligatorios.
  // Validaciones de negocio se pueden agregar aquí a medida que se define F1.
  if (body.status && !["DRAFT", "PUBLISHED", "ARCHIVED"].includes(body.status as string)) {
    return { isValid: false, error: "Estado inválido" };
  }
  return { isValid: true };
}

// ─────────────────────────────────────────────────────────────
// Include estándar para una ficha de caso completa
// ─────────────────────────────────────────────────────────────
export const caseDetailIncludes = {
  principalReason: {
    select: { id: true, name: true, catalog: true },
  },
  finalDiagnosis: {
    select: { id: true, name: true, catalog: true },
  },
  surgicalTechnique: {
    select: { id: true, name: true, catalog: true },
  },
  altReasons: {
    include: {
      item: { select: { id: true, name: true, catalog: true } },
    },
    orderBy: { itemId: "asc" as const },
  },
  examFindings: {
    include: {
      puntoAnatomico: { select: { id: true, name: true } },
      nivelRespuesta: { select: { id: true, name: true } },
    },
    orderBy: { order: "asc" as const },
  },
  studies: {
    include: {
      studyType: { select: { id: true, name: true } },
      images: { orderBy: { createdAt: "asc" as const } },
    },
    orderBy: { studyTypeId: "asc" as const },
  },
  diagnoses: {
    include: {
      item: { select: { id: true, name: true, catalog: true } },
    },
    orderBy: { order: "asc" as const },
  },
  surgicalSteps: {
    orderBy: { order: "asc" as const },
  },
  complications: {
    include: {
      item: { select: { id: true, name: true, catalog: true } },
    },
    orderBy: { itemId: "asc" as const },
  },
  additionalFields: {
    include: {
      field: { select: { id: true, name: true, catalog: true } },
    },
    orderBy: { phase: "asc" as const },
  },
} as const;

// ─────────────────────────────────────────────────────────────
// Select liviano para la lista de casos (sin tablas hijas grandes)
// ─────────────────────────────────────────────────────────────
export const caseListSelect = {
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  hasVideo: true,
  examModality: true,
  includesSurgery: true,
  principalReason: {
    select: { id: true, name: true },
  },
  finalDiagnosis: {
    select: { id: true, name: true },
  },
  diagnoses: {
    include: {
      item: { select: { id: true, name: true } },
    },
    orderBy: { order: "asc" as const },
    take: 5,
  },
  studies: {
    select: {
      id: true,
      performed: true,
      studyType: { select: { id: true, name: true } },
    },
  },
} as const;

// ─────────────────────────────────────────────────────────────
// Preparar el payload para crear o actualizar un caso
// ─────────────────────────────────────────────────────────────
export function prepareCaseBaseData(body: CasePayloadData) {
  return {
    status: (body.status ?? "DRAFT") as "DRAFT" | "PUBLISHED" | "ARCHIVED",

    // F1
    finalDiagnosisId: body.finalDiagnosisId ?? null,
    principalReasonId: body.principalReasonId ?? null,

    // F2
    signsSymptomsText: body.signsSymptomsText?.trim() ?? null,
    hasVideo: Boolean(body.hasVideo),
    videoUrl: body.videoUrl?.trim() ?? null,

    // F3
    examModality: (body.examModality ?? "interactive") as "interactive" | "narrative",
    physicalExamNarrative: body.physicalExamNarrative?.trim() ?? null,

    // F6
    medicalTreatmentText: body.medicalTreatmentText?.trim() ?? null,
    includesSurgery: Boolean(body.includesSurgery),
    surgicalTechniqueId: body.surgicalTechniqueId ?? null,
    surgicalNote: body.surgicalNote?.trim() ?? null,
    openApproach: body.openApproach?.trim() ?? null,
    minimInvasiveApproach: body.minimInvasiveApproach?.trim() ?? null,

    // F7
    complicationsIntroText: body.complicationsIntroText?.trim() ?? null,

    // F8
    summary: body.summary?.trim() ?? null,
  };
}

/**
 * Sincroniza (delete-many + create) todas las tablas hijas de un caso.
 * Se usa tanto en POST (create) como en PUT (update).
 */
export async function syncCaseChildren(
  caseId: string,
  body: CasePayloadData
): Promise<void> {
  const {
    altReasons = [],
    examFindings = [],
    studies = [],
    diagnoses = [],
    surgicalSteps = [],
    complications = [],
    additionalFields = [],
  } = body;

  await prisma.$transaction([
    // F1 - Motivos alternativos
    prisma.caseAltReason.deleteMany({ where: { caseId } }),
    ...altReasons.map((r) =>
      prisma.caseAltReason.create({ data: { caseId, itemId: r.itemId } })
    ),

    // F3 - Hallazgos del examen físico
    prisma.caseExamFinding.deleteMany({ where: { caseId } }),
    ...examFindings.map((f, idx) =>
      prisma.caseExamFinding.create({
        data: {
          caseId,
          puntoAnatomicoId: f.puntoAnatomicoId ?? null,
          hallazgo: f.hallazgo.trim(),
          nivelRespuestaId: f.nivelRespuestaId ?? null,
          order: f.order ?? idx,
        },
      })
    ),

    // F4 - Estudios (solo recreamos hallazgos/performed; imágenes se manejan por endpoint propio)
    prisma.caseStudyItem.deleteMany({ where: { caseId } }),
    ...studies.map((s) =>
      prisma.caseStudyItem.create({
        data: {
          caseId,
          studyTypeId: s.studyTypeId,
          performed: Boolean(s.performed),
          findingsText: s.findingsText?.trim() ?? null,
        },
      })
    ),

    // F5 - Diagnósticos diferenciales
    prisma.caseDiagnosis.deleteMany({ where: { caseId } }),
    ...diagnoses.map((d) =>
      prisma.caseDiagnosis.create({
        data: {
          caseId,
          itemId: d.itemId,
          order: d.order,
          isCorrect: Boolean(d.isCorrect),
        },
      })
    ),

    // F6 - Pasos quirúrgicos
    prisma.caseSurgicalStep.deleteMany({ where: { caseId } }),
    ...surgicalSteps.map((s) =>
      prisma.caseSurgicalStep.create({
        data: { caseId, order: s.order, text: s.text.trim() },
      })
    ),

    // F7 - Complicaciones
    prisma.caseComplication.deleteMany({ where: { caseId } }),
    ...complications.map((c) =>
      prisma.caseComplication.create({
        data: { caseId, itemId: c.itemId, note: c.note?.trim() ?? null },
      })
    ),

    // Campos adicionales (fases 2 y 3)
    prisma.caseAdditionalField.deleteMany({ where: { caseId } }),
    ...additionalFields
      .filter((f) => f.value?.trim())
      .map((f) =>
        prisma.caseAdditionalField.create({
          data: {
            caseId,
            phase: f.phase,
            fieldId: f.fieldId,
            value: f.value.trim(),
          },
        })
      ),
  ]);
}
