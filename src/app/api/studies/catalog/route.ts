import { NextResponse } from "next/server";
import { getOrCreateCatalogItem } from "@/lib/catalogo-service";
import { CatalogType, CatalogOrigin } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = body?.name?.trim();

    if (!name) {
      return NextResponse.json(
        { success: false, error: "El nombre del estudio es requerido" },
        { status: 400 }
      );
    }

    const result = await getOrCreateCatalogItem(CatalogType.tipo_estudio, name, {
      origin: CatalogOrigin.admin,
    });

    return NextResponse.json({ success: true, data: result.item }, { status: 201 });
  } catch (error) {
    console.error("Error al registrar nuevo estudio en catálogo:", error);
    return NextResponse.json(
      { success: false, error: "Error al registrar el estudio" },
      { status: 500 }
    );
  }
}
