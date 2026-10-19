import { NextRequest, NextResponse } from "next/server";
import {
  isCatalogType,
  importCatalogItems,
  CatalogError,
} from "@/lib/catalogo-service";
import { CatalogOrigin } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ catalogo: string }> }
) {
  try {
    const { catalogo } = await props.params;

    if (!isCatalogType(catalogo)) {
      return NextResponse.json(
        { success: false, error: `Catálogo "${catalogo}" no válido` },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const lineas = Array.isArray(body.lineas) ? body.lineas : [];

    if (lineas.length === 0) {
      return NextResponse.json(
        { success: false, error: "La lista de líneas a importar está vacía" },
        { status: 400 }
      );
    }

    const result = await importCatalogItems(
      catalogo,
      lineas,
      CatalogOrigin.admin
    );

    return NextResponse.json({
      success: true,
      catalogo,
      data: result,
      mensaje: `Importación completada: ${result.creados} creados, ${result.existentes} existentes, ${result.invalidos} inválidos.`,
    });
  } catch (error) {
    if (error instanceof CatalogError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error("[Catalogos Importar] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error durante la importación",
      },
      { status: 500 }
    );
  }
}
