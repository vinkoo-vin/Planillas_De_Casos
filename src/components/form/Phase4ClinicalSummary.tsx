"use client";

import React, { useState } from "react";
import { CaseFormData, CustomFieldItem } from "@/types/clinical";
import { FormPhase } from "./CaseStepper";
import { KeywordTagPicker } from "./subcomponents/KeywordTagPicker";
import { CustomFieldsSection } from "./subcomponents/CustomFieldsSection";

interface Phase4ClinicalSummaryProps {
  data: CaseFormData;
  updateField: <K extends keyof CaseFormData>(
    field: K,
    value: CaseFormData[K] | ((prev: CaseFormData[K]) => CaseFormData[K])
  ) => void;
  keywordsPool: string[];
  onToggleKeyword: (kw: string) => void;
  onAddCustomKeyword: (kw: string) => void;
  onSelectPhase: (phase: FormPhase) => void;
  isSubmitting: boolean;
  isEditing?: boolean;
  onAddCustomField: (phase: number | "summary") => void;
  onUpdateCustomField: (id: string, updates: Partial<CustomFieldItem>) => void;
  onRemoveCustomField: (id: string) => void;
}

export const Phase4ClinicalSummary = React.memo(function Phase4ClinicalSummary({
  data,
  updateField,
  keywordsPool,
  onToggleKeyword,
  onAddCustomKeyword,
  onSelectPhase,
  isSubmitting,
  isEditing = false,
  onAddCustomField,
  onUpdateCustomField,
  onRemoveCustomField,
}: Phase4ClinicalSummaryProps) {
  // Estados para colapsar/expandir bloques de revisión si el usuario desea enfocarse
  const [expandedSections, setExpandedSections] = useState<{
    phase1: boolean;
    phase2: boolean;
    phase3: boolean;
    phase4: boolean;
  }>({
    phase1: true,
    phase2: true,
    phase3: true,
    phase4: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div
      role="tabpanel"
      id="phase-panel-4"
      aria-labelledby="stepper-tab-4"
      className="space-y-6 animate-fadeIn"
    >
      {/* CABECERA PRINCIPAL DE RESUMEN DEL CASO */}
      <div className="card p-5 sm:p-6 rounded-2xl shadow-sm border border-card-border bg-card-bg">
        <div className="flex items-center justify-between gap-4 pb-3.5 border-b border-border-subtle flex-wrap">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shrink-0 shadow-sm bg-teal text-white">
              📋
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-text-main">
                Resumen del Caso
              </h2>
              <p className="text-xs sm:text-sm text-text-muted">
                Revise la totalidad de los datos cargados en las fases anteriores. Puede realizar modificaciones directamente aquí o saltar a la fase deseada antes de finalizar.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal/10 text-teal border border-teal/20">
              Revisión previa a publicación
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* BLOQUE 1: REVISIÓN DE FASE 1 - MOTIVO DE CONSULTA         */}
      {/* ========================================================= */}
      <div className="card p-5 sm:p-6 rounded-2xl shadow-sm border border-card-border bg-card-bg transition-all">
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-border-subtle/80 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-teal/15 text-teal text-xs font-bold flex items-center justify-center">
              1
            </span>
            <div>
              <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                <span>Motivo de Consulta y Semiología</span>
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-md bg-surface text-text-muted border border-border-subtle">
                  Fase 1
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectPhase(1)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-teal bg-teal/10 hover:bg-teal/20 border border-teal/20 transition-all cursor-pointer"
              title="Ir a Fase 1"
            >
              <span>✏️ Editar en Fase 1</span>
            </button>
            <button
              type="button"
              onClick={() => toggleSection("phase1")}
              className="w-7 h-7 rounded-lg border border-border-subtle text-text-muted hover:text-text-main hover:bg-surface flex items-center justify-center text-xs cursor-pointer"
              aria-label={expandedSections.phase1 ? "Colapsar sección 1" : "Expandir sección 1"}
            >
              {expandedSections.phase1 ? "▲" : "▼"}
            </button>
          </div>
        </div>

        {expandedSections.phase1 && (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-main mb-1">
                  Nombre / Título del caso clínico:
                </label>
                <input
                  type="text"
                  value={data.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Título del caso..."
                  className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-card-bg border border-input-border focus:border-teal outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-main mb-1">
                  Motivo de consulta inicial:
                </label>
                <input
                  type="text"
                  value={data.consultationReason}
                  onChange={(e) => updateField("consultationReason", e.target.value)}
                  placeholder="Motivo de consulta..."
                  className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-card-bg border border-input-border focus:border-teal outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1">
                Historia de la enfermedad actual y signos clave:
              </label>
              <textarea
                rows={3}
                value={data.clinicalHistory}
                onChange={(e) => updateField("clinicalHistory", e.target.value)}
                placeholder="Anamnesis y evolución..."
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-card-bg border border-input-border focus:border-teal outline-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border-subtle/50">
              {/* VIDEO */}
              <div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-text-main">Recurso Audiovisual</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      data.hasVideo
                        ? "bg-teal/15 text-teal border border-teal/30"
                        : "bg-surface text-text-muted border border-border-subtle"
                    }`}
                  >
                    {data.hasVideo ? "✓ Con Video" : "Sin Video"}
                  </span>
                </div>
                {data.hasVideo ? (
                  <textarea
                    rows={2}
                    value={data.videoDescription}
                    onChange={(e) => updateField("videoDescription", e.target.value)}
                    placeholder="Detalle del video clínico..."
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-card-bg border border-input-border focus:border-teal outline-none"
                  />
                ) : (
                  <p className="text-xs text-text-muted italic">No se configuró video para este caso.</p>
                )}
              </div>

              {/* EXAMEN FÍSICO */}
              <div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-text-main">Examen Físico</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface text-text-body border border-border-subtle">
                    {data.isInteractiveExam ? "Modo Interactivo (3D)" : "Modo Estándar (Texto)"}
                  </span>
                </div>

                {data.isInteractiveExam ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs gap-2">
                      <span className="text-text-muted">Zona:</span>
                      <input
                        type="text"
                        value={data.examZone}
                        onChange={(e) => updateField("examZone", e.target.value)}
                        placeholder="Ej: Abdomen"
                        className="px-2 py-1 rounded-md text-xs bg-card-bg border border-input-border w-2/3"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs gap-2">
                      <span className="text-text-muted">Punto ref.:</span>
                      <input
                        type="text"
                        value={data.examRefPoint}
                        onChange={(e) => updateField("examRefPoint", e.target.value)}
                        placeholder="Ej: Epigastrio"
                        className="px-2 py-1 rounded-md text-xs bg-card-bg border border-input-border w-2/3"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs gap-2">
                      <span className="text-text-muted">Hallazgo/Dolor:</span>
                      <input
                        type="text"
                        value={data.painLevel}
                        onChange={(e) => updateField("painLevel", e.target.value)}
                        placeholder="Nivel de dolor..."
                        className="px-2 py-1 rounded-md text-xs bg-card-bg border border-input-border w-2/3"
                      />
                    </div>
                  </div>
                ) : (
                  <textarea
                    rows={2}
                    value={data.examStandardText}
                    onChange={(e) => updateField("examStandardText", e.target.value)}
                    placeholder="Descripción del examen físico estándar..."
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-card-bg border border-input-border focus:border-teal outline-none"
                  />
                )}
              </div>
            </div>

            {/* CAMPOS ADICIONALES DE FASE 1 EN EL RESUMEN */}
            <CustomFieldsSection
              phase={1}
              customFields={data.customFields}
              onAddField={onAddCustomField}
              onUpdateField={onUpdateCustomField}
              onRemoveField={onRemoveCustomField}
              title="Campos Adicionales de Semiología (Fase 1)"
              badgeLabel="Fase 1"
              isCompact={true}
            />
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* BLOQUE 2: REVISIÓN DE FASE 2 - DIAGNÓSTICO (ESTUDIOS)     */}
      {/* ========================================================= */}
      <div className="card p-5 sm:p-6 rounded-2xl shadow-sm border border-card-border bg-card-bg transition-all">
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-border-subtle/80 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-teal/15 text-teal text-xs font-bold flex items-center justify-center">
              2
            </span>
            <div>
              <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                <span>Diagnóstico (Estudios Complementarios)</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal/10 text-teal border border-teal/20">
                  {data.studies.length} {data.studies.length === 1 ? "estudio" : "estudios"}
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectPhase(2)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-teal bg-teal/10 hover:bg-teal/20 border border-teal/20 transition-all cursor-pointer"
              title="Ir a Fase 2"
            >
              <span>🔬 Gestionar Estudios en Fase 2</span>
            </button>
            <button
              type="button"
              onClick={() => toggleSection("phase2")}
              className="w-7 h-7 rounded-lg border border-border-subtle text-text-muted hover:text-text-main hover:bg-surface flex items-center justify-center text-xs cursor-pointer"
              aria-label={expandedSections.phase2 ? "Colapsar sección 2" : "Expandir sección 2"}
            >
              {expandedSections.phase2 ? "▲" : "▼"}
            </button>
          </div>
        </div>

        {expandedSections.phase2 && (
          <div className="space-y-3 pt-1">
            {data.studies.length === 0 ? (
              <div className="p-4 text-center rounded-xl border border-dashed border-border-subtle text-text-muted text-xs">
                No se añadieron estudios diagnósticos para este caso. Puede agregarlos en la{" "}
                <button
                  type="button"
                  onClick={() => onSelectPhase(2)}
                  className="text-teal font-semibold hover:underline"
                >
                  Fase 2
                </button>
                .
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.studies.map((study, idx) => (
                  <div
                    key={study.id || `summary-study-${idx}`}
                    className="p-3.5 rounded-xl border border-border-subtle bg-surface hover:border-teal-border/60 transition-all text-xs space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="w-5 h-5 rounded bg-teal/15 text-teal text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={study.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateField("studies", (prev) => {
                              const next = [...prev];
                              next[idx] = { ...next[idx], name: val };
                              return next;
                            });
                          }}
                          placeholder="Nombre del estudio..."
                          className="font-bold text-xs text-text-main bg-transparent border-b border-dashed border-border-subtle focus:border-teal outline-none w-full"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          updateField("studies", (prev) => {
                            const next = [...prev];
                            next[idx] = { ...next[idx], isAdequate: !next[idx].isAdequate };
                            return next;
                          });
                        }}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 cursor-pointer transition-colors ${
                          study.isAdequate
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30"
                        }`}
                        title="Haga clic para alternar adecuación"
                      >
                        {study.isAdequate ? "✓ Adecuado" : "✕ Penaliza"}
                      </button>
                    </div>

                    <div>
                      <textarea
                        rows={2}
                        value={study.findings}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateField("studies", (prev) => {
                            const next = [...prev];
                            next[idx] = { ...next[idx], findings: val };
                            return next;
                          });
                        }}
                        placeholder="Informe / hallazgos para el simulador..."
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-card-bg border border-input-border focus:border-teal outline-none"
                      />
                    </div>

                    {study.imageUrl && (
                      <div className="flex items-center gap-2 pt-1 border-t border-border-subtle/50 text-[11px] text-text-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={study.imageUrl}
                          alt={study.name}
                          className="w-8 h-8 rounded object-cover border border-border-subtle shrink-0"
                        />
                        <span className="truncate">{study.imageName || "Imagen diagnóstica adjunta"}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* CAMPOS ADICIONALES DE FASE 2 EN EL RESUMEN */}
            <CustomFieldsSection
              phase={2}
              customFields={data.customFields}
              onAddField={onAddCustomField}
              onUpdateField={onUpdateCustomField}
              onRemoveField={onRemoveCustomField}
              title="Campos Adicionales de Diagnóstico (Fase 2)"
              badgeLabel="Fase 2"
              isCompact={true}
            />
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* BLOQUE 3: REVISIÓN DE FASE 3 - TRATAMIENTO                */}
      {/* ========================================================= */}
      <div className="card p-5 sm:p-6 rounded-2xl shadow-sm border border-card-border bg-card-bg transition-all">
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-border-subtle/80 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-teal/15 text-teal text-xs font-bold flex items-center justify-center">
              3
            </span>
            <div>
              <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                <span>Tratamiento (Conductas Terapéuticas)</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal/10 text-teal border border-teal/20">
                  {data.treatmentOptions.length} {data.treatmentOptions.length === 1 ? "conducta" : "conductas"}
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectPhase(3)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-teal bg-teal/10 hover:bg-teal/20 border border-teal/20 transition-all cursor-pointer"
              title="Ir a Fase 3"
            >
              <span>💊 Gestionar Tratamientos en Fase 3</span>
            </button>
            <button
              type="button"
              onClick={() => toggleSection("phase3")}
              className="w-7 h-7 rounded-lg border border-border-subtle text-text-muted hover:text-text-main hover:bg-surface flex items-center justify-center text-xs cursor-pointer"
              aria-label={expandedSections.phase3 ? "Colapsar sección 3" : "Expandir sección 3"}
            >
              {expandedSections.phase3 ? "▲" : "▼"}
            </button>
          </div>
        </div>

        {expandedSections.phase3 && (
          <div className="space-y-3 pt-1">
            {data.treatmentOptions.length === 0 ? (
              <div className="p-4 text-center rounded-xl border border-dashed border-border-subtle text-text-muted text-xs">
                No se registraron conductas de tratamiento todavía. Puede agregarlas en la{" "}
                <button
                  type="button"
                  onClick={() => onSelectPhase(3)}
                  className="text-teal font-semibold hover:underline"
                >
                  Fase 3
                </button>
                .
              </div>
            ) : (
              <div className="space-y-2.5">
                {data.treatmentOptions.map((opt, idx) => (
                  <div
                    key={opt.id || `summary-opt-${idx}`}
                    className={`p-3.5 rounded-xl border transition-all text-xs space-y-2 ${
                      opt.isCorrect
                        ? "bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/40"
                        : "bg-surface border-border-subtle"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span
                          className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center shrink-0 ${
                            opt.isCorrect
                              ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                              : "bg-surface-subtle text-text-muted border border-border-subtle"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={opt.description}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateField("treatmentOptions", (prev) => {
                              const next = [...prev];
                              next[idx] = { ...next[idx], description: val };
                              return next;
                            });
                          }}
                          placeholder="Descripción de la conducta terapéutica..."
                          className="font-semibold text-xs text-text-main bg-transparent border-b border-dashed border-border-subtle focus:border-teal outline-none w-full"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          updateField("treatmentOptions", (prev) => {
                            const next = [...prev];
                            next[idx] = { ...next[idx], isCorrect: !next[idx].isCorrect };
                            return next;
                          });
                        }}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 cursor-pointer transition-colors ${
                          opt.isCorrect
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-surface text-text-muted hover:text-rose-700 border border-border-subtle"
                        }`}
                        title="Haga clic para alternar si es correcta o incorrecta"
                      >
                        {opt.isCorrect ? "✓ Conducta Correcta" : "✕ Incorrecta"}
                      </button>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={opt.feedback || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateField("treatmentOptions", (prev) => {
                            const next = [...prev];
                            next[idx] = { ...next[idx], feedback: val };
                            return next;
                          });
                        }}
                        placeholder="Justificación / Feedback docente..."
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-card-bg border border-input-border focus:border-teal outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CAMPOS ADICIONALES DE FASE 3 EN EL RESUMEN */}
            <CustomFieldsSection
              phase={3}
              customFields={data.customFields}
              onAddField={onAddCustomField}
              onUpdateField={onUpdateCustomField}
              onRemoveField={onRemoveCustomField}
              title="Campos Adicionales de Tratamiento (Fase 3)"
              badgeLabel="Fase 3"
              isCompact={true}
            />
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* BLOQUE 4: SÍNTESIS DOCENTE, EPIDEMIOLOGÍA Y PALABRAS CLAVE */}
      {/* ========================================================= */}
      <div className="card p-5 sm:p-6 rounded-2xl shadow-sm border border-card-border bg-card-bg transition-all">
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-border-subtle/80 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-teal/15 text-teal text-xs font-bold flex items-center justify-center">
              4
            </span>
            <div>
              <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                <span>Síntesis y Cierre Docente</span>
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-md bg-surface text-text-muted border border-border-subtle">
                  Metadatos
                </span>
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => toggleSection("phase4")}
            className="w-7 h-7 rounded-lg border border-border-subtle text-text-muted hover:text-text-main hover:bg-surface flex items-center justify-center text-xs cursor-pointer"
            aria-label={expandedSections.phase4 ? "Colapsar sección 4" : "Expandir sección 4"}
          >
            {expandedSections.phase4 ? "▲" : "▼"}
          </button>
        </div>

        {expandedSections.phase4 && (
          <div className="space-y-4 pt-1">
            {/* RESUMEN CLÍNICO */}
            <div>
              <label htmlFor="clinicalSummary" className="block text-xs font-semibold text-text-main mb-1">
                Resumen clínico y discusión docente:
              </label>
              <textarea
                id="clinicalSummary"
                rows={3}
                value={data.clinicalSummary}
                onChange={(e) => updateField("clinicalSummary", e.target.value)}
                placeholder="Síntesis del cuadro fisiopatológico y conclusiones..."
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-card-bg border border-input-border focus:border-teal outline-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* EPIDEMIOLOGÍA */}
              <div>
                <label htmlFor="epidemiology" className="block text-xs font-semibold text-text-main mb-1">
                  Epidemiología y factores de riesgo:
                </label>
                <textarea
                  id="epidemiology"
                  rows={2}
                  value={data.epidemiology}
                  onChange={(e) => updateField("epidemiology", e.target.value)}
                  placeholder="Incidencia, sexo, edad típica..."
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-card-bg border border-input-border focus:border-teal outline-none leading-relaxed"
                />
              </div>

              {/* COMPLICACIONES */}
              <div>
                <label htmlFor="complications" className="block text-xs font-semibold text-text-main mb-1">
                  Complicaciones principales:
                </label>
                <textarea
                  id="complications"
                  rows={2}
                  value={data.complications}
                  onChange={(e) => updateField("complications", e.target.value)}
                  placeholder="Riesgos potenciales y descompensaciones..."
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-card-bg border border-input-border focus:border-teal outline-none leading-relaxed"
                />
              </div>
            </div>

            {/* PALABRAS CLAVE */}
            <div className="pt-2">
              <KeywordTagPicker
                selectedKeywords={data.keywords}
                keywordsPool={keywordsPool}
                onToggleKeyword={onToggleKeyword}
                onAddCustomKeyword={onAddCustomKeyword}
              />
            </div>

            {/* CAMPOS ADICIONALES DE FASE 4 EN EL RESUMEN */}
            <CustomFieldsSection
              phase={4}
              customFields={data.customFields}
              onAddField={onAddCustomField}
              onUpdateField={onUpdateCustomField}
              onRemoveField={onRemoveCustomField}
              title="Campos Adicionales de Cierre Docente (Fase 4)"
              description="Parámetros de cierre docente, bibliografía o notas pedagógicas adicionales."
              badgeLabel="Fase 4"
              isCompact={true}
            />
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* BLOQUE 5: CAMPOS ADICIONALES GLOBALES DEL RESUMEN         */}
      {/* ========================================================= */}
      <CustomFieldsSection
        phase="summary"
        customFields={data.customFields}
        onAddField={onAddCustomField}
        onUpdateField={onUpdateCustomField}
        onRemoveField={onRemoveCustomField}
        title="Campos Adicionales Globales del Resumen"
        description="Permite al doctor añadir campos, recordatorios de guardia o conclusiones pedagógicas globales directamente en el resumen."
        badgeLabel="Resumen"
      />

      {/* ========================================================= */}
      {/* BOTÓN ÚNICO ATÓMICO DE FINALIZAR CASO                     */}
      {/* ========================================================= */}
      <div className="text-center pt-6 pb-4">
        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="btn btn-teal px-12 py-4 text-base sm:text-lg rounded-2xl font-bold shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2.5">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>{isEditing ? "Guardando Cambios..." : "Finalizando y Guardando Caso..."}</span>
            </span>
          ) : (
            <span className="flex items-center gap-2.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{isEditing ? "Guardar Cambios del Caso" : "Finalizar Caso"}</span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
});
