import { NextResponse } from "next/server";
import { getOrCreateCatalogItem } from "@/lib/catalogo-service";
import { CatalogType, CatalogOrigin } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = body?.name?.trim();

    if (!name) {
      return NextResponse.json(
        { success: false, error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    const result = await getOrCreateCatalogItem(CatalogType.motivo_consulta, name, {
      origin: CatalogOrigin.caso,
    });

    return NextResponse.json({ success: true, data: result.item }, { status: 201 });
  } catch (error) {
    console.error("Error al registrar palabra clave/motivo:", error);
    return NextResponse.json(
      { success: false, error: "Error interno al guardar elemento" },
      { status: 500 }
    );
  }
}
