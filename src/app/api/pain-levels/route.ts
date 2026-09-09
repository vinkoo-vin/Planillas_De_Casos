import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const description = body?.description?.trim();

    if (!description) {
      return NextResponse.json(
        { success: false, error: "La descripción del nivel de dolor es requerida" },
        { status: 400 }
      );
    }

    const painLevel = await prisma.painLevelCatalog.upsert({
      where: { description },
      update: {},
      create: { description },
    });

    return NextResponse.json({ success: true, data: painLevel }, { status: 201 });
  } catch (error) {
    console.error("Error al registrar nivel de dolor:", error);
    return NextResponse.json(
      { success: false, error: "Error interno al guardar nivel de dolor" },
      { status: 500 }
    );
  }
}
