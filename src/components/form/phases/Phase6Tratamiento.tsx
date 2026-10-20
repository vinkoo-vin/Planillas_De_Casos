"use client";

import React from "react";
import { CatalogType } from "@prisma/client";
import { CaseDraft, FormErrorMap, SurgicalStepDraft } from "@/types/clinical";
import { SelectorCatalogo } from "@/components/common/SelectorCatalogo";
import { TrashIcon } from "@/components/common/Icons";

interface Phase6TratamientoProps {
  data: CaseDraft;
  errors: FormErrorMap;
  updateField: <K extends keyof CaseDraft>(field: K, value: CaseDraft[K] | ((prev: CaseDraft[K]) => CaseDraft[K])) => void;
}

export const Phase6Tratamiento = React.memo(function Phase6Tratamiento({
  data,
  errors,
  updateField,
}: Phase6TratamientoProps) {
  const steps = data.surgicalSteps || [];

  const handleAddStep = () => {
    const newStep: SurgicalStepDraft = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `step-${Date.now()}`,
      order: steps.length + 1,
      text: "",
    };
    updateField("surgicalSteps", [...steps, newStep]);
  };

  const handleUpdateStep = (index: number, text: string) => {
    updateField(
      "surgicalSteps",
      steps.map((s, i) => (i === index ? { ...s, text } : s))
    );
  };

  const handleRemoveStep = (index: number) => {
    updateField(
      "surgicalSteps",
      steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 }))
    );
  };

  const handleMoveStep = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;
    const copy = [...steps];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    updateField(
      "surgicalSteps",
      copy.map((s, i) => ({ ...s, order: i + 1 }))
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ENCABEZADO DE FASE */}
      <div className="phase-header p-5 rounded-2xl bg-surface-subtle border border-border-subtle">
        <div className="flex items-center gap-3 mb-1">
          <span className="w-9 h-9 rounded-xl bg-teal text-white flex items-center justify-center text-sm font-bold shadow-xs">
            6
          </span>
          <div>
            <h2 className="text-lg font-extrabold text-text-main">
              Tratamiento y Resolución Quirúrgica
            </h2>
            <p className="text-xs text-text-muted">
              Defina las indicaciones médicas pre/post y, si corresponde, el protocolo quirúrgico con sus principios técnicos.
            </p>
          </div>
        </div>
      </div>

      {/* 6.1 TRATAMIENTO MÉDICO GENERAL */}
      <div className="p-5 rounded-2xl bg-card-bg border border-border-subtle space-y-3">
        <div>
          <label htmlFor="medicalTreatmentText" className="text-sm font-bold text-text-main block">
            Tratamiento Médico / Indicaciones Generales:
          </label>
          <p className="text-xs text-text-muted mt-0.5">
            Manejo hidroelectrolítico, reposo digestivo, sonda nasogástrica, antibióticos, analgesia, etc.
          </p>
        </div>

        <textarea
          id="medicalTreatmentText"
          rows={4}
          className="w-full p-4 rounded-xl text-sm border border-border-subtle bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-teal resize-y"
          placeholder="Ej: Suspensión de vía oral, colocación de sonda orogástrica abierta a gravedad para descompresión. Rehidratación parenteral con solución fisiológica inicial y posterior aporte de potasio tras verificar diuresis..."
          value={data.medicalTreatmentText || ""}
          onChange={(e) => updateField("medicalTreatmentText", e.target.value)}
        />
      </div>

      {/* 6.2 ¿INCLUYE CIRUGÍA? */}
      <div className="p-5 rounded-2xl bg-card-bg border border-border-subtle space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <label className="text-sm font-bold text-text-main block">
              ¿El caso requiere resolución quirúrgica?
            </label>
            <p className="text-xs text-text-muted mt-0.5">
              Active si el paciente es candidato a intervención quirúrgica o procedimiento intervencionista.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={Boolean(data.includesSurgery)}
              onChange={(e) => updateField("includesSurgery", e.target.checked)}
            />
            <div className="w-11 h-6 bg-surface-subtle peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal border border-border-subtle"></div>
          </label>
        </div>

        {data.includesSurgery && (
          <div className="pt-4 border-t border-border-subtle space-y-5 animate-fadeIn">
            {/* TÉCNICA QUIRÚRGICA */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-main block">
                Técnica Quirúrgica Principal:
              </label>
              <SelectorCatalogo
                catalog={CatalogType.tecnica_quirurgica}
                value={data.surgicalTechniqueId || null}
                onChange={(id, item) => {
                  updateField("surgicalTechniqueId", id);
                  updateField("surgicalTechniqueName", item?.name || null);
                }}
                placeholder="Seleccione o cree técnica (ej. Piloromiotomía de Fredet-Ramstedt)..."
              />
            </div>

            {/* NOTAS DE TÉCNICA */}
            <div className="space-y-1">
              <label htmlFor="surgicalNote" className="text-xs font-bold text-text-main block">
                Nota o Aclaración sobre la Técnica:
              </label>
              <input
                id="surgicalNote"
                type="text"
                className="w-full px-3.5 py-2 rounded-xl text-xs border border-border-subtle bg-surface text-text-main focus:outline-none focus:ring-1 focus:ring-teal"
                placeholder="Ej: Incisión seromuscular longitudinal sin apertura de mucosa..."
                value={data.surgicalNote || ""}
                onChange={(e) => updateField("surgicalNote", e.target.value)}
              />
            </div>

            {/* ABORDAJES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="openApproach" className="text-xs font-bold text-text-main block">
                  Abordaje Abierto / Tradicional:
                </label>
                <input
                  id="openApproach"
                  type="text"
                  className="w-full px-3.5 py-2 rounded-xl text-xs border border-border-subtle bg-surface text-text-main focus:outline-none focus:ring-1 focus:ring-teal"
                  placeholder="Ej: Laparotomía transversa supraumbilical de Robertson..."
                  value={data.openApproach || ""}
                  onChange={(e) => updateField("openApproach", e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="minimInvasiveApproach" className="text-xs font-bold text-text-main block">
                  Abordaje Mini-invasivo / Laparoscópico:
                </label>
                <input
                  id="minimInvasiveApproach"
                  type="text"
                  className="w-full px-3.5 py-2 rounded-xl text-xs border border-border-subtle bg-surface text-text-main focus:outline-none focus:ring-1 focus:ring-teal"
                  placeholder="Ej: Laparoscopía transumbilical con instrumental de 3 mm..."
                  value={data.minimInvasiveApproach || ""}
                  onChange={(e) => updateField("minimInvasiveApproach", e.target.value)}
                />
              </div>
            </div>

            {/* PASOS Y PRINCIPIOS TÉCNICOS */}
            <div className="space-y-3 pt-3 border-t border-border-subtle">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <label className="text-xs font-bold text-text-main block">
                    Principios Técnicos y Pasos Quirúrgicos ({steps.length})
                  </label>
                  <p className="text-[11px] text-text-muted">
                    Secuencia pedagógica de la intervención para guiar al alumno.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddStep}
                  className="btn btn-teal text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1 font-semibold cursor-pointer shadow-xs"
                >
                  <span>+</span> Agregar Paso
                </button>
              </div>

              {steps.length === 0 ? (
                <div className="p-4 text-center border border-dashed border-border-subtle rounded-xl text-text-muted text-xs">
                  Sin pasos técnicos registrados. Haga clic en &ldquo;+ Agregar Paso&rdquo; para detallar la secuencia operatoria.
                </div>
              ) : (
                <div className="space-y-2">
                  {steps.map((step, idx) => (
                    <div
                      key={step.id || idx}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-surface border border-border-subtle"
                    >
                      <span className="w-6 h-6 rounded-full bg-teal-light text-teal-text flex items-center justify-center text-xs font-bold shrink-0">
                        {idx + 1}
                      </span>

                      <input
                        type="text"
                        className="flex-1 px-3 py-1.5 rounded-lg text-xs border border-border-subtle bg-card-bg text-text-main focus:outline-none focus:ring-1 focus:ring-teal"
                        placeholder={`Describa el paso #${idx + 1}...`}
                        value={step.text}
                        onChange={(e) => handleUpdateStep(idx, e.target.value)}
                      />

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveStep(idx, "up")}
                          className="p-1 text-text-muted hover:text-text-main disabled:opacity-30 cursor-pointer"
                          title="Subir paso"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          disabled={idx === steps.length - 1}
                          onClick={() => handleMoveStep(idx, "down")}
                          className="p-1 text-text-muted hover:text-text-main disabled:opacity-30 cursor-pointer"
                          title="Bajar paso"
                        >
                          ▼
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(idx)}
                          className="p-1 text-rose-500 hover:bg-rose-500/10 rounded cursor-pointer"
                          title="Eliminar paso"
                        >
                          <TrashIcon width={13} height={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
