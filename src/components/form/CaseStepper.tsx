"use client";

import React from "react";

export type FormPhase = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

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
}

export const PHASES: PhaseDefinition[] = [
  {
    phase: 1,
    number: "1",
    title: "Motivo de Consulta",
    subtitle: "Diagnóstico final y motivos",
  },
  {
    phase: 2,
    number: "2",
    title: "Signos y Síntomas",
    subtitle: "Anamnesis y video clínico",
  },
  {
    phase: 3,
    number: "3",
    title: "Examen Físico",
    subtitle: "Puntos 3D o relato narrativo",
  },
  {
    phase: 4,
    number: "4",
    title: "Estudios",
    subtitle: "Rx, TAC, Eco, Laboratorio",
  },
  {
    phase: 5,
    number: "5",
    title: "Diagnóstico Diferencial",
    subtitle: "5 opciones y correcto",
  },
  {
    phase: 6,
    number: "6",
    title: "Tratamiento",
    subtitle: "Médico y resolución quirúrgica",
  },
  {
    phase: 7,
    number: "7",
    title: "Complicaciones",
    subtitle: "Riesgos y notas docentes",
  },
  {
    phase: 8,
    number: "8",
    title: "Resumen",
    subtitle: "Epílogo docente y cierre",
  },
];

export const CaseStepper = React.memo(function CaseStepper({
  currentPhase,
  onSelectPhase,
  phaseValidation = { 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {}, 8: {} },
}: CaseStepperProps) {
  const handleKeyDown = (e: React.KeyboardEvent, phase: FormPhase) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      onSelectPhase((phase < 8 ? phase + 1 : 1) as FormPhase);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      onSelectPhase((phase > 1 ? phase - 1 : 8) as FormPhase);
    }
  };

  return (
    <div className="case-stepper mb-8">
      {/* BARRA DE NAVEGACIÓN EN PESTAÑAS (8 FASES) */}
      <nav
        role="tablist"
        aria-label="Fases del caso clínico"
        className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 p-1.5 sm:p-2 rounded-2xl bg-surface-subtle border border-border-subtle shadow-sm"
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
              className={`stepper-tab relative flex flex-col sm:flex-row items-center sm:items-start gap-2 p-2.5 sm:p-3 rounded-xl text-left transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal ${
                isActive
                  ? "bg-card-bg border border-teal-border shadow-[var(--shadow-extruded-xs)] text-text-main"
                  : "hover:bg-card-bg/60 text-text-muted hover:text-text-main"
              }`}
            >
              {/* ÍCONO Y NÚMERO */}
              <div className="relative shrink-0 flex items-center justify-center">
                <span
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold transition-all shadow-xs ${
                    isActive
                      ? "bg-teal text-white shadow-teal/20"
                      : isComplete
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      : "bg-surface border border-border-subtle text-text-muted"
                  }`}
                >
                  {isComplete ? "✓" : p.number}
                </span>

                {/* INDICADOR DE ERROR */}
                {hasErrors && !isActive && (
                  <span
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-card-bg animate-pulse"
                    title="Esta fase contiene campos incompletos"
                  />
                )}
              </div>

              {/* TÍTULO Y SUBTÍTULO */}
              <div className="stepper-tab-content min-w-0 flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start">
                  <span className="stepper-tab-title font-bold text-xs leading-snug text-text-main block">
                    {p.title}
                  </span>
                </div>
                <span className="stepper-tab-desc text-[10px] text-text-muted leading-tight mt-0.5 hidden sm:block">
                  {p.subtitle}
                </span>
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
});
