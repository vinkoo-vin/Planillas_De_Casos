"use client";

import React, { useState, useRef, useEffect, useId, useMemo } from "react";
import { CatalogType, CatalogItem } from "@prisma/client";
import { useCatalog } from "@/lib/use-catalog";
import { normalizar, normalizarClave } from "@/lib/normalizar";
import { CheckIcon } from "./Icons";

export interface SelectorCatalogoSingleProps {
  catalog: CatalogType;
  multiple?: false;
  value: string | null;
  onChange: (value: string, item?: CatalogItem) => void;
  placeholder?: string;
  label?: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
  allowCreate?: boolean;
  excludedIds?: string[];
  className?: string;
  id?: string;
}

export interface SelectorCatalogoMultipleProps {
  catalog: CatalogType;
  multiple: true;
  value: string[];
  onChange: (value: string[], items?: CatalogItem[]) => void;
  placeholder?: string;
  label?: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
  allowCreate?: boolean;
  maxItems?: number;
  excludedIds?: string[];
  className?: string;
  id?: string;
}

export type SelectorCatalogoProps =
  | SelectorCatalogoSingleProps
  | SelectorCatalogoMultipleProps;

export function SelectorCatalogo(props: SelectorCatalogoProps) {
  const {
    catalog,
    multiple = false,
    placeholder = "Buscar o seleccionar...",
    label,
    description,
    disabled = false,
    required = false,
    allowCreate = catalog !== CatalogType.tipo_estudio,
    excludedIds = [],
    className = "",
    id,
  } = props;

  const autoId = useId();
  const selectId = id || autoId;

  const { items, loading, createItem } = useCatalog(catalog);

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    text: string;
    type: "info" | "success" | "warning";
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Mapear elementos seleccionados
  const selectedItems = useMemo(() => {
    if (multiple) {
      const ids = (props.value as string[]) || [];
      return ids
        .map((id) => items.find((it) => it.id === id))
        .filter((it): it is CatalogItem => Boolean(it));
    } else {
      const singleId = props.value as string | null;
      if (!singleId) return [];
      const item = items.find((it) => it.id === singleId);
      return item ? [item] : [];
    }
  }, [items, multiple, props.value]);

  const singleSelectedItem = !multiple && selectedItems.length > 0 ? selectedItems[0] : null;

  // Filtrado de opciones disponibles excluyendo los IDs explícitos
  const availableItems = useMemo(() => {
    const excludedSet = new Set(excludedIds);
    return items.filter((it) => !excludedSet.has(it.id));
  }, [items, excludedIds]);

  // Filtrado por texto en tiempo real
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return availableItems;
    const qKey = normalizarClave(q);
    return availableItems.filter((it) => {
      return (
        it.name.toLowerCase().includes(q.toLowerCase()) ||
        (qKey && it.key.includes(qKey))
      );
    });
  }, [availableItems, searchQuery]);

  // Chequeo si la búsqueda actual coincide exactamente con algún elemento existente
  const exactMatch = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return null;
    const norm = normalizar(q);
    if (!norm) return null;
    return availableItems.find((it) => it.key === norm.clave) ?? null;
  }, [availableItems, searchQuery]);

  // Normalización sugerida para crear
  const normalizedCandidate = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return normalizar(searchQuery.trim());
  }, [searchQuery]);

  const canShowCreate =
    allowCreate &&
    Boolean(normalizedCandidate) &&
    !exactMatch &&
    !loading;

  // Feedback automático tras 3.5 segundos
  useEffect(() => {
    if (feedbackMsg) {
      const timer = setTimeout(() => setFeedbackMsg(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [feedbackMsg]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Foco en el input al abrir
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  function handleSelect(item: CatalogItem) {
    if (disabled) return;

    if (multiple) {
      const currentIds = (props.value as string[]) || [];
      const max = (props as SelectorCatalogoMultipleProps).maxItems;
      if (currentIds.includes(item.id)) {
        // Remover si ya está seleccionado
        const updated = currentIds.filter((id) => id !== item.id);
        const updatedItems = selectedItems.filter((it) => it.id !== item.id);
        (props as SelectorCatalogoMultipleProps).onChange(updated, updatedItems);
      } else {
        if (max && currentIds.length >= max) {
          setFeedbackMsg({
            text: `Solo puedes seleccionar hasta ${max} elementos`,
            type: "warning",
          });
          return;
        }
        const updated = [...currentIds, item.id];
        const updatedItems = [...selectedItems, item];
        (props as SelectorCatalogoMultipleProps).onChange(updated, updatedItems);
      }
      setSearchQuery("");
    } else {
      (props as SelectorCatalogoSingleProps).onChange(item.id, item);
      setIsOpen(false);
      setSearchQuery("");
    }
  }

  function handleRemoveItem(itemId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (disabled) return;
    if (multiple) {
      const currentIds = (props.value as string[]) || [];
      const updated = currentIds.filter((id) => id !== itemId);
      const updatedItems = selectedItems.filter((it) => it.id !== itemId);
      (props as SelectorCatalogoMultipleProps).onChange(updated, updatedItems);
    }
  }

  function handleClearSingle(e: React.MouseEvent) {
    e.stopPropagation();
    if (disabled) return;
    if (!multiple) {
      (props as SelectorCatalogoSingleProps).onChange("");
    }
  }

  async function handleCreateNew() {
    if (!normalizedCandidate || isSubmitting || disabled) return;
    try {
      setIsSubmitting(true);
      const result = await createItem(normalizedCandidate.nombre, "caso");

      if (!result.creado) {
        setFeedbackMsg({
          text: `«${result.item.name}» ya existía en el catálogo y fue seleccionado`,
          type: "info",
        });
      } else {
        setFeedbackMsg({
          text: `«${result.item.name}» agregado al catálogo`,
          type: "success",
        });
      }

      handleSelect(result.item);
      setSearchQuery("");
    } catch (err: any) {
      setFeedbackMsg({
        text: err?.message || "No se pudo registrar el nuevo elemento",
        type: "warning",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Navegación por teclado
  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;

    const totalOptions = filteredItems.length + (canShowCreate ? 1 : 0);

    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setSearchQuery("");
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % totalOptions);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + totalOptions) % totalOptions);
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredItems.length) {
        handleSelect(filteredItems[highlightedIndex]);
      } else if (canShowCreate && highlightedIndex === filteredItems.length) {
        handleCreateNew();
      } else if (canShowCreate && filteredItems.length === 0) {
        handleCreateNew();
      }
      return;
    }

    if (
      multiple &&
      e.key === "Backspace" &&
      !searchQuery &&
      selectedItems.length > 0
    ) {
      const last = selectedItems[selectedItems.length - 1];
      if (last) {
        const currentIds = (props.value as string[]) || [];
        const updated = currentIds.filter((id) => id !== last.id);
        (props as SelectorCatalogoMultipleProps).onChange(updated);
      }
    }
  }

  return (
    <div className={`relative flex flex-col gap-1.5 ${className}`} ref={containerRef}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-semibold text-text-main flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-danger ml-0.5">*</span>}
          </span>
          {multiple && (props as SelectorCatalogoMultipleProps).maxItems && (
            <span className="text-[11px] text-text-muted font-normal">
              Máx. {(props as SelectorCatalogoMultipleProps).maxItems}
            </span>
          )}
        </label>
      )}

      {description && (
        <p className="text-[11px] text-text-muted leading-tight -mt-0.5 mb-0.5">
          {description}
        </p>
      )}

      {/* Disparador del selector */}
      <div
        id={selectId}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        onKeyDown={handleKeyDown}
        className={`w-full min-h-[42px] px-3 py-2 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-2 bg-input-bg text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 ${
          isOpen
            ? "border-teal ring-2 ring-teal/20"
            : "border-input-border hover:border-teal/50"
        } ${disabled ? "opacity-50 cursor-not-allowed bg-surface-subtle" : ""}`}
      >
        <div className="flex-1 flex flex-wrap items-center gap-1.5 overflow-hidden">
          {multiple ? (
            selectedItems.length > 0 ? (
              selectedItems.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-1.5 bg-teal/10 text-teal-text border border-teal/20 px-2.5 py-1 rounded-lg text-xs font-medium animate-fadeIn"
                >
                  <span className="truncate max-w-[200px]">{item.name}</span>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={(e) => handleRemoveItem(item.id, e)}
                      className="hover:text-danger text-teal/70 p-0.5 rounded transition-colors focus:outline-none"
                      aria-label={`Eliminar ${item.name}`}
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </span>
              ))
            ) : (
              <span className="text-text-placeholder">{placeholder}</span>
            )
          ) : singleSelectedItem ? (
            <span className="font-medium text-text-main truncate">
              {singleSelectedItem.name}
            </span>
          ) : (
            <span className="text-text-placeholder">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 text-text-muted shrink-0">
          {!multiple && singleSelectedItem && !disabled && (
            <button
              type="button"
              onClick={handleClearSingle}
              className="p-1 hover:text-danger transition-colors rounded"
              title="Quitar selección"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-teal" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Mensaje de feedback flotante */}
      {feedbackMsg && (
        <div
          role="status"
          className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 animate-fadeIn ${
            feedbackMsg.type === "success"
              ? "bg-mint/20 text-mint-dark border border-mint/30"
              : feedbackMsg.type === "info"
              ? "bg-teal/15 text-teal-text border border-teal/30"
              : "bg-danger/10 text-danger border border-danger/30"
          }`}
        >
          <span className="font-semibold text-xs">
            {feedbackMsg.type === "success"
              ? "✓"
              : feedbackMsg.type === "info"
              ? "ℹ"
              : "⚠"}
          </span>
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Desplegable */}
      {isOpen && (
        <div
          role="listbox"
          ref={listRef}
          className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-card-bg border border-card-border rounded-xl shadow-xl overflow-hidden animate-fadeIn"
        >
          {/* Campo de búsqueda integrado */}
          <div className="p-2 border-b border-card-border bg-surface-subtle/50">
            <div className="relative flex items-center">
              <svg
                className="w-4 h-4 text-text-muted absolute left-3 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Escribe para buscar o agregar nuevo..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-input-bg border border-input-border rounded-lg text-text-main focus:outline-none focus:border-teal"
              />
            </div>
          </div>

          {/* Lista de resultados */}
          <div className="max-h-60 overflow-y-auto p-1 divide-y divide-card-border/30">
            {loading && items.length === 0 ? (
              <div className="py-6 text-center text-xs text-text-muted">
                <span className="animate-spin inline-block mr-2">◌</span>
                Cargando catálogo...
              </div>
            ) : filteredItems.length > 0 ? (
              filteredItems.map((item, index) => {
                const isSelected = multiple
                  ? ((props.value as string[]) || []).includes(item.id)
                  : props.value === item.id;
                const isHighlighted = highlightedIndex === index;

                return (
                  <div
                    key={item.id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`px-3 py-2 text-xs rounded-lg cursor-pointer flex items-center justify-between transition-colors ${
                      isHighlighted
                        ? "bg-teal/10 text-teal-text"
                        : isSelected
                        ? "bg-surface-subtle text-text-main font-medium"
                        : "text-text-main hover:bg-surface-subtle/80"
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="truncate">{item.name}</span>
                      {!item.reviewed && (
                        <span className="text-[10px] bg-teal/15 text-teal px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                          Nuevo
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <span className="text-teal shrink-0">
                        <CheckIcon className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                );
              })
            ) : !canShowCreate ? (
              <div className="py-5 text-center text-xs text-text-muted">
                No se encontraron coincidencias
              </div>
            ) : null}

            {/* Opción para agregar un nuevo elemento */}
            {canShowCreate && (
              <div
                role="button"
                tabIndex={0}
                onClick={handleCreateNew}
                onMouseEnter={() => setHighlightedIndex(filteredItems.length)}
                className={`p-2.5 text-xs rounded-lg cursor-pointer flex items-center gap-2 border-t border-card-border/50 transition-colors ${
                  highlightedIndex === filteredItems.length
                    ? "bg-teal text-white font-medium shadow-sm"
                    : "bg-teal/5 text-teal-text hover:bg-teal/10"
                }`}
              >
                <span className="text-base font-bold leading-none">+</span>
                <span className="truncate">
                  {isSubmitting ? (
                    "Guardando en el catálogo..."
                  ) : (
                    <>
                      Agregar al catálogo:{" "}
                      <strong className="underline underline-offset-2">
                        «{normalizedCandidate?.nombre}»
                      </strong>
                    </>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
