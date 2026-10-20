"use client";

import React, { useEffect } from "react";

interface PostSubmitReuseModalProps {
  onReuse: () => void;
  onStartOver: () => void;
}

export const PostSubmitReuseModal = React.memo(function PostSubmitReuseModal({
  onReuse,
  onStartOver,
}: PostSubmitReuseModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onReuse();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onReuse]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-submit-modal-title"
        aria-describedby="post-submit-modal-description"
        className="w-full max-w-md rounded-2xl border border-amber-500/30 bg-card-bg p-6 shadow-2xl animate-fadeIn"
      >
        <div className="flex items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M10.3 3.7 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </span>
          <div>
            <h2 id="post-submit-modal-title" className="text-lg font-extrabold text-text-main">
              Caso guardado
            </h2>
            <p id="post-submit-modal-description" className="mt-2 text-sm leading-relaxed text-text-body">
              ¿Desea conservar la información cargada para reutilizar algunos apartados en otro caso o comenzar desde cero?
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onStartOver}
            className="btn border border-border-subtle px-4 py-2.5 rounded-xl text-sm font-semibold text-text-main hover:bg-surface-hover cursor-pointer transition-colors"
          >
            Empezar desde cero
          </button>
          <button
            type="button"
            onClick={onReuse}
            className="btn btn-teal px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer shadow-sm"
          >
            Reutilizar información
          </button>
        </div>
      </div>
    </div>
  );
});
