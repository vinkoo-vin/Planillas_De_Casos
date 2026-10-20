import {
  SavedCase,
  CaseDraft,
  ExamFindingDraft,
  StudyItemDraft,
  DiagnosisDraft,
  SurgicalStepDraft,
  ComplicationDraft,
  AdditionalFieldDraft,
} from "@/types/clinical";

/**
 * Transforma un caso guardado (SavedCase) a un borrador editable (CaseDraft).
 * Se usa cuando el usuario hace click en "Editar" en la tabla de casos.
 */
export function savedCaseToDraft(savedCase: SavedCase): CaseDraft {
  // F1 - Motivos
  const altReasons = (savedCase.altReasons || []).map((ar) => ({
    itemId: ar.itemId,
    itemName: ar.item?.name || "",
  }));

  // F3 - Hallazgos del examen físico
  const examFindings: ExamFindingDraft[] = (savedCase.examFindings || []).map((f) => ({
    id: f.id,
    puntoAnatomicoId: f.puntoAnatomicoId ?? null,
    puntoAnatomicoName: f.puntoAnatomico?.name ?? null,
    hallazgo: f.hallazgo,
    nivelRespuestaId: f.nivelRespuestaId ?? null,
    nivelRespuestaName: f.nivelRespuesta?.name ?? null,
    order: f.order,
  }));

  // F4 - Estudios
  const studies: StudyItemDraft[] = (savedCase.studies || []).map((s) => ({
    studyTypeId: s.studyTypeId,
    studyTypeName: s.studyType?.name || "",
    performed: s.performed,
    findingsText: s.findingsText || "",
    images: (s.images || []).map((image) => ({
      id: image.id,
      url: image.url,
      description: image.description || "",
    })),
  }));

  // F5 - Diagnósticos
  const diagnoses: DiagnosisDraft[] = (savedCase.diagnoses || []).map((d) => ({
    itemId: d.itemId,
    itemName: d.item?.name || "",
    order: d.order,
    isCorrect: d.isCorrect,
  }));

  // F6 - Pasos quirúrgicos
  const surgicalSteps: SurgicalStepDraft[] = (savedCase.surgicalSteps || []).map((s) => ({
    id: s.id,
    order: s.order,
    text: s.text,
  }));

  // F7 - Complicaciones
  const complications: ComplicationDraft[] = (savedCase.complications || []).map((c) => ({
    itemId: c.itemId,
    itemName: c.item?.name || "",
    note: c.note || "",
  }));

  // Campos adicionales
  const additionalFields: AdditionalFieldDraft[] = (savedCase.additionalFields || []).map((f) => ({
    id: f.id,
    phase: f.phase,
    fieldId: f.fieldId,
    fieldName: f.field?.name || "",
    value: f.value,
  }));

  return {
    id: savedCase.id,
    isEditing: true,
    status: savedCase.status,

    // F1
    finalDiagnosisId: savedCase.finalDiagnosisId ?? null,
    finalDiagnosisName: savedCase.finalDiagnosis?.name ?? null,
    principalReasonId: savedCase.principalReasonId ?? null,
    principalReasonName: savedCase.principalReason?.name ?? null,
    altReasons,

    // F2
    signsSymptomsText: savedCase.signsSymptomsText ?? "",
    hasVideo: savedCase.hasVideo,
    videoUrl: savedCase.videoUrl ?? "",

    // F3
    examModality: savedCase.examModality,
    physicalExamNarrative: savedCase.physicalExamNarrative ?? "",
    examFindings,

    // F4
    studies,

    // F5
    diagnoses,

    // F6
    medicalTreatmentText: savedCase.medicalTreatmentText ?? "",
    includesSurgery: savedCase.includesSurgery,
    surgicalTechniqueId: savedCase.surgicalTechniqueId ?? null,
    surgicalTechniqueName: savedCase.surgicalTechnique?.name ?? null,
    surgicalNote: savedCase.surgicalNote ?? "",
    openApproach: savedCase.openApproach ?? "",
    minimInvasiveApproach: savedCase.minimInvasiveApproach ?? "",
    surgicalSteps,

    // F7
    complicationsIntroText: savedCase.complicationsIntroText ?? "",
    complications,

    // F8
    summary: savedCase.summary ?? "",

    additionalFields,
  };
}

/**
 * Formatea de manera homogénea la fecha de creación de un caso clínico.
 * @param dateStr Fecha en formato string ISO o Date
 * @param style 'short' (ej: "15 oct. 2026") o 'locale' (ej: "15/10/2026")
 */
export function formatCaseDate(
  dateStr: string | Date | undefined | null,
  style: "short" | "locale" = "short"
): string {
  if (!dateStr) return "";
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return "";

  if (style === "locale") {
    return date.toLocaleDateString("es-ES");
  }

  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
