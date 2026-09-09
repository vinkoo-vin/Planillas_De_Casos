"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { StudyCatalogItem, AddedStudy } from "@/types/clinical";
import { ImageLightboxModal } from "@/components/common/ImageLightboxModal";
import { AdequacyBadge } from "@/components/common/AdequacyBadge";
import { ZoomInIcon, CheckIcon } from "@/components/common/Icons";

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
      <div className="add-study-box p-5 rounded-xl border border-border-subtle bg-surface-subtle mb-6">
        <div className="study-form-grid grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-4 mb-4">
          <div className="form-group">
            <label htmlFor="studySelect" className="block text-sm font-semibold text-text-main mb-1.5">
              Tipo de Estudio:
            </label>
            <select
              id="studySelect"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm"
              value={studySelectValue}
              onChange={(e) => setStudySelectValue(e.target.value)}
            >
              <option value="">-- Seleccionar de la lista --</option>
              {studiesCatalog.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
              <option value="__NEW__" style={{ fontWeight: "bold", color: "var(--teal-text)" }}>
                + Crear nuevo estudio...
              </option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="studyAdequateSelect" className="block text-sm font-semibold text-text-main mb-1.5">
              ¿Es un estudio indicado para el caso?
            </label>
            <select
              id="studyAdequateSelect"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm"
              value={studyIsAdequate}
              onChange={(e) => setStudyIsAdequate(e.target.value)}
            >
              <option value="si">Indicado (Aporta al diagnóstico correcto)</option>
              <option value="no">Distractor (Innecesario o contraindicado)</option>
            </select>
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
                <img
                  src={uploadedImage.dataUrl}
                  alt={uploadedImage.name}
                  loading="lazy"
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
                className="btn-remove-preview text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 cursor-pointer transition-colors"
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
              className="study-item-card p-4 rounded-xl border border-border-subtle bg-surface-subtle"
            >
              <div className="study-header-line flex items-center justify-between gap-3 mb-2">
                <strong className="text-text-main text-sm font-bold">{s.name}</strong>
                <AdequacyBadge isAdequate={s.isAdequate} />
              </div>
              <div className="text-xs text-text-body mb-2">
                <strong>Hallazgo para el alumno:</strong> {s.findings}
              </div>
              {s.imageUrl && (
                <div className="mb-2">
                  <span className="text-[11px] text-text-muted block mb-1">Imagen adjunta (clic para ampliar):</span>
                  <div
                    className="inline-block relative group cursor-zoom-in"
                    onClick={() =>
                      setLightboxImage({
                        url: s.imageUrl!,
                        title: s.name,
                        subtitle: s.imageName || "Estudio complementario",
                      })
                    }
                  >
                    <img
                      src={s.imageUrl}
                      alt={s.imageName || s.name}
                      className="max-h-36 rounded-lg border border-border-subtle object-contain bg-slate-950/80 p-1 transition-transform group-hover:brightness-105"
                    />
                    <div className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                      <ZoomInIcon width={14} height={14} />
                    </div>
                  </div>
                </div>
              )}
              <div className="text-right">
                <button
                  type="button"
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 cursor-pointer transition-colors"
                  onClick={() => handleRemoveStudy(index)}
                >
                  Quitar este estudio
                </button>
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
