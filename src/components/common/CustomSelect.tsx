"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { CheckIcon } from "./Icons";

export interface CustomSelectOption {
  value: string;
  label: string;
  subtitle?: string;
  badge?: string;
}

export interface CustomSelectAction {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

interface CustomSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  actionOption?: CustomSelectAction;
  icon?: React.ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CustomSelect({
  id,
  value,
  onChange,
  options,
  placeholder = "Seleccionar de la lista...",
  actionOption,
  icon,
  searchable = true,
  searchPlaceholder = "Buscar en la lista...",
  disabled = false,
  className = "",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const autoId = useId();
  const selectId = id || autoId;

  // Encontrar opción seleccionada
  const selectedOption = options.find((opt) => opt.value === value);
  const isActionSelected = actionOption && actionOption.value === value;

  // Filtrado de opciones por búsqueda
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (opt.subtitle && opt.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Enfocar el input de búsqueda automáticamente al abrir
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  function handleToggleOpen() {
    if (disabled) return;
    if (!isOpen) {
      setHighlightedIndex(-1);
    }
    setIsOpen((prev) => !prev);
  }

  // Manejador de teclado
  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex(-1);
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setSearchQuery("");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const totalItems = filteredOptions.length + (actionOption ? 1 : 0);
      setHighlightedIndex((prev) => (prev + 1) % totalItems);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const totalItems = filteredOptions.length + (actionOption ? 1 : 0);
      setHighlightedIndex((prev) => (prev <= 0 ? totalItems - 1 : prev - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        selectItem(filteredOptions[highlightedIndex].value);
      } else if (actionOption && highlightedIndex === filteredOptions.length) {
        selectItem(actionOption.value);
      }
    }
  }

  function selectItem(val: string) {
    onChange(val);
    setIsOpen(false);
    setSearchQuery("");
  }

  return (
    <div
      ref={containerRef}
      className={`relative select-none ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* BOTÓN TRIGGER */}
      <button
        type="button"
        id={selectId}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={`${selectId}-listbox`}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={handleToggleOpen}
        className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-left text-sm font-medium transition-all duration-200 outline-none
          ${value && value !== "" ? "pr-16" : "pr-10"}
          ${isOpen
            ? "border-[1.5px] border-[var(--teal)] shadow-[var(--shadow-inset-sm),0_0_0_3px_var(--primary-light)] bg-[var(--card-bg)]"
            : "border-[1.5px] border-[var(--border-subtle)] hover:border-[var(--card-border)] bg-[var(--surface-subtle)] hover:bg-[var(--surface-hover)] shadow-[var(--shadow-inset-sm)]"
          }
          ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {icon && (
            <span className={`shrink-0 transition-colors ${isOpen ? "text-[var(--teal-text)]" : "text-[var(--text-muted)]"}`}>
              {icon}
            </span>
          )}

          <div className="truncate">
            {isActionSelected && actionOption ? (
              <span className="font-semibold text-[var(--teal-text)] flex items-center gap-1.5">
                <span>{actionOption.icon || "+"}</span>
                <span>{actionOption.label}</span>
              </span>
            ) : selectedOption ? (
              <span className="text-[var(--text-main)] font-medium">
                {selectedOption.label}
              </span>
            ) : (
              <span className="text-[var(--text-muted)]">
                {placeholder}
              </span>
            )}
          </div>
        </div>

        {/* CHEVRON DERECHA */}
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-[var(--text-muted)] transition-transform duration-200 ${isOpen ? "rotate-180 text-[var(--teal-text)]" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {/* BOTÓN LIMPIAR SELECCIÓN (HERMANO, FUERA DEL TRIGGER BUTTON) */}
      {value && value !== "" && !disabled && (
        <button
          type="button"
          aria-label="Limpiar selección"
          title="Limpiar selección"
          onClick={(e) => {
            e.stopPropagation();
            selectItem("");
          }}
          className="absolute right-9 top-1/2 -translate-y-1/2 p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer flex items-center justify-center min-w-[24px] min-h-[24px] z-10"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}

      {/* MENÚ DESPLEGABLE ELEVADO */}
      {isOpen && (
        <div
          id={`${selectId}-listbox`}
          role="listbox"
          tabIndex={-1}
          className="absolute z-50 top-full left-0 right-0 mt-1.5 rounded-2xl border-[1.5px] border-[var(--card-border)] bg-[var(--card-bg)] shadow-[var(--shadow-extruded-lg),0_16px_40px_-6px_rgba(0,0,0,0.22)] backdrop-blur-xl overflow-hidden animate-scaleUp"
        >
          {/* BUSCADOR INTEGRADO */}
          {searchable && (
            <div className="p-2 border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)]">
              <div className="relative flex items-center">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="absolute left-3 text-[var(--text-muted)] pointer-events-none"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>

                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm rounded-xl border border-[var(--border-subtle)] bg-[var(--input-bg)] text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--teal)] transition-all"
                  onClick={(e) => e.stopPropagation()}
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 p-0.5 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* LISTA SCROLLABLE DE OPCIONES */}
          <div ref={listRef} className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="py-6 px-4 text-center text-xs sm:text-sm text-[var(--text-muted)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-1.5 opacity-60">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span>No se encontraron estudios coincidentes</span>
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = opt.value === value;
                const isHighlighted = idx === highlightedIndex;

                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => selectItem(opt.value)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`group flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm cursor-pointer transition-all duration-150
                      ${isSelected
                        ? "bg-[var(--primary-light)] text-[var(--teal-text)] font-semibold shadow-xs"
                        : isHighlighted
                          ? "bg-[var(--surface-hover)] text-[var(--text-main)]"
                          : "text-[var(--text-main)] hover:bg-[var(--surface-hover)]"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span
                        className={`w-1.5 h-1.5 rounded-full transition-all shrink-0 ${
                          isSelected
                            ? "bg-[var(--teal)] scale-125"
                            : "bg-[var(--border-subtle)] group-hover:bg-[var(--teal)]"
                        }`}
                      />
                      <div className="truncate">
                        <span className="block truncate">{opt.label}</span>
                        {opt.subtitle && (
                          <span className="block text-[11px] text-[var(--text-muted)] truncate font-normal">
                            {opt.subtitle}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {opt.badge && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && (
                        <span className="text-[var(--teal-text)] flex items-center">
                          <CheckIcon width={16} height={16} />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ACCIÓN FOOTER DESTACADA (+ CREAR NUEVO ESTUDIO...) */}
          {actionOption && (
            <div className="border-t border-[var(--border-subtle)] p-1.5 bg-[var(--surface-subtle)]">
              <div
                role="option"
                aria-selected={isActionSelected}
                onClick={() => selectItem(actionOption.value)}
                onMouseEnter={() => setHighlightedIndex(filteredOptions.length)}
                className={`flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-150
                  ${isActionSelected || highlightedIndex === filteredOptions.length
                    ? "bg-[var(--teal)] text-[var(--teal-fg,#ffffff)] shadow-md"
                    : "text-[var(--teal-text)] hover:bg-[var(--teal-light)]"
                  }
                `}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-lg flex items-center justify-center bg-white/20 shrink-0">
                    {actionOption.icon || (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    )}
                  </span>
                  <div className="truncate">
                    <span>{actionOption.label}</span>
                    {actionOption.description && (
                      <span className="block text-[11px] opacity-80 font-normal truncate">
                        {actionOption.description}
                      </span>
                    )}
                  </div>
                </div>

                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
