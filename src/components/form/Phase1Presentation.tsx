"use client";

import React from "react";
import { CaseFormData, FormErrorMap, CustomFieldItem } from "@/types/clinical";
import { CustomSelect } from "@/components/common/CustomSelect";
import { CustomFieldsSection } from "./subcomponents/CustomFieldsSection";

interface Phase1PresentationProps {
  data: CaseFormData;
  updateField: <K extends keyof CaseFormData>(
    field: K,
    value: CaseFormData[K] | ((prev: CaseFormData[K]) => CaseFormData[K])
  ) => void;
  formErrors: FormErrorMap;
  painLevelsPool: string[];
  onPromptNewPainLevel: () => void;
  onAddCustomField: (phase: number | "summary") => void;
  onUpdateCustomField: (id: string, updates: Partial<CustomFieldItem>) => void;
  onRemoveCustomField: (id: string) => void;
}

export const Phase1Presentation = React.memo(function Phase1Presentation({
  data,
  updateField,
  formErrors,
  painLevelsPool,
  onPromptNewPainLevel,
  onAddCustomField,
  onUpdateCustomField,
  onRemoveCustomField,
}: Phase1PresentationProps) {
  return (
    <div
      role="tabpanel"
      id="phase-panel-1"
      aria-labelledby="stepper-tab-1"
      className="space-y-6 animate-fadeIn"
    >
      {/* BLOQUE A: IDENTIFICACIÓN Y MOTIVO DE CONSULTA */}
      <div className="card form-section p-5 sm:p-6 rounded-2xl shadow-sm border border-card-border bg-card-bg">
        <div className="section-header flex items-center gap-3.5 mb-5 pb-3.5 border-b border-border-subtle">
          <div className="section-num w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 shadow-sm bg-teal text-white">
            1.1
          </div>
          <div>
            <h3 className="section-title text-lg sm:text-xl font-bold text-text-main">
              Identificación del Caso y Motivo de Consulta
            </h3>
            <p className="text-xs text-text-muted">
              Defina el nombre patológico formal del caso y el motivo que manifiesta la familia al ingresar a la guardia.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* TÍTULO DOCENTE DEL CASO */}
          <div className="form-group mb-0">
            <label htmlFor="caseTitle" className="block text-sm font-semibold text-text-main mb-1.5">
              Nombre / Título del caso clínico: <span className="text-rose-500">*</span>
            </label>
            <input
              id="caseTitle"
              type="text"
              className={`w-full px-3.5 py-2.5 rounded-xl text-sm border transition-colors outline-none focus:ring-1 ${
                formErrors.title
                  ? "border-rose-500 bg-rose-500/5 focus:border-rose-500 focus:ring-rose-500/30"
                  : "border-input-border focus:border-teal focus:ring-teal/30"
              }`}
              value={data.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Ej: Estenosis Hipertrófica del Píloro en Lactante"
              aria-invalid={Boolean(formErrors.title)}
              aria-describedby={formErrors.title ? "error-title" : undefined}
            />
            {formErrors.title ? (
              <span id="error-title" className="text-xs text-rose-500 mt-1 font-medium block">
                {formErrors.title}
              </span>
            ) : (
              <span className="text-[11px] text-text-muted mt-1 block">
                Nombre formal del cuadro o diagnóstico final de la simulación.
              </span>
            )}
          </div>

          {/* MOTIVO DE CONSULTA (LO QUE REFIERE LA FAMILIA) */}
          <div className="form-group mb-0">
            <label htmlFor="consultationReason" className="block text-sm font-semibold text-text-main mb-1.5">
              Motivo de consulta: <span className="text-rose-500">*</span>
            </label>
            <input
              id="consultationReason"
              type="text"
              className={`w-full px-3.5 py-2.5 rounded-xl text-sm border transition-colors outline-none focus:ring-1 ${
                formErrors.consultationReason
                  ? "border-rose-500 bg-rose-500/5 focus:border-rose-500 focus:ring-rose-500/30"
                  : "border-input-border focus:border-teal focus:ring-teal/30"
              }`}
              value={data.consultationReason}
              onChange={(e) => updateField("consultationReason", e.target.value)}
              placeholder="Ej: Lactante de 4 semanas con vómitos postprandiales en proyectil e irritabilidad"
              aria-invalid={Boolean(formErrors.consultationReason)}
              aria-describedby={formErrors.consultationReason ? "error-consultationReason" : undefined}
            />
            {formErrors.consultationReason ? (
              <span id="error-consultationReason" className="text-xs text-rose-500 mt-1 font-medium block">
                {formErrors.consultationReason}
              </span>
            ) : (
              <span className="text-[11px] text-text-muted mt-1 block">
                Causa primaria que detona la consulta médica (ej: vómitos, dolor agudo, fiebre).
              </span>
            )}
          </div>
        </div>
      </div>

      {/* BLOQUE B: ANAMNESIS, SIGNOS Y RECURSO AUDIOVISUAL */}
      <div className="card form-section p-5 sm:p-6 rounded-2xl shadow-sm border border-card-border bg-card-bg">
        <div className="section-header flex items-center gap-3.5 mb-5 pb-3.5 border-b border-border-subtle">
          <div className="section-num w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 shadow-sm bg-teal text-white">
            1.2
          </div>
          <div>
            <h3 className="section-title text-lg sm:text-xl font-bold text-text-main">
              Signos, Síntomas y Anamnesis Clínica
            </h3>
            <p className="text-xs text-text-muted">
              Relato cronológico de la enfermedad y directrices visuales para el comportamiento del paciente en el simulador.
            </p>
          </div>
        </div>

        <div className="form-group mb-5">
          <label htmlFor="clinicalHistory" className="block text-sm font-semibold text-text-main mb-1.5">
            Historia de la enfermedad actual y signos clave: <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="clinicalHistory"
            rows={4}
            className={`w-full px-3.5 py-2.5 rounded-xl text-sm leading-relaxed border transition-colors outline-none focus:ring-1 ${
              formErrors.clinicalHistory
                ? "border-rose-500 bg-rose-500/5 focus:border-rose-500 focus:ring-rose-500/30"
                : "border-input-border focus:border-teal focus:ring-teal/30"
            }`}
            value={data.clinicalHistory}
            onChange={(e) => updateField("clinicalHistory", e.target.value)}
            placeholder="Describa edad, antecedentes perinatales, evolución temporal de los síntomas, signos de deshidratación, facies y estado general del paciente..."
            aria-invalid={Boolean(formErrors.clinicalHistory)}
            aria-describedby={formErrors.clinicalHistory ? "error-clinicalHistory" : undefined}
          />
          {formErrors.clinicalHistory ? (
            <span id="error-clinicalHistory" className="text-xs text-rose-500 mt-1 font-medium block">
              {formErrors.clinicalHistory}
            </span>
          ) : (
            <span className="text-[11px] text-text-muted mt-1 block">
              Esta descripción servirá tanto de contexto clínico como de directriz para la representación del paciente en el simulador.
            </span>
          )}
        </div>

        {/* TOGGLE VIDEO / ANIMACIÓN */}
        <div className="form-group mb-0 pt-2 border-t border-border-subtle/60">
          <label className="block text-sm font-semibold text-text-main mb-2">
            ¿El caso incluye recurso audiovisual o video de semiología?
          </label>
          <div className="toggle-group flex gap-3 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              className={`toggle-label flex-1 flex items-center justify-center gap-2 p-3 rounded-xl cursor-pointer font-semibold text-sm border transition-all ${
                data.hasVideo ? "active shadow-sm" : "border-input-border text-text-body bg-surface"
              }`}
              onClick={() => updateField("hasVideo", true)}
              aria-pressed={data.hasVideo}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
              Sí, incluye video o animación
            </button>

            <button
              type="button"
              className={`toggle-label flex-1 flex items-center justify-center gap-2 p-3 rounded-xl cursor-pointer font-semibold text-sm border transition-all ${
                !data.hasVideo ? "active shadow-sm" : "border-input-border text-text-body bg-surface"
              }`}
              onClick={() => updateField("hasVideo", false)}
              aria-pressed={!data.hasVideo}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              No requiere video
            </button>
          </div>

          {data.hasVideo && (
            <div className="mt-4 p-4 rounded-xl bg-surface-subtle border border-border-subtle animate-fadeIn">
              <label htmlFor="videoDescription" className="block text-xs sm:text-sm font-semibold text-text-main mb-1.5">
                Descripción del video clínico para el simulador:
              </label>
              <textarea
                id="videoDescription"
                rows={2}
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-input-border focus:border-teal focus:ring-1 focus:ring-teal/30 outline-none"
                value={data.videoDescription}
                onChange={(e) => updateField("videoDescription", e.target.value)}
                placeholder="Ej: Video demostrativo que muestra ondas peristálticas gástricas visibles de izquierda a derecha en epigastrio previas al vómito..."
              />
            </div>
          )}
        </div>
      </div>

      {/* BLOQUE C: EXAMEN FÍSICO (3D vs ESTÁNDAR) */}
      <div className="card form-section p-5 sm:p-6 rounded-2xl shadow-sm border border-card-border bg-card-bg">
        <div className="section-header flex items-center gap-3.5 mb-5 pb-3.5 border-b border-border-subtle">
          <div className="section-num w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 shadow-sm bg-teal text-white">
            1.3
          </div>
          <div>
            <h3 className="section-title text-lg sm:text-xl font-bold text-text-main">
              Examen Físico y Respuesta al Estímulo
            </h3>
            <p className="text-xs text-text-muted">
              Configure cómo explorará el estudiante al paciente: mediante puntos anatómicos 3D o texto narrativo tradicional.
            </p>
          </div>
        </div>

        <div className="form-group mb-5">
          <label className="block text-sm font-semibold text-text-main mb-2">
            Modalidad de exploración física:
          </label>
          <div className="toggle-group flex gap-3 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              className={`toggle-label flex-1 flex items-center justify-center gap-2 p-3.5 rounded-xl cursor-pointer font-semibold text-sm border transition-all ${
                data.isInteractiveExam ? "active shadow-sm" : "border-input-border text-text-body bg-surface"
              }`}
              onClick={() => updateField("isInteractiveExam", true)}
              aria-pressed={data.isInteractiveExam}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="10" />
                <path d="m4.93 4.93 4.24 4.24" />
                <path d="m14.83 9.17 4.24-4.24" />
                <path d="m14.83 14.83 4.24 4.24" />
                <path d="m9.17 14.83-4.24 4.24" />
              </svg>
              Modo Interactivo (3D / Hotspot Anatómico)
            </button>

            <button
              type="button"
              className={`toggle-label flex-1 flex items-center justify-center gap-2 p-3.5 rounded-xl cursor-pointer font-semibold text-sm border transition-all ${
                !data.isInteractiveExam ? "active shadow-sm" : "border-input-border text-text-body bg-surface"
              }`}
              onClick={() => updateField("isInteractiveExam", false)}
              aria-pressed={!data.isInteractiveExam}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              Modo Estándar (Narrativo Tradicional)
            </button>
          </div>
        </div>

        {/* CAMPOS DEPENDIENDO DEL MODO */}
        {data.isInteractiveExam ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-surface-subtle border border-border-subtle animate-fadeIn">
            <div className="form-group mb-0">
              <label htmlFor="examZone" className="block text-xs sm:text-sm font-semibold text-text-main mb-1.5">
                Región o punto anatómico palpable:
              </label>
              <input
                id="examZone"
                type="text"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-input-border focus:border-teal focus:ring-1 focus:ring-teal/30 outline-none"
                value={data.examZone}
                onChange={(e) => updateField("examZone", e.target.value)}
                placeholder="Ej: Hipocondrio derecho / Epigastrio"
              />
            </div>

            <div className="form-group mb-0">
              <label htmlFor="examRefPoint" className="block text-xs sm:text-sm font-semibold text-text-main mb-1.5">
                Signo palpatorio o hallazgo en el punto:
              </label>
              <input
                id="examRefPoint"
                type="text"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-input-border focus:border-teal focus:ring-1 focus:ring-teal/30 outline-none"
                value={data.examRefPoint}
                onChange={(e) => updateField("examRefPoint", e.target.value)}
                placeholder="Ej: Palpación de tumoración móvil de consistencia cartilaginosa (Oliva pilórica)"
              />
            </div>
          </div>
        ) : (
          <div className="form-group mb-4 animate-fadeIn">
            <label htmlFor="examStandardText" className="block text-xs sm:text-sm font-semibold text-text-main mb-1.5">
              Descripción completa del examen físico:
            </label>
            <textarea
              id="examStandardText"
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-input-border focus:border-teal focus:ring-1 focus:ring-teal/30 outline-none"
              value={data.examStandardText}
              onChange={(e) => updateField("examStandardText", e.target.value)}
              placeholder="Ej: Abdomen blando, depresible, no doloroso a la palpación superficial. A la palpación profunda en hipocondrio derecho se constata oliva pilórica de 2 cm..."
            />
          </div>
        )}

        {/* NIVEL DE DOLOR / RESPUESTA */}
        <div className="mt-4 pt-4 border-t border-border-subtle/70">
          <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
            <label className="text-xs sm:text-sm font-semibold text-text-main">
              Nivel de dolor o respuesta al estímulo: <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={onPromptNewPainLevel}
              className="text-xs font-semibold text-teal-text hover:underline cursor-pointer"
            >
              + Registrar Nuevo Nivel
            </button>
          </div>
          <div className={formErrors.painLevel ? "rounded-xl border border-rose-500 p-0.5" : ""}>
            <CustomSelect
              options={painLevelsPool.map((p) => ({ value: p, label: p }))}
              value={data.painLevel}
              onChange={(val) => updateField("painLevel", val)}
              placeholder="Seleccione el nivel de dolor o conducta esperada..."
            />
          </div>
          {formErrors.painLevel && (
            <span className="text-xs text-rose-500 mt-1 font-medium block">
              {formErrors.painLevel}
            </span>
          )}
        </div>
      </div>

      {/* BLOQUE D: CAMPOS ADICIONALES DEL DOCTOR (FASE 1) */}
      <CustomFieldsSection
        phase={1}
        customFields={data.customFields}
        onAddField={onAddCustomField}
        onUpdateField={onUpdateCustomField}
        onRemoveField={onRemoveCustomField}
        title="Campos Adicionales de Semiología y Motivo de Consulta"
        description="Agregue parámetros o campos personalizados que el médico requiera para complementar la anamnesis o el examen físico (ej: Presión arterial, Saturación O2, Escala Glasgow, etc.)."
        badgeLabel="Fase 1"
      />
    </div>
  );
});
