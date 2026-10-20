"use client";

import React from "react";
import { CatalogType } from "@prisma/client";
import { CaseDraft, FormErrorMap, DiagnosisDraft } from "@/types/clinical";
import { SelectorCatalogo } from "@/components/common/SelectorCatalogo";
import { TrashIcon } from "@/components/common/Icons";

interface Phase5DiagnosticoDiferencialProps {
  data: CaseDraft;
  errors: FormErrorMap;
  updateField: <K extends keyof CaseDraft>(field: K, value: CaseDraft[K] | ((prev: CaseDraft[K]) => CaseDraft[K])) => void;
}

export const Phase5DiagnosticoDiferencial = React.memo(function Phase5DiagnosticoDiferencial({
  data,
  errors,
  updateField,
}: Phase5DiagnosticoDiferencialProps) {
  const diagnoses = data.diagnoses || [];

  const handleAddDiagnosis = () => {
    if (diagnoses.length >= 5) return;
    const isFirst = diagnoses.length === 0;
    const newDiag: DiagnosisDraft = {
      itemId: "",
      itemName: "",
      order: diagnoses.length + 1,
      isCorrect: isFirst, // El primero por defecto es correcto si no hay ninguno
    };
    updateField("diagnoses", [...diagnoses, newDiag]);
  };

  const handleUpdateDiagnosis = (index: number, updates: Partial<DiagnosisDraft>) => {
    updateField(
      "diagnoses",
      diagnoses.map((d, i) => (i === index ? { ...d, ...updates } : d))
    );
  };

  const handleSetCorrect = (index: number) => {
    updateField(
      "diagnoses",
      diagnoses.map((d, i) => ({ ...d, isCorrect: i === index }))
    );
  };

  const handleRemoveDiagnosis = (index: number) => {
    const updated = diagnoses.filter((_, i) => i !== index).map((d, i) => ({ ...d, order: i + 1 }));
    // Si eliminó el correcto y quedan otros, marcar el primero como correcto
    const hasCorrect = updated.some((d) => d.isCorrect);
    if (!hasCorrect && updated.length > 0) {
      updated[0].isCorrect = true;
    }
    updateField("diagnoses", updated);
  };

  const hasCorrectSelected = diagnoses.some((d) => d.isCorrect && Boolean(d.itemId));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ENCABEZADO DE FASE */}
      <div className="phase-header p-5 rounded-2xl bg-surface-subtle border border-border-subtle">
        <div className="flex items-center gap-3 mb-1">
          <span className="w-9 h-9 rounded-xl bg-teal text-white flex items-center justify-center text-sm font-bold shadow-xs">
            5
          </span>
          <div>
            <h2 className="text-lg font-extrabold text-text-main">
              Diagnóstico Diferencial
            </h2>
            <p className="text-xs text-text-muted">
              Configure hasta 5 opciones diagnósticas para el simulador y señale cuál es el diagnóstico correcto.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-card-bg border border-border-subtle space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <label className="text-sm font-bold text-text-main block">
              Opciones Diagnósticas ({diagnoses.length} de 5)
            </label>
            <p className="text-xs text-text-muted mt-0.5">
              Marque con el radio button cuál de los diagnósticos es el <strong>verdadero y correcto</strong>.
            </p>
          </div>

          {diagnoses.length < 5 && (
            <button
              type="button"
              onClick={handleAddDiagnosis}
              className="btn btn-teal text-xs px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 font-semibold cursor-pointer shadow-xs"
            >
              Agregar Opción Diagnóstica
            </button>
          )}
        </div>

        {diagnoses.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-border-subtle rounded-xl text-text-muted text-xs">
            No ha agregado diagnósticos diferenciales. Agregue entre 1 y 5 opciones desde el catálogo.
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {diagnoses.map((diag, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all ${
                  diag.isCorrect
                    ? "border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-950/20 shadow-xs"
                    : "border-border-subtle bg-surface"
                }`}
              >
                <div className="flex items-center gap-3 flex-wrap">
                  {/* SELECTOR RADIO CORRECTO */}
                  <label
                    className="flex items-center gap-2 cursor-pointer select-none"
                    title="Marcar como diagnóstico correcto"
                  >
                    <input
                      type="radio"
                      name="correctDiagnosis"
                      checked={diag.isCorrect}
                      onChange={() => handleSetCorrect(idx)}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        diag.isCorrect
                          ? "bg-emerald-600 text-white"
                          : "bg-surface-subtle text-text-muted border border-border-subtle"
                      }`}
                    >
                      {diag.isCorrect ? "✓ Correcto" : `Opción #${idx + 1}`}
                    </span>
                  </label>

                  {/* SELECTOR DE CATÁLOGO */}
                  <div className="flex-1 min-w-[220px]">
                    <SelectorCatalogo
                      catalog={CatalogType.diagnostico}
                      value={diag.itemId || null}
                      onChange={(id, item) =>
                        handleUpdateDiagnosis(idx, {
                          itemId: id,
                          itemName: item?.name || "",
                        })
                      }
                      placeholder="Seleccione o cree diagnóstico..."
                    />
                  </div>

                  {/* BOTÓN ELIMINAR */}
                  <button
                    type="button"
                    onClick={() => handleRemoveDiagnosis(idx)}
                    className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-colors"
                    title="Eliminar opción"
                  >
                    <TrashIcon width={14} height={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {diagnoses.length > 0 && !hasCorrectSelected && (
          <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
            Recuerde seleccionar cuál de los diagnósticos cargados es el correcto.
          </p>
        )}
      </div>
    </div>
  );
});
