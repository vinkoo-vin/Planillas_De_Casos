"use client";

import React, { useState, useCallback } from "react";
import { CheckIcon } from "@/components/common/Icons";

interface KeywordsSectionProps {
  keywordsPool: string[];
  selectedKeywords: Set<string>;
  onToggleKeyword: (kw: string) => void;
  onAddCustomKeyword: (kw: string) => void;
}

export const KeywordsSection = React.memo(function KeywordsSection({
  keywordsPool,
  selectedKeywords,
  onToggleKeyword,
  onAddCustomKeyword,
}: KeywordsSectionProps) {
  const [newKeywordInput, setNewKeywordInput] = useState("");

  const handleAdd = useCallback(() => {
    const val = newKeywordInput.trim();
    if (!val) return;
    onAddCustomKeyword(val);
    setNewKeywordInput("");
  }, [newKeywordInput, onAddCustomKeyword]);

  return (
    <div className="card form-section p-6 rounded-2xl mb-6 shadow-sm border border-card-border bg-card-bg">
      <div className="section-header flex items-center gap-3.5 mb-5 pb-3.5 border-b border-border-subtle">
        <div className="section-num w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-sm shrink-0 shadow-sm">
          2
        </div>
        <h3 className="section-title text-xl font-bold text-text-main">Palabras Clave del Caso</h3>
      </div>

      <div className="form-group mb-4">
        <label className="block text-sm font-semibold text-text-main mb-2">
          Seleccione las palabras clave de su catálogo o añada nuevas:
        </label>
        <div className="tags-container flex flex-wrap gap-2 mb-3.5">
          {keywordsPool.map((kw) => {
            const isSelected = selectedKeywords.has(kw);
            return (
              <button
                type="button"
                key={kw}
                className={`tag-chip inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium cursor-pointer transition-all ${
                  isSelected ? "active font-bold" : ""
                }`}
                onClick={() => onToggleKeyword(kw)}
              >
                {isSelected ? (
                  <CheckIcon width={12} height={12} />
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                )}
                {kw}
              </button>
            );
          })}
        </div>

        <div className="add-tag-box flex gap-2.5 max-w-lg">
          <input
            type="text"
            className="flex-1 px-3.5 py-2.5 rounded-xl text-sm"
            placeholder="Escribe una nueva palabra clave..."
            value={newKeywordInput}
            onChange={(e) => setNewKeywordInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
          <button
            type="button"
            className="btn btn-secondary px-4 py-2.5 rounded-xl text-sm font-semibold"
            onClick={handleAdd}
          >
            + Agregar Palabra
          </button>
        </div>
      </div>
    </div>
  );
});
