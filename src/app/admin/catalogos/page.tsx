"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { CatalogType, CatalogOrigin, CatalogItem } from "@prisma/client";
import {
  CATALOGO_TIPOS,
  CATALOGO_TITULOS,
  CatalogItemWithUsage,
} from "@/lib/catalogo-service";
import { normalizar } from "@/lib/normalizar";
import { ThemeSwitcher } from "@/components/common/ThemeSwitcher";
import { invalidateCatalogCache } from "@/lib/use-catalog";

type StatusFilter = "all" | "active" | "inactive" | "unreviewed";

export default function CatalogosAdminPage() {
  const [activeCatalog, setActiveCatalog] = useState<CatalogType>(CatalogType.motivo_consulta);
  const [items, setItems] = useState<CatalogItemWithUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Notificación global
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Modal Nuevo Elemento
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Modal Edición
  const [editingItem, setEditingItem] = useState<CatalogItemWithUsage | null>(null);
  const [editName, setEditName] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Modal Importación
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importReport, setImportReport] = useState<{
    creados: number;
    existentes: number;
    invalidos: number;
    mensaje: string;
  } | null>(null);

  const showToast = useCallback((text: string, type: "success" | "error" | "info" = "info") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const fetchItems = useCallback(async (catalog: CatalogType) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/catalogos/${catalog}?activos=false&usage=true`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setItems(json.data);
      } else {
        showToast(json.error || "Error al cargar elementos del catálogo", "error");
      }
    } catch {
      showToast("Error de conexión al cargar catálogo", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchItems(activeCatalog);
  }, [activeCatalog, fetchItems]);

  // Filtrado
  const filteredItems = useMemo(() => {
    let result = items;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (it) => it.name.toLowerCase().includes(q) || it.key.includes(q)
      );
    }
    if (statusFilter === "active") {
      result = result.filter((it) => it.active);
    } else if (statusFilter === "inactive") {
      result = result.filter((it) => !it.active);
    } else if (statusFilter === "unreviewed") {
      result = result.filter((it) => !it.reviewed);
    }
    return result;
  }, [items, searchQuery, statusFilter]);

  // Contadores
  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((i) => i.active).length;
    const inactive = total - active;
    const unreviewed = items.filter((i) => !i.reviewed).length;
    return { total, active, inactive, unreviewed };
  }, [items]);

  // Handlers
  async function handleToggleActive(item: CatalogItemWithUsage) {
    const nextState = !item.active;
    if (!nextState && item.usageCount && item.usageCount > 0) {
      const confirmed = window.confirm(
        `Este elemento está en uso en ${item.usageCount} caso(s). Al desactivarlo ya no se podrá seleccionar en nuevos casos, pero se mantendrá en los casos existentes. ¿Deseas desactivarlo?`
      );
      if (!confirmed) return;
    }

    try {
      const res = await fetch(`/api/catalogos/${item.catalog}/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: nextState }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast(json.error || "No se pudo actualizar el estado", "error");
        return;
      }
      invalidateCatalogCache(item.catalog);
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, active: nextState } : i))
      );
      showToast(
        `Elemento «${item.name}» ${nextState ? "reactivado" : "desactivado"} exitosamente`,
        "success"
      );
    } catch {
      showToast("Error al conectar con el servidor", "error");
    }
  }

  async function handleMarkReviewed(item: CatalogItemWithUsage) {
    try {
      const res = await fetch(`/api/catalogos/${item.catalog}/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewed: true }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast(json.error || "No se pudo marcar como revisado", "error");
        return;
      }
      invalidateCatalogCache(item.catalog);
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, reviewed: true } : i))
      );
      showToast(`Elemento «${item.name}» marcado como revisado`, "success");
    } catch {
      showToast("Error al conectar con el servidor", "error");
    }
  }

  async function handleCreateNew() {
    if (!newItemName.trim() || isCreating) return;
    setCreateError(null);
    try {
      setIsCreating(true);
      const res = await fetch(`/api/catalogos/${activeCatalog}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: newItemName.trim(), origin: "admin" }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setCreateError(json.error || "No se pudo crear el elemento");
        return;
      }

      invalidateCatalogCache(activeCatalog);
      await fetchItems(activeCatalog);
      setIsNewModalOpen(false);
      setNewItemName("");
      showToast(json.mensaje || "Elemento guardado en el catálogo", "success");
    } catch {
      setCreateError("Error de red al crear elemento");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleSaveEdit() {
    if (!editingItem || !editName.trim() || isSavingEdit) return;
    setEditError(null);
    try {
      setIsSavingEdit(true);
      const res = await fetch(`/api/catalogos/${activeCatalog}/${editingItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setEditError(json.error || "No se pudo actualizar el elemento");
        return;
      }

      invalidateCatalogCache(activeCatalog);
      setItems((prev) =>
        prev.map((i) =>
          i.id === editingItem.id ? { ...i, name: json.item.name, key: json.item.key } : i
        )
      );
      setEditingItem(null);
      showToast("Nombre actualizado exitosamente", "success");
    } catch {
      setEditError("Error al conectar con el servidor");
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function handleImportLines() {
    const lines = importText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => Boolean(l));

    if (lines.length === 0 || isImporting) return;

    try {
      setIsImporting(true);
      setImportReport(null);
      const res = await fetch(`/api/catalogos/${activeCatalog}/importar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lineas: lines }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast(json.error || "Error al importar lista", "error");
        return;
      }

      invalidateCatalogCache(activeCatalog);
      await fetchItems(activeCatalog);
      setImportReport({
        creados: json.data.creados,
        existentes: json.data.existentes,
        invalidos: json.data.invalidos,
        mensaje: json.mensaje,
      });
      showToast("Importación masiva completada", "success");
    } catch {
      showToast("Error de red al importar elementos", "error");
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg text-text-main flex flex-col transition-colors">
      {/* Header / Topbar */}
      <header className="app-topbar sticky top-0 z-40 backdrop-blur-md border-b border-card-border/60">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group select-none">
              <Image
                src="/V1.svg"
                alt="Vinko Logo"
                width={30}
                height={26}
                priority
                className="w-auto h-7 object-contain transition-transform group-hover:scale-105"
              />
              <span className="brand-title text-xl font-extrabold tracking-tight">Vinko</span>
            </Link>
            <span className="text-text-muted text-sm font-semibold">/</span>
            <span className="text-sm font-bold bg-teal/10 text-teal-text px-2.5 py-1 rounded-lg border border-teal/20">
              Panel de Catálogos
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-input-border hover:bg-surface-subtle transition-colors flex items-center gap-1.5 text-text-muted hover:text-text-main"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al Formulario
            </Link>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Toast Notifier */}
        {toast && (
          <div
            role="status"
            className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl text-sm font-medium shadow-2xl flex items-center gap-2.5 animate-fadeIn border ${
              toast.type === "success"
                ? "bg-mint/20 text-mint-dark border-mint/40"
                : toast.type === "error"
                ? "bg-danger/20 text-danger border-danger/40"
                : "bg-teal/20 text-teal-text border-teal/40"
            }`}
          >
            <span>{toast.type === "success" ? "✓" : toast.type === "error" ? "⚠" : "ℹ"}</span>
            <span>{toast.text}</span>
          </div>
        )}

        {/* Title & Description Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card-bg border border-card-border p-5 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-text-main tracking-tight">
              Administración de Catálogos Reutilizables
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-2xl">
              Garantiza la normalización automática anti-duplicados, administra siglas (como TAC),
              revisa elementos cargados desde casos y precarga listas de elementos.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {activeCatalog !== CatalogType.tipo_estudio && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setNewItemName("");
                    setCreateError(null);
                    setIsNewModalOpen(true);
                  }}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl bg-teal text-white hover:bg-teal-hover transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span className="text-base leading-none">+</span>
                  Nuevo Elemento
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImportText("");
                    setImportReport(null);
                    setIsImportModalOpen(true);
                  }}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl border border-input-border bg-surface-subtle hover:bg-surface-hover transition-all flex items-center gap-1.5 text-text-main"
                >
                  Importar Lista
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tabs de Catálogos */}
        <div className="flex overflow-x-auto pb-1 gap-1.5 border-b border-card-border/60 scrollbar-none">
          {CATALOGO_TIPOS.map((cat) => {
            const isActive = activeCatalog === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCatalog(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                  isActive
                    ? "bg-teal/15 text-teal border border-teal/30 shadow-xs"
                    : "text-text-muted hover:text-text-main hover:bg-surface-subtle"
                }`}
              >
                <span>{CATALOGO_TITULOS[cat]}</span>
                {activeCatalog === cat && (
                  <span className="bg-teal text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {items.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Toolbar: Buscador y Filtros de Estado */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <svg
              className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Buscar en ${CATALOGO_TITULOS[activeCatalog]}...`}
              className="w-full pl-9 pr-3 py-2 text-xs bg-input-bg border border-input-border rounded-xl text-text-main focus:outline-none focus:border-teal"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(
              [
                { id: "all", label: `Todos (${stats.total})` },
                { id: "active", label: `Activos (${stats.active})` },
                { id: "inactive", label: `Inactivos (${stats.inactive})` },
                { id: "unreviewed", label: `Nuevos (${stats.unreviewed})` },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  statusFilter === f.id
                    ? "bg-surface-subtle text-teal font-bold border border-teal/30"
                    : "text-text-muted hover:text-text-main hover:bg-surface-subtle/50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla de Elementos */}
        <div className="bg-card-bg border border-card-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-card-border/80 bg-surface-subtle/40 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  <th className="px-4 py-3">Nombre Mostrado</th>
                  <th className="px-4 py-3">Clave de Búsqueda</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-center">Origen</th>
                  <th className="px-4 py-3 text-center">Uso en Casos</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border/40 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-text-muted">
                      <span className="animate-spin inline-block mr-2">◌</span>
                      Cargando elementos del catálogo...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-text-muted">
                      No se encontraron elementos en este catálogo con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-surface-subtle/40 transition-colors ${
                        !item.active ? "opacity-60 bg-surface-subtle/20" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-semibold text-text-main">
                        <div className="flex items-center gap-2">
                          <span>{item.name}</span>
                          {!item.reviewed && (
                            <span className="text-[10px] bg-teal/15 text-teal border border-teal/20 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                              Nuevo
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-text-muted">
                        {item.key}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.active
                              ? "bg-mint/20 text-mint-dark border border-mint/30"
                              : "bg-surface-subtle text-text-muted border border-border-subtle"
                          }`}
                        >
                          {item.active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-[11px] text-text-muted capitalize">
                          {item.origin}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`font-semibold text-xs ${
                            (item.usageCount || 0) > 0 ? "text-teal font-bold" : "text-text-muted"
                          }`}
                        >
                          {item.usageCount ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {!item.reviewed && (
                            <button
                              type="button"
                              onClick={() => handleMarkReviewed(item)}
                              className="px-2 py-1 text-[11px] font-semibold text-teal hover:bg-teal/10 rounded-lg transition-colors border border-teal/30"
                              title="Marcar como revisado"
                            >
                              ✓ Revisar
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItem(item);
                              setEditName(item.name);
                              setEditError(null);
                            }}
                            className="px-2 py-1 text-[11px] font-semibold text-text-muted hover:text-text-main hover:bg-surface-subtle rounded-lg transition-colors"
                            title="Editar nombre"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(item)}
                            className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                              item.active
                                ? "text-danger hover:bg-danger/10"
                                : "text-mint-dark hover:bg-mint/10"
                            }`}
                            title={item.active ? "Desactivar" : "Reactivar"}
                          >
                            {item.active ? "Desactivar" : "Activar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Nuevo Elemento */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card-bg border border-card-border w-full max-w-md rounded-2xl p-6 shadow-2xl flex flex-col gap-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-text-main">
                Nuevo en {CATALOGO_TITULOS[activeCatalog]}
              </h3>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="text-text-muted hover:text-text-main text-lg p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-text-muted">
              El elemento será normalizado automáticamente para evitar duplicados. Puedes escribir con
              tildes o mayúsculas y el sistema gestionará la clave de comparación.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-main">Nombre del elemento</label>
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Ej. Estenosis hipertrófica de píloro"
                className="w-full px-3 py-2 text-sm bg-input-bg border border-input-border rounded-xl text-text-main focus:outline-none focus:border-teal"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateNew();
                }}
              />
              {newItemName.trim() && normalizar(newItemName.trim()) && (
                <div className="text-[11px] text-text-muted mt-1 bg-surface-subtle p-2 rounded-lg">
                  <div>Se guardará como: <strong>{normalizar(newItemName.trim())?.nombre}</strong></div>
                  <div>Clave de búsqueda: <code className="text-teal font-mono">{normalizar(newItemName.trim())?.clave}</code></div>
                </div>
              )}
            </div>

            {createError && (
              <div className="text-xs text-danger bg-danger/10 border border-danger/20 p-2.5 rounded-xl">
                {createError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="px-3 py-2 text-xs font-semibold rounded-xl text-text-muted hover:bg-surface-subtle"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateNew}
                disabled={!newItemName.trim() || isCreating}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-teal text-white hover:bg-teal-hover transition-all disabled:opacity-50"
              >
                {isCreating ? "Guardando..." : "Guardar Elemento"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Elemento */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card-bg border border-card-border w-full max-w-md rounded-2xl p-6 shadow-2xl flex flex-col gap-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-text-main">Editar Elemento de Catálogo</h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-text-muted hover:text-text-main text-lg p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-text-muted">
              Puedes ajustar mayúsculas personalizadas para siglas (ej. &ldquo;TAC&rdquo; o &ldquo;RNM&rdquo;) o nombres
              propios.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-main">Nombre</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-input-bg border border-input-border rounded-xl text-text-main focus:outline-none focus:border-teal"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveEdit();
                }}
              />
              {editName.trim() && normalizar(editName.trim()) && (
                <div className="text-[11px] text-text-muted mt-1 bg-surface-subtle p-2 rounded-lg">
                  <div>Nueva clave derivada: <code className="text-teal font-mono">{normalizar(editName.trim())?.clave}</code></div>
                </div>
              )}
            </div>

            {editingItem.usageCount && editingItem.usageCount > 0 ? (
              <div className="text-[11px] text-text-muted bg-teal/10 border border-teal/20 p-2.5 rounded-xl">
                ℹ Este elemento está referenciado en <strong>{editingItem.usageCount} caso(s)</strong>.
                Cualquier cambio se reflejará automáticamente en todos ellos.
              </div>
            ) : null}

            {editError && (
              <div className="text-xs text-danger bg-danger/10 border border-danger/20 p-2.5 rounded-xl">
                {editError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-3 py-2 text-xs font-semibold rounded-xl text-text-muted hover:bg-surface-subtle"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={!editName.trim() || isSavingEdit}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-teal text-white hover:bg-teal-hover transition-all disabled:opacity-50"
              >
                {isSavingEdit ? "Actualizando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Importar Lista */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card-bg border border-card-border w-full max-w-lg rounded-2xl p-6 shadow-2xl flex flex-col gap-4 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-text-main">
                Importación Masiva en {CATALOGO_TITULOS[activeCatalog]}
              </h3>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="text-text-muted hover:text-text-main text-lg p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-text-muted">
              Pega una lista con un elemento por línea. El sistema normalizará automáticamente cada línea
              y descartará o fusionará los duplicados existentes.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-main">Lista de elementos (1 por línea)</label>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={"Lactante vomitador\nAbdomen agudo\nOclusión intestinal"}
                rows={8}
                className="w-full px-3 py-2 text-xs bg-input-bg border border-input-border rounded-xl text-text-main focus:outline-none focus:border-teal font-mono leading-relaxed"
                autoFocus
              />
              <div className="text-[11px] text-text-muted">
                {importText.split("\n").filter((l) => l.trim().length > 0).length} elementos detectados
              </div>
            </div>

            {importReport && (
              <div className="p-3 bg-surface-subtle border border-card-border rounded-xl text-xs flex flex-col gap-1.5">
                <div className="font-bold text-teal">{importReport.mensaje}</div>
                <div className="flex gap-4 text-text-muted text-[11px]">
                  <span>Nuevos: <strong className="text-mint-dark">{importReport.creados}</strong></span>
                  <span>Ya existían: <strong className="text-text-main">{importReport.existentes}</strong></span>
                  {importReport.invalidos > 0 && (
                    <span>Inválidos: <strong className="text-danger">{importReport.invalidos}</strong></span>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-3 py-2 text-xs font-semibold rounded-xl text-text-muted hover:bg-surface-subtle"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handleImportLines}
                disabled={!importText.trim() || isImporting}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-teal text-white hover:bg-teal-hover transition-all disabled:opacity-50"
              >
                {isImporting ? "Importando lista..." : "Importar Ahora"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
