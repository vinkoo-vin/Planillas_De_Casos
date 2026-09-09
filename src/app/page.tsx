"use client";

import { useEffect, useState, useRef } from "react";

interface StudyCatalogItem {
  id: string;
  name: string;
  generalDefinition: string | null;
}

interface AddedStudy {
  name: string;
  isAdequate: boolean;
  findings: string;
  imageUrl: string | null;
  imageName: string | null;
  definition?: string;
}

interface SavedCase {
  id: string;
  title: string;
  clinicalHistory: string;
  painLevel: string;
  hasVideo: boolean;
  isPhysicalExamInteractive: boolean;
  createdAt: string;
  keywords: { keyword: { name: string } }[];
  studies: { studyCatalog: { name: string }; isAdequate: boolean }[];
  treatmentOptions: { description: string; isCorrect: boolean }[];
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"form" | "list">("form");

  // Catálogos globales cargados desde Supabase
  const [keywordsPool, setKeywordsPool] = useState<string[]>([]);
  const [studiesCatalog, setStudiesCatalog] = useState<StudyCatalogItem[]>([]);
  const [painLevelsPool, setPainLevelsPool] = useState<string[]>([]);
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(true);

  // Estado del Formulario
  const [caseTitle, setCaseTitle] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set(["Vómito en proyectil", "Lactante"]));
  const [newKeywordInput, setNewKeywordInput] = useState("");

  const [clinicalHistory, setClinicalHistory] = useState("");
  const [hasVideo, setHasVideo] = useState(false);
  const [videoDescription, setVideoDescription] = useState("");

  const [isInteractiveExam, setIsInteractiveExam] = useState(true);
  const [examZone, setExamZone] = useState("");
  const [examRefPoint, setExamRefPoint] = useState("");
  const [examStandardText, setExamStandardText] = useState("");
  const [selectedPainLevel, setSelectedPainLevel] = useState("");

  // Estudios asociados al caso
  const [addedStudies, setAddedStudies] = useState<AddedStudy[]>([]);
  const [studySelectValue, setStudySelectValue] = useState("");
  const [studyIsAdequate, setStudyIsAdequate] = useState("si");
  const [newStudyName, setNewStudyName] = useState("");
  const [newStudyDefinition, setNewStudyDefinition] = useState("");
  const [studyFindings, setStudyFindings] = useState("");
  const [fallbackImageUrl, setFallbackImageUrl] = useState("");

  // Manejo de imagen subida
  const [uploadedImage, setUploadedImage] = useState<{
    dataUrl: string;
    name: string;
    size: string;
  } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tratamiento
  const [treatmentOptions, setTreatmentOptions] = useState("");

  // Estado de guardado y resultado
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCase, setSubmittedCase] = useState<SavedCase | null>(null);
  const [savedCasesList, setSavedCasesList] = useState<SavedCase[]>([]);
  const [isLoadingCases, setIsLoadingCases] = useState(false);

  // Cargar catálogos, casos guardados y verificar autoconsulta al inicio
  useEffect(() => {
    fetchCatalogs();
    fetchSavedCases();
    checkKeepAlive();
  }, []);

  const checkKeepAlive = async () => {
    try {
      const lastPing = localStorage.getItem("vynco_last_keepalive");
      const now = Date.now();
      // Si pasaron más de 6 horas desde el último ping, ejecutar autoconsulta
      if (!lastPing || now - parseInt(lastPing, 10) > 1000 * 60 * 60 * 6) {
        const res = await fetch("/api/keep-alive");
        if (res.ok) {
          localStorage.setItem("vynco_last_keepalive", now.toString());
        }
      }
    } catch {
      // Ignorar errores silenciosos en cliente
    }
  };

  const fetchCatalogs = async () => {
    try {
      setIsLoadingCatalogs(true);
      const res = await fetch("/api/catalogs");
      const json = await res.json();
      if (json.success) {
        setKeywordsPool(json.data.keywords);
        setStudiesCatalog(json.data.studies);
        setPainLevelsPool(json.data.painLevels);
        if (json.data.painLevels.length > 0 && !selectedPainLevel) {
          setSelectedPainLevel(json.data.painLevels[0]);
        }
      }
    } catch (err) {
      console.error("Error al cargar catálogos:", err);
    } finally {
      setIsLoadingCatalogs(false);
    }
  };

  const fetchSavedCases = async () => {
    try {
      setIsLoadingCases(true);
      const res = await fetch("/api/cases");
      const json = await res.json();
      if (json.success) {
        setSavedCasesList(json.data);
      }
    } catch (err) {
      console.error("Error al cargar casos guardados:", err);
    } finally {
      setIsLoadingCases(false);
    }
  };

  // Manejo de palabras clave
  const toggleKeyword = (kw: string) => {
    const updated = new Set(selectedKeywords);
    if (updated.has(kw)) {
      updated.delete(kw);
    } else {
      updated.add(kw);
    }
    setSelectedKeywords(updated);
  };

  const handleAddNewKeyword = async () => {
    const val = newKeywordInput.trim();
    if (!val) return;

    if (!keywordsPool.includes(val)) {
      try {
        const res = await fetch("/api/keywords", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: val }),
        });
        const json = await res.json();
        if (json.success) {
          setKeywordsPool((prev) => [...prev, val].sort());
        }
      } catch (err) {
        console.error("Error guardando palabra clave:", err);
      }
    }
    const updated = new Set(selectedKeywords);
    updated.add(val);
    setSelectedKeywords(updated);
    setNewKeywordInput("");
  };

  // Manejo de nuevo nivel de dolor
  const handlePromptNewPainLevel = async () => {
    const newPain = prompt("Ingrese el nuevo nivel de dolor o hallazgo para añadir al catálogo de Supabase:");
    if (!newPain || !newPain.trim()) return;

    const trimmed = newPain.trim();
    try {
      const res = await fetch("/api/pain-levels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: trimmed }),
      });
      const json = await res.json();
      if (json.success) {
        setPainLevelsPool((prev) => [...prev, trimmed]);
        setSelectedPainLevel(trimmed);
      }
    } catch (err) {
      console.error("Error al guardar nivel de dolor:", err);
    }
  };

  // Manejo de subida de imágenes de estudios
  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Por favor seleccione un archivo de imagen válido (JPG, PNG, WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const sizeStr =
        file.size < 1048576
          ? (file.size / 1024).toFixed(1) + " KB"
          : (file.size / 1048576).toFixed(1) + " MB";

      setUploadedImage({
        dataUrl: e.target?.result as string,
        name: file.name,
        size: sizeStr,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const clearUploadedImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Agregar estudio al caso
  const handleAddStudyToCase = () => {
    let name = studySelectValue;
    let definition = "";

    if (studySelectValue === "__NEW__") {
      name = newStudyName.trim();
      definition = newStudyDefinition.trim();
      if (!name) return alert("Por favor escriba el nombre del nuevo estudio.");
    }

    if (!name) return alert("Por favor seleccione o cree un tipo de estudio.");
    if (!studyFindings.trim()) return alert("Por favor ingrese los hallazgos que arroja el estudio en este caso.");

    const finalImageData = uploadedImage ? uploadedImage.dataUrl : fallbackImageUrl.trim() || null;
    const finalImageName = uploadedImage ? uploadedImage.name : fallbackImageUrl.trim() ? "Enlace web" : null;

    setAddedStudies((prev) => [
      ...prev,
      {
        name,
        isAdequate: studyIsAdequate === "si",
        findings: studyFindings.trim(),
        imageUrl: finalImageData,
        imageName: finalImageName,
        definition,
      },
    ]);

    // Reset campos de estudio
    setStudySelectValue("");
    setNewStudyName("");
    setNewStudyDefinition("");
    setStudyFindings("");
    setFallbackImageUrl("");
    clearUploadedImage();
  };

  const handleDeleteStudy = (index: number) => {
    setAddedStudies((prev) => prev.filter((_, i) => i !== index));
  };

  // Copiar prompt de IA
  const copyAiPrompt = () => {
    const promptText = `Actúa como redactor y pedagogo médico. Conviérteme las siguientes notas clínicas en una lista de opciones terapéuticas para un simulador de estudiantes de medicina. 
Formato requerido:
- Cada opción debe comenzar con un guion (-)
- Redacta entre 3 y 4 opciones plausibles (incluyendo errores clínicos comunes)
- Marca la opción terapéutica correcta agregando estrictamente al final del renglón la etiqueta [CORRECTA]

Mis notas de tratamiento son:
`;
    navigator.clipboard.writeText(promptText);
    alert("Prompt copiado al portapapeles. Péguelo en su IA y añada sus notas.");
  };

  // Envío final del caso a Supabase
  const handleSubmitCase = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!caseTitle.trim()) return alert("Por favor ingrese el título del caso.");
    if (!clinicalHistory.trim()) return alert("Por favor describa la historia clínica.");
    if (!selectedPainLevel) return alert("Por favor seleccione el nivel de dolor / examen físico.");

    try {
      setIsSubmitting(true);

      const payload = {
        title: caseTitle,
        clinicalHistory,
        hasVideo,
        videoDescription: hasVideo ? videoDescription : null,
        isPhysicalExamInteractive: isInteractiveExam,
        physicalExamZone: isInteractiveExam ? examZone : null,
        physicalExamRefPoint: isInteractiveExam ? examRefPoint : null,
        physicalExamStandard: !isInteractiveExam ? examStandardText : null,
        painLevel: selectedPainLevel,
        treatmentRaw: treatmentOptions,
        keywords: Array.from(selectedKeywords),
        studies: addedStudies,
      };

      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        setSubmittedCase(json.data);
        setTimeout(() => {
          document.getElementById("summaryCard")?.scrollIntoView({ behavior: "smooth" });
        }, 150);
      } else {
        alert("Error al guardar: " + (json.error || "No se pudo guardar en Supabase"));
      }
    } catch (err) {
      console.error("Error al enviar caso:", err);
      alert("Ocurrió un error al intentar registrar el caso en Supabase.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      {/* PESTAÑAS DE VISTA */}
      <div className="nav-tabs">
        <button
          type="button"
          className={`nav-tab-btn ${activeTab === "form" ? "active" : ""}`}
          onClick={() => setActiveTab("form")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Cargar Nuevo Caso
        </button>
        <button
          type="button"
          className={`nav-tab-btn ${activeTab === "list" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("list");
            fetchSavedCases();
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
          Casos Cargados ({savedCasesList.length})
        </button>
      </div>

      {activeTab === "list" ? (
        <div>
          <header>
            <div className="badge-top">
              <span className="badge-dot"></span>
              Repositorio Clínico
            </div>
            <h1>Casos Clínicos Registrados</h1>
            <p className="subtitle">Listado de casos almacenados listos para el simulador de estudiantes.</p>
          </header>

          {isLoadingCases ? (
            <div style={{ textAlign: "center", padding: "50px", color: "var(--color-navy)" }}>
              Cargando casos guardados...
            </div>
          ) : savedCasesList.length === 0 ? (
            <div className="form-section" style={{ textAlign: "center", padding: "40px" }}>
              <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>Aún no hay casos registrados en la base de datos.</p>
              <button type="button" className="btn btn-teal" onClick={() => setActiveTab("form")}>
                Crear el primer caso clínico
              </button>
            </div>
          ) : (
            <div className="cases-table-container">
              <table className="cases-table">
                <thead>
                  <tr>
                    <th>Título del Caso</th>
                    <th>Palabras Clave</th>
                    <th>Estudios</th>
                    <th>Opciones Terapéuticas</th>
                    <th>Fecha de Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {savedCasesList.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600, color: "var(--color-navy)" }}>{c.title}</td>
                      <td>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {c.keywords.map((k, i) => (
                            <span key={i} style={{ fontSize: "0.76rem", background: "var(--teal-light)", color: "var(--color-navy)", padding: "2px 7px", borderRadius: "99px" }}>
                              {k.keyword.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>{c.studies.length} estudio(s)</td>
                      <td>{c.treatmentOptions.length} opción(es)</td>
                      <td style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                        {new Date(c.createdAt).toLocaleDateString("es-ES")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div>
          <header>
            <div className="badge-top">
              <span className="badge-dot"></span>
              Formulario Maestro para Especialistas
            </div>
            <h1>Carga de Caso Clínico Pediátrico</h1>
            <p className="subtitle">Complete los módulos secuenciales para persistir directamente el caso en Supabase PostgreSQL.</p>
          </header>

          <form onSubmit={handleSubmitCase}>

            {/* 1. TÍTULO */}
            <div className="form-section">
              <div className="section-header">
                <div className="section-num">1</div>
                <div className="section-title">Título del Caso</div>
              </div>
              <div className="form-group">
                <label htmlFor="caseTitle">Título que verá el alumno (sin spoilers del diagnóstico)</label>
                <input
                  type="text"
                  id="caseTitle"
                  value={caseTitle}
                  onChange={(e) => setCaseTitle(e.target.value)}
                  placeholder="Ej: Lactante de 4 semanas con vómitos recurrentes e irritabilidad"
                  required
                />
                <span className="helper-text">Debe orientar el motivo de consulta sin adelantar la resolución patológica.</span>
              </div>
            </div>

            {/* 2. PALABRAS CLAVES DINÁMICAS */}
            <div className="form-section">
              <div className="section-header">
                <div className="section-num">2</div>
                <div className="section-title">Palabras Clave del Caso</div>
              </div>
              <div className="form-group">
                <label>Seleccione las palabras clave de su catálogo o añada nuevas:</label>
                <div className="tags-container">
                  {keywordsPool.map((kw) => {
                    const isSelected = selectedKeywords.has(kw);
                    return (
                      <div
                        key={kw}
                        className={`tag-chip ${isSelected ? "active" : ""}`}
                        onClick={() => toggleKeyword(kw)}
                      >
                        {isSelected ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12" /></svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        )}
                        {kw}
                      </div>
                    );
                  })}
                </div>
                <div className="add-tag-box">
                  <input
                    type="text"
                    value={newKeywordInput}
                    onChange={(e) => setNewKeywordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddNewKeyword();
                      }
                    }}
                    placeholder="Escribe una nueva palabra clave (ej: Letargia, Deshidratación...)"
                  />
                  <button type="button" className="btn btn-secondary" onClick={handleAddNewKeyword}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Agregar Palabra
                  </button>
                </div>
              </div>
            </div>

            {/* 3. HISTORIA CLÍNICA */}
            <div className="form-section">
              <div className="section-header">
                <div className="section-num">3</div>
                <div className="section-title">Descripción del Caso / Historia Clínica</div>
              </div>
              <div className="form-group">
                <label htmlFor="clinicalHistory">Relato inicial del motivo de consulta y evolución del cuadro</label>
                <textarea
                  id="clinicalHistory"
                  value={clinicalHistory}
                  onChange={(e) => setClinicalHistory(e.target.value)}
                  rows={4}
                  placeholder="Ej: Paciente de 4 semanas de vida traído a guardia por su madre, quien refiere cuadro de 5 días de evolución caracterizado por vómitos inmediatamente después de cada toma de pecho..."
                  required
                />
                <span className="helper-text">Incluya antecedentes perinatales, edad cronológica y sintomatología reportada.</span>
              </div>
            </div>

            {/* 4. VIDEO Y PREGUNTAS GUÍA */}
            <div className="form-section">
              <div className="section-header">
                <div className="section-num">4</div>
                <div className="section-title">Evidencia Multimedia: ¿Tiene Video?</div>
              </div>

              <div className="toggle-group">
                <input
                  type="radio"
                  id="videoYes"
                  name="hasVideo"
                  checked={hasVideo}
                  onChange={() => setHasVideo(true)}
                />
                <label className="toggle-label" htmlFor="videoYes">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" /></svg>
                  Sí, requiere video
                </label>

                <input
                  type="radio"
                  id="videoNo"
                  name="hasVideo"
                  checked={!hasVideo}
                  onChange={() => setHasVideo(false)}
                />
                <label className="toggle-label" htmlFor="videoNo">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m16 16-1.5-1.5" /><path d="m2 2 20 20" /><path d="M7 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 1.73-1" /><path d="m22 8-6 4 6 4V8Z" /></svg>
                  No requiere video
                </label>
              </div>

              {hasVideo && (
                <div className="split-layout">
                  <div>
                    <label htmlFor="videoDescription">Descripción / Guion para el video (recreación con IA o actores):</label>
                    <textarea
                      id="videoDescription"
                      rows={7}
                      value={videoDescription}
                      onChange={(e) => setVideoDescription(e.target.value)}
                      placeholder="Describe la escena: La madre sostiene al bebé en brazos. El lactante luce quejumbroso. Ella explica agitada cómo el bebé toma con desesperación y a los minutos vomita en forma de chorro fuerte blanco sin bilis..."
                    />
                  </div>

                  <div className="guide-box">
                    <h4>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" /><path d="M9 18h6" /><path d="M10 22h4" /></svg>
                      Preguntas Guía Esenciales
                    </h4>
                    <ul>
                      <li><strong>¿Quién habla?</strong> Madre, padre o ambos tutores en consulta.</li>
                      <li><strong>¿Qué signos físicos deben verse?</strong> Color de piel, llanto sin lágrimas, flexión de extremidades o respiración rápida.</li>
                      <li><strong>¿Qué acción ocurre en cámara?</strong> ¿Un episodio de vómito? ¿La madre intentando alimentarlo? ¿Muestra de pañal seco?</li>
                      <li><strong>Duración sugerida:</strong> Entre 60 y 90 segundos para mantener el engagement pedagógico.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* 5. EXAMEN FÍSICO */}
            <div className="form-section">
              <div className="section-header">
                <div className="section-num">5</div>
                <div className="section-title">Examen Físico</div>
              </div>

              <div className="toggle-group">
                <input
                  type="radio"
                  id="examInteractiveYes"
                  name="isInteractive"
                  checked={isInteractiveExam}
                  onChange={() => setIsInteractiveExam(true)}
                />
                <label className="toggle-label" htmlFor="examInteractiveYes">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
                  Interactivo (Esquema Anatómico)
                </label>

                <input
                  type="radio"
                  id="examInteractiveNo"
                  name="isInteractive"
                  checked={!isInteractiveExam}
                  onChange={() => setIsInteractiveExam(false)}
                />
                <label className="toggle-label" htmlFor="examInteractiveNo">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                  Tradicional (Texto Plano)
                </label>
              </div>

              {isInteractiveExam ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div className="form-group">
                    <label htmlFor="examZone">Zona anatómica analizada:</label>
                    <input
                      type="text"
                      id="examZone"
                      value={examZone}
                      onChange={(e) => setExamZone(e.target.value)}
                      placeholder="Ej: Abdomen / Tórax / Cabeza y Cuello"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="examRefPoint">Punto de referencia anatómico:</label>
                    <input
                      type="text"
                      id="examRefPoint"
                      value={examRefPoint}
                      onChange={(e) => setExamRefPoint(e.target.value)}
                      placeholder="Ej: Epigastrio / Hipocondrio Derecho"
                    />
                  </div>
                </div>
              ) : (
                <div className="form-group">
                  <label htmlFor="examStandardText">Información obtenida a través del examen físico:</label>
                  <textarea
                    id="examStandardText"
                    rows={3}
                    value={examStandardText}
                    onChange={(e) => setExamStandardText(e.target.value)}
                    placeholder="Detalle los hallazgos: Fontanela anterior levemente deprimida, mucosas semihúmedas, abdomen excavado con oliva pilórica palpable..."
                  />
                </div>
              )}

              {/* NIVEL DE DOLOR / HALLAZGO */}
              <div className="form-group" style={{ marginTop: "18px", borderTop: "1px solid #EEF2F6", paddingTop: "18px" }}>
                <label>Nivel de Dolor / Hallazgo registrado en la zona:</label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <select
                    value={selectedPainLevel}
                    onChange={(e) => setSelectedPainLevel(e.target.value)}
                    style={{ flex: 1 }}
                  >
                    {painLevelsPool.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <button type="button" className="btn btn-secondary" onClick={handlePromptNewPainLevel}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Agregar Nivel
                  </button>
                </div>
              </div>
            </div>

            {/* 6. ESTUDIOS DIAGNÓSTICOS */}
            <div className="form-section">
              <div className="section-header">
                <div className="section-num">6</div>
                <div className="section-title">Estudios Diagnósticos Complementarios</div>
              </div>

              {/* AVISO DE SELECCIÓN ESTRICTA */}
              <div className="notice-banner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                <div>
                  <strong>Criterio de Selección para el Especialista:</strong> Seleccione únicamente los estudios complementarios que correspondan estrictamente a este caso clínico y que aporten información diagnóstica pertinente para la resolución del paciente.
                </div>
              </div>

              {/* LISTA DE ESTUDIOS YA AGREGADOS AL CASO */}
              {addedStudies.length > 0 && (
                <div style={{ marginBottom: "18px" }}>
                  {addedStudies.map((st, idx) => (
                    <div key={idx} className="study-item-card">
                      <div className="study-item-header">
                        <div className="study-title-badge">
                          {st.name}
                          {st.isAdequate ? (
                            <span className="badge-adequate">Pertinente / Indicado</span>
                          ) : (
                            <span className="badge-distractor">Distractor</span>
                          )}
                        </div>
                        <button type="button" className="btn-delete-study" onClick={() => handleDeleteStudy(idx)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                          Eliminar
                        </button>
                      </div>
                      <div className="study-card-body">
                        {st.imageUrl && (
                          <img src={st.imageUrl} alt={st.name} className="study-card-img" />
                        )}
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: "0.92rem", color: "var(--text-body)", marginBottom: "4px" }}>
                            <strong>Hallazgos en el caso:</strong> {st.findings}
                          </p>
                          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            Archivo de imagen: {st.imageName || "Sin imagen adjunta"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* FORMULARIO PARA AGREGAR ESTUDIO */}
              <div style={{ background: "#FAFBFD", border: "1.5px dashed var(--input-border)", borderRadius: "12px", padding: "22px" }}>
                <h4 style={{ fontSize: "1.05rem", marginBottom: "16px", color: "var(--color-navy)", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  Agregar Estudio Correspondiente al Caso
                </h4>

                <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label>Tipo de Estudio:</label>
                    <select
                      value={studySelectValue}
                      onChange={(e) => setStudySelectValue(e.target.value)}
                    >
                      <option value="">Seleccione un estudio del catálogo...</option>
                      {studiesCatalog.map((s) => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                      <option value="__NEW__">+ Crear nuevo tipo de estudio para el catálogo...</option>
                    </select>
                  </div>

                  <div>
                    <label>Pertinencia en este caso clínico:</label>
                    <select
                      value={studyIsAdequate}
                      onChange={(e) => setStudyIsAdequate(e.target.value)}
                    >
                      <option value="si">Estudio indicado / Pertinente al caso</option>
                      <option value="no">Estudio distractor / No indicado</option>
                    </select>
                  </div>
                </div>

                {/* SI ES NUEVO ESTUDIO */}
                {studySelectValue === "__NEW__" && (
                  <div className="new-study-callout">
                    <div className="form-group" style={{ marginBottom: "12px" }}>
                      <label style={{ color: "#B45309" }}>Nombre del Nuevo Estudio:</label>
                      <input
                        type="text"
                        value={newStudyName}
                        onChange={(e) => setNewStudyName(e.target.value)}
                        placeholder="Ej: Gammagrafía con Tecnecio 99m"
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ color: "#B45309" }}>Definición general del estudio (catálogo pedagógico):</label>
                      <input
                        type="text"
                        value={newStudyDefinition}
                        onChange={(e) => setNewStudyDefinition(e.target.value)}
                        placeholder="Ej: Permite evaluar mucosa gástrica ectópica mediante captación del radiofármaco..."
                      />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>Hallazgos / Informe que verá el estudiante al solicitarlo:</label>
                  <textarea
                    rows={2}
                    value={studyFindings}
                    onChange={(e) => setStudyFindings(e.target.value)}
                    placeholder="Ej: Grosor muscular pilórico de 4.5 mm (>3 mm) y longitud del canal de 18 mm. Signo del doble riel positivo."
                  />
                </div>

                {/* SUBIDA REAL DE IMAGEN */}
                <div className="form-group">
                  <label>Imagen del Estudio (Adjuntar archivo o arrastrar):</label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />

                  <div
                    className={`file-drop-zone ${isDragOver ? "dragover" : ""}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                  >
                    <div className="drop-zone-content">
                      <div className="drop-icon-wrapper">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                      </div>
                      <div className="drop-main-text">Haga clic aquí para seleccionar una imagen o arrástrela a esta zona</div>
                      <div className="drop-sub-text">Formatos admitidos: JPG, PNG, WEBP (hasta 10 MB)</div>
                    </div>
                  </div>

                  {uploadedImage && (
                    <div className="image-preview-container">
                      <img src={uploadedImage.dataUrl} alt="Preview" className="preview-thumb" />
                      <div className="preview-meta">
                        <div className="preview-name">{uploadedImage.name}</div>
                        <div className="preview-size">{uploadedImage.size}</div>
                        <span className="preview-badge">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                          Imagen lista para guardar
                        </span>
                      </div>
                      <button type="button" className="btn-remove-preview" onClick={clearUploadedImage}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                        Quitar
                      </button>
                    </div>
                  )}

                  <div style={{ marginTop: "8px" }}>
                    <input
                      type="text"
                      value={fallbackImageUrl}
                      onChange={(e) => setFallbackImageUrl(e.target.value)}
                      placeholder="O si lo prefiere, ingrese una URL directa de imagen externa (opcional)"
                      style={{ fontSize: "0.85rem", padding: "8px 12px" }}
                    />
                  </div>
                </div>

                <button type="button" className="btn btn-teal" onClick={handleAddStudyToCase} style={{ marginTop: "8px" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  Guardar Estudio en el Caso
                </button>
              </div>
            </div>

            {/* 7. TRATAMIENTO */}
            <div className="form-section">
              <div className="section-header">
                <div className="section-num">7</div>
                <div className="section-title">Tratamiento & Opciones de Conducta</div>
              </div>

              <div className="prompt-helper-card">
                <div className="prompt-helper-text">
                  <strong>¿Notas desordenadas?</strong>
                  Copie este prompt estandarizado para que su modelo de IA organice sus apuntes clínicos en opciones pedagógicas correctas y distractores.
                </div>
                <button type="button" className="copy-btn" onClick={copyAiPrompt}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                  Copiar Prompt para IA
                </button>
              </div>

              <div className="split-layout">
                <div>
                  <label htmlFor="treatmentOptions">Describe las opciones terapéuticas (un ítem por línea) y marca la correcta con [CORRECTA]:</label>
                  <textarea
                    id="treatmentOptions"
                    rows={7}
                    value={treatmentOptions}
                    onChange={(e) => setTreatmentOptions(e.target.value)}
                    placeholder="- Plan de hidratación parenteral y corrección hidroelectrolítica antes de cirugía [CORRECTA]&#10;- Indicar pase inmediato a quirófano sin hidratación previa&#10;- Administrar ranitidina oral y dar de alta con pautas de alarma"
                  />
                </div>

                <div className="guide-box" style={{ background: "rgba(132, 205, 173, 0.12)", borderColor: "rgba(132, 205, 173, 0.4)" }}>
                  <h4 style={{ color: "var(--mint-dark)" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                    Ejemplo de formato:
                  </h4>
                  <pre style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--color-navy)", whiteSpace: "pre-wrap", lineHeight: 1.55, background: "#FFFFFF", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--mint-border)" }}>
{`- Opción 1: Rehidratación parenteral y corrección electrolítica [CORRECTA]
- Opción 2: Cirugía de urgencia sin hidratar
- Opción 3: Cambio de fórmula láctea y alta`}
                  </pre>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-body)", marginTop: "10px" }}>
                    El sistema detectará automáticamente la etiqueta <code>[CORRECTA]</code> y registrará cada alternativa en la base de datos de Supabase.
                  </p>
                </div>
              </div>
            </div>

            {/* BOTÓN FINAL */}
            <div style={{ textAlign: "center", marginTop: "30px" }}>
              <button
                type="submit"
                className="btn btn-teal"
                disabled={isSubmitting}
                style={{ padding: "16px 42px", fontSize: "1.05rem", borderRadius: "12px", boxShadow: "0 8px 24px rgba(19, 174, 185, 0.32)" }}
              >
                {isSubmitting ? (
                  <>Guardando en Supabase...</>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: "18px", height: "18px" }}><polyline points="20 6 9 17 4 12" /></svg>
                    Finalizar y Guardar Caso en Supabase
                  </>
                )}
              </button>
            </div>

          </form>

          {/* RESUMEN FINAL DE CONFIRMACIÓN */}
          {submittedCase && (
            <div id="summaryCard" className="summary-card">
              <div className="summary-header">
                <div className="summary-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                  Caso Registrado Exitosamente en Supabase
                </div>
                <span className="summary-status">ID: {submittedCase.id}</span>
              </div>

              <div className="summary-grid">
                <div className="summary-box">
                  <h5>Título del Caso</h5>
                  <div className="val">{submittedCase.title}</div>
                </div>

                <div className="summary-box">
                  <h5>Palabras Clave ({submittedCase.keywords.length})</h5>
                  <div className="val">
                    {submittedCase.keywords.map((k) => k.keyword.name).join(", ")}
                  </div>
                </div>

                <div className="summary-box">
                  <h5>Historia Clínica</h5>
                  <div className="val" style={{ fontSize: "0.88rem" }}>
                    {submittedCase.clinicalHistory.slice(0, 180)}...
                  </div>
                </div>

                <div className="summary-box">
                  <h5>Recurso Audiovisual</h5>
                  <div className="val">
                    {submittedCase.hasVideo ? "Sí, video configurado" : "No requiere video"}
                  </div>
                </div>

                <div className="summary-box">
                  <h5>Examen Físico</h5>
                  <div className="val">
                    {submittedCase.isPhysicalExamInteractive ? "Interactivo" : "Tradicional"}
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "var(--teal)", fontWeight: 600, marginTop: "5px" }}>
                    Hallazgo / Dolor: {submittedCase.painLevel}
                  </div>
                </div>

                <div className="summary-box" style={{ gridColumn: "1 / -1" }}>
                  <h5>Estudios Complementarios Registrados ({submittedCase.studies.length})</h5>
                  <div className="val">
                    {submittedCase.studies.map((s, i) => (
                      <div key={i} style={{ marginBottom: "6px" }}>
                        <strong>{s.studyCatalog.name}</strong> ({s.isAdequate ? "Indicado" : "Distractor"})
                      </div>
                    ))}
                  </div>
                </div>

                <div className="summary-box" style={{ gridColumn: "1 / -1" }}>
                  <h5>Opciones Terapéuticas Registradas ({submittedCase.treatmentOptions.length})</h5>
                  <div className="val">
                    {submittedCase.treatmentOptions.map((t, i) => (
                      <div key={i} style={{ marginBottom: "6px", color: t.isCorrect ? "var(--mint-dark)" : "var(--color-navy)" }}>
                        {t.isCorrect ? "✓ " : "- "} {t.description} {t.isCorrect && <strong>[CORRECTA]</strong>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "center", marginTop: "30px", display: "flex", justifyContent: "center", gap: "14px" }}>
                <button
                  type="button"
                  className="btn btn-teal"
                  onClick={() => {
                    setSubmittedCase(null);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Cargar Otro Caso
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setActiveTab("list");
                    fetchSavedCases();
                  }}
                >
                  Ver Casos Cargados
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pie de página con indicador de autoconsultas y protección de plan gratuito */}
      <footer style={{ marginTop: "40px", padding: "18px 0", borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", fontSize: "0.82rem", color: "var(--text-muted)" }}>
        <div>
          Vinko &copy; {new Date().getFullYear()} — Plataforma de Casos Clínicos Pediátricos
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "4px 10px", borderRadius: "99px", color: "#047857", fontWeight: 500 }}>
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
          Autoconsultas Activas (Proyecto Supabase Protegido)
        </div>
      </footer>
    </div>
  );
}
