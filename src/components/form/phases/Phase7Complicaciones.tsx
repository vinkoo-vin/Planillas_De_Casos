"use client";

import React from "react";
import { CatalogType } from "@prisma/client";
import { CaseDraft, FormErrorMap, ComplicationDraft } from "@/types/clinical";
import { SelectorCatalogo } from "@/components/common/SelectorCatalogo";
import { TrashIcon } from "@/components/common/Icons";

interface Phase7ComplicacionesProps {
  data: CaseDraft;
  errors: FormErrorMap;
  updateField: <K extends keyof CaseDraft>(field: K, value: CaseDraft[K] | ((prev: CaseDraft[K]) => CaseDraft[K])) => void;
}

export const Phase7Complicaciones = React.memo(function Phase7Complicaciones({
  data,
  errors,
  updateField,
}: Phase7ComplicacionesProps) {
  // Asegurar que complications sea un array de ComplicationDraft
  const complications: ComplicationDraft[] = Array.isArray(data.complications)
    ? data.complications
    : [];

  const handleComplicationsChange = (ids: string[], items?: { id: string; name: string }[]) => {
    const existingMap = new Map(complications.map((c) => [c.itemId, c.note]));
    const nextList: ComplicationDraft[] = (items || []).map((it) => ({
      itemId: it.id,
      itemName: it.name,
      note: existingMap.get(it.id) || "",
    }));
    updateField("complications", nextList);
  };

  const handleUpdateNote = (itemId: string, note: string) => {
    updateField(
      "complications",
      complications.map((c) => (c.itemId === itemId ? { ...c, note } : c))
    );
  };

  const handleRemoveComplication = (itemId: string) => {
    updateField(
      "complications",
      complications.filter((c) => c.itemId !== itemId)
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ENCABEZADO DE FASE */}
      <div className="phase-header p-5 rounded-2xl bg-surface-subtle border border-border-subtle">
        <div className="flex items-center gap-3 mb-1">
          <span className="w-9 h-9 rounded-xl bg-teal text-white flex items-center justify-center text-sm font-bold shadow-xs">
            7
          </span>
          <div>
            <h2 className="text-lg font-extrabold text-text-main">
              Complicaciones Posibles y Riesgos
            </h2>
            <p className="text-xs text-text-muted">
              Documente las complicaciones potenciales pre, intra y postoperatorias, con notas formativas para el alumno.
            </p>
          </div>
        </div>
      </div>

      {/* 7.1 INTRODUCCIÓN GENERAL */}
      <div className="p-5 rounded-2xl bg-card-bg border border-border-subtle space-y-3">
        <div>
          <label htmlFor="complicationsIntroText" className="text-sm font-bold text-text-main block">
            Texto Introductorio o Marco Teórico de Complicaciones:
          </label>
          <p className="text-xs text-text-muted mt-0.5">
            Explicación docente sobre los riesgos principales que el alumno debe prever al abordar este caso.
          </p>
        </div>

        <textarea
          id="complicationsIntroText"
          rows={4}
          className="w-full p-4 rounded-xl text-sm border border-border-subtle bg-surface text-text-main focus:outline-none focus:ring-2 focus:ring-teal resize-y"
          placeholder="Ej: Las complicaciones más temidas se relacionan con la descompensación metabólica no corregida antes de la anestesia general, así como los riesgos mecánicos inherentes a la piloromiotomía..."
          value={data.complicationsIntroText || ""}
          onChange={(e) => updateField("complicationsIntroText", e.target.value)}
        />
      </div>

      {/* 7.2 SELECTOR DE COMPLICACIONES */}
      <div className="p-5 rounded-2xl bg-card-bg border border-border-subtle space-y-4">
        <div>
          <label className="text-sm font-bold text-text-main block">
            Complicaciones Específicas desde Catálogo ({complications.length})
          </label>
          <p className="text-xs text-text-muted mt-0.5">
            Seleccione o agregue complicaciones al catálogo y redacte notas pedagógicas para cada una.
          </p>
        </div>

        <SelectorCatalogo
          catalog={CatalogType.complicacion}
          multiple
          value={complications.map((c) => c.itemId)}
          onChange={handleComplicationsChange}
          placeholder="Buscar o agregar complicaciones (ej. Perforación mucosa, Alcalosis grave)..."
        />

        {/* LISTA DE NOTAS POR COMPLICACIÓN */}
        {complications.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-border-subtle">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">
              Notas Docentes por Complicación:
            </span>

            {complications.map((comp) => (
              <div
                key={comp.itemId}
                className="p-3.5 rounded-xl bg-surface border border-border-subtle space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <strong className="text-xs sm:text-sm font-bold text-text-main">
                    {comp.itemName || "Complicación"}
                  </strong>
                  <button
                    type="button"
                    onClick={() => handleRemoveComplication(comp.itemId)}
                    className="p-1 text-rose-500 hover:bg-rose-500/10 rounded cursor-pointer transition-colors"
                    title="Quitar complicación"
                  >
                    <TrashIcon width={13} height={13} />
                  </button>
                </div>

                <input
                  type="text"
                  className="w-full px-3 py-1.5 rounded-lg text-xs border border-border-subtle bg-card-bg text-text-main focus:outline-none focus:ring-1 focus:ring-teal"
                  placeholder={`Añada una nota pedagógica sobre "${comp.itemName}" (ej: Incidencia < 1%, prueba de insuflación aérea)...`}
                  value={comp.note || ""}
                  onChange={(e) => handleUpdateNote(comp.itemId, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
