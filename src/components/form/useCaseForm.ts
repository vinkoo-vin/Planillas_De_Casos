"use client";

import { useState, useCallback, useMemo, FormEvent } from "react";
import {
  SavedCase,
  CaseDraft,
  FormErrorMap,
} from "@/types/clinical";
import { FormPhase, PhaseValidationState } from "./CaseStepper";

interface UseCaseFormProps {
  initialDraft?: CaseDraft | null;
  onClearDraft?: () => void;
  onCaseCreated: (newCase: SavedCase) => void;
  onCaseUpdated?: (updatedCase: SavedCase) => void;
  onNotify: (msg: string) => void;
}

export function createInitialFormData(): CaseDraft {
  return {
    status: "DRAFT",
    finalDiagnosisId: null,
    finalDiagnosisName: null,
    principalReasonId: null,
    principalReasonName: null,
    altReasons: [],
    signsSymptomsText: "",
    hasVideo: false,
    videoUrl: "",
    examModality: "interactive",
    physicalExamNarrative: "",
    examFindings: [],
    studies: [],
    diagnoses: [],
    medicalTreatmentText: "",
    includesSurgery: false,
    surgicalTechniqueId: null,
    surgicalTechniqueName: null,
    surgicalNote: "",
    openApproach: "",
    minimInvasiveApproach: "",
    surgicalSteps: [],
    complicationsIntroText: "",
    complications: [],
    summary: "",
    additionalFields: [],
  };
}

export function buildFormDataFromDraft(draft: CaseDraft | null | undefined): CaseDraft {
  if (!draft) return createInitialFormData();
  return {
    ...createInitialFormData(),
    ...draft,
  };
}

export function useCaseForm({
  initialDraft,
  onClearDraft,
  onCaseCreated,
  onCaseUpdated,
  onNotify,
}: UseCaseFormProps) {
  const [currentPhase, setCurrentPhase] = useState<FormPhase>(1);
  const [prevDraft, setPrevDraft] = useState<CaseDraft | null | undefined>(initialDraft);
  const [editingCaseId, setEditingCaseId] = useState<string | null>(initialDraft?.id || null);

  const [formData, setFormData] = useState<CaseDraft>(() => buildFormDataFromDraft(initialDraft));
  const [formErrors, setFormErrors] = useState<FormErrorMap>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCase, setSubmittedCase] = useState<SavedCase | null>(null);
  const [showPostSubmitModal, setShowPostSubmitModal] = useState(false);

  // Sincronizar borrador inicial si cambia externamente (ej: al hacer clic en Editar en la tabla)
  if (initialDraft !== prevDraft) {
    setPrevDraft(initialDraft);
    setEditingCaseId(initialDraft?.id || null);
    setFormData(buildFormDataFromDraft(initialDraft));
    setFormErrors({});
  }

  const updateField = useCallback(
    <K extends keyof CaseDraft>(field: K, value: CaseDraft[K] | ((prev: CaseDraft[K]) => CaseDraft[K])) => {
      setFormData((prev) => {
        const nextVal = typeof value === "function" ? (value as (p: CaseDraft[K]) => CaseDraft[K])(prev[field]) : value;
        return { ...prev, [field]: nextVal };
      });

      setFormErrors((prev) => {
        if (!prev[field]) return prev;
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    },
    []
  );

  const handleResetForm = useCallback(() => {
    setFormData(createInitialFormData());
    setFormErrors({});
    setEditingCaseId(null);
    setSubmittedCase(null);
    setShowPostSubmitModal(false);
    setCurrentPhase(1);
    if (onClearDraft) onClearDraft();
  }, [onClearDraft]);

  const reuseFormData = useCallback(() => {
    setFormData((prev) => ({ ...prev, id: undefined, isEditing: false, status: "DRAFT" }));
    setFormErrors({});
    setEditingCaseId(null);
    setSubmittedCase(null);
    setShowPostSubmitModal(false);
    setCurrentPhase(1);
  }, []);

  // Validación y estado de completitud por fase (1 a 8)
  const phaseValidation = useMemo((): Record<FormPhase, PhaseValidationState> => {
    return {
      1: {
        isComplete: Boolean(formData.finalDiagnosisId && formData.principalReasonId),
        hasErrors: Boolean(formErrors.finalDiagnosisId || formErrors.principalReasonId),
      },
      2: {
        isComplete: Boolean(formData.signsSymptomsText && formData.signsSymptomsText.trim().length > 15),
        hasErrors: Boolean(formErrors.signsSymptomsText),
      },
      3: {
        isComplete:
          formData.examModality === "narrative"
            ? Boolean(formData.physicalExamNarrative && formData.physicalExamNarrative.trim().length > 10)
            : Boolean(formData.examFindings && formData.examFindings.length > 0),
        hasErrors: false,
      },
      4: {
        isComplete: Boolean(formData.studies && formData.studies.some((s) => s.performed)),
        hasErrors: false,
      },
      5: {
        isComplete: Boolean(
          formData.diagnoses &&
            formData.diagnoses.length > 0 &&
            formData.diagnoses.some((d) => d.isCorrect && Boolean(d.itemId))
        ),
        hasErrors: false,
      },
      6: {
        isComplete: Boolean(
          formData.medicalTreatmentText ||
            (formData.includesSurgery && Boolean(formData.surgicalTechniqueId))
        ),
        hasErrors: false,
      },
      7: {
        isComplete: Boolean(
          (Array.isArray(formData.complications) && formData.complications.length > 0) ||
            formData.complicationsIntroText
        ),
        hasErrors: false,
      },
      8: {
        isComplete: Boolean(formData.summary && formData.summary.trim().length > 15),
        hasErrors: Boolean(formErrors.summary),
      },
    };
  }, [formData, formErrors]);

  const validateCurrentPhase = useCallback((): boolean => {
    const errors: FormErrorMap = {};

    if (currentPhase === 1) {
      if (!formData.finalDiagnosisId) {
        errors.finalDiagnosisId = "El diagnóstico final es obligatorio para identificar el caso.";
      }
      if (!formData.principalReasonId) {
        errors.principalReasonId = "Debe seleccionar un motivo principal de consulta.";
      }
    } else if (currentPhase === 2) {
      if (!formData.signsSymptomsText || formData.signsSymptomsText.trim().length < 10) {
        errors.signsSymptomsText = "Por favor ingrese al menos 10 caracteres con la historia clínica y síntomas.";
      }
    } else if (currentPhase === 8) {
      if (!formData.summary || formData.summary.trim().length < 10) {
        errors.summary = "Por favor redacte un resumen o discusión para finalizar el caso.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return false;
    }
    return true;
  }, [currentPhase, formData]);

  const goToNextPhase = useCallback(() => {
    if (validateCurrentPhase()) {
      if (currentPhase < 8) {
        setCurrentPhase((prev) => (prev + 1) as FormPhase);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, [currentPhase, validateCurrentPhase]);

  const goToPrevPhase = useCallback(() => {
    if (currentPhase > 1) {
      setCurrentPhase((prev) => (prev - 1) as FormPhase);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPhase]);

  // Envío del caso (Creación o Actualización)
  const handleSubmit = useCallback(
    async (e?: FormEvent, openReuseModal = false) => {
      if (e) e.preventDefault();

      if (!formData.finalDiagnosisId) {
        setFormErrors({ finalDiagnosisId: "El diagnóstico final es requerido antes de guardar." });
        setCurrentPhase(1);
        onNotify("Por favor complete los campos obligatorios en la Fase 1.");
        return;
      }

      setIsSubmitting(true);
      try {
        const payload = {
          id: editingCaseId || undefined,
          status: formData.status || "DRAFT",
          // F1
          finalDiagnosisId: formData.finalDiagnosisId || null,
          principalReasonId: formData.principalReasonId || null,
          altReasons: formData.altReasons?.map((r) => ({ itemId: r.itemId })) || [],
          // F2
          signsSymptomsText: formData.signsSymptomsText || null,
          hasVideo: Boolean(formData.hasVideo),
          videoUrl: formData.videoUrl || null,
          // F3
          examModality: formData.examModality || "interactive",
          physicalExamNarrative: formData.physicalExamNarrative || null,
          examFindings:
            formData.examFindings?.map((f, i) => ({
              puntoAnatomicoId: f.puntoAnatomicoId || null,
              hallazgo: f.hallazgo,
              nivelRespuestaId: f.nivelRespuestaId || null,
              order: i + 1,
            })) || [],
          // F4
          studies:
            formData.studies?.map((s) => ({
              studyTypeId: s.studyTypeId,
              performed: Boolean(s.performed),
              findingsText: s.findingsText || null,
              images: (s.images || []).map((image) => ({
                url: image.url,
                description: image.description || null,
              })),
            })) || [],
          // F5
          diagnoses:
            formData.diagnoses
              ?.filter((d) => Boolean(d.itemId))
              .map((d, i) => ({
                itemId: d.itemId,
                order: i + 1,
                isCorrect: Boolean(d.isCorrect),
              })) || [],
          // F6
          medicalTreatmentText: formData.medicalTreatmentText || null,
          includesSurgery: Boolean(formData.includesSurgery),
          surgicalTechniqueId: formData.surgicalTechniqueId || null,
          surgicalNote: formData.surgicalNote || null,
          openApproach: formData.openApproach || null,
          minimInvasiveApproach: formData.minimInvasiveApproach || null,
          surgicalSteps:
            formData.surgicalSteps?.map((step, i) => ({
              order: i + 1,
              text: step.text,
            })) || [],
          // F7
          complicationsIntroText: formData.complicationsIntroText || null,
          complications: Array.isArray(formData.complications)
            ? formData.complications.map((c) => ({
                itemId: c.itemId,
                note: c.note || null,
              }))
            : [],
          // F8
          summary: formData.summary || null,
          // Campos adicionales
          additionalFields:
            formData.additionalFields
              ?.filter((f) => Boolean(f.fieldId))
              .map((f) => ({
                phase: f.phase,
                fieldId: f.fieldId,
                value: f.value,
              })) || [],
        };

        const isEditing = Boolean(editingCaseId);
        const url = "/api/cases";
        const method = isEditing ? "PUT" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error || `Error del servidor HTTP ${res.status}`);
        }

        const json = await res.json();
        if (!json.success || !json.data) {
          throw new Error(json.error || "No se recibieron datos del caso");
        }

        const saved: SavedCase = json.data;
        setSubmittedCase(saved);
        setShowPostSubmitModal(openReuseModal);

        if (isEditing && onCaseUpdated) {
          onCaseUpdated(saved);
          onNotify("Caso clínico actualizado exitosamente en el repositorio.");
        } else {
          onCaseCreated(saved);
          onNotify("Caso clínico registrado y guardado exitosamente.");
        }
      } catch (err: unknown) {
        console.error("Error al guardar caso clínico:", err);
        const msg = err instanceof Error ? err.message : "Error al guardar el caso";
        onNotify(`Error: ${msg}`);
      } finally {
        setIsSubmitting(false);
      }
    },
    [editingCaseId, formData, onCaseCreated, onCaseUpdated, onNotify]
  );

  return {
    currentPhase,
    setCurrentPhase,
    goToNextPhase,
    goToPrevPhase,
    phaseValidation,
    editingCaseId,
    formData,
    formErrors,
    updateField,
    isSubmitting,
    submittedCase,
    showPostSubmitModal,
    handleSubmit,
    handleResetForm,
    reuseFormData,
  };
}
