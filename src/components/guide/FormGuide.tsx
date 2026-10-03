"use client";

import React, { useState, useMemo } from "react";
import { CaseDraft } from "@/types/clinical";
import { AdequacyBadge } from "@/components/common/AdequacyBadge";
import {
  REAL_CASE_EXAMPLES,
  GUIDE_SECTIONS,
  type GuideSection,
  type RealCaseExample,
} from "./guideData";

interface FormGuideProps {
  onGoToForm: () => void;
  onLoadCaseExample?: (draft: CaseDraft) => void;
  onNotify?: (msg: string) => void;
}

export function FormGuide({ onGoToForm, onLoadCaseExample, onNotify }: FormGuideProps) {
  const [mainTab, setMainTab] = useState<"modules" | "examples">("modules");
  const [activeModuleNumber, setActiveModuleNumber] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedExampleId, setSelectedExampleId] = useState<string>("ehp");

  const realCaseExamples: RealCaseExample[] = REAL_CASE_EXAMPLES;
  const guideSections: GuideSection[] = GUIDE_SECTIONS;

  // FILTRADO POR BÚSQUEDA Y POR MÓDULO
  const filteredGuideSections = useMemo(() => {
    let list = guideSections;
    if (activeModuleNumber !== "all") {
      list = list.filter((s) => s.number === activeModuleNumber);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.summary.toLowerCase().includes(q) ||
          s.purpose.toLowerCase().includes(q) ||
          s.fields.some(
            (f) =>
              f.name.toLowerCase().includes(q) ||
              f.description.toLowerCase().includes(q) ||
              f.tips.toLowerCase().includes(q) ||
              f.example.toLowerCase().includes(q)
          )
      );
    }
    return list;
  }, [guideSections, activeModuleNumber, searchQuery]);

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    if (onNotify) onNotify("Texto copiado al portapapeles");
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleApplyExample = (draft: CaseDraft) => {
    if (onLoadCaseExample) {
      onLoadCaseExample(draft);
    }
    onGoToForm();
    if (onNotify) {
      onNotify("Caso de ejemplo cargado en el formulario");
    }
  };

  const activeExample = useMemo(
    () => realCaseExamples.find((c) => c.id === selectedExampleId) || realCaseExamples[0],
    [realCaseExamples, selectedExampleId]
  );

  return (
    <div className="guide-container space-y-8 animate-fadeIn">
      {/* 1. HERO DOCENTE CON ACCESO RÁPIDO */}
      <div className="guide-hero-banner p-6 sm:p-8 rounded-3xl border border-card-border bg-card-bg shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-light text-primary border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary inline-block" />
              Manual y Criterios Docentes de Simulación
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-main">
              Guía de Carga de Casos Pediátricos
            </h2>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Consulte la especificación de cada campo, el formato requerido y ejemplos reales
              de casos clínicos pediátricos listos para simulación.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={onGoToForm}
              className="btn-primary px-5 py-2.5 rounded-xl font-bold text-sm text-primary-fg shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Ir al Formulario
            </button>
          </div>
        </div>

        {/* BARRA DE NAVEGACIÓN PRINCIPAL DE LA GUÍA (2 VISTAS) */}
        <div className="mt-6 pt-5 border-t border-border-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="guide-tab-nav inline-flex p-1 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => setMainTab("modules")}
              className={`guide-tab-btn ${mainTab === "modules" ? "active" : ""}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              Fases Clínicas ({guideSections.length})
            </button>

            <button
              type="button"
              onClick={() => setMainTab("examples")}
              className={`guide-tab-btn ${mainTab === "examples" ? "active" : ""}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2" />
                <path d="M8.5 2h7" />
                <path d="M7 16h10" />
              </svg>
              Casos Pediátricos Reales ({realCaseExamples.length})
            </button>
          </div>

          {/* BUSCADOR EN VIVO DE CAMPOS */}
          {mainTab === "modules" && (
            <div className="relative min-w-[240px]">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar campo, tip o fase..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs bg-surface-subtle border border-border-subtle text-text-main focus:bg-card-bg transition-all"
              />
            </div>
          )}
        </div>
      </div>

      {/* VISTA 1: FASES CLÍNICAS DETALLADAS */}
      {mainTab === "modules" && (
        <div className="space-y-6">
          {/* SELECTOR RÁPIDO DE FASE */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
            <button
              type="button"
              onClick={() => setActiveModuleNumber("all")}
              className={`guide-badge-pill px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer shrink-0 ${
                activeModuleNumber === "all" ? "active" : ""
              }`}
            >
              Todas las Fases ({guideSections.length})
            </button>

            {guideSections.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveModuleNumber(sec.number)}
                className={`guide-badge-pill px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeModuleNumber === sec.number ? "active" : ""
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-black/10 inline-flex items-center justify-center text-[10px] font-bold">
                  {sec.number}
                </span>
                {sec.title}
              </button>
            ))}
          </div>

          {/* MENSAJE DE BÚSQUEDA SI APLICA */}
          {searchQuery && (
            <div className="text-xs text-text-muted flex items-center justify-between p-3 rounded-xl bg-surface-subtle border border-border-subtle">
              <span>
                Resultados filtrados para: <strong>&ldquo;{searchQuery}&rdquo;</strong> ({filteredGuideSections.length} módulos coincidentes)
              </span>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-primary font-bold hover:underline cursor-pointer"
              >
                Limpiar filtro
              </button>
            </div>
          )}

          {/* LISTA DE MÓDULOS */}
          <div className="space-y-6">
            {filteredGuideSections.map((sec) => (
              <article
                key={sec.id}
                className="card guide-card p-6 sm:p-7 rounded-3xl border border-card-border bg-card-bg shadow-sm hover:shadow-md transition-all"
              >
                {/* CABECERA DEL MÓDULO */}
                <div className="flex items-start justify-between gap-4 pb-4 mb-6 border-b border-border-subtle flex-wrap">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-primary text-primary-fg flex items-center justify-center font-extrabold text-base shadow-sm shrink-0">
                      {sec.number}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-xl font-bold text-text-main">{sec.title}</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-surface-subtle border border-border-subtle text-text-muted">
                          {sec.badge}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-text-muted mt-0.5">{sec.summary}</p>
                    </div>
                  </div>

                  <div className="text-xs text-text-muted bg-surface-subtle px-3 py-1.5 rounded-xl border border-border-subtle">
                    <span className="font-bold text-text-main">Objetivo:</span> {sec.purpose}
                  </div>
                </div>

                {/* ESPECIFICACIÓN DETALLADA DE CAMPOS */}
                <div className="space-y-4 mb-6">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-text-muted">
                    Campos del Módulo y Especificación Técnica
                  </h4>

                  <div className="grid grid-cols-1 gap-4">
                    {sec.fields.map((f) => (
                      <div key={f.name} className="guide-spec-block p-4 sm:p-5 space-y-3">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm sm:text-base text-text-main">
                              {f.name}
                            </span>
                            {f.required ? (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                                Requerido
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium text-text-muted bg-card-bg px-2 py-0.5 rounded-md border border-border-subtle">
                                Opcional
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-mono text-text-muted bg-card-bg px-2.5 py-1 rounded-md border border-border-subtle">
                            {f.type}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-text-body leading-relaxed">
                          {f.description}
                        </p>

                        <div className="guide-callout-info text-xs p-3 rounded-xl flex items-start gap-2.5">
                          <span className="font-bold text-teal-text shrink-0">💡 Consejo Experto:</span>
                          <span>{f.tips}</span>
                        </div>

                        {/* PREVIEW DE EJEMPLO REAL CON BOTÓN DE COPIAR */}
                        <div className="pt-1">
                          <div className="flex items-center justify-between text-xs text-text-muted mb-1 font-semibold">
                            <span>Formato o contenido sugerido:</span>
                            <button
                              type="button"
                              onClick={() => handleCopyText(f.example, `${sec.id}-${f.name}`)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
                            >
                              {copiedKey === `${sec.id}-${f.name}` ? (
                                <>
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                  ¡Copiado!
                                </>
                              ) : (
                                <>
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                  </svg>
                                  Copiar ejemplo
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="guide-code-preview p-3.5 rounded-xl whitespace-pre-wrap overflow-x-auto">
                            {f.example}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CRITERIO DOCENTE Y RECOMENDACIONES */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
                  <div className="guide-callout-info p-4 rounded-xl text-xs space-y-1">
                    <div className="font-bold text-teal-text flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                      Impacto en la Simulación
                    </div>
                    <p className="text-text-body">{sec.pedagogicalImpact}</p>
                  </div>

                  <div className="guide-callout-success p-4 rounded-xl text-xs space-y-1">
                    <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Buena Práctica Médica
                    </div>
                    <p className="text-text-body">{sec.bestPractice}</p>
                  </div>

                  <div className="guide-callout-warning p-4 rounded-xl text-xs space-y-1">
                    <div className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                      Qué Evitar
                    </div>
                    <p className="text-text-body">{sec.avoid}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* VISTA 2: CASOS PEDIÁTRICOS REALES (3 PATOLOGÍAS CLAVE) */}
      {mainTab === "examples" && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="font-bold text-text-main text-sm">
                Casos Validados de Referencia Docente
              </h3>
              <p className="text-xs text-text-muted">
                Explore cómo se estructura un caso pediátrico completo según patología y pruébelo en el formulario con 1 solo clic.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {realCaseExamples.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => setSelectedExampleId(ex.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedExampleId === ex.id
                      ? "bg-primary text-primary-fg shadow-sm"
                      : "bg-card-bg text-text-muted border border-border-subtle hover:text-text-main"
                  }`}
                >
                  {ex.diagnosis.split("(")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* FICHA DEL CASO SELECCIONADO */}
          <div className="guide-example-card p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border-subtle flex-wrap">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {activeExample.specialty} • {activeExample.age}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-text-main mt-2">
                  {activeExample.diagnosis}
                </h3>
                <p className="text-xs sm:text-sm text-text-muted mt-1">{activeExample.tagline}</p>
              </div>

              <button
                type="button"
                onClick={() => handleApplyExample(activeExample.draft)}
                className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold text-primary-fg shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 shrink-0"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
                Cargar este caso en el Formulario
              </button>
            </div>

            {/* ESTRUCTURA CLÍNICA EN LAS 4 FASES */}
            <div className="space-y-5">
              {/* FASE 1: MOTIVO DE CONSULTA Y SEMIOLOGÍA */}
              <div className="p-5 rounded-2xl bg-surface-subtle border border-border-subtle space-y-4">
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-border-subtle flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-teal/15 text-teal text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-text-main">
                      Fase 1: Motivo de Consulta y Semiología
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-teal/10 text-teal border border-teal/20">
                    Apertura del Caso
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-card-bg border border-border-subtle">
                    <div className="text-[11px] font-bold uppercase text-text-muted mb-1">
                      Nombre / Título Académico
                    </div>
                    <div className="font-semibold text-sm text-text-main">
                      {activeExample.draft.title}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-card-bg border border-border-subtle">
                    <div className="text-[11px] font-bold uppercase text-text-muted mb-1">
                      Motivo de Consulta Inicial
                    </div>
                    <div className="font-semibold text-sm text-teal-text">
                      {activeExample.draft.consultationReason}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-card-bg border border-border-subtle space-y-2">
                  <div className="text-[11px] font-bold uppercase text-text-muted">
                    Historia Clínica y Anamnesis
                  </div>
                  <p className="text-xs leading-relaxed text-text-body">
                    {activeExample.draft.clinicalHistory}
                  </p>
                  {activeExample.draft.hasVideo && (
                    <div className="mt-2 pt-2 border-t border-border-subtle text-xs text-teal-text font-medium flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-teal/10 border border-teal/20 text-[10px] font-bold uppercase">
                        Video
                      </span>
                      <span>{activeExample.draft.videoDescription}</span>
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-card-bg border border-border-subtle">
                  <div className="text-[11px] font-bold uppercase text-text-muted mb-1.5">
                    Examen Físico y Nivel de Dolor
                  </div>
                  {activeExample.draft.isInteractiveExam ? (
                    <div className="text-xs space-y-1 text-text-body">
                      <div>
                        <strong>Modo:</strong> Interactivo 3D (Hotspot Anatómico)
                      </div>
                      <div>
                        <strong>Zona anatómica:</strong> {activeExample.draft.examZone}
                      </div>
                      <div>
                        <strong>Punto clave:</strong> {activeExample.draft.examRefPoint}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-text-body leading-relaxed">
                      {activeExample.draft.examStandardText}
                    </p>
                  )}
                  <div className="mt-2 pt-2 border-t border-border-subtle text-xs font-semibold text-rose-600 dark:text-rose-400">
                    Nivel de Dolor: {activeExample.draft.painLevel}
                  </div>
                </div>
              </div>

              {/* FASE 2: DIAGNÓSTICO */}
              <div className="p-5 rounded-2xl bg-surface-subtle border border-border-subtle space-y-4">
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-border-subtle flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-teal/15 text-teal text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-text-main">
                      Fase 2: Diagnóstico y Estudios Complementarios ({activeExample.draft.addedStudies?.length || 0})
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-teal/10 text-teal border border-teal/20">
                    Matriz Diagnóstica
                  </span>
                </div>

                <div className="space-y-2.5">
                  {activeExample.draft.addedStudies?.map((st, i) => (
                    <div
                      key={st.id || `${st.name}-${i}`}
                      className="p-3 rounded-xl bg-card-bg border border-border-subtle space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-xs sm:text-sm text-text-main">{st.name}</div>
                        <AdequacyBadge isAdequate={st.isAdequate} />
                      </div>
                      <div className="text-text-body text-xs leading-relaxed bg-surface-subtle/60 p-2.5 rounded-lg border border-border-subtle/50">
                        <span className="font-semibold text-text-muted text-[11px] uppercase mr-1">
                          Hallazgos:
                        </span>
                        {st.findings}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FASE 3: TRATAMIENTO */}
              <div className="p-5 rounded-2xl bg-surface-subtle border border-border-subtle space-y-4">
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-border-subtle flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-teal/15 text-teal text-xs font-bold flex items-center justify-center">
                      3
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-text-main">
                      Fase 3: Tratamiento y Conductas Terapéuticas ({activeExample.draft.structuredTreatments?.length || 0})
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-teal/10 text-teal border border-teal/20">
                    Conductas Estructuradas
                  </span>
                </div>

                <div className="space-y-2.5">
                  {activeExample.draft.structuredTreatments?.map((t, i) => (
                    <div
                      key={t.id || `treatment-${i}`}
                      className="p-3.5 rounded-xl bg-card-bg border border-border-subtle space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-surface text-text-muted text-[11px] font-bold flex items-center justify-center border border-border-subtle">
                            {t.order || i + 1}
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-text-main">
                            {t.description}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                            t.isCorrect
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                              : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30"
                          }`}
                        >
                          {t.isCorrect ? "✓ Conducta Correcta" : "✕ Conducta Incorrecta"}
                        </span>
                      </div>
                      {t.feedback && (
                        <div className="guide-callout-info text-xs p-2.5 rounded-lg flex items-start gap-2">
                          <span className="font-bold text-teal-text shrink-0">💡 Feedback Docente:</span>
                          <span className="text-text-body">{t.feedback}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* FASE 4: RESUMEN DEL CASO */}
              <div className="p-5 rounded-2xl bg-surface-subtle border border-border-subtle space-y-4">
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-border-subtle flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-teal/15 text-teal text-xs font-bold flex items-center justify-center">
                      4
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-text-main">
                      Fase 4: Resumen del Caso y Epílogo Teórico
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-teal/10 text-teal border border-teal/20">
                    Revisión y Base Docente
                  </span>
                </div>

                {activeExample.draft.clinicalSummary && (
                  <div className="p-3.5 rounded-xl bg-card-bg border border-border-subtle space-y-1">
                    <div className="text-[11px] font-bold uppercase text-text-muted">
                      Resumen Clínico y Discusión Docente
                    </div>
                    <p className="text-xs leading-relaxed text-text-body">
                      {activeExample.draft.clinicalSummary}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeExample.draft.epidemiology && (
                    <div className="p-3.5 rounded-xl bg-card-bg border border-border-subtle space-y-1">
                      <div className="text-[11px] font-bold uppercase text-text-muted">
                        Epidemiología y Factores de Riesgo
                      </div>
                      <p className="text-xs leading-relaxed text-text-body">
                        {activeExample.draft.epidemiology}
                      </p>
                    </div>
                  )}

                  {activeExample.draft.complications && (
                    <div className="p-3.5 rounded-xl bg-card-bg border border-border-subtle space-y-1">
                      <div className="text-[11px] font-bold uppercase text-text-muted">
                        Complicaciones Principales
                      </div>
                      <p className="text-xs leading-relaxed text-text-body">
                        {activeExample.draft.complications}
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-card-bg border border-border-subtle space-y-2">
                  <div className="text-[11px] font-bold uppercase text-text-muted">
                    Palabras Clave Indexadas ({activeExample.draft.selectedKeywords?.length || 0})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeExample.draft.selectedKeywords?.map((kw) => (
                      <span
                        key={kw}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-card-bg border border-border-subtle text-text-main"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="guide-callout-info p-4 rounded-2xl text-xs flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-base">🎯</span>
                <span className="text-text-body">
                  <strong>Eje Pedagógico:</strong> {activeExample.pedagogicalKey}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleApplyExample(activeExample.draft)}
                className="font-bold text-primary hover:underline cursor-pointer text-xs"
              >
                Probar este caso en el formulario &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIE DE LA GUÍA CON ACCIÓN FINAL */}
      <div className="p-6 rounded-3xl border border-card-border bg-card-bg text-center space-y-3 shadow-sm">
        <h3 className="text-lg font-bold text-text-main">
          ¿Preparado para registrar su caso clínico?
        </h3>
        <p className="text-xs sm:text-sm text-text-muted max-w-xl mx-auto">
          Aplique estos estándares en el formulario. Puede regresar a esta guía en cualquier momento desde la barra superior sin perder los datos que haya escrito.
        </p>
        <button
          type="button"
          onClick={onGoToForm}
          className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-primary-fg shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Comenzar Carga de Caso Clínico
        </button>
      </div>
    </div>
  );
}
