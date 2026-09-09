"use client";

import React from "react";
import { CustomSelect } from "@/components/common/CustomSelect";

interface PhysicalExamSectionProps {
  isInteractiveExam: boolean;
  setIsInteractiveExam: (val: boolean) => void;
  examZone: string;
  setExamZone: (val: string) => void;
  examRefPoint: string;
  setExamRefPoint: (val: string) => void;
  examStandardText: string;
  setExamStandardText: (val: string) => void;
  selectedPainLevel: string;
  setSelectedPainLevel: (val: string) => void;
  painLevelsPool: string[];
  onPromptNewPainLevel: () => void;
}

export const PhysicalExamSection = React.memo(function PhysicalExamSection({
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
  painLevelsPool,
  onPromptNewPainLevel,
}: PhysicalExamSectionProps) {
  return (
    <div className="card form-section p-6 rounded-2xl mb-6 shadow-sm border border-card-border bg-card-bg">
      <div className="section-header flex items-center gap-3.5 mb-5 pb-3.5 border-b border-border-subtle">
        <div className="section-num w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-sm shrink-0 shadow-sm">
          4
        </div>
        <h3 className="section-title text-xl font-bold text-text-main">Configuración del Examen Físico</h3>
      </div>

      <div className="form-group mb-5">
        <label className="block text-sm font-semibold text-text-main mb-2.5">
          ¿Cómo se presentará el examen físico al estudiante?
        </label>
        <div className="toggle-group flex gap-3 flex-wrap sm:flex-nowrap">
          <label
            className={`toggle-label flex-1 flex items-center justify-center gap-2 p-3.5 rounded-xl cursor-pointer font-semibold text-sm border transition-all ${
              isInteractiveExam ? "active shadow-sm" : "border-input-border text-text-body"
            }`}
            onClick={() => setIsInteractiveExam(true)}
          >
            <input
              type="radio"
              name="examType"
              checked={isInteractiveExam}
              onChange={() => setIsInteractiveExam(true)}
              className="hidden"
            />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10" />
              <path d="m4.93 4.93 4.24 4.24" />
              <path d="m14.83 9.17 4.24-4.24" />
              <path d="m14.83 14.83 4.24 4.24" />
              <path d="m9.17 14.83-4.24 4.24" />
            </svg>
            Interactivo con Grilla / Puntos
          </label>

          <label
            className={`toggle-label flex-1 flex items-center justify-center gap-2 p-3.5 rounded-xl cursor-pointer font-semibold text-sm border transition-all ${
              !isInteractiveExam ? "active shadow-sm" : "border-input-border text-text-body"
            }`}
            onClick={() => setIsInteractiveExam(false)}
          >
            <input
              type="radio"
              name="examType"
              checked={!isInteractiveExam}
              onChange={() => setIsInteractiveExam(false)}
              className="hidden"
            />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Estándar (Texto Clínico Tradicional)
          </label>
        </div>
      </div>

      {isInteractiveExam ? (
        <div className="two-col-responsive-grid grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="form-group">
            <label htmlFor="examZone" className="block text-sm font-semibold text-text-main mb-1.5">
              Zona Anatómica Clave:
            </label>
            <input
              type="text"
              id="examZone"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm"
              value={examZone}
              onChange={(e) => setExamZone(e.target.value)}
              placeholder="Ej: Epigastrio / Hipocondrio Derecho"
            />
            <span className="helper-text text-xs text-text-muted mt-1 block">
              Cuadrante o sector anatómico donde se concentrará la maniobra.
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="examRefPoint" className="block text-sm font-semibold text-text-main mb-1.5">
              Punto Específico de Referencia:
            </label>
            <input
              type="text"
              id="examRefPoint"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm"
              value={examRefPoint}
              onChange={(e) => setExamRefPoint(e.target.value)}
              placeholder="Ej: Oliva pilórica palpable / Signo de Murphy"
            />
            <span className="helper-text text-xs text-text-muted mt-1 block">
              Estructura diana o signo físico detectable por el alumno.
            </span>
          </div>
        </div>
      ) : (
        <div className="form-group mb-4">
          <label htmlFor="examStandardText" className="block text-sm font-semibold text-text-main mb-1.5">
            Descripción Detallada del Examen Físico:
          </label>
          <textarea
            id="examStandardText"
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm"
            value={examStandardText}
            onChange={(e) => setExamStandardText(e.target.value)}
            placeholder="Describa la exploración física completa del paciente pediátrico..."
          />
        </div>
      )}

      {/* NIVEL DE DOLOR / HALLAZGO */}
      <div className="form-group">
        <label htmlFor="painLevelSelect" className="block text-sm font-semibold text-text-main mb-1.5 flex items-center justify-between">
          <span>Hallazgo o Nivel de Dolor / Reacción (Catálogo Pediátrico):</span>
          <span className="text-xs font-normal text-text-muted">
            {painLevelsPool.length} opciones
          </span>
        </label>
        <div className="flex gap-2.5 flex-wrap sm:flex-nowrap items-center">
          <div className="flex-1 min-w-[240px]">
            <CustomSelect
              id="painLevelSelect"
              value={selectedPainLevel}
              onChange={(val) => {
                if (val === "__ADD_PAIN__") {
                  onPromptNewPainLevel();
                } else {
                  setSelectedPainLevel(val);
                }
              }}
              placeholder="Seleccionar nivel de dolor o reacción..."
              searchPlaceholder="Buscar nivel o descriptor clínico..."
              options={painLevelsPool.map((p) => ({
                value: p,
                label: p,
              }))}
              actionOption={{
                value: "__ADD_PAIN__",
                label: "Añadir nuevo nivel al catálogo...",
                description: "Crear un nuevo descriptor de reacción o dolor",
              }}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              }
            />
          </div>
          <button
            type="button"
            className="btn btn-secondary px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0"
            onClick={onPromptNewPainLevel}
            title="Añadir un nuevo nivel de dolor o reacción al catálogo"
          >
            + Añadir al Catálogo
          </button>
        </div>
        <span className="helper-text text-xs text-text-muted mt-1 block">
          Reacción conductual o signo al explorar la zona anatómica seleccionada.
        </span>
      </div>
    </div>
  );
});
