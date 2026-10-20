"use client";

import React, { useState, useCallback } from "react";
import { SavedCase } from "@/types/clinical";
import { ImageLightboxModal } from "@/components/common/ImageLightboxModal";
import { EditIcon, TrashIcon, ZoomInIcon, CheckIcon } from "@/components/common/Icons";
import { formatCaseDate } from "@/lib/case-transformers";

interface CaseDetailViewProps {
  caseData: SavedCase | null;
  isLoading?: boolean;
  onBackToList: () => void;
  onCopyNotice: (msg: string) => void;
  onEditCase?: (caseData: SavedCase) => void;
  onDeleteCase?: (id: string, title: string) => void;
}

export function CaseDetailView({
  caseData,
  isLoading = false,
  onBackToList,
  onCopyNotice,
  onEditCase,
  onDeleteCase,
}: CaseDetailViewProps) {
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

  const handleCopyJson = useCallback(() => {
    if (!caseData) return;
    navigator.clipboard.writeText(JSON.stringify(caseData, null, 2));
    onCopyNotice("JSON de Caso copiado al portapapeles");
  }, [caseData, onCopyNotice]);

  if (!caseData) {
    return (
      <div className="py-20 text-center animate-fadeIn">
        <div className="w-12 h-12 rounded-2xl bg-surface-subtle border border-border-subtle mx-auto mb-4 flex items-center justify-center text-text-muted">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-text-main mb-2">No hay caso seleccionado</h3>
        <p className="text-sm text-text-muted mb-6">Seleccione un caso de la lista para ver su ficha clínica detallada.</p>
        <button
          type="button"
          onClick={onBackToList}
          className="btn btn-teal px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
        >
          ← Volver al Listado de Casos
        </button>
      </div>
    );
  }

  const caseTitle = caseData.finalDiagnosis?.name || "Caso Clínico";

  const renderAdditionalFieldsForPhase = (phase: number) => {
    if (!caseData.additionalFields || !Array.isArray(caseData.additionalFields)) return null;
    const fields = caseData.additionalFields.filter((f) => f.phase === phase);
    if (fields.length === 0) return null;

    return (
      <div className="mt-4 pt-4 border-t border-border-subtle/80">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal block mb-2">
          Campos Adicionales ({fields.length}):
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {fields.map((f, idx) => (
            <div key={f.id || idx} className="p-3 rounded-xl bg-card-bg border border-border-subtle text-xs space-y-1">
              <strong className="text-text-main font-semibold block">{f.field?.name || "Campo adicional"}</strong>
              <p className="text-text-body whitespace-pre-wrap">{f.value}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="case-detail-view space-y-8 animate-fadeIn pb-16">
      {/* BARRA SUPERIOR DE ACCIONES Y REGRESO */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-border-subtle">
        <button
          type="button"
          onClick={onBackToList}
          className="btn border border-border-subtle hover:bg-surface-hover text-text-main text-xs sm:text-sm px-4 py-2 rounded-xl font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver a Casos Cargados
        </button>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleCopyJson}
            className="btn border border-border-subtle hover:bg-surface-subtle text-text-muted hover:text-text-main text-xs px-3 py-2 rounded-xl inline-flex items-center gap-1.5 font-semibold transition-colors cursor-pointer"
            title="Copiar JSON completo del caso"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
            Copiar JSON
          </button>

          {onEditCase && (
            <button
              type="button"
              onClick={() => onEditCase(caseData)}
              className="btn btn-teal text-xs px-4 py-2 rounded-xl inline-flex items-center gap-1.5 font-semibold shadow-xs cursor-pointer"
              title="Editar este caso en el formulario"
            >
              <EditIcon width={14} height={14} />
              Editar Caso
            </button>
          )}

          {onDeleteCase && (
            <button
              type="button"
              onClick={() => onDeleteCase(caseData.id, caseTitle)}
              className="btn border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 font-semibold transition-colors cursor-pointer"
              title="Eliminar caso clínico"
            >
              <TrashIcon width={14} height={14} />
              Eliminar
            </button>
          )}
        </div>
      </div>

      {/* TARJETA HERO DEL CASO */}
      <div className="hero-case-card p-6 sm:p-8 rounded-3xl bg-surface-subtle border border-border-subtle shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-card-bg text-teal-text border border-border-subtle">
            ID: {caseData.id}
          </span>
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-teal text-white uppercase tracking-wider">
            {caseData.status}
          </span>
          <span className="text-xs text-text-muted">
            Registrado el {formatCaseDate(caseData.createdAt, "locale")}
          </span>
          {isLoading && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-light text-teal-text animate-pulse">
              <span className="w-2 h-2 rounded-full bg-teal animate-ping inline-block" />
              Sincronizando detalles...
            </span>
          )}
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-main tracking-tight leading-tight">
            {caseTitle}
          </h1>
          {caseData.principalReason && (
            <div className="text-sm text-text-muted mt-2 flex items-center gap-2">
              <span className="font-bold text-text-main">Motivo Principal:</span>
              <span className="text-teal font-semibold px-2.5 py-0.5 rounded-full bg-teal/10 border border-teal/20">
                {caseData.principalReason.name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* BLOQUES CLÍNICOS ESTRUCTURADOS (LAS 8 FASES) */}
      <div className="space-y-6">
        {/* 1. MOTIVO DE CONSULTA */}
        <section className="p-6 rounded-2xl bg-card-bg border border-border-subtle space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-wider text-teal pb-3 border-b border-border-subtle">
            <span className="w-6 h-6 rounded-lg bg-teal text-white flex items-center justify-center font-bold text-xs">
              1
            </span>
            <span>Motivo de Consulta</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-surface-subtle border border-border-subtle space-y-1">
              <span className="text-xs font-bold text-text-muted block">
                Diagnóstico Final (Uso Interno):
              </span>
              <strong className="text-base text-text-main block">
                {caseData.finalDiagnosis?.name || "No especificado"}
              </strong>
            </div>

            <div className="p-4 rounded-xl bg-surface-subtle border border-border-subtle space-y-1">
              <span className="text-xs font-bold text-text-muted block">
                Motivo Principal de Consulta:
              </span>
              <strong className="text-base text-teal-text block">
                {caseData.principalReason?.name || "No asignado"}
              </strong>
            </div>
          </div>

          {caseData.altReasons && caseData.altReasons.length > 0 && (
            <div className="pt-2">
              <span className="text-xs font-bold text-text-muted block mb-2">
                Motivos Alternativos de Consulta ({caseData.altReasons.length}):
              </span>
              <div className="flex flex-wrap gap-2">
                {caseData.altReasons.map((ar, i) => (
                  <span
                    key={ar.item?.id || i}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-surface-subtle border border-border-subtle text-text-main"
                  >
                    {ar.item?.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 2. SIGNOS Y SÍNTOMAS */}
        <section className="p-6 rounded-2xl bg-card-bg border border-border-subtle space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-wider text-teal pb-3 border-b border-border-subtle">
            <span className="w-6 h-6 rounded-lg bg-teal text-white flex items-center justify-center font-bold text-xs">
              2
            </span>
            <span>Signos y Síntomas</span>
          </div>

          <div className="p-4 rounded-xl bg-surface-subtle border border-border-subtle space-y-2">
            <span className="text-xs font-bold text-text-muted block">
              Historia de la Enfermedad Actual y Signos Clave:
            </span>
            <p className="text-sm text-text-main leading-relaxed whitespace-pre-wrap">
              {caseData.signsSymptomsText || "Sin anamnesis detallada registrada."}
            </p>
          </div>

          {/* RECURSO AUDIOVISUAL / VIDEO */}
          <div className="p-4 rounded-xl bg-surface-subtle border border-border-subtle space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-text-muted block">
                Recurso Audiovisual / Video del Caso:
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  caseData.hasVideo
                    ? "bg-teal-light text-teal border border-teal-border"
                    : "bg-surface text-text-muted border border-border-subtle"
                }`}
              >
                {caseData.hasVideo ? "✓ Video Requerido" : "No requiere video"}
              </span>
            </div>

            {caseData.hasVideo && (
              <div className="pt-2 text-xs">
                {caseData.videoUrl && !caseData.videoUrl.startsWith("Sin preferencia") ? (
                  <div className="p-3 rounded-lg bg-card-bg border border-teal-border/40 space-y-1">
                    <span className="font-bold text-teal block">
                      Preferencias e Indicaciones para Generación de Video:
                    </span>
                    <p className="text-text-main leading-relaxed whitespace-pre-wrap">
                      {caseData.videoUrl}
                    </p>
                  </div>
                ) : (
                  <p className="text-text-muted italic">
                    Sin preferencia específica configurada (generación automática acorde a la historia y signos clínicos).
                  </p>
                )}
              </div>
            )}
          </div>

          {renderAdditionalFieldsForPhase(2)}
        </section>

        {/* 3. EXAMEN FÍSICO */}
        <section className="p-6 rounded-2xl bg-card-bg border border-border-subtle space-y-4 shadow-xs">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-border-subtle flex-wrap">
            <div className="flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-wider text-teal">
              <span className="w-6 h-6 rounded-lg bg-teal text-white flex items-center justify-center font-bold text-xs">
                3
              </span>
              <span>Examen Físico</span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface-subtle border border-border-subtle text-text-muted">
              Modalidad: {caseData.examModality === "interactive" ? "Puntos 3D Interactivos" : "Relato Narrativo"}
            </span>
          </div>

          {caseData.examModality === "narrative" ? (
            <div className="p-4 rounded-xl bg-surface-subtle border border-border-subtle">
              <p className="text-sm text-text-main leading-relaxed whitespace-pre-wrap">
                {caseData.physicalExamNarrative || "Sin relato narrativo cargado."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {caseData.examFindings && caseData.examFindings.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-border-subtle">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-surface-subtle border-b border-border-subtle text-text-muted font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Punto Anatómico</th>
                        <th className="py-2.5 px-3">Hallazgo Clínico</th>
                        <th className="py-2.5 px-3">Nivel de Respuesta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle/50">
                      {caseData.examFindings.map((f, i) => (
                        <tr key={f.id || i} className="hover:bg-surface-subtle/50">
                          <td className="py-2.5 px-3 font-semibold text-text-main">
                            {f.puntoAnatomico?.name || "Sin punto"}
                          </td>
                          <td className="py-2.5 px-3 text-text-main">{f.hallazgo}</td>
                          <td className="py-2.5 px-3 text-teal-text font-semibold">
                            {f.nivelRespuesta?.name || "Normal"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-text-muted italic">
                  No se registraron puntos anatómicos interactivos.
                </div>
              )}
            </div>
          )}

          {renderAdditionalFieldsForPhase(3)}
        </section>

        {/* 4. ESTUDIOS COMPLEMENTARIOS */}
        <section className="p-6 rounded-2xl bg-card-bg border border-border-subtle space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-wider text-teal pb-3 border-b border-border-subtle">
            <span className="w-6 h-6 rounded-lg bg-teal text-white flex items-center justify-center font-bold text-xs">
              4
            </span>
            <span>Estudios Complementarios ({caseData.studies?.length || 0})</span>
          </div>

          {caseData.studies && caseData.studies.length > 0 ? (
            <div className="space-y-3">
              {caseData.studies.map((s, i) => (
                <div
                  key={s.id || i}
                  className="p-4 rounded-xl bg-surface-subtle border border-border-subtle space-y-3"
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <strong className="text-sm font-bold text-text-main">
                      {s.studyType?.name}
                    </strong>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        s.performed
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                          : "bg-surface border border-border-subtle text-text-muted"
                      }`}
                    >
                      {s.performed ? "✓ Realizado" : "No Realizado"}
                    </span>
                  </div>

                  {s.performed && s.findingsText && (
                    <div className="text-xs text-text-body pl-2 border-l-2 border-teal space-y-1">
                      <span className="font-bold text-text-main block">Hallazgos Informados:</span>
                      <p className="whitespace-pre-wrap leading-relaxed">{s.findingsText}</p>
                    </div>
                  )}

                  {s.images && s.images.length > 0 && (
                    <div className="pt-2">
                      <span className="text-xs font-bold text-text-muted block mb-2">
                        Imágenes Diagnósticas Asociadas ({s.images.length}):
                      </span>
                      <div className="flex flex-wrap gap-3">
                        {s.images.map((img, imgIdx) => (
                          <div
                            key={img.id || imgIdx}
                            onClick={() =>
                              setLightboxImage({
                                url: img.url,
                                title: img.description || `${s.studyType?.name || "Estudio"} - Imagen ${imgIdx + 1}`,
                              })
                            }
                            className="group relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-border-subtle bg-surface cursor-pointer shadow-xs transition-transform hover:scale-105"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img.url}
                              alt={img.description || "Imagen del estudio"}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <ZoomInIcon width={20} height={20} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-text-muted italic">
              No hay estudios complementarios registrados.
            </div>
          )}
        </section>

        {/* 5. DIAGNÓSTICO DIFERENCIAL */}
        <section className="p-6 rounded-2xl bg-card-bg border border-border-subtle space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-wider text-teal pb-3 border-b border-border-subtle">
            <span className="w-6 h-6 rounded-lg bg-teal text-white flex items-center justify-center font-bold text-xs">
              5
            </span>
            <span>Diagnóstico Diferencial ({caseData.diagnoses?.length || 0})</span>
          </div>

          {caseData.diagnoses && caseData.diagnoses.length > 0 ? (
            <div className="space-y-2.5">
              {caseData.diagnoses.map((d, i) => (
                <div
                  key={d.itemId || i}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                    d.isCorrect
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-bold"
                      : "bg-surface-subtle border-border-subtle text-text-main"
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-xs">
                    <span className="w-6 h-6 rounded-full bg-surface border border-border-subtle flex items-center justify-center font-bold text-[11px] shrink-0 text-text-muted">
                      {d.order || i + 1}
                    </span>
                    <span className="text-sm font-semibold">{d.item?.name}</span>
                  </div>

                  {d.isCorrect && (
                    <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                      <CheckIcon width={13} height={13} strokeWidth={3} />
                      CORRECTO
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-text-muted italic">
              Sin diagnósticos diferenciales registrados.
            </div>
          )}
        </section>

        {/* 6. TRATAMIENTO Y RESOLUCIÓN QUIRÚRGICA */}
        <section className="p-6 rounded-2xl bg-card-bg border border-border-subtle space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-wider text-teal pb-3 border-b border-border-subtle">
            <span className="w-6 h-6 rounded-lg bg-teal text-white flex items-center justify-center font-bold text-xs">
              6
            </span>
            <span>Tratamiento y Resolución Quirúrgica</span>
          </div>

          {caseData.medicalTreatmentText && (
            <div className="p-4 rounded-xl bg-surface-subtle border border-border-subtle space-y-1">
              <span className="text-xs font-bold text-text-muted block">
                Tratamiento Médico General:
              </span>
              <p className="text-sm text-text-main leading-relaxed whitespace-pre-wrap">
                {caseData.medicalTreatmentText}
              </p>
            </div>
          )}

          <div className="p-4 rounded-xl bg-surface-subtle border border-border-subtle space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-text-muted">Conducta Quirúrgica:</span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  caseData.includesSurgery
                    ? "bg-teal-light text-teal border border-teal-border"
                    : "bg-surface border border-border-subtle text-text-muted"
                }`}
              >
                {caseData.includesSurgery ? "✓ Requiere Cirugía" : "Tratamiento no quirúrgico"}
              </span>
            </div>

            {caseData.includesSurgery && (
              <div className="space-y-3 pt-2 text-xs">
                {caseData.surgicalTechnique && (
                  <div>
                    <span className="font-bold text-text-muted block">Técnica Quirúrgica:</span>
                    <strong className="text-sm text-teal-text block mt-0.5">
                      {caseData.surgicalTechnique.name}
                    </strong>
                  </div>
                )}

                {caseData.surgicalNote && (
                  <div>
                    <span className="font-bold text-text-muted block">Nota Quirúrgica:</span>
                    <p className="text-text-main mt-0.5 whitespace-pre-wrap">{caseData.surgicalNote}</p>
                  </div>
                )}

                {(caseData.openApproach || caseData.minimInvasiveApproach) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {caseData.openApproach && (
                      <div className="p-3 rounded-lg bg-card-bg border border-border-subtle">
                        <span className="font-bold text-text-main block mb-1">Abordaje Abierto:</span>
                        <p className="text-text-body">{caseData.openApproach}</p>
                      </div>
                    )}
                    {caseData.minimInvasiveApproach && (
                      <div className="p-3 rounded-lg bg-card-bg border border-border-subtle">
                        <span className="font-bold text-text-main block mb-1">Mínimamente Invasivo:</span>
                        <p className="text-text-body">{caseData.minimInvasiveApproach}</p>
                      </div>
                    )}
                  </div>
                )}

                {caseData.surgicalSteps && caseData.surgicalSteps.length > 0 && (
                  <div className="pt-2">
                    <span className="font-bold text-text-muted block mb-2">
                      Pasos Técnicos Quirúrgicos ({caseData.surgicalSteps.length}):
                    </span>
                    <div className="space-y-1.5">
                      {caseData.surgicalSteps.map((step, idx) => (
                        <div
                          key={step.id || idx}
                          className="p-2.5 rounded-lg bg-card-bg border border-border-subtle flex items-start gap-2.5"
                        >
                          <span className="w-5 h-5 rounded-full bg-teal text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                            {step.order || idx + 1}
                          </span>
                          <span className="text-text-main">{step.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* 7. COMPLICACIONES */}
        <section className="p-6 rounded-2xl bg-card-bg border border-border-subtle space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-wider text-teal pb-3 border-b border-border-subtle">
            <span className="w-6 h-6 rounded-lg bg-teal text-white flex items-center justify-center font-bold text-xs">
              7
            </span>
            <span>Complicaciones Posibles y Riesgos ({caseData.complications?.length || 0})</span>
          </div>

          {caseData.complicationsIntroText && (
            <p className="text-xs text-text-muted leading-relaxed whitespace-pre-wrap">
              {caseData.complicationsIntroText}
            </p>
          )}

          {caseData.complications && caseData.complications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {caseData.complications.map((c, i) => (
                <div
                  key={c.itemId || i}
                  className="p-3.5 rounded-xl bg-surface-subtle border border-border-subtle text-xs space-y-1.5"
                >
                  <strong className="text-sm font-bold text-rose-600 dark:text-rose-400 block">
                    {c.item?.name}
                  </strong>
                  {c.note && (
                    <p className="text-text-body leading-relaxed">{c.note}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-text-muted italic">
              No se detallaron complicaciones específicas.
            </div>
          )}
        </section>

        {/* 8. RESUMEN Y EPÍLOGO */}
        <section className="p-6 rounded-2xl bg-card-bg border border-border-subtle space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-wider text-teal pb-3 border-b border-border-subtle">
            <span className="w-6 h-6 rounded-lg bg-teal text-white flex items-center justify-center font-bold text-xs">
              8
            </span>
            <span>Resumen del Caso y Conclusiones Docentes</span>
          </div>

          <div className="p-4 rounded-xl bg-surface-subtle border border-border-subtle">
            <p className="text-sm text-text-main leading-relaxed whitespace-pre-wrap">
              {caseData.summary || "Sin resumen clínico final redactado."}
            </p>
          </div>
        </section>
      </div>

      {/* FOOTER DE NAVEGACIÓN */}
      <div className="pt-6 border-t border-border-subtle flex items-center justify-between gap-3 flex-wrap">
        <button
          type="button"
          onClick={onBackToList}
          className="btn border border-border-subtle hover:bg-surface-hover text-text-main text-xs sm:text-sm px-5 py-2.5 rounded-xl font-semibold inline-flex items-center gap-2 cursor-pointer transition-colors"
        >
          ← Volver al Listado de Casos
        </button>

        {onEditCase && (
          <button
            type="button"
            onClick={() => onEditCase(caseData)}
            className="btn btn-teal text-xs sm:text-sm px-6 py-2.5 rounded-xl font-bold cursor-pointer shadow-md inline-flex items-center gap-2"
          >
            <EditIcon width={15} height={15} />
            Editar este Caso en el Formulario
          </button>
        )}
      </div>

      {/* LIGHTBOX DE IMÁGENES */}
      {lightboxImage && (
        <ImageLightboxModal
          imageUrl={lightboxImage.url}
          title={lightboxImage.title}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </div>
  );
}
