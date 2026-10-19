"use client";

import React from "react";
import { SavedCase } from "@/types/clinical";
import { CheckIcon } from "@/components/common/Icons";

interface CaseSummaryCardProps {
  submittedCase: SavedCase;
  onResetForm: () => void;
  onViewCases: () => void;
}

export const CaseSummaryCard = React.memo(function CaseSummaryCard({
  submittedCase,
  onResetForm,
  onViewCases,
}: CaseSummaryCardProps) {
  const caseTitle = submittedCase.finalDiagnosis?.name || "Caso Clínico";

  return (
    <div id="summaryCard" className="summary-card p-8 rounded-2xl border-2 border-mint bg-card-bg mt-10 shadow-xl animate-scaleUp">
      <div className="summary-header flex items-center justify-between pb-4 mb-6 border-b border-border-subtle flex-wrap gap-3">
        <div className="summary-title text-xl font-extrabold text-text-main flex items-center gap-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6 text-mint">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          Caso Clínico Registrado Exitosamente
        </div>
        <span className="summary-status font-mono text-xs font-bold px-3 py-1 rounded-full bg-teal-light text-teal-text">
          ID: {submittedCase.id}
        </span>
      </div>

      <div className="summary-grid grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="summary-box p-4 rounded-xl border border-border-subtle bg-surface-subtle">
          <h5 className="text-xs font-bold uppercase text-teal-text mb-1">Diagnóstico Final (Caso)</h5>
          <div className="val font-semibold text-text-main text-base">{caseTitle}</div>
          {submittedCase.principalReason && (
            <div className="text-xs text-text-muted mt-1 italic">
              Motivo principal: {submittedCase.principalReason.name}
            </div>
          )}
        </div>

        <div className="summary-box p-4 rounded-xl border border-border-subtle bg-surface-subtle">
          <h5 className="text-xs font-bold uppercase text-teal-text mb-1">
            Motivos Alternativos ({submittedCase.altReasons?.length || 0})
          </h5>
          <div className="val text-sm font-medium text-text-main">
            {submittedCase.altReasons && submittedCase.altReasons.length > 0
              ? submittedCase.altReasons.map((ar) => ar.item?.name).filter(Boolean).join(", ")
              : "Sin motivos alternativos"}
          </div>
        </div>

        <div className="summary-box p-4 rounded-xl border border-border-subtle bg-surface-subtle">
          <h5 className="text-xs font-bold uppercase text-teal-text mb-1">Anamnesis y Signos</h5>
          <div className="val text-xs text-text-main line-clamp-3">
            {submittedCase.signsSymptomsText || "Sin anamnesis registrada"}
          </div>
        </div>

        <div className="summary-box p-4 rounded-xl border border-border-subtle bg-surface-subtle">
          <h5 className="text-xs font-bold uppercase text-teal-text mb-1">Recurso Audiovisual</h5>
          <div className="val text-sm font-semibold text-text-main">
            {submittedCase.hasVideo
              ? submittedCase.videoUrl
                ? `Video: ${submittedCase.videoUrl}`
                : "Sí, video configurado"
              : "No requiere video"}
          </div>
        </div>

        <div className="summary-box p-4 rounded-xl border border-border-subtle bg-surface-subtle">
          <h5 className="text-xs font-bold uppercase text-teal-text mb-1">Examen Físico</h5>
          <div className="val text-sm font-semibold text-text-main">
            {submittedCase.examModality === "interactive" ? "Interactivo (Puntos 3D)" : "Narrativo"}
          </div>
          <div className="text-xs text-teal-text font-bold mt-1">
            {submittedCase.examFindings?.length
              ? `${submittedCase.examFindings.length} hallazgo(s) registrado(s)`
              : submittedCase.physicalExamNarrative ? "Relato cargado" : "Sin hallazgos"}
          </div>
        </div>

        <div className="summary-box p-4 rounded-xl border border-border-subtle bg-surface-subtle">
          <h5 className="text-xs font-bold uppercase text-teal-text mb-1">Resolución Quirúrgica</h5>
          <div className="val text-sm font-semibold text-text-main">
            {submittedCase.includesSurgery
              ? submittedCase.surgicalTechnique?.name || "Cirugía requerida"
              : "Tratamiento médico / no quirúrgico"}
          </div>
        </div>

        <div className="summary-box p-4 rounded-xl border border-border-subtle bg-surface-subtle col-span-full">
          <h5 className="text-xs font-bold uppercase text-teal-text mb-1">
            Estudios Complementarios Registrados ({submittedCase.studies?.length || 0})
          </h5>
          <div className="val text-sm flex flex-col gap-1.5">
            {submittedCase.studies?.map((s, i) => (
              <div key={s.id || i} className="text-xs text-text-main flex items-center justify-between gap-2 p-2 rounded-lg bg-card-bg border border-border-subtle">
                <span className="font-semibold">{s.studyType?.name}</span>
                <span className="text-[11px] font-bold text-teal-text">
                  {s.performed ? "✓ Realizado" : "No Realizado"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="summary-box p-4 rounded-xl border border-border-subtle bg-surface-subtle col-span-full">
          <h5 className="text-xs font-bold uppercase text-teal-text mb-1">
            Diagnósticos Diferenciales ({submittedCase.diagnoses?.length || 0})
          </h5>
          <div className="val flex flex-col gap-1.5">
            {submittedCase.diagnoses?.map((d, i) => (
              <div
                key={d.itemId || i}
                className="text-xs flex items-center gap-2"
                style={{ color: d.isCorrect ? "var(--teal-text)" : "var(--text-main)" }}
              >
                {d.isCorrect ? (
                  <CheckIcon width={14} height={14} className="shrink-0 text-emerald-500" />
                ) : (
                  <span className="w-3.5 inline-block text-center text-text-muted shrink-0">•</span>
                )}
                <span className={d.isCorrect ? "font-bold text-emerald-600 dark:text-emerald-400" : ""}>
                  {d.item?.name}
                </span>
                {d.isCorrect && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white ml-1">
                    CORRECTO
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {submittedCase.summary && (
          <div className="summary-box p-4 rounded-xl border border-border-subtle bg-surface-subtle col-span-full">
            <h5 className="text-xs font-bold uppercase text-teal-text mb-1">
              Resumen Clínico y Epílogo
            </h5>
            <p className="text-xs text-text-main leading-relaxed whitespace-pre-wrap">
              {submittedCase.summary}
            </p>
          </div>
        )}
      </div>

      <div className="summary-actions mt-8 pt-6 border-t border-border-subtle flex justify-end gap-3 flex-wrap">
        <button
          type="button"
          onClick={onResetForm}
          className="btn border border-border-subtle hover:bg-surface-hover text-text-main text-xs sm:text-sm px-4 py-2.5 rounded-xl font-semibold cursor-pointer transition-colors"
        >
          Cargar Otro Caso
        </button>
        <button
          type="button"
          onClick={onViewCases}
          className="btn btn-teal text-xs sm:text-sm px-5 py-2.5 rounded-xl font-semibold cursor-pointer shadow-sm"
        >
          Ver en Repositorio de Casos
        </button>
      </div>
    </div>
  );
});
