"use client";

import React from "react";
import { StudyCatalogItem, SavedCase, CaseDraft } from "@/types/clinical";
import { KeywordsSection } from "./KeywordsSection";
import { PhysicalExamSection } from "./PhysicalExamSection";
import { StudiesSection } from "./StudiesSection";
import { TreatmentSection } from "./TreatmentSection";
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

export function CaseForm({
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
    editingCaseId,
    caseTitle,
    setCaseTitle,
    selectedKeywords,
    handleToggleKeyword,
    handleAddCustomKeyword,
    clinicalHistory,
    setClinicalHistory,
    hasVideo,
    setHasVideo,
    videoDescription,
    setVideoDescription,
    isInteractiveExam,
    setIsInteractiveExam,
    examZone,
    setExamZone,
    examRefPoint,
    setExamRefPoint,
    examStandardText,
    setExamStandardText,
    selectedPainLevel,
    setSelectedPainLevel,
    handlePromptNewPainLevel,
    addedStudies,
    setAddedStudies,
    treatmentOptions,
    setTreatmentOptions,
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
              Modificando caso <strong>{caseTitle ? `"${caseTitle}"` : `#${editingCaseId}`}</strong>. Realice los cambios deseados y presione Guardar Cambios.
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              handleResetForm();
              if (onClearDraft) onClearDraft();
            }}
            className="text-xs font-bold text-amber-700 dark:text-amber-300 hover:underline cursor-pointer"
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
              <span className="font-bold text-text-main">Caso de ejemplo cargado desde la Guía:</span>{" "}
              Los campos han sido completados con un caso pediátrico validado. Puedes editarlo o guardarlo.
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              handleResetForm();
              if (onClearDraft) onClearDraft();
            }}
            className="text-xs font-bold text-teal-text hover:underline cursor-pointer"
          >
            Limpiar y empezar de cero
          </button>
        </aside>
      ) : null}

      <form onSubmit={handleSubmit}>
        {/* 1. TÍTULO */}
        <div className="card form-section p-6 rounded-2xl mb-6 shadow-sm border border-card-border bg-card-bg">
          <div className="section-header flex items-center gap-3.5 mb-5 pb-3.5 border-b border-border-subtle">
            <div className="section-num w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-sm shrink-0 shadow-sm">
              1
            </div>
            <h3 className="section-title text-xl font-bold text-text-main">Título del Caso</h3>
          </div>
          <div className="form-group">
            <label htmlFor="caseTitle" className="block text-sm font-semibold text-text-main mb-1.5">
              Título que verá el alumno (sin spoilers del diagnóstico)
            </label>
            <input
              type="text"
              id="caseTitle"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm"
              value={caseTitle}
              onChange={(e) => setCaseTitle(e.target.value)}
              placeholder="Ej: Lactante de 4 semanas con vómitos recurrentes e irritabilidad"
            />
            <span className="helper-text text-xs text-text-muted mt-1 block">
              Debe orientar el motivo de consulta sin adelantar la resolución patológica.
            </span>
          </div>
        </div>

        {/* 2. PALABRAS CLAVE */}
        <KeywordsSection
          keywordsPool={keywordsPool}
          selectedKeywords={selectedKeywords}
          onToggleKeyword={handleToggleKeyword}
          onAddCustomKeyword={handleAddCustomKeyword}
        />

        {/* 3. HISTORIA CLÍNICA */}
        <div className="card form-section p-6 rounded-2xl mb-6 shadow-sm border border-card-border bg-card-bg">
          <div className="section-header flex items-center gap-3.5 mb-5 pb-3.5 border-b border-border-subtle">
            <div className="section-num w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-sm shrink-0 shadow-sm">
              3
            </div>
            <h3 className="section-title text-xl font-bold text-text-main">Historia Clínica y Anamnesis</h3>
          </div>
          <div className="form-group mb-5">
            <label htmlFor="clinicalHistory" className="block text-sm font-semibold text-text-main mb-1.5">
              Descripción del Paciente y Motivo de Consulta:
            </label>
            <textarea
              id="clinicalHistory"
              rows={4}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm"
              value={clinicalHistory}
              onChange={(e) => setClinicalHistory(e.target.value)}
              placeholder="Describa edad, antecedentes perinatales, evolución de los síntomas y estado general..."
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-semibold text-text-main mb-2">
              ¿El caso incluye recurso audiovisual complementario?
            </label>
            <div className="toggle-group flex gap-3 flex-wrap sm:flex-nowrap">
              <label
                className={`toggle-label flex-1 flex items-center justify-center gap-2 p-3.5 rounded-xl cursor-pointer font-semibold text-sm border transition-all ${
                  hasVideo ? "active shadow-sm" : "border-input-border text-text-body"
                }`}
                onClick={() => setHasVideo(true)}
              >
                <input
                  type="radio"
                  name="videoToggle"
                  checked={hasVideo}
                  onChange={() => setHasVideo(true)}
                  className="hidden"
                />
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
                Sí, incluye Video
              </label>

              <label
                className={`toggle-label flex-1 flex items-center justify-center gap-2 p-3.5 rounded-xl cursor-pointer font-semibold text-sm border transition-all ${
                  !hasVideo ? "active shadow-sm" : "border-input-border text-text-body"
                }`}
                onClick={() => setHasVideo(false)}
              >
                <input
                  type="radio"
                  name="videoToggle"
                  checked={!hasVideo}
                  onChange={() => setHasVideo(false)}
                  className="hidden"
                />
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                No requiere Video
              </label>
            </div>
          </div>

          {hasVideo && (
            <div className="form-group mt-4">
              <label htmlFor="videoDesc" className="block text-sm font-semibold text-text-main mb-1.5">
                Descripción / Detalle del Video Clínico:
              </label>
              <textarea
                id="videoDesc"
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm"
                value={videoDescription}
                onChange={(e) => setVideoDescription(e.target.value)}
                placeholder="Ej: Video demostrativo del peristaltismo gástrico visible previo al episodio de emesis..."
              />
            </div>
          )}
        </div>

        {/* 4. EXAMEN FÍSICO */}
        <PhysicalExamSection
          isInteractiveExam={isInteractiveExam}
          setIsInteractiveExam={setIsInteractiveExam}
          examZone={examZone}
          setExamZone={setExamZone}
          examRefPoint={examRefPoint}
          setExamRefPoint={setExamRefPoint}
          examStandardText={examStandardText}
          setExamStandardText={setExamStandardText}
          selectedPainLevel={selectedPainLevel}
          setSelectedPainLevel={setSelectedPainLevel}
          painLevelsPool={painLevelsPool}
          onPromptNewPainLevel={handlePromptNewPainLevel}
        />

        {/* 5. ESTUDIOS COMPLEMENTARIOS */}
        <StudiesSection
          studiesCatalog={studiesCatalog}
          addedStudies={addedStudies}
          setAddedStudies={setAddedStudies}
          onNotify={onNotify}
        />

        {/* 6. TRATAMIENTO Y GUARDADO */}
        <TreatmentSection
          treatmentOptions={treatmentOptions}
          setTreatmentOptions={setTreatmentOptions}
          isSubmitting={isSubmitting}
          isEditing={Boolean(editingCaseId)}
        />
      </form>

      {/* 7. TARJETA RESUMEN DE CONFIRMACIÓN */}
      {submittedCase && (
        <CaseSummaryCard
          submittedCase={submittedCase}
          onResetForm={handleResetForm}
          onViewCases={onViewCasesList}
        />
      )}
    </div>
  );
}
