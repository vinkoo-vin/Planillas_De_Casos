"use client";

import React from "react";
import { CatalogType } from "@prisma/client";
import { CaseDraft, FormErrorMap, ExamFindingDraft, AdditionalFieldDraft, ExamModality } from "@/types/clinical";
import { SelectorCatalogo } from "@/components/common/SelectorCatalogo";
import { TrashIcon } from "@/components/common/Icons";

interface Phase3ExamenFisicoProps {
  data: CaseDraft;
  errors: FormErrorMap;
  updateField: <K extends keyof CaseDraft>(field: K, value: CaseDraft[K] | ((prev: CaseDraft[K]) => CaseDraft[K])) => void;
}

export const Phase3ExamenFisico = React.memo(function Phase3ExamenFisico({
  data,
  errors,
  updateField,
}: Phase3ExamenFisicoProps) {
  const modality: ExamModality = data.examModality || "interactive";
  const findings = data.examFindings || [];
  const phase3Fields = (data.additionalFields || []).filter((f) => f.phase === 3);

  const handleAddFinding = () => {
    const newFinding: ExamFindingDraft = {
      puntoAnatomicoId: "",
      puntoAnatomicoName: "",
      hallazgo: "",
      nivelRespuestaId: "",
      nivelRespuestaName: "",
      order: findings.length + 1,
    };
    updateField("examFindings", [...findings, newFinding]);
  };

  const handleUpdateFinding = (index: number, updates: Partial<ExamFindingDraft>) => {
    updateField("examFindings", findings.map((f, i) => (i === index ? { ...f, ...updates } : f)));
  };

  const handleRemoveFinding = (index: number) => {
    updateField(
      "examFindings",
      findings.filter((_, i) => i !== index).map((f, i) => ({ ...f, order: i + 1 }))
    );
  };

  const handleAddAdditionalField = () => {
    const newField: AdditionalFieldDraft = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `f3-${Date.now()}`,
      phase: 3,
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
            3
          </span>
          <div>
            <h2 className="text-lg font-extrabold text-text-main">
              Fase 3: Exploración y Examen Físico
            </h2>
            <p className="text-xs text-text-muted">
              Configure la exploración física mediante puntos anatómicos 3D interactivos o relato narrativo clásico.
            </p>
          </div>
        </div>
      </div>

      {/* SELECTOR DE MODALIDAD */}
      <div className="p-5 rounded-2xl bg-card-bg border border-border-subtle space-y-4">
        <div>
          <label className="text-sm font-bold text-text-main block">
            Modalidad de Exploración Física
          </label>
          <p className="text-xs text-text-muted mt-0.5">
            Seleccione cómo experimentará el alumno el examen físico en el simulador.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => updateField("examModality", "interactive")}
            className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
              modality === "interactive"
                ? "border-teal bg-teal-light text-text-main shadow-xs"
                : "border-border-subtle bg-surface hover:bg-surface-subtle text-text-muted"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <strong className="text-sm font-bold text-text-main">
                Interactivo (Puntos Anatómicos 3D)
              </strong>
            </div>
            <p className="text-xs text-text-body">
              El alumno interactúa palpando puntos anatómicos específicos y recibe respuestas de dolor/hallazgos.
            </p>
          </button>

          <button
            type="button"
            onClick={() => updateField("examModality", "narrative")}
            className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
              modality === "narrative"
                ? "border-teal bg-teal-light text-text-main shadow-xs"
                : "border-border-subtle bg-surface hover:bg-surface-subtle text-text-muted"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <strong className="text-sm font-bold text-text-main">
                Narrativo (Relato Clínico Tradicional)
              </strong>
            </div>
            <p className="text-xs text-text-body">
              Un texto descriptivo integral que detalla los hallazgos al examen general y segmentario.
            </p>
          </button>
        </div>
      </div>

      {/* MODALIDAD NARRATIVA */}
      {modality === "narrative" ? (
        <div className="p-5 rounded-2xl bg-card-bg border border-border-subtle space-y-3 animate-fadeIn">
          <div>
            <label htmlFor="physicalExamNarrative" className="text-sm font-bold text-text-main flex items-center gap-2">
              <span>Relato del Examen Físico</span>
              <span className="text-rose-500 font-extrabold">*</span>
            </label>
            <p className="text-xs text-text-muted mt-0.5">
              Describa signos vitales, inspección general, palpación, auscultación y hallazgos relevantes.
            </p>
          </div>

          <textarea
            id="physicalExamNarrative"
            rows={6}
            className="w-full p-4 rounded-xl text-sm border border-border-subtle bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-teal resize-y"
            placeholder="Ej: Paciente reactivo pero irritable, levemente deshidratado con mucosas secas. Abdomen excavado en piso bajo, con peristaltismo gástrico visible en epigastrio..."
            value={data.physicalExamNarrative || ""}
            onChange={(e) => updateField("physicalExamNarrative", e.target.value)}
          />
        </div>
      ) : (
        /* MODALIDAD INTERACTIVA */
        <div className="p-5 rounded-2xl bg-card-bg border border-border-subtle space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <label className="text-sm font-bold text-text-main block">
                Hallazgos por Punto Anatómico ({findings.length})
              </label>
              <p className="text-xs text-text-muted mt-0.5">
                Defina cada zona explorada con su hallazgo semiológico y el nivel de respuesta al estímulo.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddFinding}
              className="btn btn-teal text-xs px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 font-semibold cursor-pointer shadow-xs"
            >
              <span>+</span> Agregar Punto Anatómico
            </button>
          </div>

          {findings.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-border-subtle rounded-xl text-text-muted text-xs">
              No hay puntos anatómicos configurados. Haga clic en &ldquo;+ Agregar Punto Anatómico&rdquo; para sumar zonas como epigastrio, hipocondrio, etc.
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {findings.map((f, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-surface border border-border-subtle space-y-3 relative group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-light text-teal-text">
                      Punto #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFinding(idx)}
                      className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-colors"
                      title="Eliminar este hallazgo"
                    >
                      <TrashIcon width={14} height={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-text-main block mb-1">
                        Punto / Zona Anatómica:
                      </label>
                      <SelectorCatalogo
                        catalog={CatalogType.punto_anatomico}
                        value={f.puntoAnatomicoId || null}
                        onChange={(id, item) =>
                          handleUpdateFinding(idx, {
                            puntoAnatomicoId: id,
                            puntoAnatomicoName: item?.name || null,
                          })
                        }
                        placeholder="Ej: Epigastrio, CSD..."
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-text-main block mb-1">
                        Nivel de Respuesta / Dolor:
                      </label>
                      <SelectorCatalogo
                        catalog={CatalogType.nivel_respuesta}
                        value={f.nivelRespuestaId || null}
                        onChange={(id, item) =>
                          handleUpdateFinding(idx, {
                            nivelRespuestaId: id,
                            nivelRespuestaName: item?.name || null,
                          })
                        }
                        placeholder="Ej: Indoloro, Llanto leve, Defensa..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-text-main block mb-1">
                      Hallazgo Semiológico / Signo Palpatorio:
                    </label>
                    <input
                      type="text"
                      className="w-full px-3.5 py-2 rounded-xl text-xs border border-border-subtle bg-card-bg text-text-main focus:outline-none focus:ring-1 focus:ring-teal"
                      placeholder="Ej: Palpación de masa móvil, de consistencia firme, compatible con oliva pilórica..."
                      value={f.hallazgo}
                      onChange={(e) => handleUpdateFinding(idx, { hallazgo: e.target.value })}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CAMPOS ADICIONALES (FASE 3) */}
      <div className="p-5 rounded-2xl bg-card-bg border border-border-subtle space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <label className="text-sm font-bold text-text-main block">
              Campos Adicionales de la Fase 3 (Opcional)
            </label>
            <p className="text-xs text-text-muted mt-0.5">
              Agregue datos complementarios del examen físico como Glasgow, escala analógica o monitoreo.
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

        {phase3Fields.length > 0 && (
          <div className="space-y-3 pt-2">
            {phase3Fields.map((field) => (
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
                      placeholder="Seleccione o cree el campo..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAdditionalField(field.id)}
                    className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-colors"
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
