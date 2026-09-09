"use client";

import React from "react";

interface AdequacyBadgeProps {
  isAdequate: boolean;
  withIcon?: boolean;
  className?: string;
}

/**
 * Componente reutilizable para visualizar el criterio pedagógico de un estudio complementario.
 * Renderiza el estilo 'adequate' (Indicado) o 'distractor' (Distractor) configurado en el sistema de diseño.
 */
export const AdequacyBadge = React.memo(function AdequacyBadge({
  isAdequate,
  withIcon = true,
  className = "",
}: AdequacyBadgeProps) {
  return (
    <span
      className={`adequacy-tag text-xs font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
        isAdequate ? "adequate" : "distractor"
      } ${className}`}
    >
      {withIcon &&
        (isAdequate ? (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="shrink-0"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="shrink-0"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        ))}
      <span>{isAdequate ? "Indicado" : "Distractor"}</span>
    </span>
  );
});
