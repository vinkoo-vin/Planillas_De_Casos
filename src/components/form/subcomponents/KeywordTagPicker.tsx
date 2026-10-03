"use client";

import React, { useState, useMemo, useCallback } from "react";
import { CloseIcon } from "@/components/common/Icons";

interface KeywordTagPickerProps {
  selectedKeywords: string[];
  keywordsPool: string[];
  onToggleKeyword: (kw: string) => void;
  onAddCustomKeyword: (kw: string) => void;
}

export const KeywordTagPicker = React.memo(function KeywordTagPicker({
  selectedKeywords,
  keywordsPool,
  onToggleKeyword,
  onAddCustomKeyword,
}: KeywordTagPickerProps) {
  const [tagInput, setTagInput] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const trimmed = tagInput.trim();
      if (trimmed) {
        onAddCustomKeyword(trimmed);
        setTagInput("");
      }
    }
  };

  const handleAddFromInput = useCallback(() => {
    const trimmed = tagInput.trim();
    if (trimmed) {
      onAddCustomKeyword(trimmed);
      setTagInput("");
    }
  }, [tagInput, onAddCustomKeyword]);

  // Sugerencias no seleccionadas del pool
  const unselectedPool = useMemo(() => {
    const selectedSet = new Set(selectedKeywords);
    return keywordsPool.filter((k) => !selectedSet.has(k)).slice(0, 10);
  }, [keywordsPool, selectedKeywords]);

  return (
    <div className="card form-section p-5 sm:p-6 rounded-2xl shadow-sm border border-card-border bg-card-bg">
      <div className="section-header flex items-center justify-between gap-4 mb-4 pb-3.5 border-b border-border-subtle flex-wrap">
        <div className="flex items-center gap-3">
          <div className="section-num w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-sm shrink-0 shadow-sm bg-teal text-white">
            4.2
          </div>
          <div>
            <h3 className="section-title text-lg sm:text-xl font-bold text-text-main">
              Palabras Clave (Indexación y Filtro)
            </h3>
            <p className="text-xs text-text-muted">
              Indexe el caso para que sea localizable por especialidad, síntoma o técnica diagnóstica.
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-light text-teal-text border border-teal-border">
          {selectedKeywords.length} {selectedKeywords.length === 1 ? "etiqueta seleccionada" : "etiquetas seleccionadas"}
        </span>
      </div>

      {/* INPUT INTELIGENTE DE ETIQUETAS */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escriba una etiqueta y presione Enter (ej: Pediatría, Ecografía, Alcalosis)..."
          aria-label="Nueva palabra clave"
          className="flex-1 px-3.5 py-2.5 rounded-xl text-sm border border-input-border focus:border-teal focus:ring-1 focus:ring-teal/30 outline-none"
        />
        <button
          type="button"
          onClick={handleAddFromInput}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-teal text-white hover:bg-teal/90 transition-all cursor-pointer shrink-0"
        >
          + Agregar Tag
        </button>
      </div>

      {/* CHIPS SELECCIONADOS */}
      {selectedKeywords.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 p-3 rounded-xl bg-surface border border-border-subtle">
          {selectedKeywords.map((kw) => (
            <span
              key={kw}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal text-white shadow-xs"
            >
              <span>{kw}</span>
              <button
                type="button"
                onClick={() => onToggleKeyword(kw)}
                className="hover:bg-black/20 rounded-full p-0.5 cursor-pointer"
                title={`Quitar ${kw}`}
                aria-label={`Quitar etiqueta ${kw}`}
              >
                <CloseIcon width={12} height={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* SUGERENCIAS DEL CATÁLOGO */}
      {unselectedPool.length > 0 && (
        <div>
          <div className="text-xs font-medium text-text-muted mb-2">
            Sugerencias del catálogo institucional (clic para sumar):
          </div>
          <div className="flex flex-wrap gap-1.5">
            {unselectedPool.map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => onToggleKeyword(kw)}
                className="text-xs px-2.5 py-1 rounded-lg border border-border-subtle bg-surface-subtle hover:bg-teal-light text-text-body hover:text-teal-text hover:border-teal-border transition-colors cursor-pointer"
              >
                + {kw}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
