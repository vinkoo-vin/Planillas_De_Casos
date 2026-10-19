/**
 * normalizar — Servicio de normalización de elementos del catálogo.
 *
 * Reglas:
 * 1. Trim + colapsar espacios múltiples.
 * 2. Eliminar puntuación final (punto, coma, punto y coma, dos puntos).
 * 3. `nombre` (para mostrar): primera letra mayúscula, resto minúscula.
 * 4. `clave` (para comparar): minúsculas, sin tildes, conservando la ñ.
 *
 * La normalización siempre ocurre en el servidor; el cliente solo
 * la usa para previsualizar o hacer búsquedas locales.
 *
 * Casos de prueba documentados en plan-de-ejecucion §4:
 * | Entrada                          | nombre               | clave                |
 * |----------------------------------|----------------------|----------------------|
 * | "  oclusión   intestinal "       | "Oclusión intestinal"| "oclusion intestinal"|
 * | "OCLUSIÓN INTESTINAL"            | "Oclusión intestinal"| "oclusion intestinal"|
 * | "Ecografía."                     | "Ecografía"          | "ecografia"          |
 * | "   "                            | null                 | —                    |
 * | "Niño" vs "Nino"                 | distintos            | distintos            |
 * | "TAC"                            | "Tac"  (admin corrige)| "tac"               |
 */
export type NormalizarResult = { nombre: string; clave: string };

export function normalizar(entrada: string): NormalizarResult | null {
  // 1. Limpiar espacios y puntuación final
  const limpio = entrada
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.,;:]+$/, "");

  if (!limpio) return null;

  // 2. Nombre mostrado: "Primera segunda"
  const nombre =
    limpio.charAt(0).toLocaleUpperCase("es") +
    limpio.slice(1).toLocaleLowerCase("es");

  // 3. Clave de comparación: minúsculas + quitar tildes, pero conservar ñ
  //    Truco: reemplazamos ñ por un placeholder antes de normalize("NFD")
  //    para que no pierda su diacrítico.
  const PLACEHOLDER = "\u0001";
  const clave = limpio
    .toLocaleLowerCase("es")
    .replace(/ñ/g, PLACEHOLDER)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(new RegExp(PLACEHOLDER, "g"), "ñ");

  return { nombre, clave };
}

/**
 * normalizarClave — Devuelve solo la clave para búsquedas.
 * Útil en el front para filtrar mientras se escribe.
 */
export function normalizarClave(entrada: string): string {
  return normalizar(entrada)?.clave ?? "";
}
