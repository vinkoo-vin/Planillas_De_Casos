"use client";

import { useState, useCallback, useMemo, FormEvent } from "react";
import {
  StudyCatalogItem,
  SavedCase,
  CaseDraft,
  CaseFormData,
  FormErrorMap,
  CustomFieldItem,
} from "@/types/clinical";
import { FormPhase, PhaseValidationState } from "./CaseStepper";
import { DEFAULT_TREATMENT_OPTIONS } from "./Phase3TreatmentResolution";

interface UseCaseFormProps {
  initialDraft?: CaseDraft | null;
  onClearDraft?: () => void;
  keywordsPool: string[];
  setKeywordsPool: React.Dispatch<React.SetStateAction<string[]>>;
  studiesCatalog: StudyCatalogItem[];
  painLevelsPool: string[];
  setPainLevelsPool: React.Dispatch<React.SetStateAction<string[]>>;
  onCaseCreated: (newCase: SavedCase) => void;
  onCaseUpdated?: (updatedCase: SavedCase) => void;
  onNotify: (msg: string) => void;
}

export function createInitialFormData(defaultPainLevel = ""): CaseFormData {
  return {
    title: "",
    consultationReason: "",
    clinicalHistory: "",
    hasVideo: false,
    videoDescription: "",
    isInteractiveExam: true,
    examZone: "",
    examRefPoint: "",
    examStandardText: "",
    painLevel: defaultPainLevel,
    studies: [],
    treatmentQuestion: "",
    treatmentOptions: DEFAULT_TREATMENT_OPTIONS,
    clinicalSummary: "",
    epidemiology: "",
    complications: "",
    keywords: ["Vómito en proyectil", "Lactante"],
    customFields: [],
  };
}

export function buildFormDataFromDraft(
  draft: CaseDraft | null | undefined,
  defaultPainLevel = ""
): CaseFormData {
  if (!draft) {
    return createInitialFormData(defaultPainLevel);
  }

  // Reconstruir opciones terapéuticas estructuradas si vinieran en formato legacy
  let effectiveTreatments = draft.structuredTreatments;
  if ((!effectiveTreatments || effectiveTreatments.length === 0) && draft.treatmentOptions) {
    const lines = draft.treatmentOptions
      .split("\n")
      .filter((l) => l.trim().length > 0);
    if (lines.length > 0) {
      effectiveTreatments = lines.map((l, i) => ({
        id: `legacy-opt-${i + 1}`,
        description: l
          .replace(/\[CORRECTA\]/gi, "")
          .replace(/\|.*$/, "")
          .replace(/^[-*•\d.]\s*/, "")
          .trim(),
        isCorrect: /\[CORRECTA\]/i.test(l),
        feedback: l.includes("|") ? l.split("|")[1].replace(/feedback:/i, "").trim() : "",
        order: i + 1,
      }));
    }
  }

  return {
    title: draft.title ?? "",
    consultationReason: draft.consultationReason ?? "",
    clinicalHistory: draft.clinicalHistory ?? "",
    hasVideo: draft.hasVideo ?? false,
    videoDescription: draft.videoDescription ?? "",
    isInteractiveExam: draft.isInteractiveExam ?? true,
    examZone: draft.examZone ?? "",
    examRefPoint: draft.examRefPoint ?? "",
    examStandardText: draft.examStandardText ?? "",
    painLevel: draft.painLevel ?? defaultPainLevel,
    studies: draft.addedStudies ?? [],
    treatmentQuestion: draft.treatmentQuestion ?? "",
    treatmentOptions:
      effectiveTreatments && effectiveTreatments.length > 0
        ? effectiveTreatments
        : DEFAULT_TREATMENT_OPTIONS,
    clinicalSummary: draft.clinicalSummary ?? "",
    epidemiology: draft.epidemiology ?? "",
    complications: draft.complications ?? "",
    keywords: draft.selectedKeywords ?? ["Vómito en proyectil", "Lactante"],
    customFields: draft.customFields ?? [],
  };
}

export function useCaseForm({
  initialDraft,
  onClearDraft,
  keywordsPool,
  setKeywordsPool,
  painLevelsPool,
  setPainLevelsPool,
  onCaseCreated,
  onCaseUpdated,
  onNotify,
}: UseCaseFormProps) {
  const [currentPhase, setCurrentPhase] = useState<FormPhase>(1);
  const [prevDraft, setPrevDraft] = useState<CaseDraft | null | undefined>(initialDraft);
  const [editingCaseId, setEditingCaseId] = useState<string | null>(initialDraft?.id || null);

  // ESTADO UNIFICADO DEL FORMULARIO (Evita 18+ useStates dispersos y reduce re-renderizados)
  const [formData, setFormData] = useState<CaseFormData>(() =>
    buildFormDataFromDraft(initialDraft, painLevelsPool[0] || "")
  );

  // Mapa granular de errores de validación por campo
  const [formErrors, setFormErrors] = useState<FormErrorMap>({});

  // Sincronizar borrador inicial durante el render (patrón oficial de React para ajustar estado desde props sin useEffect)
  if (initialDraft !== prevDraft) {
    setPrevDraft(initialDraft);
    setEditingCaseId(initialDraft?.id || null);
    setFormData(buildFormDataFromDraft(initialDraft, painLevelsPool[0] || ""));
    setFormErrors({});
  }

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCase, setSubmittedCase] = useState<SavedCase | null>(null);

  // Actualizador genérico tipado y funcional de campos (rerender-functional-setstate)
  const updateField = useCallback(
    <K extends keyof CaseFormData>(field: K, value: CaseFormData[K] | ((prev: CaseFormData[K]) => CaseFormData[K])) => {
      setFormData((prev) => {
        const nextVal = typeof value === "function" ? (value as (p: CaseFormData[K]) => CaseFormData[K])(prev[field]) : value;
        return { ...prev, [field]: nextVal };
      });
      // Limpiar error asociado a ese campo si existiera
      setFormErrors((prev) => {
        if (!prev[field]) return prev;
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    },
    []
  );

  // Manejo de palabras clave
  const handleToggleKeyword = useCallback(
    (kw: string) => {
      updateField("keywords", (prev) =>
        prev.includes(kw) ? prev.filter((k) => k !== kw) : [...prev, kw]
      );
    },
    [updateField]
  );

  const handleAddCustomKeyword = useCallback(
    async (val: string) => {
      const trimmed = val.trim();
      if (!trimmed) return;

      if (!keywordsPool.includes(trimmed)) {
        try {
          const res = await fetch("/api/keywords", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: trimmed }),
          });
          const json = await res.json();
          if (json.success) {
            setKeywordsPool((prev) => [...prev, json.data.name]);
          }
        } catch (err) {
          console.error("Error al registrar palabra clave:", err);
        }
      }

      updateField("keywords", (prev) =>
        prev.includes(trimmed) ? prev : [...prev, trimmed]
      );
    },
    [keywordsPool, setKeywordsPool, updateField]
  );

  // Manejo de nuevo nivel de dolor
  const handlePromptNewPainLevel = useCallback(async () => {
    const newPain = prompt("Ingrese el nuevo nivel de dolor o hallazgo para añadir al catálogo:");
    if (!newPain || !newPain.trim()) return;
    const trimmed = newPain.trim();
    try {
      const res = await fetch("/api/pain-levels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: trimmed }),
      });
      const json = await res.json();
      if (json.success) {
        setPainLevelsPool((prev) => [...prev, json.data.description]);
        updateField("painLevel", json.data.description);
      }
    } catch (err) {
      console.error("Error al añadir nuevo nivel de dolor:", err);
    }
  }, [setPainLevelsPool, updateField]);

  // Manejo de campos adicionales dinámicos del doctor
  const handleAddCustomField = useCallback(
    (phase: number | "summary") => {
      const newField: CustomFieldItem = {
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `cf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        phase,
        label: "",
        value: "",
      };
      updateField("customFields", (prev) => [...prev, newField]);
    },
    [updateField]
  );

  const handleUpdateCustomField = useCallback(
    (id: string, updates: Partial<CustomFieldItem>) => {
      updateField("customFields", (prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
    },
    [updateField]
  );

  const handleRemoveCustomField = useCallback(
    (id: string) => {
      updateField("customFields", (prev) => prev.filter((item) => item.id !== id));
    },
    [updateField]
  );

  // Reiniciar formulario
  const handleResetForm = useCallback(() => {
    setEditingCaseId(null);
    setPrevDraft(null);
    setSubmittedCase(null);
    setCurrentPhase(1);
    setFormData(createInitialFormData(painLevelsPool[0] || ""));
    setFormErrors({});
    if (onClearDraft) onClearDraft();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [onClearDraft, painLevelsPool]);

  // Navegación entre Fases
  const goToNextPhase = useCallback(() => {
    setCurrentPhase((prev) => {
      const next = (prev < 4 ? prev + 1 : prev) as FormPhase;
      window.scrollTo({ top: 120, behavior: "smooth" });
      return next;
    });
  }, []);

  const goToPrevPhase = useCallback(() => {
    setCurrentPhase((prev) => {
      const next = (prev > 1 ? prev - 1 : prev) as FormPhase;
      window.scrollTo({ top: 120, behavior: "smooth" });
      return next;
    });
  }, []);

  const selectPhase = useCallback((phase: FormPhase) => {
    setCurrentPhase(phase);
    window.scrollTo({ top: 120, behavior: "smooth" });
  }, []);

  // Estado de validación reactivo por fase (rerender-derived-state-no-effect)
  const phaseValidation = useMemo<Record<FormPhase, PhaseValidationState>>(() => {
    const p1Complete = Boolean(
      formData.title.trim() &&
        formData.consultationReason.trim() &&
        formData.clinicalHistory.trim() &&
        formData.painLevel.trim()
    );
    const p2Complete = formData.studies.length > 0 && formData.studies.every((s) => Boolean(s.name.trim()));
    const p3Complete =
      formData.treatmentOptions.length > 0 &&
      formData.treatmentOptions.some((t) => t.isCorrect && t.description.trim());
    const p4Complete = formData.keywords.length > 0;

    const p1HasErrors = Boolean(formErrors.title || formErrors.consultationReason || formErrors.clinicalHistory || formErrors.painLevel);
    const p3HasErrors = Boolean(formErrors.treatmentOptions);

    return {
      1: { isComplete: p1Complete, hasErrors: p1HasErrors },
      2: { isComplete: p2Complete },
      3: { isComplete: p3Complete, hasErrors: p3HasErrors },
      4: { isComplete: p4Complete },
    };
  }, [formData, formErrors]);

  // Validación exhaustiva previa al envío
  const validateForm = useCallback((): { isValid: boolean; targetPhase: FormPhase; errors: FormErrorMap } => {
    const errors: FormErrorMap = {};
    let targetPhase: FormPhase = 1;

    // Fase 1
    if (!formData.title.trim()) {
      errors.title = "El nombre o título del caso es obligatorio";
      targetPhase = 1;
    }
    if (!formData.consultationReason.trim()) {
      errors.consultationReason = "El motivo de consulta del paciente es obligatorio";
      targetPhase = 1;
    }
    if (!formData.clinicalHistory.trim()) {
      errors.clinicalHistory = "La historia clínica y anamnesis es obligatoria";
      targetPhase = 1;
    }
    if (!formData.painLevel.trim()) {
      errors.painLevel = "Debe seleccionar la respuesta del examen físico o nivel de dolor";
      targetPhase = 1;
    }

    // Si la Fase 1 pasó, validar Fase 3
    if (Object.keys(errors).length === 0) {
      const hasCorrect = formData.treatmentOptions.some((t) => t.isCorrect && t.description.trim());
      if (!hasCorrect) {
        errors.treatmentOptions = "Debe registrar al menos una conducta terapéutica válida como correcta";
        targetPhase = 3;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      targetPhase,
      errors,
    };
  }, [formData]);

  // Envío del formulario
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const { isValid, targetPhase, errors } = validateForm();
    if (!isValid) {
      setFormErrors(errors);
      setCurrentPhase(targetPhase);
      const firstErrorMessage = Object.values(errors)[0] || "Por favor complete los campos obligatorios.";
      onNotify(firstErrorMessage);
      return;
    }

    // Construir texto plano legacy de tratamientos para retrocompatibilidad
    const treatmentRawLegacy = formData.treatmentOptions
      .map(
        (t) =>
          `- ${t.description}${t.isCorrect ? " [CORRECTA]" : ""}${
            t.feedback ? ` | Feedback: ${t.feedback}` : ""
          }`
      )
      .join("\n");

    const payload = {
      ...(editingCaseId ? { id: editingCaseId } : {}),
      title: formData.title.trim(),
      consultationReason: formData.consultationReason.trim(),
      clinicalHistory: formData.clinicalHistory.trim(),
      hasVideo: formData.hasVideo,
      videoDescription: formData.hasVideo ? formData.videoDescription.trim() || null : null,
      isPhysicalExamInteractive: formData.isInteractiveExam,
      physicalExamZone: formData.isInteractiveExam ? formData.examZone.trim() || null : null,
      physicalExamRefPoint: formData.isInteractiveExam ? formData.examRefPoint.trim() || null : null,
      physicalExamStandard: !formData.isInteractiveExam ? formData.examStandardText.trim() || null : null,
      painLevel: formData.painLevel.trim(),
      treatmentQuestion: formData.treatmentQuestion?.trim() || null,
      treatmentRaw: treatmentRawLegacy,
      structuredTreatments: formData.treatmentOptions,
      clinicalSummary: formData.clinicalSummary.trim() || null,
      epidemiology: formData.epidemiology.trim() || null,
      complications: formData.complications.trim() || null,
      keywords: formData.keywords,
      studies: formData.studies,
      customFields: formData.customFields,
    };

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/cases", {
        method: editingCaseId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.success) {
        setSubmittedCase(json.data);
        if (editingCaseId) {
          if (onCaseUpdated) onCaseUpdated(json.data);
          onNotify("Caso clínico actualizado exitosamente");
        } else {
          onCaseCreated(json.data);
          onNotify("Caso clínico registrado y publicado exitosamente");
        }
        setTimeout(() => {
          document.getElementById("summaryCard")?.scrollIntoView({ behavior: "smooth" });
        }, 150);
      } else {
        onNotify("Error al guardar: " + (json.error || "No se pudo guardar el caso clínico"));
      }
    } catch (err) {
      console.error("Error al enviar caso:", err);
      onNotify("Ocurrió un error al intentar registrar el caso clínico.");
    } finally {
      setIsSubmitting(false);
    }

  };

  return {
    currentPhase,
    setCurrentPhase: selectPhase,
    goToNextPhase,
    goToPrevPhase,
    phaseValidation,
    editingCaseId,
    formData,
    formErrors,
    updateField,
    handleToggleKeyword,
    handleAddCustomKeyword,
    handlePromptNewPainLevel,
    handleAddCustomField,
    handleUpdateCustomField,
    handleRemoveCustomField,
    keywordsPool,
    painLevelsPool,
    isSubmitting,
    submittedCase,
    handleSubmit,
    handleResetForm,
  };
}
