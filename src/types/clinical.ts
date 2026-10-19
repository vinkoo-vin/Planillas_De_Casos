// ─────────────────────────────────────────────────────────────
// Tipos de datos del nuevo schema (8 fases)
// ─────────────────────────────────────────────────────────────

export type CaseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type ExamModality = "interactive" | "narrative";
export type ThemeKey = "teal" | "warm" | "dark" | "emerald" | "neumorphic";
export type CatalogType =
  | "motivo_consulta"
  | "diagnostico"
  | "punto_anatomico"
  | "nivel_respuesta"
  | "tipo_estudio"
  | "tecnica_quirurgica"
  | "complicacion"
  | "campo_adicional";

// ─────────────────────────────────────────────────────────────
// Ítem de catálogo (versión liviana para el frontend)
// ─────────────────────────────────────────────────────────────
export interface CatalogItemRef {
  id: string;
  name: string;
  catalog?: CatalogType;
}

// ─────────────────────────────────────────────────────────────
// Tablas hijas del caso (formato que devuelve la API)
// ─────────────────────────────────────────────────────────────

export interface AltReasonData {
  itemId: string;
  item: CatalogItemRef;
}

export interface ExamFindingData {
  id: string;
  puntoAnatomicoId?: string | null;
  puntoAnatomico?: CatalogItemRef | null;
  hallazgo: string;
  nivelRespuestaId?: string | null;
  nivelRespuesta?: CatalogItemRef | null;
  order: number;
}

export interface StudyImageData {
  id: string;
  url: string;
  description?: string | null;
}

export interface StudyItemData {
  id: string;
  studyTypeId: string;
  studyType: CatalogItemRef;
  performed: boolean;
  findingsText?: string | null;
  images: StudyImageData[];
}

export interface DiagnosisData {
  caseId: string;
  itemId: string;
  item: CatalogItemRef;
  order: number;
  isCorrect: boolean;
}

export interface SurgicalStepData {
  id: string;
  order: number;
  text: string;
}

export interface ComplicationData {
  caseId: string;
  itemId: string;
  item: CatalogItemRef;
  note?: string | null;
}

export interface AdditionalFieldData {
  id: string;
  phase: number;
  fieldId: string;
  field: CatalogItemRef;
  value: string;
}

// ─────────────────────────────────────────────────────────────
// Caso guardado completo (lo que devuelve la API)
// ─────────────────────────────────────────────────────────────
export interface SavedCase {
  id: string;
  status: CaseStatus;
  createdAt: string;
  updatedAt: string;

  // F1
  finalDiagnosisId?: string | null;
  finalDiagnosis?: CatalogItemRef | null;
  principalReasonId?: string | null;
  principalReason?: CatalogItemRef | null;
  altReasons: AltReasonData[];

  // F2
  signsSymptomsText?: string | null;
  hasVideo: boolean;
  videoUrl?: string | null;

  // F3
  examModality: ExamModality;
  physicalExamNarrative?: string | null;
  examFindings: ExamFindingData[];

  // F4
  studies: StudyItemData[];

  // F5
  diagnoses: DiagnosisData[];

  // F6
  medicalTreatmentText?: string | null;
  includesSurgery: boolean;
  surgicalTechniqueId?: string | null;
  surgicalTechnique?: CatalogItemRef | null;
  surgicalNote?: string | null;
  openApproach?: string | null;
  minimInvasiveApproach?: string | null;
  surgicalSteps: SurgicalStepData[];

  // F7
  complicationsIntroText?: string | null;
  complications: ComplicationData[];

  // F8
  summary?: string | null;

  // Campos adicionales
  additionalFields: AdditionalFieldData[];
}

// ─────────────────────────────────────────────────────────────
// Draft del formulario (estado local mientras se edita)
// ─────────────────────────────────────────────────────────────
export interface ExamFindingDraft {
  id?: string; // cuid si ya existe en BD, undefined si es nuevo
  puntoAnatomicoId?: string | null;
  puntoAnatomicoName?: string | null;
  hallazgo: string;
  nivelRespuestaId?: string | null;
  nivelRespuestaName?: string | null;
  order: number;
}

export interface StudyItemDraft {
  studyTypeId: string;
  studyTypeName: string;
  performed: boolean;
  findingsText: string;
}

export interface DiagnosisDraft {
  itemId: string;
  itemName: string;
  order: number;
  isCorrect: boolean;
}

export interface SurgicalStepDraft {
  id: string; // id local (uuid) para el drag-and-drop
  order: number;
  text: string;
}

export interface ComplicationDraft {
  itemId: string;
  itemName: string;
  note: string;
}

export interface AdditionalFieldDraft {
  id: string; // id local
  phase: number;
  fieldId: string;
  fieldName: string;
  value: string;
}

export interface CaseDraft {
  id?: string;
  isEditing?: boolean;

  // F1
  finalDiagnosisId?: string | null;
  finalDiagnosisName?: string | null;
  principalReasonId?: string | null;
  principalReasonName?: string | null;
  altReasons?: { itemId: string; itemName: string }[];

  // F2
  signsSymptomsText?: string;
  hasVideo?: boolean;
  videoUrl?: string;

  // F3
  examModality?: ExamModality;
  physicalExamNarrative?: string;
  examFindings?: ExamFindingDraft[];

  // F4
  studies?: StudyItemDraft[];

  // F5
  diagnoses?: DiagnosisDraft[];

  // F6
  medicalTreatmentText?: string;
  includesSurgery?: boolean;
  surgicalTechniqueId?: string | null;
  surgicalTechniqueName?: string | null;
  surgicalNote?: string;
  openApproach?: string;
  minimInvasiveApproach?: string;
  surgicalSteps?: SurgicalStepDraft[];

  // F7
  complicationsIntroText?: string;
  complications?: ComplicationDraft[] | string;

  // F8
  summary?: string;

  // Campos adicionales
  additionalFields?: AdditionalFieldDraft[];

  status?: CaseStatus;

  // Campos heredados / retrocompatibilidad con componentes existentes
  title?: string;
  consultationReason?: string;
  clinicalHistory?: string;
  videoDescription?: string;
  isInteractiveExam?: boolean;
  examZone?: string;
  examRefPoint?: string;
  examStandardText?: string;
  painLevel?: string;
  addedStudies?: AddedStudy[];
  treatmentQuestion?: string;
  treatmentOptions?: string;
  structuredTreatments?: TreatmentOptionItem[];
  clinicalSummary?: string;
  epidemiology?: string;
  selectedKeywords?: string[];
  customFields?: CustomFieldItem[];
}

export type CaseFormData = CaseDraft;

// ─────────────────────────────────────────────────────────────
// Temas de la UI
// ─────────────────────────────────────────────────────────────
export interface ThemeOption {
  id: ThemeKey;
  name: string;
  label: string;
  dotPrimary: string;
  dotSecondary: string;
}

export const THEMES: ThemeOption[] = [
  { id: "teal", name: "Teal Clínico", label: "Clínico", dotPrimary: "#13AEB9", dotSecondary: "#194267" },
  { id: "warm", name: "Pediátrico Solar", label: "Solar", dotPrimary: "#DD3506", dotSecondary: "#FE750A" },
  { id: "dark", name: "Cirugía Midnight", label: "Midnight", dotPrimary: "#06B6D4", dotSecondary: "#0A0F1D" },
  { id: "emerald", name: "Quirófano Esmeralda", label: "Esmeralda", dotPrimary: "#10B981", dotSecondary: "#04130F" },
  { id: "neumorphic", name: "Neumorphic Matrix", label: "Neumórfico", dotPrimary: "#006666", dotSecondary: "#E7E5E4" },
];

// ─────────────────────────────────────────────────────────────
// Legacy — se mantienen para no romper imports existentes
// mientras se migra el formulario (Tarea 3)
// ─────────────────────────────────────────────────────────────

/** @deprecated Usar StudyItemDraft */
export interface AddedStudy {
  id?: string;
  name: string;
  isAdequate: boolean;
  findings: string;
  imageUrl: string | null;
  imageName: string | null;
  definition?: string;
}

/** @deprecated Usar DiagnosisDraft */
export interface TreatmentOptionItem {
  id?: string;
  description: string;
  isCorrect: boolean;
  feedback?: string | null;
  order?: number;
}

/** @deprecated Usar AdditionalFieldDraft */
export type CustomFieldType = "text" | "image";
export interface CustomFieldItem {
  id: string;
  phase: number | "summary";
  label: string;
  type?: CustomFieldType;
  value: string;
  imageUrl?: string | null;
  imageName?: string | null;
}

/** @deprecated */
export interface StudyCatalogItem {
  id: string;
  name: string;
  generalDefinition: string | null;
}

export type FormErrorMap = Record<string, string>;
