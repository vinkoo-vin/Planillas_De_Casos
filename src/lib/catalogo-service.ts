import prisma from "@/lib/prisma";
import { CatalogType, CatalogOrigin, CatalogItem } from "@prisma/client";
import { normalizar, normalizarClave } from "@/lib/normalizar";

export const CATALOGO_TIPOS: readonly CatalogType[] = [
  CatalogType.motivo_consulta,
  CatalogType.diagnostico,
  CatalogType.punto_anatomico,
  CatalogType.nivel_respuesta,
  CatalogType.tipo_estudio,
  CatalogType.tecnica_quirurgica,
  CatalogType.complicacion,
  CatalogType.campo_adicional,
] as const;

export const CATALOGO_TITULOS: Record<CatalogType, string> = {
  [CatalogType.motivo_consulta]: "Motivos de Consulta",
  [CatalogType.diagnostico]: "Diagnósticos",
  [CatalogType.punto_anatomico]: "Puntos Anatómicos",
  [CatalogType.nivel_respuesta]: "Niveles de Respuesta / Hallazgos",
  [CatalogType.tipo_estudio]: "Tipos de Estudio",
  [CatalogType.tecnica_quirurgica]: "Técnicas Quirúrgicas",
  [CatalogType.complicacion]: "Complicaciones",
  [CatalogType.campo_adicional]: "Campos Adicionales",
};

export function isCatalogType(value: string): value is CatalogType {
  return CATALOGO_TIPOS.includes(value as CatalogType);
}

export interface CatalogItemWithUsage extends CatalogItem {
  usageCount?: number;
}

export interface ListCatalogOptions {
  q?: string;
  activosOnly?: boolean;
  includeUsageCount?: boolean;
}

export class CatalogError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "CatalogError";
    this.statusCode = statusCode;
  }
}

/**
 * Lista y busca elementos de un catálogo específico.
 */
export async function listCatalogItems(
  catalog: CatalogType,
  options: ListCatalogOptions = {}
): Promise<CatalogItemWithUsage[]> {
  const { q, activosOnly = true, includeUsageCount = false } = options;

  const where: any = { catalog };

  if (activosOnly) {
    where.active = true;
  }

  if (q && q.trim()) {
    const query = q.trim();
    const queryKey = normalizarClave(query);
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      ...(queryKey ? [{ key: { contains: queryKey } }] : []),
    ];
  }

  if (includeUsageCount) {
    const items = await prisma.catalogItem.findMany({
      where,
      orderBy: [{ name: "asc" }],
      include: {
        _count: {
          select: {
            casesAsPrincipalReason: true,
            casesAsFinalDiagnosis: true,
            casesAsSurgicalTechnique: true,
            altReasons: true,
            examFindingsAnatomic: true,
            examFindingsLevel: true,
            caseStudies: true,
            caseDiagnoses: true,
            caseComplications: true,
            caseAdditionalFields: true,
          },
        },
      },
    });

    return items.map((item) => {
      const counts = item._count;
      const usageCount =
        counts.casesAsPrincipalReason +
        counts.casesAsFinalDiagnosis +
        counts.casesAsSurgicalTechnique +
        counts.altReasons +
        counts.examFindingsAnatomic +
        counts.examFindingsLevel +
        counts.caseStudies +
        counts.caseDiagnoses +
        counts.caseComplications +
        counts.caseAdditionalFields;

      const { _count, ...rest } = item;
      return { ...rest, usageCount };
    });
  }

  return prisma.catalogItem.findMany({
    where,
    orderBy: [{ name: "asc" }],
  });
}

/**
 * Alta tipo get-or-create para un elemento del catálogo.
 * Si ya existe por clave normalizada, devuelve el existente con `creado: false`.
 * Si no existe, lo crea con `creado: true`.
 * Garantía anti-duplicados por BD y transacción idempotente.
 */
export async function getOrCreateCatalogItem(
  catalog: CatalogType,
  rawNombre: string,
  options: { origin?: CatalogOrigin; reviewed?: boolean } = {}
): Promise<{ item: CatalogItem; creado: boolean }> {
  const norm = normalizar(rawNombre);
  if (!norm) {
    throw new CatalogError("El nombre ingresado no es válido o está vacío", 400);
  }

  const { nombre, clave } = norm;
  const origin = options.origin ?? CatalogOrigin.caso;
  const reviewed = options.reviewed ?? (origin === CatalogOrigin.admin);

  // 1. Verificar si ya existe
  const existing = await prisma.catalogItem.findUnique({
    where: { catalog_key: { catalog, key: clave } },
  });

  if (existing) {
    // Si estaba inactivo y lo vuelven a ingresar desde un caso/admin, lo reactivamos
    if (!existing.active) {
      const reactivated = await prisma.catalogItem.update({
        where: { id: existing.id },
        data: { active: true },
      });
      return { item: reactivated, creado: false };
    }
    return { item: existing, creado: false };
  }

  // 2. Intentar crear; si hay condición de carrera concurrent-safe con unique constraint
  try {
    const created = await prisma.catalogItem.create({
      data: {
        catalog,
        name: nombre,
        key: clave,
        origin,
        reviewed,
        active: true,
      },
    });
    return { item: created, creado: true };
  } catch (error: any) {
    if (error?.code === "P2002") {
      // Conflicto de clave única: recuperar el existente
      const found = await prisma.catalogItem.findUnique({
        where: { catalog_key: { catalog, key: clave } },
      });
      if (found) {
        return { item: found, creado: false };
      }
    }
    throw error;
  }
}

/**
 * Actualiza un elemento del catálogo (nombre, activo, revisado).
 * Si cambia el nombre, verifica que la nueva clave no choque con otro registro.
 * Permite preservar mayúsculas personalizadas para siglas (e.g. "TAC", "RNM").
 */
export async function updateCatalogItem(
  catalog: CatalogType,
  id: string,
  data: { name?: string; active?: boolean; reviewed?: boolean }
): Promise<CatalogItem> {
  const existing = await prisma.catalogItem.findUnique({
    where: { id },
  });

  if (!existing || existing.catalog !== catalog) {
    throw new CatalogError("Elemento no encontrado en este catálogo", 404);
  }

  const updateData: {
    name?: string;
    key?: string;
    active?: boolean;
    reviewed?: boolean;
  } = {};

  if (data.name !== undefined) {
    const trimmed = data.name.trim();
    const norm = normalizar(trimmed);
    if (!norm) {
      throw new CatalogError("El nuevo nombre no puede estar vacío", 400);
    }

    // Verificar si otra fila ya tiene la misma clave en el mismo catálogo
    const conflict = await prisma.catalogItem.findUnique({
      where: { catalog_key: { catalog, key: norm.clave } },
    });

    if (conflict && conflict.id !== id) {
      throw new CatalogError(
        `Ya existe otro elemento registrado con la misma clave ("${conflict.name}") en este catálogo`,
        409
      );
    }

    // Guardar el nombre especificado (permitiendo siglas exactas del admin como "TAC")
    updateData.name = trimmed;
    updateData.key = norm.clave;
  }

  if (data.active !== undefined) {
    updateData.active = Boolean(data.active);
  }

  if (data.reviewed !== undefined) {
    updateData.reviewed = Boolean(data.reviewed);
  }

  return prisma.catalogItem.update({
    where: { id },
    data: updateData,
  });
}

/**
 * Importación masiva pegando una lista línea por línea.
 * Devuelve conteo de creados, existentes e inválidos.
 */
export async function importCatalogItems(
  catalog: CatalogType,
  lines: string[],
  origin: CatalogOrigin = CatalogOrigin.admin
): Promise<{
  creados: number;
  existentes: number;
  invalidos: number;
  items: CatalogItem[];
}> {
  let creados = 0;
  let existentes = 0;
  let invalidos = 0;
  const items: CatalogItem[] = [];

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      continue;
    }

    const norm = normalizar(trimmed);
    if (!norm) {
      invalidos++;
      continue;
    }

    try {
      const result = await getOrCreateCatalogItem(catalog, trimmed, {
        origin,
        reviewed: true,
      });
      if (result.creado) {
        creados++;
      } else {
        existentes++;
      }
      items.push(result.item);
    } catch {
      invalidos++;
    }
  }

  return { creados, existentes, invalidos, items };
}
