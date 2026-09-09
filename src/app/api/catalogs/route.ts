import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Consulta optimizada con proyección select estricta para reducir consumo de I/O y memoria
    const [keywords, studies, painLevels] = await Promise.all([
      prisma.keyword.findMany({
        select: { name: true },
        orderBy: { name: "asc" },
      }),
      prisma.studyCatalog.findMany({
        select: { id: true, name: true, generalDefinition: true },
        orderBy: { name: "asc" },
      }),
      prisma.painLevelCatalog.findMany({
        select: { description: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          keywords: keywords.map((k) => k.name),
          studies,
          painLevels: painLevels.map((p) => p.description),
        },
      },
      {
        headers: {
          // Permite responder desde caché rápida y revalidar en segundo plano para evitar saturar la BD
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
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
