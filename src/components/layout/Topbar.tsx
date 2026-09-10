"use client";

import { useTransition } from "react";
import Image from "next/image";

export type ActiveTab = "form" | "list" | "guide";

interface TopbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  savedCasesCount: number;
}

export function Topbar({ activeTab, onTabChange, savedCasesCount }: TopbarProps) {
  const [isPending, startTransition] = useTransition();

  const handleSelectTab = (tab: ActiveTab) => {
    startTransition(() => {
      onTabChange(tab);
    });
  };

  return (
    <header className="app-topbar sticky top-0 z-50 backdrop-blur-md transition-colors">
      <div className="app-topbar-inner max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* LOGO Y MARCA */}
        <div
          className="app-brand flex items-center gap-3 cursor-pointer select-none"
          onClick={() => handleSelectTab("form")}
        >
          <div className="brand-icon-box w-10 h-10 rounded-xl flex items-center justify-center shadow-md p-1.5 overflow-hidden">
            <Image
              src="/V1.svg"
              alt="Vinko Logo"
              width={26}
              height={23}
              priority
              className="w-auto h-6 object-contain drop-shadow-sm"
            />
          </div>
          <div>
            <div className="brand-title text-xl font-extrabold tracking-tight">Vinko</div>
          </div>
        </div>

        {/* CONTROLES DERECHA: PESTAÑAS SEGMENTADAS */}
        <div className="topbar-right flex items-center gap-3.5">
          <div className="nav-segmented inline-flex p-1 rounded-xl gap-1">
            <button
              type="button"
              className={`nav-segmented-btn inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === "form" ? "active shadow-sm" : ""
                }`}
              onClick={() => handleSelectTab("form")}
              disabled={isPending}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Nuevo Caso
            </button>

            <button
              type="button"
              className={`nav-segmented-btn inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === "list" ? "active shadow-sm" : ""
                }`}
              onClick={() => handleSelectTab("list")}
              disabled={isPending}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
              </svg>
              Casos Cargados
              <span className="count-pill text-xs font-bold px-1.5 py-0.5 rounded-full">
                {savedCasesCount}
              </span>
            </button>

            <button
              type="button"
              className={`nav-segmented-btn inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === "guide" ? "active shadow-sm" : ""
                }`}
              onClick={() => handleSelectTab("guide")}
              disabled={isPending}
              title="Guía detallada de cada campo del formulario"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              Guía del Formulario
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
