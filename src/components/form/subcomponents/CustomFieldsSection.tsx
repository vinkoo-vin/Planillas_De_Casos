"use client";

import React, { useState, useMemo, useCallback } from "react";
import { CustomFieldItem, CustomFieldType } from "@/types/clinical";
import { TrashIcon, ZoomInIcon, CloseIcon } from "@/components/common/Icons";
import { ImageLightboxModal } from "@/components/common/ImageLightboxModal";
import { compressImageToWebP } from "@/lib/image-compression";

interface CustomFieldsSectionProps {
  phase: number | "summary";
  customFields: CustomFieldItem[];
  onAddField: (phase: number | "summary") => void;
  onUpdateField: (id: string, updates: Partial<CustomFieldItem>) => void;
  onRemoveField: (id: string) => void;
  title?: string;
  description?: string;
  badgeLabel?: string;
  isCompact?: boolean;
}

const DEFAULT_PHASE_NAMES: Record<string, string> = {
  "1": "Fase 1: Semiología",
  "2": "Fase 2: Diagnóstico",
  "3": "Fase 3: Tratamiento",
  "4": "Fase 4: Cierre Docente",
  summary: "Resumen del Caso",
};

export const CustomFieldsSection = React.memo(function CustomFieldsSection({
  phase,
  customFields,
  onAddField,
  onUpdateField,
  onRemoveField,
  title,
  description,
  badgeLabel,
  isCompact = false,
}: CustomFieldsSectionProps) {
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  // Filtrar los campos que correspondan a esta fase específica
  const phaseFields = customFields.filter((f) => String(f.phase) === String(phase));

  // Validación de no duplicados: contabilizar frecuencia de nombres normalizados en esta fase
  const duplicateCounts = useMemo(() => {
    const counts = new Map<string, number>();
    phaseFields.forEach((f) => {
      const normalized = f.label.trim().toLowerCase();
      if (normalized) {
        counts.set(normalized, (counts.get(normalized) || 0) + 1);
      }
    });
    return counts;
  }, [phaseFields]);

  // Manejo de carga de imagen WebP para un campo específico
  const handleImageUpload = useCallback(
    async (id: string, file: File) => {
      try {
        setUploadingId(id);
        const compressed = await compressImageToWebP(file, 1200, 0.85);
        onUpdateField(id, {
          imageUrl: compressed.dataUrl,
          imageName: compressed.name,
        });
      } catch (err) {
        console.error("Error al procesar imagen de campo personalizado:", err);
      } finally {
        setUploadingId(null);
      }
    },
    [onUpdateField]
  );

  const effectiveTitle =
    title || `Campos Adicionales Personalizados (${DEFAULT_PHASE_NAMES[String(phase)] || `Fase ${phase}`})`;
  const effectiveDescription =
    description ||
    "Permite al médico docente incorporar parámetros, signos, imágenes diagnósticas adicionales o notas clínicas específicas.";
  const effectiveBadge = badgeLabel || (phase === "summary" ? "Resumen" : `Fase ${phase}`);

  return (
    <div
      className={`card form-section p-5 sm:p-6 rounded-2xl shadow-sm border border-card-border bg-card-bg transition-all ${
        isCompact ? "mt-4" : ""
      }`}
    >
      {/* CABECERA DE LA SECCIÓN DE CAMPOS ADICIONALES */}
      <div className="section-header flex items-center justify-between gap-4 mb-4 pb-3.5 border-b border-border-subtle flex-wrap">
        <div className="flex items-center gap-3">
          <div className="section-num w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 shadow-sm bg-teal/15 text-teal border border-teal/20">
            ➕
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="section-title text-base sm:text-lg font-bold text-text-main">
                {effectiveTitle}
              </h3>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-teal-light text-teal-text border border-teal-border">
                {effectiveBadge}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">{effectiveDescription}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onAddField(phase)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-teal bg-teal/10 hover:bg-teal/20 border border-teal/30 transition-all cursor-pointer shadow-xs hover:shadow-sm"
        >
          <span className="text-sm font-extrabold">+</span>
          <span>Agregar Campo</span>
        </button>
      </div>

      {/* LISTA DE CAMPOS AGREGADOS O ESTADO VACÍO */}
      {phaseFields.length === 0 ? (
        <div className="p-5 text-center rounded-xl border border-dashed border-border-subtle bg-surface-subtle/50 text-text-muted transition-all">
          <p className="text-xs font-medium text-text-body mb-2.5">
            No se han agregado campos personalizados en esta sección.
          </p>
          <button
            type="button"
            onClick={() => onAddField(phase)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-text bg-surface hover:bg-teal-light border border-border-subtle hover:border-teal-border cursor-pointer transition-colors shadow-xs"
          >
            <span>+ Añadir primer campo adicional</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {phaseFields.map((field, idx) => {
            const normalized = field.label.trim().toLowerCase();
            const isDuplicate = Boolean(normalized && (duplicateCounts.get(normalized) || 0) > 1);
            const fieldType: CustomFieldType = field.type || (field.imageUrl ? "image" : "text");

            return (
              <div
                key={field.id}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all shadow-xs animate-fadeIn space-y-3 ${
                  isDuplicate
                    ? "border-rose-500/50 bg-rose-500/5"
                    : "border-border-subtle bg-surface hover:border-teal-border/70"
                }`}
              >
                {/* FILA SUPERIOR: NÚMERO, INPUT NOMBRE, SELECTOR TIPO Y BOTÓN ELIMINAR */}
                <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                  <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <span className="w-5 h-5 rounded-md bg-teal/15 text-teal text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => onUpdateField(field.id, { label: e.target.value })}
                        placeholder="Nombre del campo (ej: Presión arterial, Score clínico, Radiografía extra...)"
                        className={`w-full px-3 py-1.5 rounded-lg text-xs font-semibold text-text-main bg-card-bg border transition-colors outline-none ${
                          isDuplicate
                            ? "border-rose-500 bg-rose-500/10 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30"
                            : "border-input-border focus:border-teal focus:ring-1 focus:ring-teal/30"
                        }`}
                      />
                      {isDuplicate && (
                        <span className="text-[11px] text-rose-500 font-semibold block mt-1">
                          ⚠️ Ya existe otro campo con este nombre en esta sección. Evite nombres duplicados.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* SELECTOR DE TIPO (TEXTO O IMAGEN) */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center p-0.5 rounded-lg bg-card-bg border border-border-subtle text-xs">
                      <button
                        type="button"
                        onClick={() => onUpdateField(field.id, { type: "text" })}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                          fieldType === "text"
                            ? "bg-teal text-white shadow-xs"
                            : "text-text-muted hover:text-text-main"
                        }`}
                      >
                        📝 Texto
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateField(field.id, { type: "image" })}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                          fieldType === "image"
                            ? "bg-teal text-white shadow-xs"
                            : "text-text-muted hover:text-text-main"
                        }`}
                      >
                        🖼️ Imagen
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveField(field.id)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-rose-600 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-colors cursor-pointer shrink-0"
                      title="Eliminar este campo"
                      aria-label={`Eliminar campo ${field.label || idx + 1}`}
                    >
                      <TrashIcon width={14} height={14} />
                    </button>
                  </div>
                </div>

                {/* CONTENIDO SEGÚN EL TIPO SELECCIONADO */}
                {fieldType === "image" ? (
                  <div className="space-y-2.5 pt-1 border-t border-border-subtle/50">
                    {field.imageUrl ? (
                      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-card-bg border border-border-subtle flex-wrap sm:flex-nowrap">
                        <div
                          className="relative w-16 h-16 rounded-lg overflow-hidden border border-border-subtle bg-black/40 shrink-0 cursor-pointer group"
                          onClick={() =>
                            setLightboxImage({
                              url: field.imageUrl!,
                              title: field.label || "Imagen adicional",
                            })
                          }
                          title="Haga clic para ampliar imagen"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={field.imageUrl}
                            alt={field.label || "Imagen adicional"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                            <ZoomInIcon width={14} height={14} />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 text-xs">
                          <p className="font-semibold text-text-main truncate">
                            {field.imageName || "Imagen adicional adjunta"}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              type="button"
                              onClick={() =>
                                setLightboxImage({
                                  url: field.imageUrl!,
                                  title: field.label || "Imagen adicional",
                                })
                              }
                              className="text-[11px] font-bold text-teal hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              <ZoomInIcon width={12} height={12} />
                              Ver en grande
                            </button>
                            <span className="text-text-muted">•</span>
                            <button
                              type="button"
                              onClick={() => onUpdateField(field.id, { imageUrl: null, imageName: null })}
                              className="text-[11px] font-semibold text-rose-500 hover:underline cursor-pointer"
                            >
                              Quitar imagen
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl border border-dashed border-border-subtle bg-card-bg text-center">
                        <label className="cursor-pointer block">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingId === field.id}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(field.id, file);
                            }}
                          />
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-teal bg-teal/10 hover:bg-teal/20 border border-teal/30 transition-all">
                            {uploadingId === field.id ? (
                              <span>Comprimiendo y optimizando imagen...</span>
                            ) : (
                              <span>Subir Imagen o Captura (JPG, PNG, WebP)</span>
                            )}
                          </span>
                          <span className="text-[11px] text-text-muted block mt-1">
                            La imagen se optimizará automáticamente a formato WebP ligero.
                          </span>
                        </label>
                      </div>
                    )}

                    {/* DESCRIPCIÓN O EPÍGRAFE DE LA IMAGEN */}
                    <textarea
                      rows={2}
                      value={field.value}
                      onChange={(e) => onUpdateField(field.id, { value: e.target.value })}
                      placeholder="Epígrafe, hallazgos o descripción de la imagen médica..."
                      className="w-full px-3 py-2 rounded-lg text-xs leading-relaxed text-text-main bg-card-bg border border-input-border focus:border-teal focus:ring-1 focus:ring-teal/30 outline-none transition-colors"
                    />
                  </div>
                ) : (
                  <div>
                    <textarea
                      rows={2}
                      value={field.value}
                      onChange={(e) => onUpdateField(field.id, { value: e.target.value })}
                      placeholder="Ingrese el valor o contenido clínico para este campo..."
                      className="w-full px-3 py-2 rounded-lg text-xs leading-relaxed text-text-main bg-card-bg border border-input-border focus:border-teal focus:ring-1 focus:ring-teal/30 outline-none transition-colors"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL LIGHTBOX PARA VISUALIZAR IMÁGENES ADICIONALES */}
      <ImageLightboxModal
        isOpen={Boolean(lightboxImage)}
        onClose={() => setLightboxImage(null)}
        imageUrl={lightboxImage?.url || null}
        title={lightboxImage?.title}
      />
    </div>
  );
});
