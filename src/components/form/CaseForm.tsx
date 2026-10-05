"use client";

import React from "react";
import { StudyCatalogItem, SavedCase, CaseDraft } from "@/types/clinical";
import { CaseStepper } from "./CaseStepper";
import { Phase1Presentation } from "./Phase1Presentation";
import { Phase2DiagnosticMatrix } from "./Phase2DiagnosticMatrix";
import { Phase3TreatmentResolution } from "./Phase3TreatmentResolution";
import { Phase4ClinicalSummary } from "./Phase4ClinicalSummary";
import { CaseSummaryCard } from "./CaseSummaryCard";
import { useCaseForm } from "./useCaseForm";

interface CaseFormProps {
  initialDraft?: CaseDraft | null;
  onClearDraft?: () => void;
  keywordsPool: string[];
  setKeywordsPool: React.Dispatch<React.SetStateAction<string[]>>;
  studiesCatalog: StudyCatalogItem[];
  painLevelsPool: string[];
  setPainLevelsPool: React.Dispatch<React.SetStateAction<string[]>>;
  onCaseCreated: (newCase: SavedCase) => void;
  onCaseUpdated?: (updatedCase: SavedCase) => void;
  onViewCasesList: () => void;
  onNotify: (msg: string) => void;
}

const NEXT_PHASE_LABELS: Record<number, string> = {
  1: "Continuar a Fase 2: Diagnóstico",
  2: "Continuar a Fase 3: Tratamiento",
  3: "Continuar a Fase 4: Resumen del Caso",
};

export const CaseForm = React.memo(function CaseForm({
  initialDraft,
  onClearDraft,
  keywordsPool,
  setKeywordsPool,
  studiesCatalog,
  painLevelsPool,
  setPainLevelsPool,
  onCaseCreated,
  onCaseUpdated,
  onViewCasesList,
  onNotify,
}: CaseFormProps) {
  const {
    currentPhase,
    setCurrentPhase,
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
    isSubmitting,
    submittedCase,
    handleSubmit,
    handleResetForm,
  } = useCaseForm({
    initialDraft,
    onClearDraft,
    keywordsPool,
    setKeywordsPool,
    studiesCatalog,
    painLevelsPool,
    setPainLevelsPool,
    onCaseCreated,
    onCaseUpdated,
    onNotify,
  });

  return (
    <div>
      {/* NOTIFICACIÓN DE MODO EDICIÓN */}
      {editingCaseId ? (
        <aside
          aria-label="Notificación de edición de caso"
          className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 flex-wrap animate-fadeIn"
        >
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
              ✏️
            </span>
            <div className="text-xs sm:text-sm text-text-body">
              <span className="font-bold text-text-main">Modo Edición Activado:</span>{" "}
              Modificando caso <strong>{formData.title ? `"${formData.title}"` : `#${editingCaseId}`}</strong>. Puede navegar libremente entre las 4 fases y guardar cambios.
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              handleResetForm();
              if (onClearDraft) onClearDraft();
            }}
            className="text-xs font-semibold text-amber-800 dark:text-amber-300 hover:underline cursor-pointer"
          >
            Cancelar edición y crear nuevo caso
          </button>
        </aside>
      ) : initialDraft ? (
        <aside
          aria-label="Notificación de caso de ejemplo"
          className="mb-6 p-4 rounded-2xl bg-teal-light border border-teal-border flex items-center justify-between gap-4 flex-wrap animate-fadeIn"
        >
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-teal text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
              ✨
            </span>
            <div className="text-xs sm:text-sm text-text-body">
              <span className="font-bold text-text-main">Borrador de Ejemplo Cargado:</span>{" "}
              Visualizando <strong>&ldquo;{formData.title || "Caso Clínico"}&rdquo;</strong>. Puede adaptar los campos o continuar con la publicación.
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              handleResetForm();
              if (onClearDraft) onClearDraft();
            }}
            className="text-xs font-semibold text-teal-text hover:underline cursor-pointer"
          >
            Limpiar y empezar desde cero
          </button>
        </aside>
      ) : null}

      {/* STEPPER SUPERIOR CON ACCESIBILIDAD ARIA */}
      <CaseStepper
        currentPhase={currentPhase}
        onSelectPhase={setCurrentPhase}
        phaseValidation={phaseValidation}
      />

      {/* FORMULARIO PRINCIPAL */}
      <form onSubmit={handleSubmit} noValidate>
        {/* FASE 1: MOTIVO DE CONSULTA */}
        {currentPhase === 1 && (
          <Phase1Presentation
            data={formData}
            updateField={updateField}
            formErrors={formErrors}
            painLevelsPool={painLevelsPool}
            onPromptNewPainLevel={handlePromptNewPainLevel}
            onAddCustomField={handleAddCustomField}
            onUpdateCustomField={handleUpdateCustomField}
            onRemoveCustomField={handleRemoveCustomField}
          />
        )}

        {/* FASE 2: DIAGNÓSTICO */}
        {currentPhase === 2 && (
          <Phase2DiagnosticMatrix
            data={formData}
            updateField={updateField}
            onNotify={onNotify}
            onAddCustomField={handleAddCustomField}
            onUpdateCustomField={handleUpdateCustomField}
            onRemoveCustomField={handleRemoveCustomField}
          />
        )}

        {/* FASE 3: TRATAMIENTO */}
        {currentPhase === 3 && (
          <Phase3TreatmentResolution
            data={formData}
            updateField={updateField}
            formErrors={formErrors}
            onNotify={onNotify}
            onAddCustomField={handleAddCustomField}
            onUpdateCustomField={handleUpdateCustomField}
            onRemoveCustomField={handleRemoveCustomField}
          />
        )}

        {/* FASE 4: RESUMEN DEL CASO */}
        {currentPhase === 4 && (
          <Phase4ClinicalSummary
            data={formData}
            updateField={updateField}
            keywordsPool={keywordsPool}
            onToggleKeyword={handleToggleKeyword}
            onAddCustomKeyword={handleAddCustomKeyword}
            onSelectPhase={setCurrentPhase}
            isSubmitting={isSubmitting}
            isEditing={Boolean(editingCaseId)}
            onAddCustomField={handleAddCustomField}
            onUpdateCustomField={handleUpdateCustomField}
            onRemoveCustomField={handleRemoveCustomField}
          />
        )}

        {/* CONTROLES DE NAVEGACIÓN INFERIOR DEL STEPPER */}
        <div className="flex items-center justify-between gap-4 mt-8 pt-5 border-t border-border-subtle flex-wrap">
          <div>
            {currentPhase > 1 && (
              <button
                type="button"
                onClick={goToPrevPhase}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-surface hover:bg-surface-subtle border border-border-subtle text-text-main transition-all cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
              >
                <span>&larr; Fase Anterior</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentPhase < 4 && (
              <button
                type="button"
                onClick={goToNextPhase}
                className="btn btn-teal inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
              >
                <span>{NEXT_PHASE_LABELS[currentPhase] || "Continuar"}</span>
                <span>&rarr;</span>
              </button>
            )}
          </div>
        </div>
      </form>

      {/* TARJETA RESUMEN TRAS GUARDAR */}
      {submittedCase && (
        <CaseSummaryCard
          submittedCase={submittedCase}
          onResetForm={handleResetForm}
          onViewCases={onViewCasesList}
        />
      )}
    </div>
  );
});
