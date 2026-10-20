import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [keywords, studies, painLevels] = await Promise.all([
      prisma.catalogItem.findMany({
        where: { catalog: "motivo_consulta", active: true },
        select: { name: true },
        orderBy: { name: "asc" },
      }),
      prisma.catalogItem.findMany({
        where: { catalog: "tipo_estudio", active: true },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.catalogItem.findMany({
        where: { catalog: "nivel_respuesta", active: true },
        select: { name: true },
        orderBy: { name: "asc" },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          keywords: keywords.map((k) => k.name),
          studies: studies.map((s) => ({
            id: s.id,
            name: s.name,
            generalDefinition: `Estudio complementario de tipo ${s.name}`,
          })),
          painLevels: painLevels.map((p) => p.name),
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("[Catálogos] Error al obtener catálogos:", error);
    return NextResponse.json(
      { success: false, error: "No se pudieron obtener los catálogos" },
      { status: 500 }
    );
  }
}
