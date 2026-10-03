"use client";

import React, { useEffect, useCallback, useState } from "react";
import { SavedCase } from "@/types/clinical";
import { ImageLightboxModal } from "@/components/common/ImageLightboxModal";
import { AdequacyBadge } from "@/components/common/AdequacyBadge";
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
          onDeleteCase(caseData.id, caseData.title);
        }}
        title="Eliminar este caso clínico"
      >
        <TrashIcon width={14} height={14} />
        Eliminar Caso
      </button>
    );
  };

  if (!caseData) return null;

  return (
    <>
      <div
        className="modal-overlay fixed inset-0 flex items-center justify-center p-4 z-50 animate-fadeIn"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-case-title"
      >
        <div
          className="modal-dialog rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ENCABEZADO DEL MODAL */}
          <div className="modal-header-bar p-5 border-b sticky top-0 backdrop-blur-md flex items-start justify-between gap-4 z-10">
            <div className="modal-title-box flex-1">
              <div className="modal-badge-row flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-surface-subtle text-teal-text">
                  ID: {caseData.id}
                </span>
                <span className="text-xs font-semibold text-text-muted">
                  Registrado el {formatCaseDate(caseData.createdAt, "locale")}
                </span>
                {isLoading && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-light text-teal-text animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-teal animate-ping inline-block" />
                    Sincronizando detalles...
                  </span>
                )}
              </div>
              <h3 id="modal-case-title" className="modal-case-title text-xl font-extrabold text-text-main leading-snug">
                {caseData.title}
              </h3>
              {caseData.consultationReason && (
                <div className="text-xs text-text-muted mt-1.5 flex items-center gap-1.5">
                  <span className="font-bold text-text-main">Motivo de Consulta:</span>
                  <span>{caseData.consultationReason}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {renderEditButton()}
              {renderDeleteButton()}
              <button
                type="button"
                className="modal-close-btn w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                onClick={onClose}
                aria-label="Cerrar ficha"
              >
                <CloseIcon width={18} height={18} />
              </button>
            </div>
          </div>

          {/* CUERPO DE LA FICHA EN LAS 4 FASES CLÍNICAS */}
          <div className="modal-content-body p-6 flex flex-col gap-6">
            {/* FASE 1: PRESENTACIÓN Y SEMIOLOGÍA */}
            <div className="modal-clinical-block p-4 rounded-2xl border border-border-subtle bg-surface-subtle flex flex-col gap-3">
              <div className="modal-block-header text-xs font-extrabold uppercase tracking-wider text-teal flex items-center gap-2">
                <span>🩺</span>
                <span>Fase 1: Motivo de Consulta</span>
              </div>

              <div>
                <span className="text-xs font-bold text-text-muted block mb-1">
                  Historia de la Enfermedad Actual y Signos Clave:
                </span>
                <p className="modal-history-text text-sm leading-relaxed text-text-main whitespace-pre-wrap bg-card-bg p-3 rounded-xl border border-border-subtle">
                  {caseData.clinicalHistory}
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
                    <span>{caseData.videoDescription || "Video clínico configurado"}</span>
                  </div>
                </div>
              )}

              {/* EXAMEN FÍSICO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border-subtle/60">
                <div>
                  <span className="text-xs text-text-muted block">Modalidad de Exploración:</span>
                  <strong className="text-text-main text-xs sm:text-sm">
                    {caseData.isPhysicalExamInteractive ? "Interactivo (Puntos Anatómicos 3D)" : "Estándar (Narrativo)"}
                  </strong>
                </div>

                {caseData.physicalExamZone && (
                  <div>
                    <span className="text-xs text-text-muted block">Zona Anatómica:</span>
                    <strong className="text-text-main text-xs sm:text-sm">{caseData.physicalExamZone}</strong>
                  </div>
                )}

                {caseData.physicalExamRefPoint && (
                  <div>
                    <span className="text-xs text-text-muted block">Punto / Signo Palpatorio:</span>
                    <strong className="text-text-main text-xs sm:text-sm">{caseData.physicalExamRefPoint}</strong>
                  </div>
                )}

                <div className="col-span-full">
                  <span className="text-xs text-text-muted block mb-1">Nivel de Dolor / Respuesta al Estímulo:</span>
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold text-xs sm:text-sm inline-flex items-center gap-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    {caseData.painLevel}
                  </div>
                </div>
              </div>
            </div>

            {/* FASE 2: DIAGNÓSTICO */}
            <div className="modal-clinical-block p-4 rounded-2xl border border-border-subtle bg-surface-subtle flex flex-col gap-3">
              <div className="modal-block-header text-xs font-extrabold uppercase tracking-wider text-teal flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>🔬</span>
                  <span>Fase 2: Diagnóstico ({caseData.studies?.length || 0} Estudios)</span>
                </div>
              </div>

              {(!caseData.studies || caseData.studies.length === 0) ? (
                <div className="text-xs text-text-muted italic p-3 bg-card-bg rounded-xl border border-border-subtle">
                  No se registraron estudios complementarios para este caso.
                </div>
              ) : (
                <div className="space-y-3">
                  {caseData.studies.map((s, i) => (
                    <div key={s.id || `${s.studyCatalog?.name || "study"}-${i}`} className="study-item-card p-3.5 rounded-xl border border-border-subtle bg-card-bg">
                      <div className="study-header-line flex items-center justify-between gap-3 mb-1.5 flex-wrap">
                        <strong className="text-text-main text-sm font-bold">
                          {s.studyCatalog?.name}
                        </strong>
                        <AdequacyBadge isAdequate={s.isAdequate} />
                      </div>
                      <div className="text-xs text-text-body mb-2 leading-relaxed">
                        <span className="font-bold text-text-main">Informe para el alumno: </span>
                        <span>{s.findings || "Sin hallazgos especificados"}</span>
                      </div>
                      {s.imageUrl && (
                        <div className="mt-2.5">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-semibold text-text-muted flex items-center gap-1">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                              </svg>
                              Imagen adjunta: {s.imageName || "Captura del estudio"}
                            </span>
                            <button
                              type="button"
                              onClick={() => setLightboxImage({ url: s.imageUrl!, title: s.imageName || s.studyCatalog?.name || "Estudio" })}
                              className="text-[11px] font-bold text-teal-text hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              <ZoomInIcon width={12} height={12} />
                              Ver en Grande
                            </button>
                          </div>
                          <div
                            onClick={() => setLightboxImage({ url: s.imageUrl!, title: s.imageName || s.studyCatalog?.name || "Estudio" })}
                            className="relative group cursor-pointer overflow-hidden rounded-xl border border-border-subtle bg-black/60 max-w-sm"
                            title="Haga clic para ampliar la imagen en alta definición"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={s.imageUrl}
                              alt={s.imageName || s.studyCatalog?.name || "Estudio"}
                              loading="lazy"
                              decoding="async"
                              className="max-h-48 w-full object-contain transition-transform duration-200 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5 backdrop-blur-[2px]">
                              <ZoomInIcon width={16} height={16} />
                              Clic para ampliar
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FASE 3: TRATAMIENTO */}
            <div className="modal-clinical-block p-4 rounded-2xl border border-border-subtle bg-surface-subtle flex flex-col gap-3">
              <div className="modal-block-header text-xs font-extrabold uppercase tracking-wider text-teal flex items-center gap-2">
                <span>💊</span>
                <span>Fase 3: Tratamiento ({caseData.treatmentOptions?.length || 0} Conductas)</span>
              </div>

              {caseData.treatmentQuestion && (
                <div className="p-3 rounded-xl bg-card-bg border border-border-subtle text-xs sm:text-sm font-bold text-text-main">
                  <span className="text-teal font-extrabold mr-1.5">Pregunta:</span>
                  {caseData.treatmentQuestion}
                </div>
              )}

              <div className="space-y-2.5">
                {caseData.treatmentOptions?.map((t, i) => (
                  <div
                    key={t.id || `treatment-${t.order || i}-${i}`}
                    className={`treatment-pill-item flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                      t.isCorrect
                        ? "correct border-emerald-500/50 bg-emerald-500/10 dark:bg-emerald-950/30 dark:border-emerald-500/40 shadow-xs"
                        : "border-border-subtle bg-card-bg"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-xs ${
                        t.isCorrect
                          ? "bg-emerald-600 text-white"
                          : "bg-surface border border-border-subtle text-text-muted"
                      }`}
                    >
                      {t.isCorrect ? "✓" : i + 1}
                    </div>
                    <div className="flex-1 text-sm">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-bold text-text-main text-xs sm:text-sm leading-snug">
                          {t.description}
                        </span>
                        {t.isCorrect && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                            Respuesta Correcta
                          </span>
                        )}
                      </div>
                      {t.feedback && (
                        <div className="mt-1.5 text-xs text-text-body bg-surface-subtle p-2 rounded-lg border border-border-subtle leading-relaxed">
                          <span className="font-bold text-text-main">Feedback pedagógico: </span>
                          <span>{t.feedback}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FASE 4: RESUMEN DEL CASO */}
            <div className="modal-clinical-block p-4 rounded-2xl border border-border-subtle bg-surface-subtle flex flex-col gap-3">
              <div className="modal-block-header text-xs font-extrabold uppercase tracking-wider text-teal flex items-center gap-2">
                <span>📋</span>
                <span>Fase 4: Resumen del Caso</span>
              </div>

              {caseData.clinicalSummary && (
                <div>
                  <span className="text-xs font-bold text-text-muted block mb-1">
                    Resumen Clínico y Discusión Docente:
                  </span>
                  <p className="text-xs sm:text-sm text-text-main leading-relaxed bg-card-bg p-3 rounded-xl border border-border-subtle whitespace-pre-wrap">
                    {caseData.clinicalSummary}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {caseData.epidemiology && (
                  <div>
                    <span className="text-xs font-bold text-text-muted block mb-1">
                      Epidemiología y Factores de Riesgo:
                    </span>
                    <p className="text-xs text-text-main leading-relaxed bg-card-bg p-3 rounded-xl border border-border-subtle">
                      {caseData.epidemiology}
                    </p>
                  </div>
                )}

                {caseData.complications && (
                  <div>
                    <span className="text-xs font-bold text-text-muted block mb-1">
                      Complicaciones Principales:
                    </span>
                    <p className="text-xs text-text-main leading-relaxed bg-card-bg p-3 rounded-xl border border-border-subtle">
                      {caseData.complications}
                    </p>
                  </div>
                )}
              </div>

              {caseData.keywords && caseData.keywords.length > 0 && (
                <div className="pt-2 border-t border-border-subtle/60">
                  <span className="text-xs font-bold text-text-muted block mb-1.5">
                    Palabras Clave Indexadas:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {caseData.keywords.map((kw, i) => (
                      <span
                        key={kw.keyword?.name || i}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-teal text-white shadow-xs"
                      >
                        {kw.keyword.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* PIE DEL MODAL */}
          <div className="modal-footer-bar p-4 border-t flex items-center justify-between gap-3 bg-surface-subtle rounded-b-2xl flex-wrap">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn btn-secondary text-xs px-3.5 py-2 rounded-xl"
                onClick={handleCopyJson}
              >
                Copiar JSON
              </button>
              {renderEditButton()}
              {renderDeleteButton()}
            </div>
            <button
              type="button"
              className="btn btn-secondary text-sm px-5 py-2 rounded-xl"
              onClick={onClose}
            >
              Cerrar Ficha
            </button>
          </div>
        </div>
      </div>

      {/* LIGHTBOX MODAL */}
      <ImageLightboxModal
        isOpen={Boolean(lightboxImage)}
        imageUrl={lightboxImage?.url || ""}
        title={lightboxImage?.title || ""}
        onClose={() => setLightboxImage(null)}
      />
    </>
  );
}
