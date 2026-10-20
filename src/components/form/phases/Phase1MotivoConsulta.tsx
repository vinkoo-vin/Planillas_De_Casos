"use client";

import React from "react";
import { CatalogType } from "@prisma/client";
import { CaseDraft, FormErrorMap } from "@/types/clinical";
import { SelectorCatalogo } from "@/components/common/SelectorCatalogo";

interface Phase1MotivoConsultaProps {
  data: CaseDraft;
  errors: FormErrorMap;
  updateField: <K extends keyof CaseDraft>(field: K, value: CaseDraft[K] | ((prev: CaseDraft[K]) => CaseDraft[K])) => void;
}

export const Phase1MotivoConsulta = React.memo(function Phase1MotivoConsulta({
  data,
  errors,
  updateField,
}: Phase1MotivoConsultaProps) {
  const principalId = data.principalReasonId || "";

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ENCABEZADO DE FASE */}
      <div className="phase-header p-5 rounded-2xl bg-surface-subtle border border-border-subtle">
        <div className="flex items-center gap-3 mb-1">
          <span className="w-9 h-9 rounded-xl bg-teal text-white flex items-center justify-center text-sm font-bold shadow-xs">
            1
          </span>
          <div>
            <h2 className="text-lg font-extrabold text-text-main">
              Motivo de Consulta
            </h2>
            <p className="text-xs text-text-muted">
              Configure el diagnóstico definitivo del caso y defina cómo se presenta inicialmente al alumno.
            </p>
          </div>
        </div>
      </div>

      {/* 1.1 DIAGNÓSTICO FINAL (DATO INTERNO) */}
      <div className="p-5 rounded-2xl bg-card-bg border border-border-subtle space-y-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <label className="text-sm font-bold text-text-main flex items-center gap-2">
              <span>Diagnóstico Final del Caso</span>
              <span className="text-rose-500 font-extrabold">*</span>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                Uso Interno
              </span>
            </label>
            <p className="text-xs text-text-muted mt-0.5">
              Identifica este caso en la planilla y repositorio. <strong>No se muestra al alumno durante la simulación.</strong>
            </p>
          </div>
        </div>

        <SelectorCatalogo
          catalog={CatalogType.diagnostico}
          value={data.finalDiagnosisId || null}
          onChange={(id, item) => {
            updateField("finalDiagnosisId", id);
            updateField("finalDiagnosisName", item?.name || null);
          }}
          placeholder="Seleccione o escriba el diagnóstico final..."
          required
        />
        {errors.finalDiagnosisId && (
          <p className="text-xs text-rose-500 font-semibold">{errors.finalDiagnosisId}</p>
        )}
      </div>

      {/* 1.2 MOTIVO PRINCIPAL DE CONSULTA */}
      <div className="p-5 rounded-2xl bg-card-bg border border-border-subtle space-y-3">
        <div>
          <label className="text-sm font-bold text-text-main flex items-center gap-2">
            <span>Motivo Principal de Consulta</span>
            <span className="text-rose-500 font-extrabold">*</span>
          </label>
          <p className="text-xs text-text-muted mt-0.5">
            El síntoma o razón de ingreso que presenta el paciente (ej. &ldquo;Vómitos&rdquo;, &ldquo;Dolor abdominal agudo&rdquo;).
          </p>
        </div>

        <SelectorCatalogo
          catalog={CatalogType.motivo_consulta}
          value={data.principalReasonId || null}
          onChange={(id, item) => {
            updateField("principalReasonId", id);
            updateField("principalReasonName", item?.name || null);
          }}
          placeholder="Seleccione o cree el motivo principal..."
          required
        />
        {errors.principalReasonId && (
          <p className="text-xs text-rose-500 font-semibold">{errors.principalReasonId}</p>
        )}
      </div>

      {/* 1.3 MOTIVOS ALTERNATIVOS */}
      <div className="p-5 rounded-2xl bg-card-bg border border-border-subtle space-y-3">
        <div>
          <label className="text-sm font-bold text-text-main">
            Motivos de Consulta Alternativos (Opcional)
          </label>
          <p className="text-xs text-text-muted mt-0.5">
            Variantes con las que otros tutores o alumnos podrían consultar el mismo caso clínico.
          </p>
        </div>

        <SelectorCatalogo
          catalog={CatalogType.motivo_consulta}
          multiple
          value={data.altReasons?.map((r) => r.itemId) || []}
          excludedIds={principalId ? [principalId] : []}
          onChange={(ids, items) => {
            const mapped = (items || []).map((it) => ({
              itemId: it.id,
              itemName: it.name,
            }));
            updateField("altReasons", mapped);
          }}
          placeholder="Buscar o agregar motivos alternos..."
        />
      </div>
    </div>
  );
});
