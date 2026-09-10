"use client";

import { useEffect, useState, useTransition, useMemo, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { StudyCatalogItem, SavedCase, CaseDraft } from "@/types/clinical";
import { savedCaseToDraft } from "@/lib/case-transformers";
import { Topbar, ActiveTab } from "@/components/layout/Topbar";
import { MetricsKPIs } from "@/components/cases/MetricsKPIs";
import { CasesTable } from "@/components/cases/CasesTable";
import { CaseForm } from "@/components/form/CaseForm";
import { ThemeSwitcher } from "@/components/common/ThemeSwitcher";
import { CaseDetailModal } from "@/components/cases/CaseDetailModal";

// Carga diferida de componentes pesados bajo demanda (Code-Splitting según Vercel Best Practices)
const FormGuide = dynamic(
  () => import("@/components/guide/FormGuide").then((m) => m.FormGuide),
  {
    ssr: false,
    loading: () => (
      <div className="py-24 text-center text-text-muted">
        <div className="animate-spin w-8 h-8 border-3 border-teal border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm font-semibold">Cargando Guía del Formulario...</p>
      </div>
    ),
  }
);



export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("form");
  const [formDraft, setFormDraft] = useState<CaseDraft | null>(null);
  const [, startTransition] = useTransition();

  // Catálogos globales cargados desde la base de datos
  const [keywordsPool, setKeywordsPool] = useState<string[]>([]);
  const [studiesCatalog, setStudiesCatalog] = useState<StudyCatalogItem[]>([]);
  const [painLevelsPool, setPainLevelsPool] = useState<string[]>([]);

  // Casos guardados
  const [savedCasesList, setSavedCasesList] = useState<SavedCase[]>([]);
  const [isLoadingCases, setIsLoadingCases] = useState(false);

  // Modal de detalle y notificaciones
  const [inspectingCase, setInspectingCase] = useState<SavedCase | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Caché en memoria para fichas clínicas completas (acceso instantáneo en 0ms)
  const caseDetailsCache = useRef<Map<string, SavedCase>>(new Map());

  // Consulta de casos guardados (asíncrona en segundo plano) con validación HTTP
  const fetchSavedCases = useCallback(async () => {
    try {
      setIsLoadingCases(true);
      const res = await fetch("/api/cases");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success) {
        setSavedCasesList(json.data);
      }
    } catch (err) {
      console.error("Error al cargar casos guardados:", err);
    } finally {
      setIsLoadingCases(false);
    }
  }, []);

  // Precarga predictiva en segundo plano cuando el usuario pasa el mouse sobre la fila o botón
  const handlePrefetchCase = useCallback((id: string) => {
    if (caseDetailsCache.current.has(id)) return;
    fetch(`/api/cases?id=${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (json.success && json.data) {
          caseDetailsCache.current.set(id, json.data);
        }
      })
      .catch(() => {});
  }, []);

  // Inspección de ficha detallada con apertura instantánea (0ms)
  const handleInspectCase = useCallback(
    (id: string) => {
      // 1. Lectura instantánea desde caché en memoria (0ms)
      const cached = caseDetailsCache.current.get(id);
      if (cached) {
        setInspectingCase(cached);
        return;
      }

      // 2. Fallback con datos parciales de la lista
      const partial = savedCasesList.find((c) => c.id === id);
      if (partial) {
        setInspectingCase(partial);
      }

      // 3. Carga en segundo plano
      setIsLoadingDetail(true);
      fetch(`/api/cases?id=${id}`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((json) => {
          if (json.success && json.data) {
            caseDetailsCache.current.set(id, json.data);
            setInspectingCase(json.data);
          }
        })
        .catch((err) => {
          console.error("Error al cargar ficha detallada:", err);
        })
        .finally(() => {
          setIsLoadingDetail(false);
        });
    },
    [savedCasesList]
  );

  // Carga inicial no bloqueante: la UI del formulario se renderiza al instante
  useEffect(() => {
    let isMounted = true;
    fetch("/api/catalogs")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (isMounted && json.success) {
          setKeywordsPool(json.data.keywords);
          setStudiesCatalog(json.data.studies);
          setPainLevelsPool(json.data.painLevels);
        }
      })
      .catch((err) => {
        console.error("Error al cargar catálogos iniciales:", err);
      });

    const timer = setTimeout(() => {
      startTransition(() => {
        fetchSavedCases();
      });
    }, 40);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [fetchSavedCases]);

  // Métricas calculadas con useMemo
  const totalStudiesCount = useMemo(() => {
    return savedCasesList.reduce((acc, c) => acc + (c.studies?.length || 0), 0);
  }, [savedCasesList]);

  const totalTreatmentsCount = useMemo(() => {
    return savedCasesList.reduce((acc, c) => acc + (c.treatmentOptions?.length || 0), 0);
  }, [savedCasesList]);

  const handleCaseCreated = useCallback((newCase: SavedCase) => {
    caseDetailsCache.current.set(newCase.id, newCase);
    setSavedCasesList((prev) => [newCase, ...prev]);
  }, []);

  const handleCaseUpdated = useCallback((updated: SavedCase) => {
    caseDetailsCache.current.set(updated.id, updated);
    setSavedCasesList((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setInspectingCase((prev) => (prev && prev.id === updated.id ? updated : prev));
  }, []);

  const handleEditCase = useCallback((c: SavedCase) => {
    const draft = savedCaseToDraft(c);
    setFormDraft(draft);
    setInspectingCase(null);
    setActiveTab("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleNotify = useCallback((msg: string) => {
    setCopiedNotification(msg);
    setTimeout(() => setCopiedNotification(null), 3000);
  }, []);

  const handleLoadCaseExample = useCallback((draft: CaseDraft) => {
    setFormDraft(draft);
    setActiveTab("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      {/* BARRA SUPERIOR CON SELECTOR DE TEMAS Y PESTAÑAS */}
      <Topbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        savedCasesCount={savedCasesList.length}
      />

      <div className="container max-w-5xl mx-auto px-4 py-8">
        {/* ENCABEZADO DE SECCIÓN ACTIVA (SOLO PARA FORMULARIO Y LISTA) */}
        {activeTab !== "guide" && (
          <header className="text-center mb-8">
            <div className="badge-top inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              <span className="badge-dot w-2 h-2 rounded-full" />
              {activeTab === "form"
                ? "Formulario Maestro para Especialistas"
                : "Repositorio Clínico"}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 text-text-main">
              {activeTab === "form"
                ? "Carga de Caso Clínico Pediátrico"
                : "Casos Clínicos Registrados"}
            </h1>
            <p className="subtitle text-sm sm:text-base text-text-muted max-w-2xl mx-auto">
              {activeTab === "form"
                ? "Complete los módulos secuenciales para registrar y publicar el caso clínico en la plataforma."
                : "Listado de casos almacenados listos para el simulador de estudiantes."}
            </p>
          </header>
        )}

        {/* CONTENIDO PRINCIPAL SEGÚN PESTAÑA */}
        {activeTab === "form" ? (
          <div>
            {/* ACCESO RÁPIDO A LA GUÍA DESDE EL FORMULARIO */}
            <aside
              aria-label="Acceso a la guía de carga"
              className="mb-6 p-4 rounded-2xl bg-surface-subtle border border-border-subtle flex items-center justify-between gap-4 flex-wrap"
            >
              <div className="flex items-center gap-3 text-xs sm:text-sm text-text-body">
                <span className="w-8 h-8 rounded-xl bg-primary-light text-primary flex items-center justify-center font-bold text-base shrink-0">
                  📖
                </span>
                <div>
                  <span className="font-bold text-text-main">¿Primera vez o dudas con los campos?</span>{" "}
                  Consulte la guía completa con ejemplos reales y formato de cada sección.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("guide")}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-primary bg-primary-light hover:bg-primary/20 transition-all cursor-pointer"
              >
                Abrir Guía del Formulario
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </aside>

            <CaseForm
              initialDraft={formDraft}
              onClearDraft={() => setFormDraft(null)}
              keywordsPool={keywordsPool}
              setKeywordsPool={setKeywordsPool}
              studiesCatalog={studiesCatalog}
              painLevelsPool={painLevelsPool}
              setPainLevelsPool={setPainLevelsPool}
              onCaseCreated={handleCaseCreated}
              onCaseUpdated={handleCaseUpdated}
              onViewCasesList={() => {
                setActiveTab("list");
                fetchSavedCases();
              }}
              onNotify={handleNotify}
            />
          </div>
        ) : activeTab === "list" ? (
          <div>
            {/* TARJETAS DE MÉTRICAS CLÍNICAS (KPIS) */}
            <MetricsKPIs
              totalCases={savedCasesList.length}
              totalStudies={totalStudiesCount}
              totalTreatments={totalTreatmentsCount}
              totalKeywords={keywordsPool.length}
            />

            {/* TABLA DE CASOS CON FILTRADO REACTIVO Y PRECARGA */}
            <CasesTable
              cases={savedCasesList}
              isLoading={isLoadingCases}
              onRefresh={fetchSavedCases}
              onInspect={handleInspectCase}
              onEdit={handleEditCase}
              onNewCaseClick={() => setActiveTab("form")}
              onPrefetch={handlePrefetchCase}
            />
          </div>
        ) : (
          /* GUÍA DEL FORMULARIO REDISEÑADA */
          <FormGuide
            onGoToForm={() => setActiveTab("form")}
            onLoadCaseExample={handleLoadCaseExample}
            onNotify={handleNotify}
          />
        )}

        {/* MODAL DE FICHA CLÍNICA DETALLADA */}
        {inspectingCase && (
          <CaseDetailModal
            caseData={inspectingCase}
            isLoading={isLoadingDetail}
            onClose={() => setInspectingCase(null)}
            onCopyNotice={handleNotify}
            onEditCase={handleEditCase}
          />
        )}

        {/* TOAST FLOTANTE DE NOTIFICACIÓN */}
        {copiedNotification && (
          <div className="fixed bottom-24 right-6 bg-primary text-primary-fg px-5 py-3 rounded-xl shadow-2xl z-50 text-sm font-semibold flex items-center gap-2 animate-fadeIn border border-white/10">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {copiedNotification}
          </div>
        )}

        {/* SELECTOR FLOTANTE DE PALETA DE TEMAS (BOTÓN INFERIOR DERECHO) */}
        <ThemeSwitcher />

        {/* PIE DE PÁGINA */}
        <footer className="mt-12 pt-5 border-t border-border-subtle flex justify-between items-center flex-wrap gap-3 text-xs text-text-muted">
          <div>
            Vinko &copy; {new Date().getFullYear()} — Plataforma de Casos Clínicos Pediátricos
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Sistema en Línea &bull; Base de Datos Conectada
          </div>
        </footer>
      </div>
    </>
  );
}
