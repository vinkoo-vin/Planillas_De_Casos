"use client";

import React from "react";
import { AddedStudy } from "@/types/clinical";
import { TrashIcon, ZoomInIcon } from "@/components/common/Icons";

interface StudyCardItemProps {
  study: AddedStudy;
  index: number;
  totalStudies: number;
  isUploading: boolean;
  onUpdate: (index: number, updates: Partial<AddedStudy>) => void;
  onRemove: (index: number) => void;
  onMove: (index: number, direction: "up" | "down") => void;
  onOpenLightbox: (img: { url: string; title: string; subtitle?: string }) => void;
  onImageFileChange: (index: number, file: File) => void;
  onRemoveImage: (index: number) => void;
}

export const StudyCardItem = React.memo(function StudyCardItem({
  study,
  index,
  totalStudies,
  isUploading,
  onUpdate,
  onRemove,
  onMove,
  onOpenLightbox,
  onImageFileChange,
  onRemoveImage,
}: StudyCardItemProps) {
  const studyDomId = study.id || `study-${index}`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageFileChange(index, file);
      if (e.target) e.target.value = "";
    }
  };

  return (
    <div className="study-card p-4 sm:p-5 rounded-2xl border border-border-subtle bg-surface shadow-[var(--shadow-extruded-xs)] hover:shadow-[var(--shadow-extruded-sm)] transition-all duration-200">
      {/* CABECERA DE LA TARJETA */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-border-subtle/70 flex-wrap">
        <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
          <span className="w-6 h-6 rounded-md bg-teal/15 text-teal text-xs font-bold flex items-center justify-center shrink-0">
            {index + 1}
          </span>
          <input
            type="text"
            value={study.name}
            onChange={(e) => onUpdate(index, { name: e.target.value })}
            placeholder="Nombre del estudio (ej: Ecografía Abdominal)..."
            aria-label={`Nombre del estudio ${index + 1}`}
            className="font-bold text-sm sm:text-base text-text-main bg-transparent border-b border-dashed border-border-subtle focus:border-teal outline-none px-1 py-0.5 w-full max-w-md focus-visible:ring-1 focus-visible:ring-teal/30"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {/* BOTONES DE REORDENAR */}
          <button
            type="button"
            onClick={() => onMove(index, "up")}
            disabled={index === 0}
            className="w-7 h-7 rounded-lg border border-border-subtle text-text-muted hover:text-text-main hover:bg-surface-subtle flex items-center justify-center text-xs disabled:opacity-30 cursor-pointer transition-colors"
            title="Mover arriba"
            aria-label="Mover estudio arriba"
          >
            ▲
          </button>
          <button
            type="button"
            onClick={() => onMove(index, "down")}
            disabled={index === totalStudies - 1}
            className="w-7 h-7 rounded-lg border border-border-subtle text-text-muted hover:text-text-main hover:bg-surface-subtle flex items-center justify-center text-xs disabled:opacity-30 cursor-pointer transition-colors"
            title="Mover abajo"
            aria-label="Mover estudio abajo"
          >
            ▼
          </button>

          {/* BOTÓN QUITAR */}
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ml-1"
            title="Quitar este estudio"
            aria-label={`Quitar estudio ${study.name || index + 1}`}
          >
            <TrashIcon width={13} height={13} />
            <span>Quitar</span>
          </button>
        </div>
      </div>

      {/* CUERPO: CRITERIO, HALLAZGO E IMAGEN */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4 items-start">
        {/* COLUMNA IZQUIERDA: CRITERIO Y HALLAZGO */}
        <div className="space-y-3.5">
          {/* TOGGLE CRITERIO PEDAGÓGICO */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Criterio de evaluación pedagógica:
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onUpdate(index, { isAdequate: true })}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  study.isAdequate
                    ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 shadow-xs"
                    : "bg-card-bg text-text-muted border-border-subtle hover:text-text-body"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Clínicamente adecuado
              </button>

              <button
                type="button"
                onClick={() => onUpdate(index, { isAdequate: false })}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  !study.isAdequate
                    ? "bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/40 shadow-xs"
                    : "bg-card-bg text-text-muted border-border-subtle hover:text-text-body"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Inadecuado (penaliza)
              </button>
            </div>
          </div>

          {/* TEXTAREA HALLAZGO */}
          <div>
            <label htmlFor={`study-findings-${studyDomId}`} className="block text-xs font-semibold text-text-main mb-1.5">
              Informe o hallazgo que recibirá el alumno en el simulador:
            </label>
            <textarea
              id={`study-findings-${studyDomId}`}
              rows={3}
              value={study.findings}
              onChange={(e) => onUpdate(index, { findings: e.target.value })}
              placeholder="Ej: Diámetro pilórico transversal de 16 mm, espesor muscular de 4.5 mm (signo del ojo de buey / dona positivo). Canal elongado a 20 mm..."
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-card-bg border border-input-border leading-relaxed focus:border-teal focus:ring-1 focus:ring-teal/30 outline-none"
            />
          </div>
        </div>

        {/* COLUMNA DERECHA: ADJUNTAR IMAGEN O PREVIEW */}
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5">
            Imagen diagnóstica (opcional):
          </label>

          {study.imageUrl ? (
            <div className="p-3 rounded-xl border border-border-subtle bg-card-bg flex items-center gap-3">
              <div
                className="relative group cursor-zoom-in w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-border-subtle bg-slate-950 flex items-center justify-center"
                onClick={() =>
                  onOpenLightbox({
                    url: study.imageUrl!,
                    title: study.name || "Estudio complementario",
                    subtitle: study.imageName || undefined,
                  })
                }
                title="Clic para ampliar imagen"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={study.imageUrl}
                  alt={study.imageName || study.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                  <ZoomInIcon width={14} height={14} />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-text-main truncate">
                  {study.imageName || "imagen_estudio.webp"}
                </div>
                <div className="text-[11px] text-text-muted mt-0.5">Formato WebP HD</div>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() =>
                      onOpenLightbox({
                        url: study.imageUrl!,
                        title: study.name || "Estudio complementario",
                        subtitle: study.imageName || undefined,
                      })
                    }
                    className="text-[11px] font-semibold text-teal-text hover:underline cursor-pointer"
                  >
                    Ampliar
                  </button>
                  <span className="text-border-subtle">&bull;</span>
                  <button
                    type="button"
                    onClick={() => onRemoveImage(index)}
                    className="text-[11px] font-semibold text-rose-500 hover:underline cursor-pointer"
                  >
                    Eliminar foto
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border-2 border-dashed border-border-subtle hover:border-teal-border bg-card-bg text-center transition-colors">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="hidden"
                id={`file-input-${studyDomId}`}
              />

              <label
                htmlFor={`file-input-${studyDomId}`}
                className="cursor-pointer flex flex-col items-center gap-1.5 text-xs text-text-muted hover:text-text-main"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span className="font-semibold text-text-main">
                  {isUploading ? "Comprimiendo WebP..." : "Adjuntar placa o ecografía"}
                </span>
                <span className="text-[10px] text-text-muted">PNG, JPG o WEBP (conversión automática)</span>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
