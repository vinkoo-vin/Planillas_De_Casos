"use client";

import React from "react";
import { CaseDraft, FormErrorMap, CaseStatus } from "@/types/clinical";

interface Phase8ResumenProps {
  data: CaseDraft;
  errors: FormErrorMap;
  updateField: <K extends keyof CaseDraft>(field: K, value: CaseDraft[K] | ((prev: CaseDraft[K]) => CaseDraft[K])) => void;
}

export const Phase8Resumen = React.memo(function Phase8Resumen({
  data,
  errors,
  updateField,
}: Phase8ResumenProps) {
  const currentStatus: CaseStatus = data.status || "DRAFT";

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ENCABEZADO DE FASE */}
      <div className="phase-header p-5 rounded-2xl bg-surface-subtle border border-border-subtle">
        <div className="flex items-center gap-3 mb-1">
          <span className="w-9 h-9 rounded-xl bg-teal text-white flex items-center justify-center text-sm font-bold shadow-xs">
            8
          </span>
          <div>
            <h2 className="text-lg font-extrabold text-text-main">
              Resumen del Caso y Conclusiones Docentes
            </h2>
            <p className="text-xs text-text-muted">
              Redacte la discusión clínica, perlas formativas y seleccione el estado final de este caso.
            </p>
          </div>
        </div>
      </div>

      {/* 8.1 TEXTO DE RESUMEN CLÍNICO */}
      <div className="p-5 rounded-2xl bg-card-bg border border-border-subtle space-y-3">
        <div>
          <label htmlFor="summaryText" className="text-sm font-bold text-text-main flex items-center gap-2">
            <span>Resumen Clínico, Discusión y Epílogo Docente</span>
            <span className="text-rose-500 font-extrabold">*</span>
          </label>
          <p className="text-xs text-text-muted mt-0.5">
            Texto integrador que se revelará al alumno al completar la simulación para afianzar el aprendizaje.
          </p>
        </div>

        <textarea
          id="summaryText"
          rows={6}
          className="w-full p-4 rounded-xl text-sm border border-border-subtle bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-teal resize-y"
          placeholder="Ej: La estenosis hipertrófica de píloro es la causa quirúrgica más frecuente de vómitos no biliosos en el lactante. El diagnóstico ecográfico temprano evita la progresión a deshidratación severa con alcalosis metabólica..."
          value={data.summary || ""}
          onChange={(e) => updateField("summary", e.target.value)}
        />
        {errors.summary && (
          <p className="text-xs text-rose-500 font-semibold">{errors.summary}</p>
        )}
      </div>

      {/* 8.2 ESTADO DEL CASO */}
      <div className="p-5 rounded-2xl bg-card-bg border border-border-subtle space-y-4">
        <div>
          <label className="text-sm font-bold text-text-main block">
            Estado de Publicación del Caso
          </label>
          <p className="text-xs text-text-muted mt-0.5">
            Indique si el caso debe guardarse como borrador editable o publicarse para su uso en simulaciones.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => updateField("status", "DRAFT")}
            className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
              currentStatus === "DRAFT"
                ? "border-teal bg-teal-light text-text-main shadow-xs"
                : "border-border-subtle bg-surface hover:bg-surface-subtle text-text-muted"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <strong className="text-sm font-bold text-text-main">Borrador</strong>
            </div>
            <p className="text-xs text-text-body">
              El caso se guarda para continuar su edición más adelante. No aparece en simulaciones activas.
            </p>
          </button>

          <button
            type="button"
            onClick={() => updateField("status", "PUBLISHED")}
            className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
              currentStatus === "PUBLISHED"
                ? "border-emerald-500 bg-emerald-500/10 text-text-main shadow-xs"
                : "border-border-subtle bg-surface hover:bg-surface-subtle text-text-muted"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <strong className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                Publicado
              </strong>
            </div>
            <p className="text-xs text-text-body">
              El caso queda listo y activo para que los alumnos lo resuelvan en la plataforma.
            </p>
          </button>
        </div>
      </div>

      {/* REVISIÓN RÁPIDA DE FASES */}
      <div className="p-5 rounded-2xl bg-surface-subtle border border-border-subtle space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-teal">
          Revisión Rápida del Caso antes de Guardar:
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-card-bg border border-border-subtle">
            <span className="text-text-muted block text-[11px]">Diagnóstico:</span>
            <strong className="text-text-main font-semibold truncate block">
              {data.finalDiagnosisName || "Sin diagnóstico"}
            </strong>
          </div>
          <div className="p-3 rounded-xl bg-card-bg border border-border-subtle">
            <span className="text-text-muted block text-[11px]">Motivo Principal:</span>
            <strong className="text-text-main font-semibold truncate block">
              {data.principalReasonName || "Sin motivo"}
            </strong>
          </div>
          <div className="p-3 rounded-xl bg-card-bg border border-border-subtle">
            <span className="text-text-muted block text-[11px]">Examen Físico:</span>
            <strong className="text-text-main font-semibold block">
              {data.examModality === "interactive"
                ? `${data.examFindings?.length || 0} hallazgos`
                : "Narrativo"}
            </strong>
          </div>
          <div className="p-3 rounded-xl bg-card-bg border border-border-subtle">
            <span className="text-text-muted block text-[11px]">Estudios y Cirugía:</span>
            <strong className="text-text-main font-semibold block">
              {data.studies?.filter((s) => s.performed).length || 0} realizados ·{" "}
              {data.includesSurgery ? "Quirúrgico" : "Médico"}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
});
