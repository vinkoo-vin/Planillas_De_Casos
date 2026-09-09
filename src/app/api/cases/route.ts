import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const isFull = req.nextUrl.searchParams.get("full") === "true";

    // Consulta optimizada: en modo lista excluimos campos pesados (imágenes en base64, etc.)
    const cases = isFull
      ? await prisma.case.findMany({
          orderBy: { createdAt: "desc" },
          take: 100,
          include: {
            keywords: { include: { keyword: true } },
            studies: { include: { studyCatalog: true } },
            treatmentOptions: { orderBy: { order: "asc" } },
          },
        })
      : await prisma.case.findMany({
          orderBy: { createdAt: "desc" },
          take: 100,
          select: {
            id: true,
            title: true,
            clinicalHistory: true,
            hasVideo: true,
            isPhysicalExamInteractive: true,
            painLevel: true,
            status: true,
            createdAt: true,
            keywords: {
              select: {
                keyword: {
                  select: { name: true },
                },
              },
            },
            studies: {
              select: {
                id: true,
                isAdequate: true,
                studyCatalog: {
                  select: { name: true },
                },
              },
            },
            treatmentOptions: {
              select: {
                id: true,
                description: true,
                isCorrect: true,
                order: true,
              },
              orderBy: { order: "asc" },
            },
          },
        });

    return NextResponse.json({ success: true, data: cases });
  } catch (error) {
    console.error("[Casos] Error al obtener casos clínicos:", error);
    return NextResponse.json(
      { success: false, error: "Error al consultar los casos" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

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

    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, error: "El título del caso es obligatorio" },
        { status: 400 }
      );
    }

    if (!clinicalHistory?.trim()) {
      return NextResponse.json(
        { success: false, error: "La descripción clínica es obligatoria" },
        { status: 400 }
      );
    }

    if (!painLevel?.trim()) {
      return NextResponse.json(
        { success: false, error: "El hallazgo del examen físico o nivel de dolor es obligatorio" },
        { status: 400 }
      );
    }

    // 1. Procesar opciones de tratamiento
    const treatmentLines = (treatmentRaw || "")
      .split("\n")
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0);

    const parsedTreatments = treatmentLines.map((line: string, index: number) => {
      const isCorrect = /\[CORRECTA\]/i.test(line);
      const cleanDescription = line.replace(/\[CORRECTA\]/gi, "").replace(/^[-*•\d.]\s*/, "").trim();
      return {
        description: cleanDescription || line,
        isCorrect,
        order: index + 1,
      };
    });

    // 2. Optimización por Lotes (Batching) de Palabras Clave: Evita N viajes de red individuales
    const validKeywordNames = Array.from(
      new Set(
        (keywords as string[])
          .map((k: string) => k?.trim())
          .filter((k: string) => Boolean(k))
      )
    );

    let keywordRecords: { id: string }[] = [];
    if (validKeywordNames.length > 0) {
      // 2a. Buscar en 1 sola consulta las que ya existen
      const existingKeywords = await prisma.keyword.findMany({
        where: { name: { in: validKeywordNames } },
        select: { id: true, name: true },
      });
      const existingMap = new Map(existingKeywords.map((k) => [k.name, k.id]));

      // 2b. Crear en lote solo las que falten
      const missingNames = validKeywordNames.filter((name) => !existingMap.has(name));
      if (missingNames.length > 0) {
        await prisma.keyword.createMany({
          data: missingNames.map((name) => ({ name })),
          skipDuplicates: true,
        });
        const newlyCreated = await prisma.keyword.findMany({
          where: { name: { in: missingNames } },
          select: { id: true, name: true },
        });
        newlyCreated.forEach((k) => existingMap.set(k.name, k.id));
      }

      keywordRecords = validKeywordNames
        .map((name) => {
          const id = existingMap.get(name);
          return id ? { id } : null;
        })
        .filter((k): k is { id: string } => k !== null);
    }

    // 3. Optimización por Lotes (Batching) de Catálogo de Estudios
    interface RawStudy {
      name?: string;
      definition?: string;
      isAdequate?: boolean;
      findings?: string;
      imageUrl?: string;
      imageName?: string;
    }

    const rawStudies: RawStudy[] = (studies as RawStudy[]).filter((st) => Boolean(st?.name?.trim()));
    const uniqueStudyNames = Array.from(new Set(rawStudies.map((s) => s.name!.trim())));

    const existingStudies =
      uniqueStudyNames.length > 0
        ? await prisma.studyCatalog.findMany({
            where: { name: { in: uniqueStudyNames } },
            select: { id: true, name: true },
          })
        : [];
    const studyMap = new Map(existingStudies.map((s) => [s.name, s.id]));

    const missingStudies = uniqueStudyNames.filter((name) => !studyMap.has(name));
    if (missingStudies.length > 0) {
      const studyDefinitionsMap = new Map(
        rawStudies.map((s) => [s.name!.trim(), s.definition?.trim() || "Estudio complementario de diagnóstico"])
      );
      await prisma.studyCatalog.createMany({
        data: missingStudies.map((name) => ({
          name,
          generalDefinition: studyDefinitionsMap.get(name) || "Estudio complementario de diagnóstico",
        })),
        skipDuplicates: true,
      });
      const newlyCreatedStudies = await prisma.studyCatalog.findMany({
        where: { name: { in: missingStudies } },
        select: { id: true, name: true },
      });
      newlyCreatedStudies.forEach((s) => studyMap.set(s.name, s.id));
    }

    const validStudies = rawStudies
      .map((st) => {
        const catalogId = studyMap.get(st.name!.trim());
        if (!catalogId) return null;
        return {
          studyCatalogId: catalogId,
          isAdequate: st.isAdequate ?? true,
          findings: st.findings?.trim() || "Sin hallazgos especificados",
          imageUrl: st.imageUrl || null,
          imageName: st.imageName || null,
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);

    // 4. Crear el caso con todas sus relaciones anidadas de forma atómica
    const fullCase = await prisma.case.create({
      data: {
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
        keywords: {
          create: keywordRecords.map((kw) => ({
            keywordId: kw.id,
          })),
        },
        studies: {
          create: validStudies.map((s) => ({
            studyCatalogId: s.studyCatalogId,
            isAdequate: s.isAdequate,
            findings: s.findings,
            imageUrl: s.imageUrl,
            imageName: s.imageName,
          })),
        },
        treatmentOptions: {
          create: parsedTreatments,
        },
      },
      include: {
        keywords: { include: { keyword: true } },
        studies: { include: { studyCatalog: true } },
        treatmentOptions: true,
      },
    });

    return NextResponse.json({ success: true, data: fullCase }, { status: 201 });
  } catch (error) {
    console.error("[Casos] Error al registrar caso clínico en Supabase:", error);
    return NextResponse.json(
      { success: false, error: "Error interno al guardar el caso en la base de datos" },
      { status: 500 }
    );
  }
}
