"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { THEMES, ThemeKey } from "@/types/clinical";
import { CloseIcon, CheckIcon } from "@/components/common/Icons";

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>("teal");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cargar tema guardado en localStorage al iniciar
  useEffect(() => {
    try {
      const saved = localStorage.getItem("vinko_theme") as ThemeKey | null;
      if (saved && ["teal", "warm", "dark", "emerald", "neumorphic"].includes(saved)) {
        setCurrentTheme(saved);
        document.documentElement.setAttribute("data-theme", saved);
      }
    } catch {
      // localStorage no disponible
    }
  }, []);

  // Cerrar al hacer clic fuera del menú o presionar Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleThemeChange = useCallback(
    (nextTheme: ThemeKey) => {
      if (currentTheme === nextTheme) {
        setIsOpen(false);
        return;
      }

      const updateDOM = () => {
        setCurrentTheme(nextTheme);
        document.documentElement.setAttribute("data-theme", nextTheme);
        try {
          localStorage.setItem("vinko_theme", nextTheme);
        } catch {
          // localStorage no disponible
        }
      };

      if (typeof document !== "undefined" && "startViewTransition" in document) {
        (document as any).startViewTransition(() => {
          updateDOM();
        });
      } else {
        updateDOM();
      }

      setIsOpen(false);
    },
    [currentTheme]
  );

  const activeThemeObj = THEMES.find((t) => t.id === currentTheme) || THEMES[0];

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-40 select-none">
      {/* MENÚ POPOVER DESPLEGABLE */}
      {isOpen && (
        <div
          className="absolute bottom-16 right-0 mb-2 w-64 p-3 rounded-2xl bg-card-bg border border-card-border shadow-2xl animate-scaleUp backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          aria-label="Paleta de temas visuales"
        >
          {/* ENCABEZADO DEL MENÚ */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-subtle px-1">
            <div className="flex items-center gap-2">
              <span className="text-base">🎨</span>
              <span className="text-xs font-bold text-text-main uppercase tracking-wider">
                Paleta de Temas
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 rounded-full flex items-center justify-center text-text-muted hover:text-text-main transition-colors cursor-pointer"
              aria-label="Cerrar paleta"
            >
              <CloseIcon width={14} height={14} />
            </button>
          </div>

          {/* LISTADO DE LOS 4 TEMAS */}
          <div className="flex flex-col gap-1.5" role="radiogroup" aria-label="Seleccionar tema visual">
            {THEMES.map((t) => {
              const isActive = currentTheme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleThemeChange(t.id)}
                  role="radio"
                  aria-checked={isActive}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-primary/10 border border-primary/30 text-text-main font-bold shadow-xs"
                      : "hover:bg-surface-hover border border-transparent text-text-body"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center gap-1 p-1 rounded-md bg-surface-subtle border border-border-subtle">
                      <span
                        className="w-3 h-3 rounded-full inline-block shadow-xs"
                        style={{ background: t.dotPrimary }}
                      />
                      <span
                        className="w-3 h-3 rounded-full inline-block shadow-xs"
                        style={{ background: t.dotSecondary }}
                      />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold leading-snug">{t.name}</span>
                      <span className="text-[10px] text-text-muted">{t.label}</span>
                    </div>
                  </div>

                  {isActive && (
                    <CheckIcon width={16} height={16} strokeWidth={3} className="text-primary shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* BOTÓN FLOTANTE EN FORMA DE TABLA DE PINTURA (SIN LA BROCHA) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group relative w-14 h-14 rounded-2xl flex items-center justify-center bg-card-bg border border-card-border shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer backdrop-blur-md"
        title="Cambiar paleta de colores / Tema visual"
        aria-label="Abrir selector de paleta de colores"
        aria-expanded={isOpen}
      >
        {/* SVG TABLA DE PINTURAS ARTISTA (MADERA CON ÓLEOS DE COLORES Y HUECO DE PULGAR, SIN BROCHA) */}
        <svg
          width="32"
          height="32"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 group-hover:rotate-12"
        >
          {/* Cuerpo ovalado de la tabla de pinturas con gradiente de madera */}
          <path
            d="M24 4C12.95 4 4 12.95 4 24c0 6.6 3.2 12.5 8.2 16.1 1.2.9 2.9.4 3.5-.9l1.4-2.8c.8-1.5 2.4-2.4 4.1-2.4h3.8c7.7 0 14-6.3 14-14C43 11.2 34.5 4 24 4z"
            fill="url(#paletteWoodGradient)"
            stroke="#A8733E"
            strokeWidth="1.6"
          />
          {/* Orificio para el pulgar de la paleta */}
          <ellipse
            cx="32"
            cy="27"
            rx="3.6"
            ry="4.6"
            fill="var(--card-bg, #ffffff)"
            stroke="#A8733E"
            strokeWidth="1.4"
          />
          {/* Manchas de pintura al óleo perimetrales */}
          <circle cx="12.5" cy="20" r="3.2" fill="#EF4444" stroke="#DC2626" strokeWidth="0.5" />
          <circle cx="15.5" cy="12.5" r="3.2" fill="#F97316" stroke="#EA580C" strokeWidth="0.5" />
          <circle cx="23.5" cy="9" r="3.2" fill="#FBBF24" stroke="#D97706" strokeWidth="0.5" />
          <circle cx="31.5" cy="12" r="3.2" fill="#10B981" stroke="#059669" strokeWidth="0.5" />
          <circle cx="37" cy="18.5" r="3" fill="#06B6D4" stroke="#0891B2" strokeWidth="0.5" />
          <circle cx="21" cy="28.5" r="2.8" fill="#8B5CF6" stroke="#7C3AED" strokeWidth="0.5" />
          <circle cx="15" cy="27" r="2.8" fill="#EC4899" stroke="#DB2777" strokeWidth="0.5" />
          <defs>
            <linearGradient id="paletteWoodGradient" x1="4" y1="4" x2="43" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F5D0A1" />
              <stop offset="0.5" stopColor="#E2B27B" />
              <stop offset="1" stopColor="#C68B4C" />
            </linearGradient>
          </defs>
        </svg>

        {/* INDICADOR DEL TEMA ACTUAL ACTIVO */}
        <span
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-card-bg shadow-sm"
          style={{ background: activeThemeObj.dotPrimary }}
          title={`Tema activo: ${activeThemeObj.name}`}
        />
      </button>
    </div>
  );
}
