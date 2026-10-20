"use client";

import React from "react";
import { CatalogType } from "@prisma/client";
import {
  CaseDraft,
  FormErrorMap,
  AdditionalFieldDraft,
} from "@/types/clinical";
import { SelectorCatalogo } from "@/components/common/SelectorCatalogo";
import { TrashIcon } from "@/components/common/Icons";

interface Phase2SignosSintomasProps {
  data: CaseDraft;
  errors: FormErrorMap;
  updateField: <K extends keyof CaseDraft>(
    field: K,
    value: CaseDraft[K] | ((prev: CaseDraft[K]) => CaseDraft[K]),
  ) => void;
}

export const Phase2SignosSintomas = React.memo(function Phase2SignosSintomas({
  data,
  errors,
  updateField,
}: Phase2SignosSintomasProps) {
  const phase2Fields = (data.additionalFields || []).filter(
    (f) => f.phase === 2,
  );

  const handleAddAdditionalField = () => {
    const newField: AdditionalFieldDraft = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `f2-${Date.now()}`,
      phase: 2,
      fieldId: "",
      fieldName: "",
      value: "",
    };
    updateField("additionalFields", (prev = []) => [...prev, newField]);
  };

  const handleUpdateAdditionalField = (
    id: string,
    updates: Partial<AdditionalFieldDraft>,
  ) => {
    updateField("additionalFields", (prev = []) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    );
  };

  const handleRemoveAdditionalField = (id: string) => {
    updateField("additionalFields", (prev = []) =>
      prev.filter((f) => f.id !== id),
    );
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
              Signos y Síntomas
            </h2>
            <p className="text-xs text-text-muted">
              Detalle la cronología del cuadro clínico, características del
              síntoma y recursos audiovisuales asociados.
            </p>
          </div>
        </div>
      </div>

      {/* 2.1 TEXTO DE SIGNOS Y SÍNTOMAS */}
      <div className="p-5 rounded-2xl bg-card-bg border border-border-subtle space-y-3">
        <div>
          <label
            htmlFor="signsSymptomsText"
            className="text-sm font-bold text-text-main flex items-center gap-2"
          >
            <span>Historia de la Enfermedad Actual y Signos Clave</span>
            <span className="text-rose-500 font-extrabold">*</span>
          </label>
          <p className="text-xs text-text-muted mt-0.5">
            Describa el inicio, tiempo de evolución, características de los
            síntoma, antecedentes perinatales y estado general.
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
          <p className="text-xs text-rose-500 font-semibold">
            {errors.signsSymptomsText}
          </p>
        )}
      </div>

      {/* 2.2 RECURSO AUDIOVISUAL / GENERACIÓN DE VIDEO CLÍNICO */}
      <div className="p-5 rounded-2xl bg-card-bg border border-border-subtle space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <label className="text-sm font-bold text-text-main block">
              ¿El caso incluye recurso audiovisual o video para el simulador?
            </label>
            <p className="text-xs text-text-muted mt-0.5">
              Active esta opción para definir sugerencias o directivas para la
              posterior generación del video clínico del caso.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={Boolean(data.hasVideo)}
              onChange={(e) => {
                const nextChecked = e.target.checked;
                updateField("hasVideo", nextChecked);
                if (
                  nextChecked &&
                  (!data.videoUrl || data.videoUrl.trim() === "")
                ) {
                  updateField(
                    "videoUrl",
                    "Sin preferencia específica (generar acorde a los signos y síntomas)",
                  );
                }
              }}
            />
            <div className="w-11 h-6 bg-surface-subtle peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal border border-border-subtle"></div>
          </label>
        </div>

        {data.hasVideo && (
          <div className="pt-4 border-t border-border-subtle space-y-4 animate-fadeIn">
            <div>
              <span className="text-xs font-bold text-text-main block mb-1">
                Preferencia de Generación del Video:
              </span>
              <p className="text-xs text-text-muted">
                Seleccione si tiene requerimientos específicos de toma, postura
                o escena, o si prefiere que se genere automáticamente.
              </p>
            </div>

            {/* SELECTOR DE OPCIONES: TENGO UNA PREFERENCIA VS NO TENGO PREFERENCIA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* OPCIÓN 1: TENGO UNA PREFERENCIA */}
              <button
                type="button"
                onClick={() => {
                  if (data.videoUrl?.startsWith("Sin preferencia")) {
                    updateField("videoUrl", "");
                  }
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  data.videoUrl !== undefined &&
                  !data.videoUrl.startsWith("Sin preferencia")
                    ? "bg-teal/10 border-teal shadow-xs text-text-main"
                    : "bg-surface-subtle border-border-subtle text-text-muted hover:border-teal/40 hover:text-text-main"
                }`}
              >
                <div className="pt-0.5">
                  <span
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      data.videoUrl !== undefined &&
                      !data.videoUrl.startsWith("Sin preferencia")
                        ? "border-teal bg-teal"
                        : "border-border-subtle bg-surface"
                    }`}
                  >
                    {data.videoUrl !== undefined &&
                      !data.videoUrl.startsWith("Sin preferencia") && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                  </span>
                </div>
                <div>
                  <strong className="text-xs font-bold block text-text-main">
                    Tengo una preferencia
                  </strong>
                  <span className="text-[11px] leading-snug block text-text-muted mt-0.5">
                    Deseo redactar sugerencias o indicaciones clínicas para la
                    producción del video.
                  </span>
                </div>
              </button>

              {/* OPCIÓN 2: NO TENGO PREFERENCIA */}
              <button
                type="button"
                onClick={() => {
                  updateField(
                    "videoUrl",
                    "Sin preferencia específica (generar acorde a los signos y síntomas)",
                  );
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  data.videoUrl?.startsWith("Sin preferencia")
                    ? "bg-teal/10 border-teal shadow-xs text-text-main"
                    : "bg-surface-subtle border-border-subtle text-text-muted hover:border-teal/40 hover:text-text-main"
                }`}
              >
                <div className="pt-0.5">
                  <span
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      data.videoUrl?.startsWith("Sin preferencia")
                        ? "border-teal bg-teal"
                        : "border-border-subtle bg-surface"
                    }`}
                  >
                    {data.videoUrl?.startsWith("Sin preferencia") && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </span>
                </div>
                <div>
                  <strong className="text-xs font-bold block text-text-main">
                    No tengo preferencia
                  </strong>
                  <span className="text-[11px] leading-snug block text-text-muted mt-0.5">
                    Generación estándar acorde al cuadro clínico y signos
                    descritos en el caso.
                  </span>
                </div>
              </button>
            </div>

            {/* ÁREA DE TEXTO CUANDO TIENE PREFERENCIA */}
            {data.videoUrl !== undefined &&
            !data.videoUrl.startsWith("Sin preferencia") ? (
              <div className="p-4 rounded-xl bg-surface border border-teal-border/40 space-y-2 animate-fadeIn">
                <label
                  htmlFor="videoSuggestions"
                  className="text-xs font-bold text-text-main flex items-center gap-2"
                >
                  <span>Sugerencias e Indicaciones para el Video:</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-light text-teal">
                    Prompt de Generación
                  </span>
                </label>
                <textarea
                  id="videoSuggestions"
                  rows={4}
                  className="w-full p-3.5 rounded-xl text-sm border border-border-subtle bg-card-bg text-text-main focus:outline-none focus:ring-2 focus:ring-teal resize-y"
                  placeholder="Ej: Video en plano detalle del abdomen del lactante en decúbito supino, mostrando ondas peristálticas gástricas visibles de izquierda a derecha antes de la toma de leche, facies de dolor o quejido..."
                  value={data.videoUrl || ""}
                  onChange={(e) => updateField("videoUrl", e.target.value)}
                />
                <p className="text-[11px] text-text-muted">
                  Describa encuadre, síntomas visibles en movimiento, duración
                  sugerida o cualquier especificación para el generador o equipo
                  de video.
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-surface border border-border-subtle text-xs text-text-muted flex items-center gap-2.5 animate-fadeIn">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold">
                  ✓
                </span>
                <span>
                  <strong>Modo automático:</strong> El video clínico se generará
                  automáticamente tomando como base los datos de anamnesis,
                  historia clínica y hallazgos registrados.
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2.3 CAMPOS ADICIONALES (OPCIONAL) */}
      <div className="p-5 rounded-2xl bg-card-bg border border-border-subtle space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <label className="text-sm font-bold text-text-main block">
              Campos Adicionales (Opcional)
            </label>
            <p className="text-xs text-text-muted mt-0.5">
              Agregue información específica no cubierta por los campos estándar
              utilizando el catálogo de campos.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddAdditionalField}
            className="btn btn-teal text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 font-semibold"
          >
            Agregar Campo Adicional
          </button>
        </div>

        {phase2Fields.length > 0 && (
          <div className="space-y-3 pt-2">
            {phase2Fields.map((field) => (
              <div
                key={field.id}
                className="p-3.5 rounded-xl bg-surface border border-border-subtle space-y-2.5"
              >
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
                  onChange={(e) =>
                    handleUpdateAdditionalField(field.id, {
                      value: e.target.value,
                    })
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
