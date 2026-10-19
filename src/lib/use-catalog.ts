"use client";

import { useState, useEffect, useCallback } from "react";
import { CatalogType, CatalogItem } from "@prisma/client";

// Cache en memoria por catálogo para evitar peticiones redundantes
const catalogCache = new Map<CatalogType, CatalogItem[]>();
const listeners = new Map<CatalogType, Set<() => void>>();

function notifyListeners(catalog: CatalogType) {
  const cListeners = listeners.get(catalog);
  if (cListeners) {
    cListeners.forEach((fn) => fn());
  }
}

export function subscribeToCatalog(catalog: CatalogType, callback: () => void) {
  if (!listeners.has(catalog)) {
    listeners.set(catalog, new Set());
  }
  listeners.get(catalog)!.add(callback);
  return () => {
    listeners.get(catalog)?.delete(callback);
  };
}

export function invalidateCatalogCache(catalog?: CatalogType) {
  if (catalog) {
    catalogCache.delete(catalog);
    notifyListeners(catalog);
  } else {
    catalogCache.clear();
    listeners.forEach((_, cat) => notifyListeners(cat));
  }
}

export function mutateCatalogItem(catalog: CatalogType, item: CatalogItem) {
  const current = catalogCache.get(catalog) || [];
  const index = current.findIndex((i) => i.id === item.id);
  if (index >= 0) {
    current[index] = item;
  } else {
    current.push(item);
    current.sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));
  }
  catalogCache.set(catalog, [...current]);
  notifyListeners(catalog);
}

export function useCatalog(catalog: CatalogType) {
  const [items, setItems] = useState<CatalogItem[]>(() => catalogCache.get(catalog) || []);
  const [loading, setLoading] = useState<boolean>(!catalogCache.has(catalog));
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/catalogos/${catalog}?activos=true`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        catalogCache.set(catalog, data.data);
        setItems(data.data);
      } else {
        setError(data.error || "Error al cargar catálogo");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de red al cargar catálogo");
    } finally {
      setLoading(false);
    }
  }, [catalog]);

  useEffect(() => {
    // Si ya está en caché, sincronizamos estado inicial
    if (catalogCache.has(catalog)) {
      setItems(catalogCache.get(catalog)!);
      setLoading(false);
    } else {
      fetchItems();
    }

    const unsubscribe = subscribeToCatalog(catalog, () => {
      setItems(catalogCache.get(catalog) || []);
    });

    return unsubscribe;
  }, [catalog, fetchItems]);

  const createItem = useCallback(
    async (
      nombre: string,
      origin: "caso" | "admin" = "caso"
    ): Promise<{ item: CatalogItem; creado: boolean; mensaje?: string }> => {
      const res = await fetch(`/api/catalogos/${catalog}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, origin }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "No se pudo crear el elemento en el catálogo");
      }

      mutateCatalogItem(catalog, data.item);

      return {
        item: data.item,
        creado: Boolean(data.creado),
        mensaje: data.mensaje,
      };
    },
    [catalog]
  );

  return {
    items,
    loading,
    error,
    refresh: fetchItems,
    createItem,
  };
}
