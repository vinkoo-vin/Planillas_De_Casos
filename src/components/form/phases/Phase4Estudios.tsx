"use client";

import React, { useEffect } from "react";
import { CatalogType } from "@prisma/client";
import { CaseDraft, FormErrorMap, StudyItemDraft } from "@/types/clinical";
import { useCatalog } from "@/lib/use-catalog";

interface Phase4EstudiosProps {
  data: CaseDraft;
  errors: FormErrorMap;
  updateField: <K extends keyof CaseDraft>(field: K, value: CaseDraft[K] | ((prev: CaseDraft[K]) => CaseDraft[K])) => void;
}

export const Phase4Estudios = React.memo(function Phase4Estudios({
  data,
  errors,
  updateField,
}: Phase4EstudiosProps) {
  const { items: studyTypes, loading } = useCatalog(CatalogType.tipo_estudio);
  const currentStudies = data.studies || [];

  // Asegurar que cada tipo_estudio tenga su entrada en studies
  useEffect(() => {
    if (loading || studyTypes.length === 0) return;

    const existingMap = new Map(currentStudies.map((s) => [s.studyTypeId, s]));
    let hasChanges = false;

    const initialized: StudyItemDraft[] = studyTypes.map((t) => {
      if (existingMap.has(t.id)) {
        return existingMap.get(t.id)!;
      }
      hasChanges = true;
      return {
        studyTypeId: t.id,
        studyTypeName: t.name,
        performed: false,
        findingsText: "",
      };
    });

    if (hasChanges && currentStudies.length < studyTypes.length) {
      updateField("studies", initialized);
    }
  }, [studyTypes, loading, currentStudies, updateField]);

  const handleTogglePerformed = (typeId: string, typeName: string, performed: boolean) => {
    updateField("studies", (prev = []) => {
      const idx = prev.findIndex((s) => s.studyTypeId === typeId);
      if (idx >= 0) {
        return prev.map((s, i) => (i === idx ? { ...s, performed } : s));
      }
      return [...prev, { studyTypeId: typeId, studyTypeName: typeName, performed, findingsText: "" }];
    });
  };

  const handleUpdateFindings = (typeId: string, findingsText: string) => {
    updateField("studies", (prev = []) =>
      prev.map((s) => (s.studyTypeId === typeId ? { ...s, findingsText } : s))
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ENCABEZADO DE FASE */}
      <div className="phase-header p-5 rounded-2xl bg-surface-subtle border border-border-subtle">
        <div className="flex items-center gap-3 mb-1">
          <span className="w-9 h-9 rounded-xl bg-teal text-white flex items-center justify-center text-sm font-bold shadow-xs">
            4
          </span>
          <div>
            <h2 className="text-lg font-extrabold text-text-main">
              Fase 4: Estudios Complementarios e Imágenes
            </h2>
            <p className="text-xs text-text-muted">
              Configure qué estudios se solicitaron en este caso, cuáles arrojaron resultados y sus hallazgos médicos.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-text-muted">
          <div className="animate-spin w-8 h-8 border-3 border-teal border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-xs font-semibold">Cargando catálogo de tipos de estudio...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {studyTypes.map((st) => {
            const entry = currentStudies.find((s) => s.studyTypeId === st.id) || {
              studyTypeId: st.id,
              studyTypeName: st.name,
              performed: false,
              findingsText: "",
            };

            return (
              <div
                key={st.id}
                className={`p-5 rounded-2xl border transition-all ${
                  entry.performed
                    ? "border-teal/50 bg-card-bg shadow-sm"
                    : "border-border-subtle bg-surface-subtle/50 opacity-80 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-teal border border-border-subtle shrink-0">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-text-main">{st.name}</h4>
                      <span className="text-[11px] text-text-muted">
                        {entry.performed ? "Estudio realizado y solicitado" : "No realizado en este caso"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-text-main">
                      {entry.performed ? "Realizado" : "No Realizado"}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={entry.performed}
                        onChange={(e) => handleTogglePerformed(st.id, st.name, e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-surface-subtle peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal border border-border-subtle"></div>
                    </label>
                  </div>
                </div>

                {/* SI ESTÁ REALIZADO, MOSTRAR CAMPO DE HALLAZGO */}
                {entry.performed && (
                  <div className="mt-4 pt-4 border-t border-border-subtle space-y-2 animate-fadeIn">
                    <label className="text-xs font-bold text-text-main block">
                      Informe / Hallazgos para el Alumno:
                    </label>
                    <textarea
                      rows={3}
                      className="w-full p-3 rounded-xl text-xs border border-border-subtle bg-surface text-text-main focus:outline-none focus:ring-1 focus:ring-teal resize-y"
                      placeholder={`Describa el informe del estudio (${st.name}). Ej: Diámetro pilórico aumentado, grosor del músculo > 4mm, signo del doble riel...`}
                      value={entry.findingsText || ""}
                      onChange={(e) => handleUpdateFindings(st.id, e.target.value)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
