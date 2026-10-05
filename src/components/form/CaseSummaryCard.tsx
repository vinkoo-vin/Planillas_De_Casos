"use client";

import React from "react";
import { SavedCase } from "@/types/clinical";
import { AdequacyBadge } from "@/components/common/AdequacyBadge";
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
          <h5 className="text-xs font-bold uppercase text-teal-text mb-1">Título del Caso</h5>
          <div className="val font-semibold text-text-main text-base">{submittedCase.title}</div>
          {submittedCase.consultationReason && (
            <div className="text-xs text-text-muted mt-1 italic">
              Motivo: {submittedCase.consultationReason}
            </div>
          )}
        </div>

        <div className="summary-box p-4 rounded-xl border border-border-subtle bg-surface-subtle">
          <h5 className="text-xs font-bold uppercase text-teal-text mb-1">
            Palabras Clave ({submittedCase.keywords?.length || 0})
          </h5>
          <div className="val text-sm font-medium text-text-main">
            {submittedCase.keywords?.map((k) => k.keyword.name).join(", ")}
          </div>
        </div>

        <div className="summary-box p-4 rounded-xl border border-border-subtle bg-surface-subtle">
          <h5 className="text-xs font-bold uppercase text-teal-text mb-1">Historia Clínica</h5>
          <div className="val text-xs text-text-main line-clamp-3">
            {submittedCase.clinicalHistory}
          </div>
        </div>

        <div className="summary-box p-4 rounded-xl border border-border-subtle bg-surface-subtle">
          <h5 className="text-xs font-bold uppercase text-teal-text mb-1">Recurso Audiovisual</h5>
          <div className="val text-sm font-semibold text-text-main">
            {submittedCase.hasVideo ? "Sí, video clínico configurado" : "No requiere video"}
          </div>
        </div>

        <div className="summary-box p-4 rounded-xl border border-border-subtle bg-surface-subtle">
          <h5 className="text-xs font-bold uppercase text-teal-text mb-1">Examen Físico</h5>
          <div className="val text-sm font-semibold text-text-main">
            {submittedCase.isPhysicalExamInteractive ? "Interactivo" : "Tradicional"}
          </div>
          <div className="text-xs text-teal-text font-bold mt-1">
            Hallazgo / Reacción: {submittedCase.painLevel}
          </div>
        </div>

        <div className="summary-box p-4 rounded-xl border border-border-subtle bg-surface-subtle col-span-full">
          <h5 className="text-xs font-bold uppercase text-teal-text mb-1">
            Estudios Complementarios Registrados ({submittedCase.studies?.length || 0})
          </h5>
          <div className="val text-sm flex flex-col gap-1.5">
            {submittedCase.studies?.map((s, i) => (
              <div key={s.id || `${s.studyCatalog?.name || "study"}-${i}`} className="text-xs text-text-main flex items-center gap-2">
                <strong>{s.studyCatalog?.name}</strong>
                <AdequacyBadge isAdequate={s.isAdequate} />
              </div>
            ))}
          </div>
        </div>

        <div className="summary-box p-4 rounded-xl border border-border-subtle bg-surface-subtle col-span-full">
          <h5 className="text-xs font-bold uppercase text-teal-text mb-1">
            Opciones Terapéuticas Registradas ({submittedCase.treatmentOptions?.length || 0})
          </h5>
          <div className="val flex flex-col gap-1.5">
            {submittedCase.treatmentOptions?.map((t, i) => (
              <div
                key={t.id || `summary-opt-${t.order || i}-${i}`}
                className="text-xs flex items-center gap-2"
                style={{ color: t.isCorrect ? "var(--teal-text)" : "var(--text-main)" }}
              >
                {t.isCorrect ? (
                  <CheckIcon width={14} height={14} className="shrink-0" />
                ) : (
                  <span className="w-3.5 inline-block text-center text-text-muted shrink-0">•</span>
                )}
                <span>{t.description}</span>
                {t.isCorrect && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white ml-1">
                    CORRECTA
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {(submittedCase.clinicalSummary || submittedCase.epidemiology || submittedCase.complications) && (
          <div className="summary-box p-4 rounded-xl border border-border-subtle bg-surface-subtle col-span-full">
            <h5 className="text-xs font-bold uppercase text-teal-text mb-1">
              Epílogo Docente & Resumen Clínico
            </h5>
            {submittedCase.clinicalSummary && (
              <p className="text-xs text-text-main mb-2 leading-relaxed">
                {submittedCase.clinicalSummary}
              </p>
            )}
            <div className="flex gap-4 text-xs text-text-muted flex-wrap">
              {submittedCase.epidemiology && (
                <div>
                  <strong className="text-text-main">Epidemiología:</strong> {submittedCase.epidemiology}
                </div>
              )}
              {submittedCase.complications && (
                <div>
                  <strong className="text-text-main">Complicaciones:</strong> {submittedCase.complications}
                </div>
              )}
            </div>
          </div>
        )}

        {submittedCase.customFields && submittedCase.customFields.length > 0 && (
          <div className="summary-box p-4 rounded-xl border border-border-subtle bg-surface-subtle col-span-full">
            <h5 className="text-xs font-bold uppercase text-teal-text mb-2">
              Campos Adicionales del Doctor ({submittedCase.customFields.length})
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {submittedCase.customFields.map((cf, idx) => (
                <div key={cf.id || idx} className="p-2.5 rounded-lg bg-card-bg border border-border-subtle text-xs">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <strong className="text-text-main font-semibold">{cf.label}</strong>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal/15 text-teal">
                      {cf.phase === "summary" ? "Resumen" : `Fase ${cf.phase}`}
                    </span>
                  </div>
                  <p className="text-text-body whitespace-pre-wrap">{cf.value}</p>
                  {cf.imageUrl && (
                    <div className="mt-2 flex items-center gap-2 pt-1.5 border-t border-border-subtle/50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cf.imageUrl}
                        alt={cf.label}
                        className="w-12 h-12 rounded-lg object-cover border border-border-subtle shrink-0"
                      />
                      <span className="text-[11px] text-text-muted truncate">{cf.imageName || "Imagen adicional adjunta"}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>


      <div className="text-center mt-8 flex justify-center gap-3.5 flex-wrap">
        <button
          type="button"
          className="btn btn-teal px-6 py-2.5 rounded-xl font-semibold text-sm"
          onClick={onResetForm}
        >
          Cargar Otro Caso
        </button>
        <button
          type="button"
          className="btn btn-secondary px-6 py-2.5 rounded-xl font-semibold text-sm"
          onClick={onViewCases}
        >
          Ver Casos Cargados
        </button>
      </div>
    </div>
  );
});
