"use client";

import React from "react";

interface TreatmentSectionProps {
  treatmentOptions: string;
  setTreatmentOptions: (val: string) => void;
  isSubmitting: boolean;
  isEditing?: boolean;
}

export const TreatmentSection = React.memo(function TreatmentSection({
  treatmentOptions,
  setTreatmentOptions,
  isSubmitting,
  isEditing = false,
}: TreatmentSectionProps) {
  return (
    <div className="card form-section p-6 rounded-2xl mb-6 shadow-sm border border-card-border bg-card-bg">
      <div className="section-header flex items-center gap-3.5 mb-5 pb-3.5 border-b border-border-subtle">
        <div className="section-num w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-sm shrink-0 shadow-sm">
          6
        </div>
        <h3 className="section-title text-xl font-bold text-text-main">
          Conducta Terapéutica y Opciones de Tratamiento
        </h3>
      </div>

      <div className="split-layout grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-5 items-start">
        <div className="form-group">
          <label htmlFor="treatmentOptions" className="block text-sm font-semibold text-text-main mb-1.5">
            Opciones de Tratamiento (Una por línea):
          </label>
          <textarea
            id="treatmentOptions"
            rows={5}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm leading-relaxed"
            value={treatmentOptions}
            onChange={(e) => setTreatmentOptions(e.target.value)}
            placeholder="- Plan de hidratación parenteral y corrección hidroelectrolítica antes de cirugía [CORRECTA]&#10;- Indicar pase inmediato a quirófano sin hidratación previa&#10;- Administrar ranitidina oral y dar de alta con pautas de alarma"
          />
        </div>

        <div className="guide-box p-5 rounded-xl text-xs bg-surface-subtle border border-border-subtle">
          <h4 className="font-bold text-text-main mb-2.5 flex items-center gap-2 text-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-teal-text">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            Ejemplo de formato:
          </h4>
          <pre className="font-mono text-xs text-text-main p-2.5 rounded-lg border border-border-subtle bg-card-bg whitespace-pre-wrap leading-relaxed mb-2.5">
{`- Opción 1: Rehidratación parenteral y corrección electrolítica [CORRECTA]
- Opción 2: Cirugía de urgencia sin hidratar
- Opción 3: Cambio de fórmula láctea y alta`}
          </pre>
          <p className="text-text-body">
            El sistema detectará automáticamente la etiqueta <code>[CORRECTA]</code> y registrará cada alternativa en la base de datos.
          </p>
        </div>
      </div>

      {/* BOTÓN FINAL DE GUARDADO O ACTUALIZACIÓN */}
      <div className="text-center mt-8">
        <button
          type="submit"
          className="btn btn-teal px-10 py-4 text-base rounded-xl font-bold shadow-lg transition-transform hover:-translate-y-0.5 cursor-pointer"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>{isEditing ? "Actualizando Caso Clínico..." : "Guardando Caso Clínico..."}</>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {isEditing ? "Guardar Cambios del Caso Clínico" : "Finalizar y Guardar Caso Clínico"}
            </>
          )}
        </button>
      </div>
    </div>
  );
});
