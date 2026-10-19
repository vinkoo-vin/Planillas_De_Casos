import { NextRequest, NextResponse } from "next/server";
import {
  isCatalogType,
  listCatalogItems,
  getOrCreateCatalogItem,
  CatalogError,
} from "@/lib/catalogo-service";
import { CatalogOrigin } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(
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

    const { searchParams } = request.nextUrl;
    const q = searchParams.get("q") ?? undefined;
    const activosParam = searchParams.get("activos");
    const activosOnly = activosParam === null ? true : activosParam === "true";
    const includeUsage = searchParams.get("usage") === "true";

    const items = await listCatalogItems(catalogo, {
      q,
      activosOnly,
      includeUsageCount: includeUsage,
    });

    return NextResponse.json(
      {
        success: true,
        catalogo,
        total: items.length,
        data: items,
      },
      {
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("[Catalogos GET] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al obtener catálogo",
      },
      { status: 500 }
    );
  }
}

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
    const nombre = typeof body.nombre === "string" ? body.nombre : "";
    const rawOrigin = body.origin;
    const origin =
      rawOrigin === "admin"
        ? CatalogOrigin.admin
        : rawOrigin === "seed"
        ? CatalogOrigin.seed
        : CatalogOrigin.caso;

    const result = await getOrCreateCatalogItem(catalogo, nombre, {
      origin,
      reviewed: body.reviewed,
    });

    return NextResponse.json(
      {
        success: true,
        item: result.item,
        creado: result.creado,
        mensaje: result.creado
          ? "Elemento creado en el catálogo"
          : "El elemento ya existía en el catálogo y fue seleccionado",
      },
      { status: result.creado ? 201 : 200 }
    );
  } catch (error) {
    if (error instanceof CatalogError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error("[Catalogos POST] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al crear elemento de catálogo",
      },
      { status: 500 }
    );
  }
}
