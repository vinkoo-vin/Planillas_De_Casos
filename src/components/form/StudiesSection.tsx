"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { StudyCatalogItem, AddedStudy } from "@/types/clinical";
import { ImageLightboxModal } from "@/components/common/ImageLightboxModal";
import { AdequacyBadge } from "@/components/common/AdequacyBadge";
import { ZoomInIcon, CheckIcon, TrashIcon } from "@/components/common/Icons";
import { CustomSelect } from "@/components/common/CustomSelect";

import { compressImageToWebP } from "@/lib/image-compression";

interface StudiesSectionProps {
  studiesCatalog: StudyCatalogItem[];
  addedStudies: AddedStudy[];
  setAddedStudies: React.Dispatch<React.SetStateAction<AddedStudy[]>>;
  onNotify: (msg: string) => void;
}

export const StudiesSection = React.memo(function StudiesSection({
  studiesCatalog,
  addedStudies,
  setAddedStudies,
  onNotify,
}: StudiesSectionProps) {
  const [studySelectValue, setStudySelectValue] = useState("");
  const [studyIsAdequate, setStudyIsAdequate] = useState("si");
  const [newStudyName, setNewStudyName] = useState("");
  const [newStudyDefinition, setNewStudyDefinition] = useState("");
  const [studyFindings, setStudyFindings] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const [uploadedImage, setUploadedImage] = useState<{
    dataUrl: string;
    name: string;
    size: string;
  } | null>(null);

  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    title: string;
    subtitle?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compresión desacoplada y optimización a WebP
  const processFile = useCallback(async (file: File) => {
    try {
      const result = await compressImageToWebP(file);
      setUploadedImage({
        dataUrl: result.dataUrl,
        name: result.name,
        size: result.sizeStr,
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al procesar la imagen seleccionada.");
    }
  }, []);

  // Listener para capturas y pegado directo con Ctrl + V
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(11, 19);
            const pastedFile = new File([file], `captura-estudio-${timestamp}.webp`, {
              type: file.type,
            });
            processFile(pastedFile);
            onNotify("Imagen cargada desde el portapapeles (Ctrl+V)");
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [processFile, onNotify]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const clearUploadedImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddStudyToCase = () => {
    let name = studySelectValue;
    let definition = "";

    if (studySelectValue === "__NEW__") {
      name = newStudyName.trim();
      definition = newStudyDefinition.trim();
      if (!name) return alert("Por favor escriba el nombre del nuevo estudio.");
    }

    if (!name) return alert("Por favor seleccione o cree un tipo de estudio.");

    const newStudy: AddedStudy = {
      name,
      isAdequate: studyIsAdequate === "si",
      findings: studyFindings.trim() || "Sin hallazgos especificados",
      imageUrl: uploadedImage?.dataUrl || null,
      imageName: uploadedImage?.name || null,
      definition: definition || undefined,
    };

    setAddedStudies((prev) => [...prev, newStudy]);

    // Limpiar formulario de estudio
    setStudySelectValue("");
    setStudyIsAdequate("si");
    setNewStudyName("");
    setNewStudyDefinition("");
    setStudyFindings("");
    clearUploadedImage();
  };

  const handleRemoveStudy = (index: number) => {
    setAddedStudies((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="card form-section p-6 rounded-2xl mb-6 shadow-sm border border-card-border bg-card-bg">
      <div className="section-header flex items-center gap-3.5 mb-5 pb-3.5 border-b border-border-subtle">
        <div className="section-num w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-sm shrink-0 shadow-sm">
          5
        </div>
        <h3 className="section-title text-xl font-bold text-text-main">
          Estudios Complementarios de Diagnóstico
        </h3>
      </div>

      <div className="notice-banner flex items-start gap-3 p-3.5 rounded-xl mb-5 text-sm bg-surface-subtle border border-border-subtle">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-text shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span className="text-xs sm:text-sm text-text-body">
          <strong>Configuración Pedagógica:</strong> Defina qué estudios son pertinentes y cuáles funcionan como distractores para evaluar el criterio clínico del estudiante.
        </span>
      </div>

      {/* CAJA DE ADICIÓN DE ESTUDIO */}
      <div className="add-study-box p-5 rounded-xl border border-border-subtle bg-surface-subtle shadow-[var(--shadow-inset-sm)] mb-6">
        <div className="study-form-grid grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-4 mb-4">
          <div className="form-group">
            <label htmlFor="studySelect" className="block text-sm font-semibold text-text-main mb-1.5 flex items-center justify-between">
              <span>Tipo de Estudio:</span>
              <span className="text-xs font-normal text-text-muted">
                {studiesCatalog.length} disponibles
              </span>
            </label>
            <CustomSelect
              id="studySelect"
              value={studySelectValue}
              onChange={(val) => setStudySelectValue(val)}
              placeholder="-- Seleccionar de la lista --"
              searchPlaceholder="Buscar estudio por nombre..."
              options={studiesCatalog.map((s) => ({
                value: s.name,
                label: s.name,
                subtitle: s.generalDefinition || undefined,
              }))}
              actionOption={{
                value: "__NEW__",
                label: "Crear nuevo estudio...",
                description: "Definir un estudio personalizado para el catálogo",
              }}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              }
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-semibold text-text-main mb-1.5">
              Criterio Pedagógico:
            </label>
            <div className="grid grid-cols-2 gap-2 h-[42px]">
              <button
                type="button"
                onClick={() => setStudyIsAdequate("si")}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  studyIsAdequate === "si"
                    ? "bg-mint-light text-mint-dark border-2 border-mint shadow-[var(--shadow-inset-sm)] translate-y-[1px]"
                    : "bg-surface-subtle text-text-muted border border-border-subtle hover:bg-surface-hover hover:text-text-main shadow-[var(--shadow-extruded-xs)] hover:shadow-[var(--shadow-extruded-sm)] hover:-translate-y-[0.5px]"
                }`}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={studyIsAdequate === "si" ? "text-mint-dark" : "opacity-40"}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <div className="text-left leading-tight">
                  <span>Indicado</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setStudyIsAdequate("no")}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  studyIsAdequate === "no"
                    ? "bg-danger-light text-danger border-2 border-danger shadow-[var(--shadow-inset-sm)] translate-y-[1px]"
                    : "bg-surface-subtle text-text-muted border border-border-subtle hover:bg-surface-hover hover:text-text-main shadow-[var(--shadow-extruded-xs)] hover:shadow-[var(--shadow-extruded-sm)] hover:-translate-y-[0.5px]"
                }`}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={studyIsAdequate === "no" ? "text-danger" : "opacity-40"}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div className="text-left leading-tight">
                  <span>Distractor</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {studySelectValue === "__NEW__" && (
          <div className="new-study-callout p-4 rounded-xl border border-amber-400 bg-amber-50 dark:bg-amber-950/30 mb-4">
            <div className="form-group mb-3">
              <label htmlFor="newStudyName" className="block text-sm font-semibold text-text-main mb-1">
                Nombre del Nuevo Estudio:
              </label>
              <input
                type="text"
                id="newStudyName"
                className="w-full px-3.5 py-2 rounded-lg text-sm"
                value={newStudyName}
                onChange={(e) => setNewStudyName(e.target.value)}
                placeholder="Ej: Ecografía Piloroduodenal / Radiografía de Abdomen Simple"
              />
            </div>
            <div className="form-group">
              <label htmlFor="newStudyDefinition" className="block text-sm font-semibold text-text-main mb-1">
                Definición / Descripción del Estudio:
              </label>
              <input
                type="text"
                id="newStudyDefinition"
                className="w-full px-3.5 py-2 rounded-lg text-sm"
                value={newStudyDefinition}
                onChange={(e) => setNewStudyDefinition(e.target.value)}
                placeholder="Ej: Exploración ultrasonográfica transabdominal en corte sagital y transversal"
              />
            </div>
          </div>
        )}

        <div className="form-group mb-4">
          <label htmlFor="studyFindings" className="block text-sm font-semibold text-text-main mb-1.5">
            Hallazgos / Informe que verá el estudiante al solicitarlo:
          </label>
          <textarea
            id="studyFindings"
            rows={2}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm"
            value={studyFindings}
            onChange={(e) => setStudyFindings(e.target.value)}
            placeholder="Ej: Grosor muscular pilórico de 4.5 mm (>3 mm) y longitud del canal de 18 mm. Signo del doble riel positivo."
          />
        </div>

        {/* SUBIDA DE IMAGEN OPTIMIZADA */}
        <div className="form-group mb-4">
          <label htmlFor="studyFileInput" className="block text-sm font-semibold text-text-main mb-1.5">
            Imagen del Estudio (Adjuntar archivo, arrastrar o pegar):
          </label>

          <input
            type="file"
            id="studyFileInput"
            aria-label="Adjuntar archivo de imagen del estudio"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <div
            className={`file-drop-zone p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all text-center ${
              isDragOver ? "dragover border-teal bg-teal-light" : "border-input-border bg-card-bg"
            }`}
            role="button"
            tabIndex={0}
            aria-label="Haga clic para seleccionar imagen, arrastre o pegue con Ctrl+V"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="drop-zone-content flex flex-col items-center justify-center gap-2">
              <div className="drop-icon-wrapper w-12 h-12 rounded-full flex items-center justify-center text-teal-text bg-teal-light mb-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              </div>
              <div className="drop-main-text text-sm font-semibold text-text-main">
                Haga clic para examinar, arrastre un archivo o pegue con <strong>Ctrl + V</strong>
              </div>
              <div className="drop-sub-text text-xs text-text-muted">
                Formatos admitidos: JPG, PNG, WEBP (Apertura rápida optimizada)
              </div>
            </div>
          </div>

          {uploadedImage && (
            <div className="image-preview-container flex items-center gap-4 p-3 rounded-xl border border-mint-border bg-surface-subtle mt-2.5">
              <div
                className="relative group cursor-zoom-in shrink-0"
                onClick={() =>
                  setLightboxImage({
                    url: uploadedImage.dataUrl,
                    title: uploadedImage.name,
                    subtitle: `${uploadedImage.size} • Clic para ampliar`,
                  })
                }
                title="Haga clic para ampliar imagen"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={uploadedImage.dataUrl}
                  alt={uploadedImage.name}
                  loading="lazy"
                  decoding="async"
                  className="preview-thumb w-16 h-16 rounded-lg object-cover border border-card-border transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/30 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                  <ZoomInIcon width={18} height={18} />
                </div>
              </div>
              <div className="preview-meta flex-1 min-w-0">
                <div className="preview-name text-sm font-semibold text-text-main truncate">
                  {uploadedImage.name}
                </div>
                <div className="preview-size text-xs text-text-muted">{uploadedImage.size}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="preview-badge inline-flex items-center gap-1 text-[11px] font-bold text-mint-dark bg-mint-light px-2 py-0.5 rounded-full">
                    <CheckIcon width={12} height={12} />
                    Imagen lista
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxImage({
                        url: uploadedImage.dataUrl,
                        title: uploadedImage.name,
                        subtitle: `${uploadedImage.size} • Previsualización ampliada`,
                      })
                    }
                    className="text-[11px] font-bold text-teal-text hover:underline cursor-pointer"
                  >
                    Ver en Grande
                  </button>
                </div>
              </div>
              <button
                type="button"
                className="btn-remove-preview text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20 cursor-pointer transition-colors"
                onClick={clearUploadedImage}
              >
                Eliminar
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          className="btn btn-secondary text-sm font-semibold px-5 py-2.5 rounded-xl w-full sm:w-auto"
          onClick={handleAddStudyToCase}
        >
          + Vincular Estudio al Caso
        </button>
      </div>

      {/* LISTADO DE ESTUDIOS YA AÑADIDOS */}
      {addedStudies.length > 0 && (
        <div className="added-studies-list flex flex-col gap-3">
          <h4 className="text-sm font-bold text-text-main flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Estudios asignados a este caso ({addedStudies.length}):
          </h4>

          {addedStudies.map((s, index) => (
            <div
              key={index}
              className="study-item-card p-3 sm:p-4 rounded-xl border border-border-subtle bg-card-bg shadow-[var(--shadow-extruded-xs)] hover:shadow-[var(--shadow-extruded-sm)] transition-all duration-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4"
            >
              {/* MINIATURA HORIZONTAL A LA IZQUIERDA (SI TIENE IMAGEN) */}
              {s.imageUrl && (
                <div
                  className="relative group cursor-zoom-in w-full sm:w-44 md:w-52 h-28 sm:h-28 rounded-lg border border-border-subtle bg-slate-950/80 overflow-hidden shrink-0 flex items-center justify-center transition-all hover:brightness-105"
                  onClick={() =>
                    setLightboxImage({
                      url: s.imageUrl!,
                      title: s.name,
                      subtitle: s.imageName || "Estudio complementario",
                    })
                  }
                  title="Clic para ampliar imagen en alta resolución"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.imageUrl}
                    alt={s.imageName || s.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full max-h-28 object-contain p-1.5 transition-transform duration-200 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold backdrop-blur-[1px]">
                    <ZoomInIcon width={14} height={14} />
                    <span>Ampliar</span>
                  </div>
                  <span className="absolute bottom-1 right-1 bg-black/75 text-white/90 text-[10px] px-1.5 py-0.5 rounded font-mono pointer-events-none">
                    HD
                  </span>
                </div>
              )}

              {/* CONTENIDO PRINCIPAL A LA DERECHA */}
              <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
                <div>
                  {/* LÍNEA SUPERIOR: TÍTULO, BADGE Y BOTÓN QUITAR */}
                  <div className="flex items-start justify-between gap-2.5 mb-1.5">
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                      <strong className="text-text-main text-sm sm:text-base font-bold truncate">
                        {s.name}
                      </strong>
                      <AdequacyBadge isAdequate={s.isAdequate} />
                    </div>

                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-danger hover:text-danger/80 bg-danger-light/50 hover:bg-danger-light px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0"
                      onClick={() => handleRemoveStudy(index)}
                      title="Quitar este estudio del caso"
                    >
                      <TrashIcon width={13} height={13} />
                      <span>Quitar</span>
                    </button>
                  </div>

                  {/* HALLAZGOS PARA EL ALUMNO */}
                  <div className="text-xs sm:text-sm text-text-body bg-surface-subtle/70 rounded-lg p-2.5 border border-border-subtle/60 leading-relaxed">
                    <span className="font-bold text-text-main">Hallazgo para el alumno: </span>
                    <span className="text-text-body">{s.findings || "Sin hallazgos especificados."}</span>
                  </div>
                </div>

                {/* METADATOS INFERIORES */}
                {s.imageName && (
                  <div className="text-[11px] text-text-muted flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span>Archivo: <span className="font-mono text-text-body font-medium">{s.imageName}</span></span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LIGHTBOX MODAL PARA IMÁGENES CLÍNICAS */}
      <ImageLightboxModal
        isOpen={Boolean(lightboxImage)}
        onClose={() => setLightboxImage(null)}
        imageUrl={lightboxImage?.url || null}
        title={lightboxImage?.title}
        subtitle={lightboxImage?.subtitle}
      />
    </div>
  );
});
