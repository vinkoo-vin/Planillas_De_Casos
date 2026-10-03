"use client";

import React, { useState, useCallback } from "react";
import { AddedStudy, CaseFormData } from "@/types/clinical";
import { ImageLightboxModal } from "@/components/common/ImageLightboxModal";
import { compressImageToWebP } from "@/lib/image-compression";
import { StudyCardItem } from "./subcomponents/StudyCardItem";

interface Phase2DiagnosticMatrixProps {
  data: CaseFormData;
  updateField: <K extends keyof CaseFormData>(
    field: K,
    value: CaseFormData[K] | ((prev: CaseFormData[K]) => CaseFormData[K])
  ) => void;
  onNotify?: (msg: string) => void;
}

const FREQUENT_STUDIES = [
  { name: "Ecografía Abdominal / Píloro", definition: "Visualización ecográfica de grosor y longitud pilórica." },
  { name: "Hemograma Completo", definition: "Evaluación de glóbulos rojos, blancos y plaquetas." },
  { name: "Ionograma Plasmático & Gases", definition: "Medición de sodio, potasio, cloro y equilibrio ácido-base." },
  { name: "Radiografía Simple Abdomen / Tórax", definition: "Placa simple de abdomen y tórax de pie o decúbito." },
  { name: "Orina Completa y Sedimento", definition: "Densidad urinaria, sedimento y examen físico-químico." },
  { name: "Esofagograma / Tránsito Digestivo", definition: "Estudio contrastado del tracto digestivo superior." },
];

export const Phase2DiagnosticMatrix = React.memo(function Phase2DiagnosticMatrix({
  data,
  updateField,
  onNotify,
}: Phase2DiagnosticMatrixProps) {
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    title: string;
    subtitle?: string;
  } | null>(null);

  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  // Agregar preset
  const handleAddStudyPreset = useCallback(
    (name: string, definition?: string) => {
      const exists = data.studies.some(
        (s) => s.name.toLowerCase().trim() === name.toLowerCase().trim()
      );
      if (exists) {
        if (onNotify) onNotify(`"${name}" ya está añadido en la lista.`);
        return;
      }

      const newStudy: AddedStudy = {
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `study-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name,
        isAdequate: true,
        findings: "",
        imageUrl: null,
        imageName: null,
        definition,
      };

      updateField("studies", (prev) => [...prev, newStudy]);
      if (onNotify) onNotify(`Estudio "${name}" incorporado.`);
    },
    [data.studies, updateField, onNotify]
  );

  // Agregar estudio en blanco
  const handleAddEmptyStudy = useCallback(() => {
    const newStudy: AddedStudy = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `study-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: "",
      isAdequate: true,
      findings: "",
      imageUrl: null,
      imageName: null,
    };
    updateField("studies", (prev) => [...prev, newStudy]);
  }, [updateField]);

  // Actualizar estudio específico
  const handleUpdateStudy = useCallback(
    (index: number, updates: Partial<AddedStudy>) => {
      updateField("studies", (prev) => {
        const next = [...prev];
        next[index] = { ...next[index], ...updates };
        return next;
      });
    },
    [updateField]
  );

  // Eliminar estudio
  const handleRemoveStudy = useCallback(
    (index: number) => {
      updateField("studies", (prev) => prev.filter((_, i) => i !== index));
    },
    [updateField]
  );

  // Mover posición
  const handleMoveStudy = useCallback(
    (index: number, direction: "up" | "down") => {
      updateField("studies", (prev) => {
        const targetIdx = direction === "up" ? index - 1 : index + 1;
        if (targetIdx < 0 || targetIdx >= prev.length) return prev;
        const next = [...prev];
        const [moved] = next.splice(index, 1);
        next.splice(targetIdx, 0, moved);
        return next;
      });
    },
    [updateField]
  );

  // Carga de imagen WebP
  const handleImageFileChange = useCallback(
    async (index: number, file: File) => {
      try {
        setUploadingIndex(index);
        const compressed = await compressImageToWebP(file, 1200, 0.85);
        handleUpdateStudy(index, {
          imageUrl: compressed.dataUrl,
          imageName: compressed.name,
        });
        if (onNotify) onNotify(`Imagen procesada (${compressed.sizeStr})`);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Error al procesar la imagen.";
        if (onNotify) onNotify(errorMsg);
      } finally {
        setUploadingIndex(null);
      }
    },
    [handleUpdateStudy, onNotify]
  );

  const handleRemoveImage = useCallback(
    (index: number) => {
      handleUpdateStudy(index, {
        imageUrl: null,
        imageName: null,
      });
    },
    [handleUpdateStudy]
  );

  return (
    <div
      role="tabpanel"
      id="phase-panel-2"
      aria-labelledby="stepper-tab-2"
      className="space-y-6 animate-fadeIn"
    >
      {/* BOTONERA RÁPIDA DE ESTUDIOS FRECUENTES */}
      <div className="card form-section p-5 sm:p-6 rounded-2xl shadow-sm border border-card-border bg-card-bg">
        <div className="section-header flex items-center justify-between gap-4 mb-4 pb-3.5 border-b border-border-subtle flex-wrap">
          <div className="flex items-center gap-3">
            <div className="section-num w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 shadow-sm bg-teal text-white">
              2.1
            </div>
            <div>
              <h3 className="section-title text-lg sm:text-xl font-bold text-text-main">
                Diagnóstico: Estudios y Solicitudes Complementarias
              </h3>
              <p className="text-xs text-text-muted">
                Seleccione o añada los estudios complementarios e imágenes que el alumno podrá solicitar durante el caso.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddEmptyStudy}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-teal bg-teal/10 hover:bg-teal/20 border border-teal/30 transition-all cursor-pointer"
          >
            <span>+ Otro Estudio Personalizado</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {FREQUENT_STUDIES.map((preset) => {
            const isAdded = data.studies.some(
              (s) => s.name.toLowerCase().trim() === preset.name.toLowerCase().trim()
            );

            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleAddStudyPreset(preset.name, preset.definition)}
                disabled={isAdded}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                  isAdded
                    ? "opacity-50 cursor-not-allowed bg-surface-subtle text-text-muted border-border-subtle"
                    : "bg-surface hover:bg-teal-light text-text-main hover:text-teal-text border-border-subtle hover:border-teal-border shadow-xs hover:shadow-sm"
                }`}
                title={preset.definition}
              >
                <span className="text-teal font-bold">{isAdded ? "✓" : "+"}</span>
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* LISTADO DE TARJETAS INLINE */}
      <div className="card form-section p-5 sm:p-6 rounded-2xl shadow-sm border border-card-border bg-card-bg">
        <div className="section-header flex items-center justify-between gap-4 mb-5 pb-3.5 border-b border-border-subtle flex-wrap">
          <div className="flex items-center gap-3">
            <div className="section-num w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 shadow-sm bg-teal text-white">
              2.2
            </div>
            <div>
              <h3 className="section-title text-lg sm:text-xl font-bold text-text-main">
                Matriz de Informes y Criterio Pedagógico
              </h3>
              <p className="text-xs text-text-muted">
                Especifique el criterio docente (adecuado o penaliza) y el informe clínico que verá el estudiante al solicitar cada estudio.
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-light text-teal-text border border-teal-border">
            {data.studies.length} {data.studies.length === 1 ? "estudio asignado" : "estudios asignados"}
          </span>
        </div>

        {data.studies.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed border-border-subtle bg-surface-subtle/50">
            <div className="text-3xl mb-2" aria-hidden="true">🔬</div>
            <h4 className="text-sm font-bold text-text-main mb-1">No hay estudios en la matriz aún</h4>
            <p className="text-xs text-text-muted max-w-md mx-auto mb-4">
              Utilice los botones rápidos de arriba para incorporar estudios comunes o agregue uno personalizado.
            </p>
            <button
              type="button"
              onClick={() => handleAddStudyPreset(FREQUENT_STUDIES[0].name, FREQUENT_STUDIES[0].definition)}
              className="btn btn-teal text-xs font-semibold px-4 py-2 rounded-xl inline-flex items-center gap-2 cursor-pointer"
            >
              <span>+ Agregar {FREQUENT_STUDIES[0].name}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {data.studies.map((study, idx) => (
              <StudyCardItem
                key={study.id || `study-${study.name}-${idx}`}
                study={study}
                index={idx}
                totalStudies={data.studies.length}
                isUploading={uploadingIndex === idx}
                onUpdate={handleUpdateStudy}
                onRemove={handleRemoveStudy}
                onMove={handleMoveStudy}
                onOpenLightbox={setLightboxImage}
                onImageFileChange={handleImageFileChange}
                onRemoveImage={handleRemoveImage}
              />
            ))}
          </div>
        )}
      </div>

      {/* LIGHTBOX MODAL */}
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
