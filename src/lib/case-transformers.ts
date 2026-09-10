import { SavedCase, CaseDraft, AddedStudy } from "@/types/clinical";

/**
 * Transforma un caso clínico guardado en la base de datos (SavedCase)
 * a un borrador editable para el formulario (CaseDraft), reconstruyendo:
 * - Opciones terapéuticas con sus etiquetas [CORRECTA].
 * - Lista de estudios complementarios con imágenes WebP y hallazgos.
 * - Palabras clave seleccionadas.
 */
export function savedCaseToDraft(savedCase: SavedCase): CaseDraft {
  const reconstructedTreatments =
    savedCase.treatmentOptions && savedCase.treatmentOptions.length > 0
      ? savedCase.treatmentOptions
          .map((t) => `- ${t.description}${t.isCorrect ? " [CORRECTA]" : ""}${t.feedback ? ` | Feedback: ${t.feedback}` : ""}`)
          .join("\n")
      : "";

  const reconstructedStudies: AddedStudy[] = (savedCase.studies || []).map((s) => ({
    name: s.studyCatalog?.name || "",
    isAdequate: s.isAdequate,
    findings: s.findings || "",
    imageUrl: s.imageUrl || null,
    imageName: s.imageName || null,
  }));

  const reconstructedKeywords = (savedCase.keywords || []).map((kw) => kw.keyword.name);

  return {
    id: savedCase.id,
    isEditing: true,
    title: savedCase.title,
    clinicalHistory: savedCase.clinicalHistory,
    treatmentOptions: reconstructedTreatments,
    selectedKeywords: reconstructedKeywords,
    isInteractiveExam: savedCase.isPhysicalExamInteractive,
    examZone: savedCase.physicalExamZone || "",
    examRefPoint: savedCase.physicalExamRefPoint || "",
    examStandardText: savedCase.physicalExamStandard || "",
    painLevel: savedCase.painLevel,
    hasVideo: savedCase.hasVideo,
    videoDescription: savedCase.videoDescription || "",
    addedStudies: reconstructedStudies,
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
