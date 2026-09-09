import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  validateCaseInput,
  prepareCasePayload,
  caseDetailIncludes,
} from "@/lib/case-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id");
    const search = searchParams.get("search")?.trim();
    const isFull = searchParams.get("full") === "true";

    // 1. Consulta de caso individual completo por ID (para el Modal de Ficha Clínica)
    if (id) {
      const singleCase = await prisma.case.findUnique({
        where: { id },
        include: caseDetailIncludes,
      });

      if (!singleCase) {
        return NextResponse.json(
          { success: false, error: "Caso clínico no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: true, data: singleCase },
        {
          headers: {
            "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
          },
        }
      );
    }

    // 2. Filtro de búsqueda opcional
    const whereClause = search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { clinicalHistory: { contains: search, mode: "insensitive" as const } },
            { keywords: { some: { keyword: { name: { contains: search, mode: "insensitive" as const } } } } },
          ],
        }
      : undefined;

    // 3. Consulta para la lista de casos
    const cases = isFull
      ? await prisma.case.findMany({
          where: whereClause,
          orderBy: { createdAt: "desc" },
          take: 100,
          include: caseDetailIncludes,
        })
      : await prisma.case.findMany({
          where: whereClause,
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

    return NextResponse.json({
      success: true,
      data: cases,
      meta: {
        total: cases.length,
        timestamp: new Date().toISOString(),
      },
    });
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

    const validation = validateCaseInput(body);
    if (!validation.isValid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    const { baseData, keywordsCreate, studiesCreate, treatmentOptionsCreate } =
      await prepareCasePayload(body);

    const fullCase = await prisma.case.create({
      data: {
        ...baseData,
        keywords: { create: keywordsCreate },
        studies: { create: studiesCreate },
        treatmentOptions: { create: treatmentOptionsCreate },
      },
      include: caseDetailIncludes,
    });

    return NextResponse.json({ success: true, data: fullCase }, { status: 201 });
  } catch (error) {
    console.error("[Casos] Error al registrar caso clínico:", error);
    return NextResponse.json(
      { success: false, error: "Error interno al guardar el caso en la base de datos" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "El ID del caso es requerido para actualizarlo" },
        { status: 400 }
      );
    }

    const validation = validateCaseInput(body);
    if (!validation.isValid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    const existingCase = await prisma.case.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingCase) {
      return NextResponse.json(
        { success: false, error: "Caso clínico no encontrado" },
        { status: 404 }
      );
    }

    const { baseData, keywordsCreate, studiesCreate, treatmentOptionsCreate } =
      await prepareCasePayload(body);

    // Actualización atómica del caso y sincronización de relaciones hijas
    const updatedCase = await prisma.case.update({
      where: { id },
      data: {
        ...baseData,
        keywords: {
          deleteMany: {},
          create: keywordsCreate,
        },
        studies: {
          deleteMany: {},
          create: studiesCreate,
        },
        treatmentOptions: {
          deleteMany: {},
          create: treatmentOptionsCreate,
        },
      },
      include: caseDetailIncludes,
    });

    return NextResponse.json({ success: true, data: updatedCase });
  } catch (error) {
    console.error("[Casos] Error al actualizar caso clínico:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno al actualizar el caso en la base de datos",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
