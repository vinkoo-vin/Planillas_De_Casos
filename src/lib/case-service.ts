import prisma from "@/lib/prisma";
import type { AddedStudy } from "@/types/clinical";

export interface TreatmentOptionParsed {
  description: string;
  isCorrect: boolean;
  order: number;
}

export type RawStudyInput = Partial<AddedStudy>;

export interface ValidatedStudyInput {
  studyCatalogId: string;
  isAdequate: boolean;
  findings: string;
  imageUrl: string | null;
  imageName: string | null;
}

export interface CasePayloadValidation {
  isValid: boolean;
  error?: string;
}

/**
 * Valida los campos obligatorios para la creación o actualización de un caso clínico.
 */
export function validateCaseInput(body: Record<string, any>): CasePayloadValidation {
  if (!body.title?.trim()) {
    return { isValid: false, error: "El título del caso es obligatorio" };
  }
  if (!body.clinicalHistory?.trim()) {
    return { isValid: false, error: "La descripción clínica es obligatoria" };
  }
  if (!body.painLevel?.trim()) {
    return { isValid: false, error: "El hallazgo del examen físico o nivel de dolor es obligatorio" };
  }
  return { isValid: true };
}

/**
 * Convierte el texto libre de opciones terapéuticas a registros estructurados,
 * reconociendo automáticamente las etiquetas [CORRECTA].
 */
export function parseTreatmentRaw(treatmentRaw?: string | null): TreatmentOptionParsed[] {
  if (!treatmentRaw) return [];

  const lines = treatmentRaw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return lines.map((line, index) => {
    const isCorrect = /\[CORRECTA\]/i.test(line);
    const cleanDescription = line
      .replace(/\[CORRECTA\]/gi, "")
      .replace(/^[-*•\d.]\s*/, "")
      .trim();

    return {
      description: cleanDescription || line,
      isCorrect,
      order: index + 1,
    };
  });
}

/**
 * Sincroniza en lote palabras clave contra la base de datos:
 * busca las existentes, crea las faltantes y retorna los IDs para vinculación.
 */
export async function syncKeywords(keywords: string[] = []): Promise<{ id: string }[]> {
  const validNames = Array.from(
    new Set(
      keywords
        .map((k) => k?.trim())
        .filter((k): k is string => Boolean(k))
    )
  );

  if (validNames.length === 0) return [];

  // 1. Buscar existentes en 1 sola consulta
  const existing = await prisma.keyword.findMany({
    where: { name: { in: validNames } },
    select: { id: true, name: true },
  });
  const map = new Map(existing.map((k) => [k.name, k.id]));

  // 2. Crear en lote las faltantes
  const missing = validNames.filter((name) => !map.has(name));
  if (missing.length > 0) {
    await prisma.keyword.createMany({
      data: missing.map((name) => ({ name })),
      skipDuplicates: true,
    });
    const newlyCreated = await prisma.keyword.findMany({
      where: { name: { in: missing } },
      select: { id: true, name: true },
    });
    newlyCreated.forEach((k) => map.set(k.name, k.id));
  }

  return validNames
    .map((name) => {
      const id = map.get(name);
      return id ? { id } : null;
    })
    .filter((k): k is { id: string } => k !== null);
}

/**
 * Sincroniza en lote los estudios complementarios contra el catálogo global
 * y prepara las entradas para CaseStudy (incluyendo imágenes WebP y hallazgos).
 */
export async function syncStudies(studies: RawStudyInput[] = []): Promise<ValidatedStudyInput[]> {
  const validRaw = studies.filter((st) => Boolean(st?.name?.trim()));
  const uniqueNames = Array.from(new Set(validRaw.map((s) => s.name!.trim())));

  if (uniqueNames.length === 0) return [];

  // 1. Buscar en el catálogo
  const existing = await prisma.studyCatalog.findMany({
    where: { name: { in: uniqueNames } },
    select: { id: true, name: true },
  });
  const map = new Map(existing.map((s) => [s.name, s.id]));

  // 2. Crear en lote los que no existan en el catálogo
  const missing = uniqueNames.filter((name) => !map.has(name));
  if (missing.length > 0) {
    const definitionsMap = new Map(
      validRaw.map((s) => [s.name!.trim(), s.definition?.trim() || "Estudio complementario de diagnóstico"])
    );
    await prisma.studyCatalog.createMany({
      data: missing.map((name) => ({
        name,
        generalDefinition: definitionsMap.get(name) || "Estudio complementario de diagnóstico",
      })),
      skipDuplicates: true,
    });
    const newlyCreated = await prisma.studyCatalog.findMany({
      where: { name: { in: missing } },
      select: { id: true, name: true },
    });
    newlyCreated.forEach((s) => map.set(s.name, s.id));
  }

  // 3. Mapear a la estructura de CaseStudy
  return validRaw
    .map((st) => {
      const catalogId = map.get(st.name!.trim());
      if (!catalogId) return null;
      return {
        studyCatalogId: catalogId,
        isAdequate: st.isAdequate ?? true,
        findings: st.findings?.trim() || "Sin hallazgos especificados",
        imageUrl: st.imageUrl || null,
        imageName: st.imageName || null,
      };
    })
    .filter((s): s is ValidatedStudyInput => s !== null);
}

/**
 * Selector estándar para incluir todas las relaciones necesarias en una ficha de caso.
 */
export const caseDetailIncludes = {
  keywords: { include: { keyword: true } },
  studies: { include: { studyCatalog: true } },
  treatmentOptions: { orderBy: { order: "asc" as const } },
};

export interface CasePayloadData {
  title: string;
  clinicalHistory: string;
  hasVideo?: boolean;
  videoDescription?: string | null;
  videoUrl?: string | null;
  isPhysicalExamInteractive?: boolean;
  physicalExamZone?: string | null;
  physicalExamRefPoint?: string | null;
  physicalExamStandard?: string | null;
  painLevel: string;
  treatmentRaw?: string | null;
  keywords?: string[];
  studies?: RawStudyInput[];
}

/**
 * Prepara y sincroniza en lote todos los datos y relaciones necesarias para
 * la creación o actualización de un caso clínico en Prisma, eliminando duplicación entre POST y PUT.
 */
export async function prepareCasePayload(body: CasePayloadData) {
  const {
    title,
    clinicalHistory,
    hasVideo = false,
    videoDescription,
    videoUrl,
    isPhysicalExamInteractive = true,
    physicalExamZone,
    physicalExamRefPoint,
    physicalExamStandard,
    painLevel,
    treatmentRaw,
    keywords = [],
    studies = [],
  } = body;

  const parsedTreatments = parseTreatmentRaw(treatmentRaw);

  const [keywordRecords, validStudies] = await Promise.all([
    syncKeywords(keywords),
    syncStudies(studies),
  ]);

  const baseData = {
    title: title.trim(),
    clinicalHistory: clinicalHistory.trim(),
    hasVideo: Boolean(hasVideo),
    videoDescription: videoDescription?.trim() || null,
    videoUrl: videoUrl?.trim() || null,
    isPhysicalExamInteractive: Boolean(isPhysicalExamInteractive),
    physicalExamZone: physicalExamZone?.trim() || null,
    physicalExamRefPoint: physicalExamRefPoint?.trim() || null,
    physicalExamStandard: physicalExamStandard?.trim() || null,
    painLevel: painLevel.trim(),
    treatmentRaw: treatmentRaw?.trim() || null,
  };

  const keywordsCreate = keywordRecords.map((kw) => ({
    keywordId: kw.id,
  }));

  const studiesCreate = validStudies.map((s) => ({
    studyCatalogId: s.studyCatalogId,
    isAdequate: s.isAdequate,
    findings: s.findings,
    imageUrl: s.imageUrl,
    imageName: s.imageName,
  }));

  const treatmentOptionsCreate = parsedTreatments;

  return {
    baseData,
    keywordsCreate,
    studiesCreate,
    treatmentOptionsCreate,
  };
}
