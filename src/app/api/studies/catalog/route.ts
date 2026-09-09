import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = body?.name?.trim();
    const generalDefinition = body?.generalDefinition?.trim() || null;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "El nombre del estudio es requerido" },
        { status: 400 }
      );
    }

    const study = await prisma.studyCatalog.upsert({
      where: { name },
      update: { generalDefinition },
      create: { name, generalDefinition },
    });

    return NextResponse.json({ success: true, data: study }, { status: 201 });
  } catch (error) {
    console.error("Error al registrar nuevo estudio en catálogo:", error);
    return NextResponse.json(
      { success: false, error: "Error al registrar el estudio" },
      { status: 500 }
    );
  }
}
