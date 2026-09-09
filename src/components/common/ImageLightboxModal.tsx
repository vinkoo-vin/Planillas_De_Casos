"use client";

import React, { useEffect } from "react";

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  title?: string;
  subtitle?: string;
}

export function ImageLightboxModal({
  isOpen,
  onClose,
  imageUrl,
  title,
  subtitle,
}: ImageLightboxModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title || "Previsualización de imagen médica"}
    >
      <div
        className="relative max-w-4xl w-full bg-card-bg rounded-3xl overflow-hidden shadow-2xl border border-card-border flex flex-col max-h-[92vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ENCABEZADO DEL LIGHTBOX */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border-subtle bg-surface-subtle shrink-0">
          <div className="min-w-0 flex-1">
            <h4 className="text-base font-bold text-text-main truncate">
              {title || "Estudio Diagnóstico Complementario"}
            </h4>
            {subtitle && (
              <p className="text-xs text-text-muted truncate mt-0.5">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={imageUrl}
              download={title ? `${title.replace(/\s+/g, "_")}.webp` : "estudio-clinico.webp"}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface-hover hover:bg-card-border text-text-main transition-colors cursor-pointer"
              title="Descargar imagen"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Descargar
            </a>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-hover hover:bg-card-border text-text-main transition-colors cursor-pointer"
              aria-label="Cerrar visor de imagen"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* CONTENEDOR DE LA IMAGEN CON FONDO OSCURO PARA ALTO CONTRASTE */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/90 min-h-[300px]">
          <img
            src={imageUrl}
            alt={title || "Imagen clínica ampliada"}
            className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-lg select-none"
          />
        </div>

        {/* PIE DEL LIGHTBOX */}
        <div className="px-6 py-2.5 bg-surface-subtle border-t border-border-subtle flex items-center justify-between text-xs text-text-muted shrink-0">
          <span>Vista ampliada de alta fidelidad</span>
          <span className="font-mono">Presiona Esc para cerrar</span>
        </div>
      </div>
    </div>
  );
}
