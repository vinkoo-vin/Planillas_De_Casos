"use client";

import React from "react";
import { StudyCatalogItem, SavedCase, CaseDraft } from "@/types/clinical";
import { CaseStepper, FormPhase } from "./CaseStepper";
import { Phase1MotivoConsulta } from "./phases/Phase1MotivoConsulta";
import { Phase2SignosSintomas } from "./phases/Phase2SignosSintomas";
import { Phase3ExamenFisico } from "./phases/Phase3ExamenFisico";
import { Phase4Estudios } from "./phases/Phase4Estudios";
import { Phase5DiagnosticoDiferencial } from "./phases/Phase5DiagnosticoDiferencial";
import { Phase6Tratamiento } from "./phases/Phase6Tratamiento";
import { Phase7Complicaciones } from "./phases/Phase7Complicaciones";
import { Phase8Resumen } from "./phases/Phase8Resumen";
import { CaseSummaryCard } from "./CaseSummaryCard";
import { useCaseForm } from "./useCaseForm";

interface CaseFormProps {
  initialDraft?: CaseDraft | null;
  onClearDraft?: () => void;
  keywordsPool?: string[];
  setKeywordsPool?: React.Dispatch<React.SetStateAction<string[]>>;
  studiesCatalog?: StudyCatalogItem[];
  painLevelsPool?: string[];
  setPainLevelsPool?: React.Dispatch<React.SetStateAction<string[]>>;
  onCaseCreated: (newCase: SavedCase) => void;
  onCaseUpdated?: (updatedCase: SavedCase) => void;
  onViewCasesList: () => void;
  onNotify: (msg: string) => void;
}

const NEXT_PHASE_LABELS: Record<number, string> = {
  1: "Continuar a Signos y Síntomas",
  2: "Continuar a Examen Físico",
  3: "Continuar a Estudios",
  4: "Continuar a Diagnóstico Diferencial",
  5: "Continuar a Tratamiento",
  6: "Continuar a Complicaciones",
  7: "Continuar a Resumen del Caso",
};

export const CaseForm = React.memo(function CaseForm({
  initialDraft,
  onClearDraft,
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
    isSubmitting,
    submittedCase,
    handleSubmit,
    handleResetForm,
  } = useCaseForm({
    initialDraft,
    onClearDraft,
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
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </span>
            <div className="text-xs sm:text-sm text-text-body">
              <span className="font-bold text-text-main">Modo Edición Activado:</span>{" "}
              Modificando caso <strong>{formData.finalDiagnosisName ? `"${formData.finalDiagnosisName}"` : `#${editingCaseId}`}</strong>. Puede navegar libremente entre las 8 fases y guardar cambios.
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
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </span>
            <div className="text-xs sm:text-sm text-text-body">
              <span className="font-bold text-text-main">Borrador de Ejemplo Cargado:</span>{" "}
              Visualizando <strong>&ldquo;{formData.finalDiagnosisName || "Caso Clínico"}&rdquo;</strong>. Puede adaptar los campos o continuar con la publicación.
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              handleResetForm();
              if (onClearDraft) onClearDraft();
            }}
            className="text-xs font-semibold text-teal hover:underline cursor-pointer"
          >
            Limpiar y empezar desde cero
          </button>
        </aside>
      ) : null}

      {/* STEPPER DE LAS 8 FASES */}
      <CaseStepper
        currentPhase={currentPhase}
        onSelectPhase={(phase) => setCurrentPhase(phase as FormPhase)}
        phaseValidation={phaseValidation}
      />

      {/* CONTENIDO DE LA FASE ACTIVA */}
      <form onSubmit={handleSubmit} noValidate>
        <div className="phase-container" id={`phase-panel-${currentPhase}`}>
          {currentPhase === 1 && (
            <Phase1MotivoConsulta
              data={formData}
              errors={formErrors}
              updateField={updateField}
            />
          )}

          {currentPhase === 2 && (
            <Phase2SignosSintomas
              data={formData}
              errors={formErrors}
              updateField={updateField}
            />
          )}

          {currentPhase === 3 && (
            <Phase3ExamenFisico
              data={formData}
              errors={formErrors}
              updateField={updateField}
            />
          )}

          {currentPhase === 4 && (
            <Phase4Estudios
              data={formData}
              errors={formErrors}
              updateField={updateField}
            />
          )}

          {currentPhase === 5 && (
            <Phase5DiagnosticoDiferencial
              data={formData}
              errors={formErrors}
              updateField={updateField}
            />
          )}

          {currentPhase === 6 && (
            <Phase6Tratamiento
              data={formData}
              errors={formErrors}
              updateField={updateField}
            />
          )}

          {currentPhase === 7 && (
            <Phase7Complicaciones
              data={formData}
              errors={formErrors}
              updateField={updateField}
            />
          )}

          {currentPhase === 8 && (
            <Phase8Resumen
              data={formData}
              errors={formErrors}
              updateField={updateField}
            />
          )}
        </div>

        {/* BARRA INFERIOR DE NAVEGACIÓN Y ACCIONES */}
        <div className="form-actions mt-8 pt-6 border-t border-border-subtle flex items-center justify-between gap-3 flex-wrap">
          <div>
            {currentPhase > 1 && (
              <button
                type="button"
                onClick={goToPrevPhase}
                disabled={isSubmitting}
                className="btn border border-border-subtle hover:bg-surface-hover text-text-main text-xs sm:text-sm px-4 py-2.5 rounded-xl font-semibold cursor-pointer transition-colors"
              >
                ← Fase Anterior
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* GUARDAR BORRADOR EN CUALQUIER FASE */}
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              className="btn border border-teal/40 text-teal-text hover:bg-teal-light text-xs sm:text-sm px-4 py-2.5 rounded-xl font-semibold cursor-pointer transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Guardando..." : "Guardar Borrador"}
            </button>

            {/* BOTÓN PRINCIPAL: SIGUIENTE FASE O PUBLICAR */}
            {currentPhase < 8 ? (
              <button
                type="button"
                onClick={goToNextPhase}
                disabled={isSubmitting}
                className="btn btn-teal text-xs sm:text-sm px-5 py-2.5 rounded-xl font-semibold cursor-pointer shadow-sm transition-transform hover:-translate-y-0.5"
              >
                {NEXT_PHASE_LABELS[currentPhase] || "Continuar"} →
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-teal text-xs sm:text-sm px-6 py-2.5 rounded-xl font-bold cursor-pointer shadow-md transition-transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {isSubmitting ? "Guardando..." : editingCaseId ? "Actualizar Caso Clínico" : "Guardar y Finalizar Caso"}
              </button>
            )}
          </div>
        </div>
      </form>

      {/* TARJETA DE ÉXITO TRAS GUARDAR */}
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
