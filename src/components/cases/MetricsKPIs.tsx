"use client";

import React from "react";

interface MetricsKPIsProps {
  totalCases: number;
  totalStudies: number;
  totalTreatments: number;
  totalKeywords: number;
}

export const MetricsKPIs = React.memo(function MetricsKPIs({
  totalCases,
  totalStudies,
  totalTreatments,
  totalKeywords,
}: MetricsKPIsProps) {
  return (
    <div className="kpi-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
      {/* 1. CASOS CLÍNICOS */}
      <div className="kpi-card flex items-center gap-4 p-4 rounded-2xl transition-transform hover:-translate-y-0.5">
        <div className="kpi-icon-box kpi-icon-navy w-11 h-11 rounded-xl flex items-center justify-center shrink-0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        </div>
        <div className="kpi-details flex flex-col">
          <span className="kpi-value text-2xl font-extrabold tracking-tight">{totalCases}</span>
          <span className="kpi-label text-xs font-semibold text-text-muted">Casos Clínicos</span>
        </div>
      </div>

      {/* 2. ESTUDIOS VINCULADOS */}
      <div className="kpi-card flex items-center gap-4 p-4 rounded-2xl transition-transform hover:-translate-y-0.5">
        <div className="kpi-icon-box kpi-icon-teal w-11 h-11 rounded-xl flex items-center justify-center shrink-0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="m21 21-6-6m6 6v-4.8m0 4.8h-4.8" />
            <path d="M3 16.2V21m0 0h4.8M3 21l6-6" />
            <path d="M21 7.8V3m0 0h-4.8M21 3l-6 6" />
            <path d="M3 7.8V3m0 0h4.8M3 3l6 6" />
          </svg>
        </div>
        <div className="kpi-details flex flex-col">
          <span className="kpi-value text-2xl font-extrabold tracking-tight">{totalStudies}</span>
          <span className="kpi-label text-xs font-semibold text-text-muted">Estudios Vinculados</span>
        </div>
      </div>

      {/* 3. OPCIONES TERAPÉUTICAS */}
      <div className="kpi-card flex items-center gap-4 p-4 rounded-2xl transition-transform hover:-translate-y-0.5">
        <div className="kpi-icon-box kpi-icon-mint w-11 h-11 rounded-xl flex items-center justify-center shrink-0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
            <path d="m8.5 8.5 7 7" />
          </svg>
        </div>
        <div className="kpi-details flex flex-col">
          <span className="kpi-value text-2xl font-extrabold tracking-tight">{totalTreatments}</span>
          <span className="kpi-label text-xs font-semibold text-text-muted">Opciones Terapéuticas</span>
        </div>
      </div>

      {/* 4. TÉRMINOS MÉDICOS */}
      <div className="kpi-card flex items-center gap-4 p-4 rounded-2xl transition-transform hover:-translate-y-0.5">
        <div className="kpi-icon-box kpi-icon-amber w-11 h-11 rounded-xl flex items-center justify-center shrink-0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <line x1="21" y1="6" x2="3" y2="6" />
            <line x1="15" y1="12" x2="3" y2="12" />
            <line x1="17" y1="18" x2="3" y2="18" />
          </svg>
        </div>
        <div className="kpi-details flex flex-col">
          <span className="kpi-value text-2xl font-extrabold tracking-tight">{totalKeywords}</span>
          <span className="kpi-label text-xs font-semibold text-text-muted">Términos Médicos</span>
        </div>
      </div>
    </div>
  );
});
