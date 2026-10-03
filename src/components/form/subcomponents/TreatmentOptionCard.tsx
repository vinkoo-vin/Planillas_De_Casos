"use client";

import React from "react";
import { TreatmentOptionItem } from "@/types/clinical";
import { TrashIcon } from "@/components/common/Icons";

interface TreatmentOptionCardProps {
  option: TreatmentOptionItem;
  index: number;
  totalOptions: number;
  canRemove: boolean;
  onUpdate: (index: number, updates: Partial<TreatmentOptionItem>) => void;
  onRemove: (index: number) => void;
  onMove: (index: number, direction: "up" | "down") => void;
}

export const TreatmentOptionCard = React.memo(function TreatmentOptionCard({
  option,
  index,
  totalOptions,
  canRemove,
  onUpdate,
  onRemove,
  onMove,
}: TreatmentOptionCardProps) {
  const optionDomId = option.id || `opt-${index}`;

  return (
    <div
      className={`treatment-card p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
        option.isCorrect
          ? "bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/40 shadow-xs"
          : "bg-surface border-border-subtle hover:border-border shadow-[var(--shadow-extruded-xs)]"
      }`}
    >
      {/* CABECERA DE LA TARJETA */}
      <div className="flex items-center justify-between gap-3 mb-3.5 pb-2.5 border-b border-border-subtle/70 flex-wrap">
        <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
          <span
            className={`w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center shrink-0 ${
              option.isCorrect
                ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                : "bg-teal/15 text-teal"
            }`}
          >
            {index + 1}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Conducta #{index + 1}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* BOTONES DE REORDENAR */}
          <button
            type="button"
            onClick={() => onMove(index, "up")}
            disabled={index === 0}
            className="w-7 h-7 rounded-lg border border-border-subtle text-text-muted hover:text-text-main hover:bg-surface-subtle flex items-center justify-center text-xs disabled:opacity-30 cursor-pointer transition-colors"
            title="Mover arriba"
            aria-label={`Mover tratamiento ${index + 1} arriba`}
          >
            ▲
          </button>
          <button
            type="button"
            onClick={() => onMove(index, "down")}
            disabled={index === totalOptions - 1}
            className="w-7 h-7 rounded-lg border border-border-subtle text-text-muted hover:text-text-main hover:bg-surface-subtle flex items-center justify-center text-xs disabled:opacity-30 cursor-pointer transition-colors"
            title="Mover abajo"
            aria-label={`Mover tratamiento ${index + 1} abajo`}
          >
            ▼
          </button>

          {/* BOTÓN QUITAR */}
          {canRemove && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ml-1"
              title="Eliminar este tratamiento"
              aria-label={`Eliminar tratamiento ${index + 1}`}
            >
              <TrashIcon width={13} height={13} />
              <span>Quitar</span>
            </button>
          )}
        </div>
      </div>

      {/* CONMUTADOR DE CRITERIO: CORRECTA / INCORRECTA */}
      <div className="mb-3.5">
        <label className="block text-xs font-semibold text-text-main mb-1.5">
          Criterio Pedagógico de la Conducta:
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onUpdate(index, { isCorrect: true })}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              option.isCorrect
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-surface hover:bg-emerald-500/10 text-text-muted hover:text-emerald-700 dark:hover:text-emerald-400 border-border-subtle"
            }`}
            aria-pressed={option.isCorrect}
          >
            <span>✓ Conducta Correcta (Recomendada)</span>
          </button>

          <button
            type="button"
            onClick={() => onUpdate(index, { isCorrect: false })}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              !option.isCorrect
                ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                : "bg-surface hover:bg-rose-500/10 text-text-muted hover:text-rose-700 dark:hover:text-rose-400 border-border-subtle"
            }`}
            aria-pressed={!option.isCorrect}
          >
            <span>✕ Conducta Incorrecta (Error / Penaliza)</span>
          </button>
        </div>
      </div>

      {/* CAMPOS DE DESCRIPCIÓN Y FEEDBACK */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div>
          <label
            htmlFor={`treatment-desc-${optionDomId}`}
            className="block text-xs font-semibold text-text-main mb-1"
          >
            Conducta o prescripción médica: <span className="text-rose-500">*</span>
          </label>
          <textarea
            id={`treatment-desc-${optionDomId}`}
            rows={3}
            value={option.description}
            onChange={(e) => onUpdate(index, { description: e.target.value })}
            placeholder="Describa la conducta terapéutica o intervención..."
            className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-card-bg border border-input-border leading-relaxed focus:border-teal focus:ring-1 focus:ring-teal/30 outline-none"
          />
        </div>

        <div>
          <label
            htmlFor={`treatment-feedback-${optionDomId}`}
            className="block text-xs font-semibold text-text-main mb-1"
          >
            Justificación formativa para el alumno (Feedback):
          </label>
          <textarea
            id={`treatment-feedback-${optionDomId}`}
            rows={3}
            value={option.feedback || ""}
            onChange={(e) => onUpdate(index, { feedback: e.target.value })}
            placeholder="Explicación pedagógica: por qué es la conducta indicada o qué peligro clínico representa el error..."
            className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-card-bg border border-input-border leading-relaxed focus:border-teal focus:ring-1 focus:ring-teal/30 outline-none"
          />
        </div>
      </div>
    </div>
  );
});
