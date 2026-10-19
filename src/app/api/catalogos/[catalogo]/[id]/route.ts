import { NextRequest, NextResponse } from "next/server";
import {
  isCatalogType,
  updateCatalogItem,
  CatalogError,
} from "@/lib/catalogo-service";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ catalogo: string; id: string }> }
) {
  try {
    const { catalogo, id } = await props.params;

    if (!isCatalogType(catalogo)) {
      return NextResponse.json(
        { success: false, error: `Catálogo "${catalogo}" no válido` },
        { status: 400 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID del elemento es requerido" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));

    const updated = await updateCatalogItem(catalogo, id, {
      name: typeof body.name === "string" ? body.name : undefined,
      active: typeof body.active === "boolean" ? body.active : undefined,
      reviewed: typeof body.reviewed === "boolean" ? body.reviewed : undefined,
    });

    return NextResponse.json({
      success: true,
      item: updated,
      message: "Elemento actualizado correctamente",
    });
  } catch (error) {
    if (error instanceof CatalogError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error("[Catalogos PATCH] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al actualizar elemento",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  props: { params: Promise<{ catalogo: string; id: string }> }
) {
  try {
    const { catalogo, id } = await props.params;

    if (!isCatalogType(catalogo)) {
      return NextResponse.json(
        { success: false, error: `Catálogo "${catalogo}" no válido` },
        { status: 400 }
      );
    }

    // Regla de negocio (§3): un elemento usado no se borra físicamente, se marca activo = false
    const deactivated = await updateCatalogItem(catalogo, id, {
      active: false,
    });

    return NextResponse.json({
      success: true,
      item: deactivated,
      message: "Elemento desactivado correctamente",
    });
  } catch (error) {
    if (error instanceof CatalogError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error("[Catalogos DELETE] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al desactivar elemento",
      },
      { status: 500 }
    );
  }
}
