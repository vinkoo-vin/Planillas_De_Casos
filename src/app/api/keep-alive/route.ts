import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Endpoint de autoconsulta / Keep-Alive para Supabase
 * Ejecuta una consulta directa y ligera a PostgreSQL para registrar actividad
 * y evitar que el proyecto en plan gratuito se pause por inactividad (7 días).
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // 1. Consulta directa liviana a PostgreSQL para resetear el contador de inactividad
    const result = await prisma.$queryRaw<Array<{ keep_alive: number; current_time: Date }>>`
      SELECT 1 as keep_alive, NOW() as current_time;
    `;

    // 2. Conteo rápido de casos
    const casesCount = await prisma.case.count();

    const responseTimeMs = Date.now() - startTime;

    return NextResponse.json(
      {
        success: true,
        status: "active",
        database: "connected",
        pingResult: result[0] || null,
        casesCount,
        responseTimeMs,
        timestamp: new Date().toISOString(),
        message: "Keep-alive ping exitoso a Supabase. El proyecto se mantiene activo.",
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("[Keep-Alive] Error al consultar Supabase:", error);
    return NextResponse.json(
      {
        success: false,
        status: "error",
        error: error instanceof Error ? error.message : "Error de conexión a la base de datos",
        responseTimeMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
