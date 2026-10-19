"use client";

import React, { useEffect, useCallback, useState } from "react";
import { SavedCase } from "@/types/clinical";
import { ImageLightboxModal } from "@/components/common/ImageLightboxModal";
import { CloseIcon, EditIcon, TrashIcon, ZoomInIcon } from "@/components/common/Icons";
import { formatCaseDate } from "@/lib/case-transformers";

interface CaseDetailModalProps {
  caseData: SavedCase | null;
  isLoading: boolean;
  onClose: () => void;
  onCopyNotice: (msg: string) => void;
  onEditCase?: (caseData: SavedCase) => void;
  onDeleteCase?: (id: string, title: string) => void;
}

export function CaseDetailModal({
  caseData,
  isLoading = false,
  onClose,
  onCopyNotice,
  onEditCase,
  onDeleteCase,
}: CaseDetailModalProps) {
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

  // Manejo de la tecla Escape para cerrar el modal
  useEffect(() => {
    if (!caseData) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !lightboxImage) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [caseData, onClose, lightboxImage]);

  const handleCopyJson = useCallback(() => {
    if (!caseData) return;
    navigator.clipboard.writeText(JSON.stringify(caseData, null, 2));
    onCopyNotice("JSON de Caso copiado al portapapeles");
  }, [caseData, onCopyNotice]);

  const caseTitle = caseData?.finalDiagnosis?.name || "Caso Clínico";

  const renderEditButton = () => {
    if (!onEditCase || !caseData) return null;
    return (
      <button
        type="button"
        className="btn btn-teal text-xs px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 cursor-pointer font-semibold shadow-sm"
        onClick={() => {
          onEditCase(caseData);
          onClose();
        }}
        title="Editar este caso clínico en el formulario"
      >
        <EditIcon width={14} height={14} />
        Editar Caso
      </button>
    );
  };

  const renderDeleteButton = () => {
    if (!onDeleteCase || !caseData) return null;
    return (
      <button
        type="button"
        className="btn border border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 cursor-pointer font-semibold shadow-sm transition-colors"
        onClick={() => {
          onDeleteCase(caseData.id, caseTitle);
        }}
        title="Eliminar este caso clínico"
      >
        <TrashIcon width={14} height={14} />
        Eliminar Caso
      </button>
    );
  };

  const renderAdditionalFieldsForPhase = (phase: number) => {
    if (!caseData?.additionalFields || !Array.isArray(caseData.additionalFields)) return null;
    const fields = caseData.additionalFields.filter((f) => f.phase === phase);
    if (fields.length === 0) return null;

    return (
      <div className="mt-3 pt-3 border-t border-border-subtle/60">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal block mb-2">
          Campos Adicionales ({fields.length}):
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {fields.map((f, idx) => (
            <div key={f.id || idx} className="p-2.5 rounded-xl bg-card-bg border border-border-subtle text-xs space-y-1">
              <strong className="text-text-main font-semibold block">{f.field?.name || "Campo adicional"}</strong>
              <p className="text-text-body whitespace-pre-wrap">{f.value}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!caseData) return null;

  return (
    <>
      <div
        className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/60 overflow-y-auto animate-fadeIn"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-case-title"
      >
        <div className="modal-container w-full max-w-4xl bg-surface rounded-2xl shadow-2xl border border-border-subtle overflow-hidden my-8 max-h-[90vh] flex flex-col">
          {/* ENCABEZADO DEL MODAL */}
          <div className="modal-header-bar p-5 border-b border-border-subtle flex items-start justify-between gap-4 bg-surface-subtle shrink-0">
            <div>
              <div className="modal-badge-row flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-surface text-teal-text border border-border-subtle">
                  ID: {caseData.id}
                </span>
                <span className="text-xs font-semibold text-text-muted">
                  Registrado el {formatCaseDate(caseData.createdAt, "locale")}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-light text-teal uppercase">
                  {caseData.status}
                </span>
                {isLoading && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-light text-teal-text animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-teal animate-ping inline-block" />
                    Sincronizando detalles...
                  </span>
                )}
              </div>
              <h3 id="modal-case-title" className="modal-case-title text-xl font-extrabold text-text-main leading-snug">
                {caseTitle}
              </h3>
              {caseData.principalReason && (
                <div className="text-xs text-text-muted mt-1.5 flex items-center gap-1.5">
                  <span className="font-bold text-text-main">Motivo Principal:</span>
                  <span className="text-teal-text font-semibold">{caseData.principalReason.name}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {renderEditButton()}
              {renderDeleteButton()}
              <button
                type="button"
                className="modal-close-btn w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-surface-hover text-text-muted"
                onClick={onClose}
                aria-label="Cerrar ficha"
              >
                <CloseIcon width={18} height={18} />
              </button>
            </div>
          </div>

          {/* CUERPO DE LA FICHA EN LAS 8 FASES CLÍNICAS */}
          <div className="modal-content-body p-6 flex flex-col gap-6 overflow-y-auto">
            {/* FASE 1: MOTIVO DE CONSULTA */}
            <div className="modal-clinical-block p-4 rounded-2xl border border-border-subtle bg-surface-subtle flex flex-col gap-3">
              <div className="modal-block-header text-xs font-extrabold uppercase tracking-wider text-teal flex items-center gap-2">
                <span>Fase 1: Motivo de Consulta</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-card-bg border border-border-subtle">
                  <span className="text-xs font-bold text-text-muted block mb-1">
                    Diagnóstico Final (Uso Interno):
                  </span>
                  <strong className="text-sm text-text-main">
                    {caseData.finalDiagnosis?.name || "No especificado"}
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-card-bg border border-border-subtle">
                  <span className="text-xs font-bold text-text-muted block mb-1">
                    Motivo Principal de Consulta:
                  </span>
                  <strong className="text-sm text-text-main">
                    {caseData.principalReason?.name || "No especificado"}
                  </strong>
                </div>
              </div>

              {caseData.altReasons && caseData.altReasons.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-text-muted block mb-1.5">
                    Motivos Alternativos:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {caseData.altReasons.map((ar, i) => (
                      <span
                        key={ar.itemId || i}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-surface border border-border-subtle text-text-main"
                      >
                        {ar.item?.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* FASE 2: SIGNOS Y SÍNTOMAS */}
            <div className="modal-clinical-block p-4 rounded-2xl border border-border-subtle bg-surface-subtle flex flex-col gap-3">
              <div className="modal-block-header text-xs font-extrabold uppercase tracking-wider text-teal flex items-center gap-2">
                <span>Fase 2: Signos, Síntomas y Anamnesis</span>
              </div>

              <div>
                <span className="text-xs font-bold text-text-muted block mb-1">
                  Historia de la Enfermedad Actual y Signos Clave:
                </span>
                <p className="modal-history-text text-sm leading-relaxed text-text-main whitespace-pre-wrap bg-card-bg p-3 rounded-xl border border-border-subtle">
                  {caseData.signsSymptomsText || "Sin anamnesis registrada"}
                </p>
              </div>

              {caseData.hasVideo && (
                <div className="p-3 rounded-xl bg-teal-light text-text-main text-xs flex items-center gap-2 border border-teal-border">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-teal shrink-0">
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                  <div>
                    <strong className="text-text-main">Recurso Audiovisual para el Simulador:</strong>{" "}
                    {caseData.videoUrl ? (
                      <a href={caseData.videoUrl} target="_blank" rel="noopener noreferrer" className="text-teal font-semibold underline ml-1">
                        {caseData.videoUrl}
                      </a>
                    ) : (
                      <span>Video activo sin enlace especificado</span>
                    )}
                  </div>
                </div>
              )}

              {renderAdditionalFieldsForPhase(2)}
            </div>

            {/* FASE 3: EXAMEN FÍSICO */}
            <div className="modal-clinical-block p-4 rounded-2xl border border-border-subtle bg-surface-subtle flex flex-col gap-3">
              <div className="modal-block-header text-xs font-extrabold uppercase tracking-wider text-teal flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>Fase 3: Examen Físico</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-light text-teal-text">
                  Modalidad: {caseData.examModality === "interactive" ? "Interactivo (Puntos 3D)" : "Narrativo"}
                </span>
              </div>

              {caseData.examModality === "narrative" ? (
                <div>
                  <span className="text-xs font-bold text-text-muted block mb-1">Relato del Examen Físico:</span>
                  <p className="text-sm leading-relaxed text-text-main bg-card-bg p-3 rounded-xl border border-border-subtle whitespace-pre-wrap">
                    {caseData.physicalExamNarrative || "Sin relato cargado"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-text-muted block">Hallazgos por Punto Anatómico:</span>
                  {(!caseData.examFindings || caseData.examFindings.length === 0) ? (
                    <p className="text-xs text-text-muted italic bg-card-bg p-3 rounded-xl border border-border-subtle">
                      No se registraron hallazgos específicos.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {caseData.examFindings.map((f, i) => (
                        <div key={f.id || i} className="p-3 rounded-xl bg-card-bg border border-border-subtle text-xs space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <strong className="text-text-main font-bold">
                              {f.puntoAnatomico?.name || `Punto #${i + 1}`}
                            </strong>
                            {f.nivelRespuesta && (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                {f.nivelRespuesta.name}
                              </span>
                            )}
                          </div>
                          <p className="text-text-body">{f.hallazgo}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {renderAdditionalFieldsForPhase(3)}
            </div>

            {/* FASE 4: ESTUDIOS COMPLEMENTARIOS */}
            <div className="modal-clinical-block p-4 rounded-2xl border border-border-subtle bg-surface-subtle flex flex-col gap-3">
              <div className="modal-block-header text-xs font-extrabold uppercase tracking-wider text-teal flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>Fase 4: Estudios Complementarios ({caseData.studies?.length || 0})</span>
                </div>
              </div>

              {(!caseData.studies || caseData.studies.length === 0) ? (
                <div className="text-xs text-text-muted italic p-3 bg-card-bg rounded-xl border border-border-subtle">
                  No se registraron estudios complementarios para este caso.
                </div>
              ) : (
                <div className="space-y-3">
                  {caseData.studies.map((s, i) => (
                    <div key={s.id || i} className="study-item-card p-3.5 rounded-xl border border-border-subtle bg-card-bg">
                      <div className="study-header-line flex items-center justify-between gap-3 mb-1.5 flex-wrap">
                        <strong className="text-text-main text-sm font-bold">
                          {s.studyType?.name || `Estudio #${i + 1}`}
                        </strong>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          s.performed
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : "bg-surface text-text-muted border border-border-subtle"
                        }`}>
                          {s.performed ? "✓ Realizado" : "No Realizado"}
                        </span>
                      </div>
                      <div className="text-xs text-text-body mb-2 leading-relaxed">
                        <span className="font-bold text-text-main">Hallazgos: </span>
                        <span>{s.findingsText || "Sin hallazgos especificados"}</span>
                      </div>
                      {s.images && s.images.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {s.images.map((img) => (
                            <div
                              key={img.id}
                              onClick={() => setLightboxImage({ url: img.url, title: img.description || s.studyType?.name || "Estudio" })}
                              className="relative group cursor-pointer overflow-hidden rounded-xl border border-border-subtle bg-black/60 max-w-[200px]"
                              title="Clic para ampliar"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={img.url}
                                alt={img.description || "Estudio"}
                                className="h-28 w-full object-cover transition-transform group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold gap-1">
                                <ZoomInIcon width={14} height={14} /> Ampliar
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FASE 5: DIAGNÓSTICO DIFERENCIAL */}
            <div className="modal-clinical-block p-4 rounded-2xl border border-border-subtle bg-surface-subtle flex flex-col gap-3">
              <div className="modal-block-header text-xs font-extrabold uppercase tracking-wider text-teal flex items-center gap-2">
                <span>Fase 5: Diagnóstico Diferencial ({caseData.diagnoses?.length || 0} Opciones)</span>
              </div>

              {(!caseData.diagnoses || caseData.diagnoses.length === 0) ? (
                <div className="text-xs text-text-muted italic p-3 bg-card-bg rounded-xl border border-border-subtle">
                  No se registraron diagnósticos diferenciales.
                </div>
              ) : (
                <div className="space-y-2">
                  {caseData.diagnoses.map((d, i) => (
                    <div
                      key={d.itemId || i}
                      className={`flex items-center justify-between p-3 rounded-xl border ${
                        d.isCorrect
                          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100"
                          : "border-border-subtle bg-card-bg text-text-main"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          d.isCorrect ? "bg-emerald-600 text-white" : "bg-surface border border-border-subtle text-text-muted"
                        }`}>
                          {d.order || i + 1}
                        </span>
                        <strong className="text-sm font-semibold">{d.item?.name}</strong>
                      </div>
                      {d.isCorrect && (
                        <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                          Diagnóstico Correcto
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FASE 6: TRATAMIENTO Y CIRUGÍA */}
            <div className="modal-clinical-block p-4 rounded-2xl border border-border-subtle bg-surface-subtle flex flex-col gap-3">
              <div className="modal-block-header text-xs font-extrabold uppercase tracking-wider text-teal flex items-center gap-2">
                <span>Fase 6: Tratamiento y Resolución</span>
              </div>

              {caseData.medicalTreatmentText && (
                <div className="p-3 rounded-xl bg-card-bg border border-border-subtle">
                  <span className="text-xs font-bold text-text-muted block mb-1">
                    Tratamiento Médico / Indicaciones Generales:
                  </span>
                  <p className="text-sm text-text-main leading-relaxed whitespace-pre-wrap">
                    {caseData.medicalTreatmentText}
                  </p>
                </div>
              )}

              {caseData.includesSurgery && (
                <div className="p-4 rounded-xl bg-card-bg border border-teal-border/50 space-y-3">
                  <div className="flex items-center gap-2 text-teal font-extrabold text-xs uppercase tracking-wider">
                    <span>Resolución Quirúrgica</span>
                  </div>

                  {caseData.surgicalTechnique && (
                    <div>
                      <span className="text-xs font-bold text-text-muted block mb-0.5">Técnica Quirúrgica:</span>
                      <strong className="text-sm text-text-main">{caseData.surgicalTechnique.name}</strong>
                      {caseData.surgicalNote && (
                        <p className="text-xs text-text-body mt-1 italic">{caseData.surgicalNote}</p>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {caseData.openApproach && (
                      <div className="p-2.5 rounded-lg bg-surface border border-border-subtle text-xs">
                        <span className="font-bold text-text-muted block">Abordaje Abierto:</span>
                        <p className="text-text-main mt-0.5">{caseData.openApproach}</p>
                      </div>
                    )}
                    {caseData.minimInvasiveApproach && (
                      <div className="p-2.5 rounded-lg bg-surface border border-border-subtle text-xs">
                        <span className="font-bold text-text-muted block">Abordaje Mini-invasivo:</span>
                        <p className="text-text-main mt-0.5">{caseData.minimInvasiveApproach}</p>
                      </div>
                    )}
                  </div>

                  {caseData.surgicalSteps && caseData.surgicalSteps.length > 0 && (
                    <div className="pt-2">
                      <span className="text-xs font-bold text-text-muted block mb-2">Principios Técnicos y Pasos:</span>
                      <ol className="space-y-1.5 list-decimal list-inside text-xs text-text-body">
                        {caseData.surgicalSteps.map((step, idx) => (
                          <li key={step.id || idx} className="p-2 rounded-lg bg-surface border border-border-subtle">
                            <span className="font-semibold text-text-main">{step.text}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* FASE 7: COMPLICACIONES */}
            <div className="modal-clinical-block p-4 rounded-2xl border border-border-subtle bg-surface-subtle flex flex-col gap-3">
              <div className="modal-block-header text-xs font-extrabold uppercase tracking-wider text-teal flex items-center gap-2">
                <span>Fase 7: Complicaciones Posibles</span>
              </div>

              {caseData.complicationsIntroText && (
                <p className="text-xs sm:text-sm text-text-main leading-relaxed bg-card-bg p-3 rounded-xl border border-border-subtle whitespace-pre-wrap">
                  {caseData.complicationsIntroText}
                </p>
              )}

              {caseData.complications && caseData.complications.length > 0 && (
                <div className="space-y-2">
                  {caseData.complications.map((comp, idx) => (
                    <div key={comp.itemId || idx} className="p-3 rounded-xl bg-card-bg border border-border-subtle text-xs space-y-1">
                      <strong className="text-sm font-semibold text-text-main block">
                        {comp.item?.name || "Complicación"}
                      </strong>
                      {comp.note && (
                        <p className="text-text-body leading-relaxed">{comp.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FASE 8: RESUMEN Y DISCUSIÓN */}
            <div className="modal-clinical-block p-4 rounded-2xl border border-border-subtle bg-surface-subtle flex flex-col gap-3">
              <div className="modal-block-header text-xs font-extrabold uppercase tracking-wider text-teal flex items-center gap-2">
                <span>Fase 8: Resumen del Caso y Conclusiones</span>
              </div>

              <div className="bg-card-bg p-3.5 rounded-xl border border-border-subtle text-xs sm:text-sm text-text-main leading-relaxed whitespace-pre-wrap">
                {caseData.summary || "Sin resumen clínico registrado"}
              </div>

              {renderAdditionalFieldsForPhase(8)}
            </div>
          </div>

          {/* PIE DEL MODAL */}
          <div className="modal-footer-bar p-4 border-t flex items-center justify-between gap-3 bg-surface-subtle rounded-b-2xl flex-wrap">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn border border-border-subtle text-text-main hover:bg-surface-hover text-xs px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 cursor-pointer font-semibold shadow-xs transition-colors"
                onClick={handleCopyJson}
                title="Copiar estructura de datos completa en JSON"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
                Copiar JSON
              </button>
            </div>

            <button
              type="button"
              className="btn btn-teal text-xs px-4 py-2 rounded-xl font-semibold cursor-pointer shadow-sm"
              onClick={onClose}
            >
              Cerrar Ficha
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox para imágenes médicas */}
      {lightboxImage && (
        <ImageLightboxModal
          isOpen={Boolean(lightboxImage)}
          imageUrl={lightboxImage.url}
          title={lightboxImage.title}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </>
  );
}
