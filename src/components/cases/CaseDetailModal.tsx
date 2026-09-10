"use client";

import React, { useEffect, useCallback, useState } from "react";
import { SavedCase } from "@/types/clinical";
import { ImageLightboxModal } from "@/components/common/ImageLightboxModal";
import { AdequacyBadge } from "@/components/common/AdequacyBadge";
import { CloseIcon, EditIcon, ZoomInIcon } from "@/components/common/Icons";
import { formatCaseDate } from "@/lib/case-transformers";

interface CaseDetailModalProps {
  caseData: SavedCase | null;
  isLoading: boolean;
  onClose: () => void;
  onCopyNotice: (msg: string) => void;
  onEditCase?: (caseData: SavedCase) => void;
}

export function CaseDetailModal({
  caseData,
  isLoading = false,
  onClose,
  onCopyNotice,
  onEditCase,
}: CaseDetailModalProps) {
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

  // Manejo accesible de la tecla Escape para cerrar el modal
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
            </div>

            <div className="flex items-center gap-2">
              {renderEditButton()}
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

          {/* CUERPO DE LA FICHA */}
          <div className="modal-content-body p-6 flex flex-col gap-6">
            {/* 1. HISTORIA CLÍNICA */}
            <div className="modal-clinical-block flex flex-col gap-2">
              <div className="modal-block-header text-xs font-bold uppercase tracking-wider text-teal-text flex items-center gap-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                1. Historia Clínica y Anamnesis
              </div>
              <p className="modal-history-text text-sm leading-relaxed text-text-main whitespace-pre-wrap">
                {caseData.clinicalHistory}
              </p>
              {caseData.hasVideo && (
                <div className="mt-2 p-3 rounded-lg bg-teal-light text-text-main text-xs flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                  <span>
                    <strong>Recurso Audiovisual:</strong>{" "}
                    {caseData.videoDescription || "Video clínico configurado"}
                  </span>
                </div>
              )}
            </div>

            {/* 2. EXAMEN FÍSICO */}
            <div className="modal-clinical-block flex flex-col gap-2">
              <div className="modal-block-header text-xs font-bold uppercase tracking-wider text-teal-text flex items-center gap-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m4.93 4.93 4.24 4.24" />
                  <path d="m14.83 9.17 4.24-4.24" />
                  <path d="m14.83 14.83 4.24 4.24" />
                  <path d="m9.17 14.83-4.24 4.24" />
                </svg>
                2. Examen Físico y Hallazgos
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-text-muted block">Modalidad:</span>
                  <strong className="text-text-main text-sm">
                    {caseData.isPhysicalExamInteractive ? "Interactivo" : "Estándar"}
                  </strong>
                </div>
                {caseData.physicalExamZone && (
                  <div>
                    <span className="text-xs text-text-muted block">Zona Anatómica:</span>
                    <strong className="text-text-main text-sm">{caseData.physicalExamZone}</strong>
                  </div>
                )}
                {caseData.physicalExamRefPoint && (
                  <div>
                    <span className="text-xs text-text-muted block">Punto de Referencia:</span>
                    <strong className="text-text-main text-sm">{caseData.physicalExamRefPoint}</strong>
                  </div>
                )}
                <div className="col-span-full">
                  <span className="text-xs text-text-muted block mb-1">Hallazgo / Nivel de Dolor:</span>
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold text-sm inline-flex items-center gap-2">
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

            {/* 3. ESTUDIOS COMPLEMENTARIOS */}
            <div className="modal-clinical-block flex flex-col gap-2">
              <div className="modal-block-header text-xs font-bold uppercase tracking-wider text-teal-text flex items-center gap-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 21H3V3" />
                  <path d="m21 9-8 8-4-4-6 6" />
                </svg>
                3. Estudios Complementarios ({caseData.studies?.length || 0})
              </div>
              {caseData.studies?.map((s, i) => (
                <div key={i} className="study-item-card p-3.5 rounded-xl border border-border-subtle bg-surface-subtle">
                  <div className="study-header-line flex items-center justify-between gap-3 mb-1.5">
                    <strong className="text-text-main text-sm font-bold">
                      {s.studyCatalog?.name}
                    </strong>
                    <AdequacyBadge isAdequate={s.isAdequate} />
                  </div>
                  <div className="text-xs text-text-body mb-2">
                    <strong>Hallazgo:</strong> {s.findings || "Sin hallazgos especificados"}
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
                          className="text-[11px] font-bold text-teal hover:underline inline-flex items-center gap-1 cursor-pointer"
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

            {/* 4. CONDUCTA TERAPÉUTICA */}
            <div className="modal-clinical-block flex flex-col gap-2">
              <div className="modal-block-header text-xs font-bold uppercase tracking-wider text-teal-text flex items-center gap-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
                  <path d="m8.5 8.5 7 7" />
                </svg>
                4. Opciones Terapéuticas ({caseData.treatmentOptions?.length || 0})
              </div>
              {caseData.treatmentOptions?.map((t, i) => (
                <div
                  key={i}
                  className={`treatment-pill-item flex items-start gap-2.5 p-3 rounded-xl border ${
                    t.isCorrect ? "correct border-emerald-400 bg-emerald-500/10" : "border-border-subtle bg-surface-subtle"
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
                    style={{ background: t.isCorrect ? "#16A34A" : "#94A3B8" }}
                  >
                    {t.isCorrect ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <div className="flex-1 text-sm">
                    <span className={`font-semibold ${t.isCorrect ? "text-emerald-700 dark:text-emerald-300" : "text-text-main"}`}>
                      {t.description}
                    </span>
                    {t.isCorrect && (
                      <span className="ml-2 text-[11px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200">
                        CORRECTA
                      </span>
                    )}
                    {t.feedback && (
                      <div className="mt-1.5 text-xs text-text-muted bg-card-bg/60 p-2 rounded-lg border border-border-subtle/50">
                        <span className="font-semibold text-text-main">Feedback para el alumno: </span>
                        <span>{t.feedback}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
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

      {/* LIGHTBOX MODAL PARA VER IMAGEN EN ALTA RESOLUCIÓN */}
      <ImageLightboxModal
        isOpen={Boolean(lightboxImage)}
        imageUrl={lightboxImage?.url || ""}
        title={lightboxImage?.title || ""}
        onClose={() => setLightboxImage(null)}
      />
    </>
  );
}
