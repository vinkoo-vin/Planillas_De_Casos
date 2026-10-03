"use client";

import React from "react";

export type FormPhase = 1 | 2 | 3 | 4;

export interface PhaseValidationState {
  hasErrors?: boolean;
  isComplete?: boolean;
}

interface CaseStepperProps {
  currentPhase: FormPhase;
  onSelectPhase: (phase: FormPhase) => void;
  phaseValidation?: Record<FormPhase, PhaseValidationState>;
}

interface PhaseDefinition {
  phase: FormPhase;
  number: string;
  title: string;
  subtitle: string;
  icon: string;
}

const PHASES: PhaseDefinition[] = [
  {
    phase: 1,
    number: "1",
    title: "Motivo de Consulta",
    subtitle: "Ingreso, motivo y semiología",
    icon: "🩺",
  },
  {
    phase: 2,
    number: "2",
    title: "Diagnóstico",
    subtitle: "Estudios e imágenes clínicas",
    icon: "🔬",
  },
  {
    phase: 3,
    number: "3",
    title: "Tratamiento",
    subtitle: "Conductas y opciones terapéuticas",
    icon: "💊",
  },
  {
    phase: 4,
    number: "4",
    title: "Resumen del Caso",
    subtitle: "Revisión completa y finalización",
    icon: "📋",
  },
];

export const CaseStepper = React.memo(function CaseStepper({
  currentPhase,
  onSelectPhase,
  phaseValidation = { 1: {}, 2: {}, 3: {}, 4: {} },
}: CaseStepperProps) {

  const handleKeyDown = (e: React.KeyboardEvent, phase: FormPhase) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      onSelectPhase((phase < 4 ? phase + 1 : 1) as FormPhase);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      onSelectPhase((phase > 1 ? phase - 1 : 4) as FormPhase);
    }
  };

  return (
    <div className="case-stepper mb-8">
      {/* BARRA DE NAVEGACIÓN EN PESTAÑAS CON ACCESIBILIDAD ARIA */}
      <nav
        role="tablist"
        aria-label="Fases del caso clínico"
        className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 p-1.5 sm:p-2 rounded-2xl bg-surface-subtle border border-border-subtle shadow-sm"
      >
        {PHASES.map((p) => {
          const isActive = currentPhase === p.phase;
          const status = phaseValidation[p.phase];
          const isComplete = status?.isComplete;
          const hasErrors = status?.hasErrors;

          return (
            <button
              key={p.phase}
              type="button"
              role="tab"
              id={`stepper-tab-${p.phase}`}
              aria-selected={isActive}
              aria-controls={`phase-panel-${p.phase}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onSelectPhase(p.phase)}
              onKeyDown={(e) => handleKeyDown(e, p.phase)}
              className={`stepper-tab relative flex items-center gap-3 p-3 sm:p-3.5 rounded-xl text-left transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal ${
                isActive
                  ? "bg-card-bg border border-teal-border shadow-[var(--shadow-extruded-xs)] text-text-main"
                  : "bg-transparent border border-transparent hover:bg-card-bg/60 text-text-muted hover:text-text-main"
              }`}
            >
              {/* ÍCONO / ESTADO */}
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-transform ${
                  isActive
                    ? "bg-teal text-white shadow-sm scale-105"
                    : isComplete
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                    : "bg-surface text-text-body border border-border-subtle"
                }`}
                aria-hidden="true"
              >
                {isComplete && !isActive ? "✓" : p.icon}
              </div>

              {/* CONTENIDO TEXTUAL */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-text-muted">
                    Fase {p.number}
                  </span>
                  {hasErrors && (
                    <span
                      title="Campos obligatorios pendientes"
                      className="w-2 h-2 rounded-full bg-rose-500 animate-pulse inline-block"
                      aria-label="Contiene errores o campos pendientes"
                    />
                  )}
                </div>
                <div
                  className={`text-xs sm:text-sm font-bold truncate leading-tight ${
                    isActive ? "text-text-main" : "text-text-body"
                  }`}
                >
                  {p.title}
                </div>
                <div className="text-[11px] text-text-muted truncate hidden sm:block mt-0.5">
                  {p.subtitle}
                </div>
              </div>

              {/* LÍNEA INDICADORA ACTIVA */}
              {isActive && (
                <span className="absolute -bottom-1.5 left-4 right-4 h-1 rounded-full bg-teal" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
});
