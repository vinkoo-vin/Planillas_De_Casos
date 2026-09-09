import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = body?.name?.trim();

    if (!name) {
      return NextResponse.json(
        { success: false, error: "El nombre de la palabra clave es requerido" },
        { status: 400 }
      );
    }

    const keyword = await prisma.keyword.upsert({
      where: { name },
      update: {},
      create: { name },
    });

    return NextResponse.json({ success: true, data: keyword }, { status: 201 });
  } catch (error) {
    console.error("Error al registrar palabra clave:", error);
    return NextResponse.json(
      { success: false, error: "Error interno al guardar palabra clave" },
      { status: 500 }
    );
  }
}
