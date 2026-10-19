"use client";

import React from "react";
import { CatalogType } from "@prisma/client";
import { CaseDraft, FormErrorMap, AdditionalFieldDraft } from "@/types/clinical";
import { SelectorCatalogo } from "@/components/common/SelectorCatalogo";
import { TrashIcon } from "@/components/common/Icons";

interface Phase2SignosSintomasProps {
  data: CaseDraft;
  errors: FormErrorMap;
  updateField: <K extends keyof CaseDraft>(field: K, value: CaseDraft[K] | ((prev: CaseDraft[K]) => CaseDraft[K])) => void;
}

export const Phase2SignosSintomas = React.memo(function Phase2SignosSintomas({
  data,
  errors,
  updateField,
}: Phase2SignosSintomasProps) {
  const phase2Fields = (data.additionalFields || []).filter((f) => f.phase === 2);

  const handleAddAdditionalField = () => {
    const newField: AdditionalFieldDraft = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `f2-${Date.now()}`,
      phase: 2,
      fieldId: "",
      fieldName: "",
      value: "",
    };
    updateField("additionalFields", (prev = []) => [...prev, newField]);
  };

  const handleUpdateAdditionalField = (id: string, updates: Partial<AdditionalFieldDraft>) => {
    updateField("additionalFields", (prev = []) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const handleRemoveAdditionalField = (id: string) => {
    updateField("additionalFields", (prev = []) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ENCABEZADO DE FASE */}
      <div className="phase-header p-5 rounded-2xl bg-surface-subtle border border-border-subtle">
        <div className="flex items-center gap-3 mb-1">
          <span className="w-9 h-9 rounded-xl bg-teal text-white flex items-center justify-center text-sm font-bold shadow-xs">
            2
          </span>
          <div>
            <h2 className="text-lg font-extrabold text-text-main">
              Fase 2: Signos, Síntomas y Anamnesis
            </h2>
            <p className="text-xs text-text-muted">
              Detalle la cronología del cuadro clínico, características del síntoma y recursos audiovisuales asociados.
            </p>
          </div>
        </div>
      </div>

      {/* 2.1 TEXTO DE SIGNOS Y SÍNTOMAS */}
      <div className="p-5 rounded-2xl bg-card-bg border border-border-subtle space-y-3">
        <div>
          <label htmlFor="signsSymptomsText" className="text-sm font-bold text-text-main flex items-center gap-2">
            <span>Historia de la Enfermedad Actual y Signos Clave</span>
            <span className="text-rose-500 font-extrabold">*</span>
          </label>
          <p className="text-xs text-text-muted mt-0.5">
            Describa el inicio, tiempo de evolución, características del vómito o síntoma, antecedentes perinatales y estado general.
          </p>
        </div>

        <textarea
          id="signsSymptomsText"
          rows={6}
          className="w-full p-4 rounded-xl text-sm border border-border-subtle bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-teal resize-y"
          placeholder="Ej: Lactante masculino de 4 semanas de vida, previamente sano, alimentado a pecho exclusivo. Consulta por vómitos postprandiales inmediatos, no biliosos, que progresaron en frecuencia y fuerza..."
          value={data.signsSymptomsText || ""}
          onChange={(e) => updateField("signsSymptomsText", e.target.value)}
        />
        {errors.signsSymptomsText && (
          <p className="text-xs text-rose-500 font-semibold">{errors.signsSymptomsText}</p>
        )}
      </div>

      {/* 2.2 RECURSO AUDIOVISUAL / VIDEO */}
      <div className="p-5 rounded-2xl bg-card-bg border border-border-subtle space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <label className="text-sm font-bold text-text-main block">
              ¿El caso incluye recurso audiovisual o video para el simulador?
            </label>
            <p className="text-xs text-text-muted mt-0.5">
              Active esta opción si el caso cuenta con un video clínico (ej. vómito en proyectil, onda peristáltica).
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={Boolean(data.hasVideo)}
              onChange={(e) => updateField("hasVideo", e.target.checked)}
            />
            <div className="w-11 h-6 bg-surface-subtle peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal border border-border-subtle"></div>
          </label>
        </div>

        {data.hasVideo && (
          <div className="pt-3 border-t border-border-subtle space-y-2 animate-fadeIn">
            <label htmlFor="videoUrl" className="text-xs font-bold text-text-main block">
              URL o Enlace del Video Clínico:
            </label>
            <input
              id="videoUrl"
              type="url"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-border-subtle bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-teal"
              placeholder="https://..."
              value={data.videoUrl || ""}
              onChange={(e) => updateField("videoUrl", e.target.value)}
            />
            <p className="text-[11px] text-text-muted">
              Puede ser un enlace a YouTube, Vimeo, Google Drive institucional o repositorio de video.
            </p>
          </div>
        )}
      </div>

      {/* 2.3 CAMPOS ADICIONALES (OPCIONAL) */}
      <div className="p-5 rounded-2xl bg-card-bg border border-border-subtle space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <label className="text-sm font-bold text-text-main block">
              Campos Adicionales de la Fase 2 (Opcional)
            </label>
            <p className="text-xs text-text-muted mt-0.5">
              Agregue información específica no cubierta por los campos estándar utilizando el catálogo de campos.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddAdditionalField}
            className="btn btn-teal text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 font-semibold"
          >
            <span>+</span> Agregar Campo Adicional
          </button>
        </div>

        {phase2Fields.length > 0 && (
          <div className="space-y-3 pt-2">
            {phase2Fields.map((field) => (
              <div key={field.id} className="p-3.5 rounded-xl bg-surface border border-border-subtle space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <SelectorCatalogo
                      catalog={CatalogType.campo_adicional}
                      value={field.fieldId || null}
                      onChange={(id, item) =>
                        handleUpdateAdditionalField(field.id, {
                          fieldId: id,
                          fieldName: item?.name || "",
                        })
                      }
                      placeholder="Seleccione o cree el nombre del campo..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAdditionalField(field.id)}
                    className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-colors"
                    title="Eliminar campo"
                  >
                    <TrashIcon width={14} height={14} />
                  </button>
                </div>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg text-xs border border-border-subtle bg-card-bg text-text-main focus:outline-none focus:ring-1 focus:ring-teal"
                  placeholder="Valor del campo adicional..."
                  value={field.value}
                  onChange={(e) => handleUpdateAdditionalField(field.id, { value: e.target.value })}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
