"use client";

import React, { useState, useDeferredValue, useMemo } from "react";
import { SavedCase } from "@/types/clinical";
import { formatCaseDate } from "@/lib/case-transformers";
import { CloseIcon, EditIcon, RefreshIcon } from "@/components/common/Icons";

interface CasesTableProps {
  cases: SavedCase[];
  isLoading: boolean;
  onRefresh: () => void;
  onInspect: (id: string) => void;
  onEdit?: (c: SavedCase) => void;
  onNewCaseClick: () => void;
  onPrefetch?: (id: string) => void;
}

export function CasesTable({
  cases,
  isLoading,
  onRefresh,
  onInspect,
  onEdit,
  onNewCaseClick,
  onPrefetch,
}: CasesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  // useDeferredValue optimiza el rendimiento del buscador para que el teclado no se congele
  const deferredSearch = useDeferredValue(searchTerm);

  const filteredCases = useMemo(() => {
    if (!deferredSearch.trim()) return cases;
    const term = deferredSearch.toLowerCase();
    return cases.filter((c) => {
      const matchTitle = c.title.toLowerCase().includes(term);
      const matchHistory = c.clinicalHistory?.toLowerCase().includes(term);
      const matchKw = c.keywords.some((k) => k.keyword.name.toLowerCase().includes(term));
      return matchTitle || matchHistory || matchKw;
    });
  }, [cases, deferredSearch]);

  return (
    <div>
      {/* BARRA DE BÚSQUEDA Y ACCIONES */}
      <div className="repo-toolbar flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div className="search-box relative flex-1 min-w-[260px]">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            className="search-icon absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="search-input-field w-full pl-10 pr-10 py-2.5 rounded-xl text-sm"
            placeholder="Buscar por síntoma, diagnóstico o palabra clave..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="clear-search-btn absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full hover:opacity-80"
              onClick={() => setSearchTerm("")}
              title="Limpiar búsqueda"
            >
              <CloseIcon width={14} height={14} />
            </button>
          )}
        </div>

        <div className="toolbar-actions flex items-center gap-2.5">
          <button
            type="button"
            className="btn-refresh inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold cursor-pointer"
            onClick={onRefresh}
            disabled={isLoading}
            title="Recargar casos desde la base de datos"
          >
            <RefreshIcon
              width={15}
              height={15}
              className={isLoading ? "animate-spin" : ""}
            />
            Refrescar
          </button>
          <button
            type="button"
            className="btn btn-teal inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            onClick={onNewCaseClick}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Cargar Caso
          </button>
        </div>
      </div>

      {/* ESTADO VACÍO O CARGANDO */}
      {isLoading && cases.length === 0 ? (
        <div className="text-center py-14 text-text-muted">
          <div className="animate-spin w-8 h-8 border-3 border-teal border-t-transparent rounded-full mx-auto mb-3" />
          Cargando casos clínicos registrados...
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="empty-repo-state text-center py-16 px-4">
          <div className="empty-icon-box w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-surface-subtle border border-border-subtle text-text-muted">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h4 className="text-lg font-bold text-text-main mb-1">
            {searchTerm ? "No se encontraron coincidencias" : "No hay casos clínicos guardados"}
          </h4>
          <p className="text-sm text-text-muted max-w-md mx-auto mb-5">
            {searchTerm
              ? `No hay casos que contengan "${searchTerm}". Intente con otra búsqueda.`
              : "Aún no se ha registrado ningún caso clínico. Comience completando el formulario de nuevo caso."}
          </p>
          {!searchTerm && (
            <button
              type="button"
              className="btn btn-teal inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
              onClick={onNewCaseClick}
            >
              Comenzar a Cargar un Caso
            </button>
          )}
        </div>
      ) : (
        /* TABLA DE CASOS CON SCROLL RESPONSIVE */
        <div className="cases-table-container rounded-2xl overflow-x-auto shadow-sm">
          <table className="cases-table w-full min-w-[680px] text-left border-collapse">
            <thead>
              <tr>
                <th className="py-3.5 px-5 text-xs font-bold uppercase tracking-wider">Caso Clínico</th>
                <th className="py-3.5 px-5 text-xs font-bold uppercase tracking-wider">Palabras Clave</th>
                <th className="py-3.5 px-5 text-xs font-bold uppercase tracking-wider">Examen Físico</th>
                <th className="py-3.5 px-5 text-xs font-bold uppercase tracking-wider">Contenido</th>
                <th className="py-3.5 px-5 text-xs font-bold uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((c) => (
                <tr
                  key={c.id}
                  className="transition-colors hover:bg-surface-hover"
                  onMouseEnter={() => onPrefetch?.(c.id)}
                >
                  <td className="py-4 px-5">
                    <div className="case-main-cell flex flex-col gap-1">
                      <span className="case-title-text font-bold text-base text-text-main leading-snug">
                        {c.title}
                      </span>
                      <span className="text-xs text-text-muted line-clamp-1">
                        {c.clinicalHistory?.slice(0, 110)}...
                      </span>
                      <span className="case-status-badge text-[11px] font-bold px-2 py-0.5 rounded-md w-fit">
                        {formatCaseDate(c.createdAt, "short")}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-5">
                    <div className="flex flex-wrap gap-1 max-w-[220px]">
                      {c.keywords?.slice(0, 3).map((kw, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-surface-subtle border border-border-subtle text-text-main"
                        >
                          {kw.keyword.name}
                        </span>
                      ))}
                      {c.keywords?.length > 3 && (
                        <span className="text-[11px] font-bold text-text-muted px-1">
                          +{c.keywords.length - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-5">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-semibold text-text-main">
                        {c.isPhysicalExamInteractive ? "Interactivo" : "Estándar"}
                      </span>
                      <span className="text-[11px] text-teal-text font-semibold">
                        {c.painLevel}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="stat-pill text-xs font-semibold px-2 py-1 rounded-lg" title="Estudios cargados">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                        </svg>
                        {c.studies?.length || 0}
                      </span>
                      <span className="stat-pill text-xs font-semibold px-2 py-1 rounded-lg" title="Opciones terapéuticas">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {c.treatmentOptions?.length || 0}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onEdit && (
                        <button
                          type="button"
                          className="btn-edit-case inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer border border-teal/40 text-teal-text hover:bg-teal-light transition-colors"
                          onClick={() => onEdit(c)}
                          title="Editar este caso clínico"
                        >
                          <EditIcon width={13} height={13} />
                          Editar
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn-inspect inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                        onClick={() => onInspect(c.id)}
                        onMouseEnter={() => onPrefetch?.(c.id)}
                        title="Ver ficha completa del caso (carga instantánea)"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        Ver Ficha
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
