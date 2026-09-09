import { useState, useCallback, useEffect, FormEvent } from "react";
import { StudyCatalogItem, AddedStudy, SavedCase, CaseDraft } from "@/types/clinical";

interface UseCaseFormProps {
  initialDraft?: CaseDraft | null;
  onClearDraft?: () => void;
  keywordsPool: string[];
  setKeywordsPool: React.Dispatch<React.SetStateAction<string[]>>;
  studiesCatalog: StudyCatalogItem[];
  painLevelsPool: string[];
  setPainLevelsPool: React.Dispatch<React.SetStateAction<string[]>>;
  onCaseCreated: (newCase: SavedCase) => void;
  onCaseUpdated?: (updatedCase: SavedCase) => void;
  onNotify: (msg: string) => void;
}

export function useCaseForm({
  initialDraft,
  onClearDraft,
  keywordsPool,
  setKeywordsPool,
  painLevelsPool,
  setPainLevelsPool,
  onCaseCreated,
  onCaseUpdated,
  onNotify,
}: UseCaseFormProps) {
  const [editingCaseId, setEditingCaseId] = useState<string | null>(null);
  const [caseTitle, setCaseTitle] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(
    new Set(["Vómito en proyectil", "Lactante"])
  );
  const [clinicalHistory, setClinicalHistory] = useState("");
  const [hasVideo, setHasVideo] = useState(false);
  const [videoDescription, setVideoDescription] = useState("");

  const [isInteractiveExam, setIsInteractiveExam] = useState(true);
  const [examZone, setExamZone] = useState("");
  const [examRefPoint, setExamRefPoint] = useState("");
  const [examStandardText, setExamStandardText] = useState("");
  const [selectedPainLevel, setSelectedPainLevel] = useState(painLevelsPool[0] || "");

  const [addedStudies, setAddedStudies] = useState<AddedStudy[]>([]);
  const [treatmentOptions, setTreatmentOptions] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCase, setSubmittedCase] = useState<SavedCase | null>(null);

  // Sincronizar borrador inicial cuando se carga desde la Guía o desde el modo Edición
  useEffect(() => {
    if (initialDraft) {
      setEditingCaseId(initialDraft.id || null);
      if (initialDraft.title !== undefined) setCaseTitle(initialDraft.title);
      if (initialDraft.clinicalHistory !== undefined) setClinicalHistory(initialDraft.clinicalHistory);
      if (initialDraft.treatmentOptions !== undefined) setTreatmentOptions(initialDraft.treatmentOptions);
      if (initialDraft.selectedKeywords !== undefined) setSelectedKeywords(new Set(initialDraft.selectedKeywords));
      if (initialDraft.isInteractiveExam !== undefined) setIsInteractiveExam(initialDraft.isInteractiveExam);
      if (initialDraft.examZone !== undefined) setExamZone(initialDraft.examZone || "");
      if (initialDraft.examRefPoint !== undefined) setExamRefPoint(initialDraft.examRefPoint || "");
      if (initialDraft.examStandardText !== undefined) setExamStandardText(initialDraft.examStandardText || "");
      if (initialDraft.painLevel !== undefined) setSelectedPainLevel(initialDraft.painLevel || "");
      if (initialDraft.hasVideo !== undefined) setHasVideo(initialDraft.hasVideo ?? false);
      if (initialDraft.videoDescription !== undefined) setVideoDescription(initialDraft.videoDescription || "");
      if (initialDraft.addedStudies !== undefined) setAddedStudies(initialDraft.addedStudies || []);
    } else {
      setEditingCaseId(null);
    }
  }, [initialDraft]);

  const handleToggleKeyword = useCallback((kw: string) => {
    setSelectedKeywords((prev) => {
      const next = new Set(prev);
      if (next.has(kw)) next.delete(kw);
      else next.add(kw);
      return next;
    });
  }, []);

  const handleAddCustomKeyword = useCallback(
    async (val: string) => {
      if (!keywordsPool.includes(val)) {
        try {
          const res = await fetch("/api/keywords", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: val }),
          });
          const json = await res.json();
          if (json.success) {
            setKeywordsPool((prev) => [...prev, json.data.name]);
          }
        } catch (err) {
          console.error("Error al registrar palabra clave:", err);
        }
      }
      setSelectedKeywords((prev) => new Set(prev).add(val));
    },
    [keywordsPool, setKeywordsPool]
  );

  const handlePromptNewPainLevel = useCallback(async () => {
    const newPain = prompt("Ingrese el nuevo nivel de dolor o hallazgo para añadir al catálogo:");
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
        setPainLevelsPool((prev) => [...prev, json.data.description]);
        setSelectedPainLevel(json.data.description);
      }
    } catch (err) {
      console.error("Error al añadir nuevo nivel de dolor:", err);
    }
  }, [setPainLevelsPool]);

  const handleResetForm = useCallback(() => {
    setEditingCaseId(null);
    setSubmittedCase(null);
    setCaseTitle("");
    setClinicalHistory("");
    setTreatmentOptions("");
    setAddedStudies([]);
    setSelectedKeywords(new Set(["Vómito en proyectil", "Lactante"]));
    if (onClearDraft) onClearDraft();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [onClearDraft]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!caseTitle.trim()) return alert("Por favor complete el título del caso clínico.");
    if (!clinicalHistory.trim()) return alert("Por favor escriba la historia clínica.");
    if (!selectedPainLevel.trim()) return alert("Por favor seleccione un nivel de dolor.");
    if (!treatmentOptions.trim()) return alert("Por favor defina las opciones de conducta terapéutica.");

    const payload = {
      ...(editingCaseId ? { id: editingCaseId } : {}),
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

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/cases", {
        method: editingCaseId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.success) {
        setSubmittedCase(json.data);
        if (editingCaseId) {
          if (onCaseUpdated) onCaseUpdated(json.data);
          onNotify("Caso clínico actualizado exitosamente");
        } else {
          onCaseCreated(json.data);
          onNotify("Caso clínico registrado exitosamente");
        }
        setTimeout(() => {
          document.getElementById("summaryCard")?.scrollIntoView({ behavior: "smooth" });
        }, 150);
      } else {
        alert("Error al guardar: " + (json.error || "No se pudo guardar el caso clínico"));
      }
    } catch (err) {
      console.error("Error al enviar caso:", err);
      alert("Ocurrió un error al intentar registrar el caso clínico.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    editingCaseId,
    caseTitle,
    setCaseTitle,
    selectedKeywords,
    handleToggleKeyword,
    handleAddCustomKeyword,
    clinicalHistory,
    setClinicalHistory,
    hasVideo,
    setHasVideo,
    videoDescription,
    setVideoDescription,
    isInteractiveExam,
    setIsInteractiveExam,
    examZone,
    setExamZone,
    examRefPoint,
    setExamRefPoint,
    examStandardText,
    setExamStandardText,
    selectedPainLevel,
    setSelectedPainLevel,
    handlePromptNewPainLevel,
    addedStudies,
    setAddedStudies,
    treatmentOptions,
    setTreatmentOptions,
    isSubmitting,
    submittedCase,
    handleSubmit,
    handleResetForm,
  };
}
