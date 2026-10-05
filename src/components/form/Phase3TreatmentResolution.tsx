"use client";

import React, { useCallback } from "react";
import { CaseFormData, FormErrorMap, TreatmentOptionItem, CustomFieldItem } from "@/types/clinical";
import { TreatmentOptionCard } from "./subcomponents/TreatmentOptionCard";
import { CustomFieldsSection } from "./subcomponents/CustomFieldsSection";

interface Phase3TreatmentResolutionProps {
  data: CaseFormData;
  updateField: <K extends keyof CaseFormData>(
    field: K,
    value: CaseFormData[K] | ((prev: CaseFormData[K]) => CaseFormData[K])
  ) => void;
  formErrors: FormErrorMap;
  onNotify?: (msg: string) => void;
  onAddCustomField: (phase: number | "summary") => void;
  onUpdateCustomField: (id: string, updates: Partial<CustomFieldItem>) => void;
  onRemoveCustomField: (id: string) => void;
}

export interface TreatmentPreset {
  name: string;
  description: string;
  isCorrect: boolean;
  feedback: string;
}

export const FREQUENT_TREATMENTS: TreatmentPreset[] = [
  {
    name: "Hidratación Parenteral y Corrección",
    description: "Plan de hidratación parenteral endovenosa y corrección del desequilibrio ácido-base antes de cualquier intervención quirúrgica.",
    isCorrect: true,
    feedback: "Excelente conducta. La urgencia médica inicial es estabilizar el medio interno, restaurar la volemia y corregir la alcalosis metabólica.",
  },
  {
    name: "Piloromiotomía de Fredet-Ramstedt",
    description: "Piloromiotomía extramucosa longitudinal (técnica laparoscópica o abierta de Fredet-Ramstedt) tras compensación metabólica.",
    isCorrect: true,
    feedback: "Resolución quirúrgica definitiva estándar una vez lograda la normohidratación y compensación metabólica completa.",
  },
  {
    name: "Descompresión Gástrica (Sonda)",
    description: "Colocación de sonda orogástrica/nasogástrica a caída libre y suspensión total de la vía oral (ayuno).",
    isCorrect: true,
    feedback: "Medida complementaria inicial adecuada para descomprimir la cámara gástrica y evitar broncoaspiración.",
  },
  {
    name: "Pase Urgente a Quirófano sin Compensar",
    description: "Indicar cirugía inmediata de urgencia sin esperar compensación hidroelectrolítica.",
    isCorrect: false,
    feedback: "Peligro crítico: Alto riesgo de arritmias intraoperatorias, hipotensión severa y paro cardíaco por hipopotasemia y alcalosis no corregidas.",
  },
  {
    name: "Antieméticos / Proquinéticos y Alta",
    description: "Administrar metoclopramida u ondansetrón oral y enviar a domicilio con pautas de alarma.",
    isCorrect: false,
    feedback: "Error conceptual grave: No resuelve la estenosis mecánica pilórica, enmascara el cuadro y posterga la intervención crítica.",
  },
  {
    name: "Alimentación con Fórmula Hidrolizada",
    description: "Iniciar sonda transpílorica o alimentación fraccionada con fórmula hipoalergénica.",
    isCorrect: false,
    feedback: "Inadecuado: Incurre en procedimientos invasivos innecesarios sin abordar la etiología hipertrófica pilórica.",
  },
  {
    name: "Antibioticoterapia Empírica",
    description: "Iniciar ceftriaxona o ampicilina endovenosa ante presunción infecciosa.",
    isCorrect: false,
    feedback: "Inadecuado: No es un proceso infeccioso bacteriano primario, somete al neonato o lactante a toxicidad innecesaria.",
  },
];

export const DEFAULT_TREATMENT_OPTIONS: TreatmentOptionItem[] = [
  {
    id: "treatment-opt-1",
    description: "Plan de hidratación parenteral y corrección hidroelectrolítica antes de la cirugía",
    isCorrect: true,
    feedback: "Excelente conducta. En estenosis pilórica la urgencia inicial es médica para estabilizar el medio interno y corregir la alcalosis.",
    order: 1,
  },
  {
    id: "treatment-opt-2",
    description: "Indicar pase inmediato a quirófano sin hidratación previa",
    isCorrect: false,
    feedback: "Peligro crítico: Alto riesgo de arritmias intraoperatorias y paro cardíaco por alcalosis metabólica e hipopotasemia no corregidas.",
    order: 2,
  },
  {
    id: "treatment-opt-3",
    description: "Administrar inhibidores de bomba o proquinéticos y dar de alta",
    isCorrect: false,
    feedback: "Error conceptual grave: Confunde reflujo gastroesofágico fisiológico con una obstrucción pilórica mecánica requiring resolución.",
    order: 3,
  },
  {
    id: "treatment-opt-4",
    description: "Alimentar por sonda nasoyeyunal con fórmula hidrolizada",
    isCorrect: false,
    feedback: "Conducta inadecuada: No resuelve el estrechamiento hipertrófico y somete al lactante a procedimientos innecesarios.",
    order: 4,
  },
];

export const Phase3TreatmentResolution = React.memo(function Phase3TreatmentResolution({
  data,
  updateField,
  formErrors,
  onNotify,
  onAddCustomField,
  onUpdateCustomField,
  onRemoveCustomField,
}: Phase3TreatmentResolutionProps) {
  // Incorporar un preset frecuente
  const handleAddTreatmentPreset = useCallback(
    (preset: TreatmentPreset) => {
      const exists = data.treatmentOptions.some(
        (t) => t.description.toLowerCase().trim() === preset.description.toLowerCase().trim()
      );
      if (exists) {
        if (onNotify) onNotify(`"${preset.name}" ya está añadido en la lista.`);
        return;
      }

      const newOption: TreatmentOptionItem = {
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `opt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        description: preset.description,
        isCorrect: preset.isCorrect,
        feedback: preset.feedback,
        order: data.treatmentOptions.length + 1,
      };

      updateField("treatmentOptions", (prev) => [...prev, newOption]);
      if (onNotify) onNotify(`Tratamiento "${preset.name}" incorporado.`);
    },
    [data.treatmentOptions, updateField, onNotify]
  );

  // Agregar tratamiento en blanco
  const handleAddEmptyTreatment = useCallback(() => {
    updateField("treatmentOptions", (prev) => [
      ...prev,
      {
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `opt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        description: "",
        isCorrect: prev.length === 0,
        feedback: "",
        order: prev.length + 1,
      },
    ]);
  }, [updateField]);

  // Actualizar tratamiento específico
  const handleUpdateOption = useCallback(
    (index: number, updates: Partial<TreatmentOptionItem>) => {
      updateField("treatmentOptions", (prev) => {
        const next = [...prev];
        next[index] = { ...next[index], ...updates };
        return next;
      });
    },
    [updateField]
  );

  // Eliminar tratamiento
  const handleRemoveOption = useCallback(
    (index: number) => {
      updateField("treatmentOptions", (prev) => {
        const filtered = prev.filter((_, i) => i !== index);
        return filtered.map((item, idx) => ({ ...item, order: idx + 1 }));
      });
    },
    [updateField]
  );

  // Reordenar posición
  const handleMoveTreatment = useCallback(
    (index: number, direction: "up" | "down") => {
      updateField("treatmentOptions", (prev) => {
        const targetIdx = direction === "up" ? index - 1 : index + 1;
        if (targetIdx < 0 || targetIdx >= prev.length) return prev;
        const next = [...prev];
        const [moved] = next.splice(index, 1);
        next.splice(targetIdx, 0, moved);
        return next.map((item, idx) => ({ ...item, order: idx + 1 }));
      });
    },
    [updateField]
  );

  return (
    <div
      role="tabpanel"
      id="phase-panel-3"
      aria-labelledby="stepper-tab-3"
      className="space-y-6 animate-fadeIn"
    >
      {/* SECCIÓN PRINCIPAL: TRATAMIENTO Y CONDUCTAS */}
      <div className="card form-section p-5 sm:p-6 rounded-2xl shadow-sm border border-card-border bg-card-bg">
        <div className="section-header flex items-center justify-between gap-4 mb-4 pb-3.5 border-b border-border-subtle flex-wrap">
          <div className="flex items-center gap-3">
            <div className="section-num w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 shadow-sm bg-teal text-white">
              3.1
            </div>
            <div>
              <h3 className="section-title text-lg sm:text-xl font-bold text-text-main">
                Tratamiento: Conductas y Opciones Terapéuticas
              </h3>
              <p className="text-xs text-text-muted">
                Seleccione conductas habituales o agregue alternativas personalizadas para configurar la toma de decisiones clínicas.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddEmptyTreatment}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-teal bg-teal/10 hover:bg-teal/20 border border-teal/30 transition-all cursor-pointer"
          >
            <span>+ Agregar Tratamiento Personalizado</span>
          </button>
        </div>

        {/* MENÚ DE SELECCIÓN DE CONDUCTAS FRECUENTES (PRESETS) */}
        <div className="mb-6 p-4 rounded-xl bg-surface-subtle border border-border-subtle">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Conductas terapéuticas frecuentes (incorporación rápida):
            </span>
            <span className="text-[11px] text-text-muted hidden sm:inline">
              Haga clic para agregar con su prescripción y criterio
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {FREQUENT_TREATMENTS.map((preset) => {
              const isAlreadyAdded = data.treatmentOptions.some(
                (t) => t.description.toLowerCase().trim() === preset.description.toLowerCase().trim()
              );
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleAddTreatmentPreset(preset)}
                  disabled={isAlreadyAdded}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isAlreadyAdded
                      ? "bg-surface text-text-muted opacity-50 cursor-not-allowed border border-border-subtle"
                      : "bg-surface hover:bg-card-bg text-text-body hover:text-teal border border-border-subtle hover:border-teal-border shadow-xs hover:shadow-sm"
                  }`}
                  title={preset.description}
                >
                  <span className={preset.isCorrect ? "text-emerald-600 font-bold" : "text-rose-500 font-bold"}>
                    {isAlreadyAdded ? "✓" : "+"}
                  </span>
                  <span>{preset.name}</span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={handleAddEmptyTreatment}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-teal bg-teal/10 hover:bg-teal/20 border border-teal/30 transition-all cursor-pointer ml-auto"
            >
              <span>+ Otro Tratamiento en Blanco</span>
            </button>
          </div>
        </div>

        {formErrors.treatmentOptions && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
            <span className="font-bold">Aviso:</span> {formErrors.treatmentOptions}
          </div>
        )}

        {/* LISTADO DE TARJETAS DE TRATAMIENTO (MODALIDAD FASE 2 SIN IMÁGENES) */}
        {data.treatmentOptions.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border-2 border-dashed border-border-subtle bg-surface-subtle/50 text-text-muted">
            <div className="text-3xl mb-2">💊</div>
            <p className="text-sm font-semibold text-text-main mb-1">
              No hay tratamientos o conductas agregadas todavía
            </p>
            <p className="text-xs text-text-muted max-w-md mx-auto mb-4">
              Haga clic en cualquiera de las conductas terapéuticas frecuentes del menú superior o pulse &ldquo;+ Agregar Tratamiento Personalizado&rdquo;.
            </p>
            <button
              type="button"
              onClick={handleAddEmptyTreatment}
              className="btn btn-teal px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
            >
              + Agregar Primer Tratamiento
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {data.treatmentOptions.map((opt, idx) => (
              <TreatmentOptionCard
                key={opt.id || `option-${opt.order || idx}-${idx}`}
                option={opt}
                index={idx}
                totalOptions={data.treatmentOptions.length}
                canRemove={data.treatmentOptions.length > 1}
                onUpdate={handleUpdateOption}
                onRemove={handleRemoveOption}
                onMove={handleMoveTreatment}
              />
            ))}
          </div>
        )}
      </div>

      {/* BLOQUE B: CAMPOS ADICIONALES DEL DOCTOR (FASE 3) */}
      <CustomFieldsSection
        phase={3}
        customFields={data.customFields}
        onAddField={onAddCustomField}
        onUpdateField={onUpdateCustomField}
        onRemoveField={onRemoveCustomField}
        title="Campos Adicionales de Tratamiento y Resolución"
        description="Agregue pautas terapéuticas particulares, contraindicaciones específicas, ajustes posológicos o protocolos de guardia adicionales."
        badgeLabel="Fase 3"
      />
    </div>
  );
});
