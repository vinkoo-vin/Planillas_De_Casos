export interface StudyCatalogItem {
  id: string;
  name: string;
  generalDefinition: string | null;
}

export interface AddedStudy {
  id?: string;
  name: string;
  isAdequate: boolean;
  findings: string;
  imageUrl: string | null;
  imageName: string | null;
  definition?: string;
}


export interface TreatmentOptionItem {
  id?: string;
  description: string;
  isCorrect: boolean;
  feedback?: string | null;
  order?: number;
}

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

export interface SavedCase {
  id: string;
  title: string;
  consultationReason?: string | null;
  clinicalHistory: string;
  painLevel: string;
  hasVideo: boolean;
  videoDescription?: string | null;
  isPhysicalExamInteractive: boolean;
  physicalExamZone?: string | null;
  physicalExamRefPoint?: string | null;
  physicalExamStandard?: string | null;
  treatmentQuestion?: string | null;
  clinicalSummary?: string | null;
  epidemiology?: string | null;
  complications?: string | null;
  customFields?: CustomFieldItem[] | null;
  createdAt: string;
  keywords: { keyword: { name: string } }[];
  studies: {
    id?: string;
    studyCatalog: { name: string };
    isAdequate: boolean;
    findings?: string;
    imageUrl?: string | null;
    imageName?: string | null;
  }[];
  treatmentOptions: TreatmentOptionItem[];
}

export interface CaseDraft {
  id?: string;
  isEditing?: boolean;
  title?: string;
  consultationReason?: string | null;
  clinicalHistory?: string;
  treatmentQuestion?: string | null;
  treatmentOptions?: string;
  structuredTreatments?: TreatmentOptionItem[];
  selectedKeywords?: string[];
  isInteractiveExam?: boolean;
  examZone?: string | null;
  examRefPoint?: string | null;
  examStandardText?: string | null;
  painLevel?: string;
  hasVideo?: boolean;
  videoDescription?: string | null;
  clinicalSummary?: string | null;
  epidemiology?: string | null;
  complications?: string | null;
  addedStudies?: AddedStudy[];
  customFields?: CustomFieldItem[];
}

export interface CaseFormData {
  // Fase 1: Presentación & Semiología
  title: string;
  consultationReason: string;
  clinicalHistory: string;
  hasVideo: boolean;
  videoDescription: string;
  isInteractiveExam: boolean;
  examZone: string;
  examRefPoint: string;
  examStandardText: string;
  painLevel: string;

  // Fase 2: Matriz Diagnóstica
  studies: AddedStudy[];

  // Fase 3: Resolución Terapéutica
  treatmentQuestion: string;
  treatmentOptions: TreatmentOptionItem[];

  // Fase 4: Resumen & Epílogo Docente
  clinicalSummary: string;
  epidemiology: string;
  complications: string;
  keywords: string[];

  // Campos Adicionales Dinámicos por Fase y Resumen
  customFields: CustomFieldItem[];
}

export type FormErrorMap = Partial<Record<keyof CaseFormData, string>>;

export type ThemeKey = "teal" | "warm" | "dark" | "emerald" | "neumorphic";

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
