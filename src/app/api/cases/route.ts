import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  validateCaseInput,
  prepareCaseBaseData,
  syncCaseChildren,
  caseDetailIncludes,
  caseListSelect,
  type CasePayloadData,
} from "@/lib/case-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id");
    const isFull = searchParams.get("full") === "true";

    // ── Caso individual por ID ──────────────────────────────
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

    // ── Lista de casos ──────────────────────────────────────
    const cases = isFull
      ? await prisma.case.findMany({
          orderBy: { createdAt: "desc" },
          take: 100,
          include: caseDetailIncludes,
        })
      : await prisma.case.findMany({
          orderBy: { createdAt: "desc" },
          take: 100,
          select: caseListSelect,
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
    const body: CasePayloadData = await req.json();

    const validation = validateCaseInput(body as Record<string, unknown>);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const baseData = prepareCaseBaseData(body);

    // Crear el caso base primero, luego las relaciones hijas
    const newCase = await prisma.case.create({ data: baseData });
    await syncCaseChildren(newCase.id, body);

    // Retornar el caso completo con relaciones
    const fullCase = await prisma.case.findUnique({
      where: { id: newCase.id },
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
    const body: CasePayloadData & { id: string } = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "El ID del caso es requerido para actualizarlo" },
        { status: 400 }
      );
    }

    const validation = validateCaseInput(body as unknown as Record<string, unknown>);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
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

    const baseData = prepareCaseBaseData(body);

    // Actualizar base y sincronizar relaciones hijas
    await prisma.case.update({ where: { id }, data: baseData });
    await syncCaseChildren(id, body);

    const updatedCase = await prisma.case.findUnique({
      where: { id },
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

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        if (body && typeof body.id === "string") {
          id = body.id;
        }
      } catch {
        // Body vacío o no es JSON válido
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "El ID del caso es requerido para eliminarlo" },
        { status: 400 }
      );
    }

    const existingCase = await prisma.case.findUnique({
      where: { id },
      select: { id: true, principalReason: { select: { name: true } } },
    });

    if (!existingCase) {
      return NextResponse.json(
        { success: false, error: "Caso clínico no encontrado" },
        { status: 404 }
      );
    }

    // Eliminación en cascada configurada en el schema
    await prisma.case.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `El caso clínico fue eliminado exitosamente`,
      id,
    });
  } catch (error) {
    console.error("[Casos] Error al eliminar caso clínico:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno al eliminar el caso de la base de datos",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
