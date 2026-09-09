export interface StudyCatalogItem {
  id: string;
  name: string;
  generalDefinition: string | null;
}

export interface AddedStudy {
  name: string;
  isAdequate: boolean;
  findings: string;
  imageUrl: string | null;
  imageName: string | null;
  definition?: string;
}

export interface SavedCase {
  id: string;
  title: string;
  clinicalHistory: string;
  painLevel: string;
  hasVideo: boolean;
  videoDescription?: string | null;
  isPhysicalExamInteractive: boolean;
  physicalExamZone?: string | null;
  physicalExamRefPoint?: string | null;
  physicalExamStandard?: string | null;
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
  treatmentOptions: {
    id?: string;
    description: string;
    isCorrect: boolean;
    order?: number;
  }[];
}

export interface CaseDraft {
  id?: string;
  isEditing?: boolean;
  title?: string;
  clinicalHistory?: string;
  treatmentOptions?: string;
  selectedKeywords?: string[];
  isInteractiveExam?: boolean;
  examZone?: string | null;
  examRefPoint?: string | null;
  examStandardText?: string | null;
  painLevel?: string;
  hasVideo?: boolean;
  videoDescription?: string | null;
  addedStudies?: AddedStudy[];
}

export type ThemeKey = "teal" | "warm" | "dark" | "emerald";

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
];
