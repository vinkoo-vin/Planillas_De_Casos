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

      <div className="split-layout grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-5 items-stretch">
        <div className="form-group flex flex-col h-full mb-0">
          <label htmlFor="treatmentOptions" className="block text-sm font-semibold text-text-main mb-1.5">
            Opciones de Tratamiento (Una por línea):
          </label>
          <textarea
            id="treatmentOptions"
            rows={13}
            className="w-full flex-1 min-h-[340px] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed resize-y"
            value={treatmentOptions}
            onChange={(e) => setTreatmentOptions(e.target.value)}
            placeholder="- Plan de hidratación parenteral y corrección hidroelectrolítica antes de cirugía [CORRECTA] | Feedback: Excelente. En estenosis pilórica la urgencia inicial es médica para estabilizar el medio interno.&#10;- Indicar pase inmediato a quirófano sin hidratación previa | Feedback: Grave riesgo de arritmias por alcalosis metabólica e hipopotasemia.&#10;- Administrar ranitidina oral y dar de alta | Feedback: Error que confunde reflujo fisiológico con obstrucción pilórica mecánica."
          />
        </div>

        <div className="guide-box p-5 rounded-xl text-xs bg-surface-subtle border border-border-subtle">
          <h4 className="font-bold text-text-main mb-2 flex items-center gap-2 text-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-teal-text">
              <circle cx="12" cy="10" r="8" />
              <line x1="12" y1="14" x2="12" y2="10" />
              <line x1="12" y1="6" x2="12.01" y2="6" />
            </svg>
            Sintaxis de Opciones y Feedback:
          </h4>
          <pre className="font-mono text-xs text-text-main p-3 rounded-lg border border-border-subtle bg-card-bg whitespace-pre-wrap leading-relaxed mb-3">
{`- Rehidratación parenteral y corrección electrolítica [CORRECTA] | Feedback: Fundamental estabilizar medio interno antes de inducir anestesia.
- Cirugía de urgencia sin hidratar | Feedback: Riesgo severo de arritmia intraoperatoria por alcalosis.
- Cambio de fórmula láctea y alta | Feedback: Retrasa el diagnóstico de una obstrucción pilórica.`}
          </pre>
          <div className="space-y-1.5 text-text-body">
            <p>
              <strong className="text-text-main">• [CORRECTA]:</strong> Marca la conducta terapéutica acertada del caso clínico.
            </p>
            <p>
              <strong className="text-text-main">• | Feedback:</strong> Es la <span className="font-semibold text-text-main">justificación médica</span> que el alumno leerá en el simulador al seleccionar esa alternativa (explica por qué acertó o qué peligro clínico representa el error).
            </p>
            <p className="text-[11px] text-text-muted italic pt-1">
              * El campo de feedback es opcional; si no lo escribes, la opción se registrará igualmente.
            </p>
          </div>
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
