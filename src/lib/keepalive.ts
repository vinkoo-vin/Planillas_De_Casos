import prisma from "@/lib/prisma";

const PING_INTERVAL_MS = 1000 * 60 * 60 * 12; // Cada 12 horas

let isKeepAliveRunning = false;

export async function pingDatabase(): Promise<boolean> {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1 as keep_alive, NOW() as current_time;`;
    const elapsed = Date.now() - start;
    console.log(`[Supabase Keep-Alive] Autoconsulta exitosa en ${elapsed}ms (${new Date().toLocaleString("es-ES")}). Proyecto activo.`);
    return true;
  } catch (err) {
    console.error("[Supabase Keep-Alive] Error en autoconsulta periódica:", err);
    return false;
  }
}

export function initKeepAliveScheduler() {
  if (isKeepAliveRunning) return;
  isKeepAliveRunning = true;

  // Ejecutar un primer ping diferido a los 5 segundos de iniciar
  setTimeout(() => {
    pingDatabase();
  }, 5000);

  // Programar ping periódico cada 12 horas
  setInterval(() => {
    pingDatabase();
  }, PING_INTERVAL_MS);

  console.log("[Supabase Keep-Alive] Programador de autoconsultas inicializado (cada 12 horas).");
}
