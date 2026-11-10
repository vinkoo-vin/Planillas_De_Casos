import {
  SavedCase,
  CaseDraft,
  ExamFindingDraft,
  StudyItemDraft,
  DiagnosisDraft,
  SurgicalStepDraft,
  ComplicationDraft,
  AdditionalFieldDraft,
} from "@/types/clinical";

/**
 * Transforma un caso guardado (SavedCase) a un borrador editable (CaseDraft).
 * Se usa cuando el usuario hace click en "Editar" en la tabla de casos.
 */
export function savedCaseToDraft(savedCase: SavedCase): CaseDraft {
  // F1 - Motivos
  const altReasons = (savedCase.altReasons || []).map((ar) => ({
    itemId: ar.itemId,
    itemName: ar.item?.name || "",
  }));

  // F3 - Hallazgos del examen físico
  const examFindings: ExamFindingDraft[] = (savedCase.examFindings || []).map((f) => ({
    id: f.id,
    puntoAnatomicoId: f.puntoAnatomicoId ?? null,
    puntoAnatomicoName: f.puntoAnatomico?.name ?? null,
    hallazgo: f.hallazgo,
    nivelRespuestaId: f.nivelRespuestaId ?? null,
    nivelRespuestaName: f.nivelRespuesta?.name ?? null,
    order: f.order,
  }));

  // F4 - Estudios
  const studies: StudyItemDraft[] = (savedCase.studies || []).map((s) => ({
    studyTypeId: s.studyTypeId,
    studyTypeName: s.studyType?.name || "",
    performed: s.performed,
    findingsText: s.findingsText || "",
    images: (s.images || []).map((image) => ({
      id: image.id,
      url: image.url,
      description: image.description || "",
    })),
  }));

  // F5 - Diagnósticos
  const diagnoses: DiagnosisDraft[] = (savedCase.diagnoses || []).map((d) => ({
    itemId: d.itemId,
    itemName: d.item?.name || "",
    order: d.order,
    isCorrect: d.isCorrect,
  }));

  // F6 - Pasos quirúrgicos
  const surgicalSteps: SurgicalStepDraft[] = (savedCase.surgicalSteps || []).map((s) => ({
    id: s.id,
    order: s.order,
    text: s.text,
  }));

  // F7 - Complicaciones
  const complications: ComplicationDraft[] = (savedCase.complications || []).map((c) => ({
    itemId: c.itemId,
    itemName: c.item?.name || "",
    note: c.note || "",
  }));

  // Campos adicionales
  const additionalFields: AdditionalFieldDraft[] = (savedCase.additionalFields || []).map((f) => ({
    id: f.id,
    phase: f.phase,
    fieldId: f.fieldId,
    fieldName: f.field?.name || "",
    value: f.value,
  }));

  return {
    id: savedCase.id,
    isEditing: true,
    status: savedCase.status,

    // F1
    finalDiagnosisId: savedCase.finalDiagnosisId ?? null,
    finalDiagnosisName: savedCase.finalDiagnosis?.name ?? null,
    principalReasonId: savedCase.principalReasonId ?? null,
    principalReasonName: savedCase.principalReason?.name ?? null,
    altReasons,

    // F2
    signsSymptomsText: savedCase.signsSymptomsText ?? "",
    hasVideo: savedCase.hasVideo,
    videoUrl: savedCase.videoUrl ?? "",

    // F3
    examModality: savedCase.examModality,
    physicalExamNarrative: savedCase.physicalExamNarrative ?? "",
    examFindings,

    // F4
    studies,

    // F5
    diagnoses,

    // F6
    medicalTreatmentText: savedCase.medicalTreatmentText ?? "",
    includesSurgery: savedCase.includesSurgery,
    surgicalTechniqueId: savedCase.surgicalTechniqueId ?? null,
    surgicalTechniqueName: savedCase.surgicalTechnique?.name ?? null,
    surgicalNote: savedCase.surgicalNote ?? "",
    openApproach: savedCase.openApproach ?? "",
    minimInvasiveApproach: savedCase.minimInvasiveApproach ?? "",
    surgicalSteps,

    // F7
    complicationsIntroText: savedCase.complicationsIntroText ?? "",
    complications,

    // F8
    summary: savedCase.summary ?? "",

    additionalFields,
  };
}

/**
 * Formatea de manera homogénea la fecha de creación de un caso clínico.
 * @param dateStr Fecha en formato string ISO o Date
 * @param style 'short' (ej: "15 oct. 2026") o 'locale' (ej: "15/10/2026")
 */
export function formatCaseDate(
  dateStr: string | Date | undefined | null,
  style: "short" | "locale" = "short"
): string {
  if (!dateStr) return "";
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return "";

  if (style === "locale") {
    return date.toLocaleDateString("es-ES");
  }

  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Genera el contenido en formato Markdown (.md) de un caso clínico completo
 * respetando la estructura de las 8 fases de la plantilla.
 */
export function caseToMarkdown(caseData: SavedCase): string {
  const title = caseData.finalDiagnosis?.name || "Caso clínico sin diagnóstico";
  const createdDate = formatCaseDate(caseData.createdAt, "locale") || "Sin fecha";
  const lines: string[] = [];

  lines.push(`# Caso Clínico: ${title}`);
  lines.push("");
  lines.push(`- **ID del Caso:** \`${caseData.id}\``);
  lines.push(`- **Estado:** ${caseData.status}`);
  lines.push(`- **Fecha de Registro:** ${createdDate}`);
  lines.push("");
  lines.push("---");
  lines.push("");

  // 1. MOTIVO DE CONSULTA
  lines.push("## 1. Motivo de Consulta");
  lines.push("");
  lines.push(`- **Diagnóstico Final (Uso Interno):** ${caseData.finalDiagnosis?.name || "No especificado"}`);
  lines.push(`- **Motivo Principal de Consulta:** ${caseData.principalReason?.name || "No asignado"}`);
  if (caseData.altReasons && caseData.altReasons.length > 0) {
    const altNames = caseData.altReasons
      .map((ar) => ar.item?.name)
      .filter(Boolean)
      .join(", ");
    lines.push(`- **Motivos Alternativos de Consulta:** ${altNames || "Ninguno"}`);
  } else {
    lines.push("- **Motivos Alternativos de Consulta:** Sin motivos alternativos");
  }
  lines.push("");

  // 2. SIGNOS Y SÍNTOMAS
  lines.push("## 2. Signos y Síntomas");
  lines.push("");
  lines.push("### Historia de la Enfermedad Actual y Signos Clave");
  lines.push("");
  lines.push(caseData.signsSymptomsText?.trim() || "_Sin anamnesis detallada registrada._");
  lines.push("");
  lines.push(`- **Recurso Audiovisual / Video:** ${caseData.hasVideo ? "Sí requiere video" : "No requiere video"}`);
  if (caseData.hasVideo) {
    lines.push(
      `- **Indicaciones / Enlace de Video:** ${
        caseData.videoUrl?.trim() || "Sin preferencia específica configurada"
      }`
    );
  }

  const phase2Fields = (caseData.additionalFields || []).filter((f) => f.phase === 2);
  if (phase2Fields.length > 0) {
    lines.push("");
    lines.push("### Campos Adicionales (Fase 2)");
    lines.push("");
    for (const f of phase2Fields) {
      lines.push(`- **${f.field?.name || "Campo adicional"}:** ${f.value}`);
    }
  }
  lines.push("");

  // 3. EXAMEN FÍSICO
  lines.push("## 3. Examen Físico");
  lines.push("");
  lines.push(
    `- **Modalidad:** ${
      caseData.examModality === "interactive" ? "Interactivo (Puntos 3D)" : "Relato Narrativo"
    }`
  );
  lines.push("");

  if (caseData.examModality === "narrative") {
    lines.push("### Relato del Examen Físico");
    lines.push("");
    lines.push(caseData.physicalExamNarrative?.trim() || "_Sin relato narrativo cargado._");
  } else {
    lines.push("### Hallazgos por Punto Anatómico");
    lines.push("");
    if (caseData.examFindings && caseData.examFindings.length > 0) {
      lines.push("| Punto Anatómico | Hallazgo Clínico | Nivel de Respuesta |");
      lines.push("| --- | --- | --- |");
      for (const f of caseData.examFindings) {
        const punto = (f.puntoAnatomico?.name || "Sin punto").replace(/\|/g, "\\|");
        const hallazgo = (f.hallazgo || "").replace(/\|/g, "\\|").replace(/\n/g, " ");
        const nivel = (f.nivelRespuesta?.name || "Normal").replace(/\|/g, "\\|");
        lines.push(`| ${punto} | ${hallazgo} | ${nivel} |`);
      }
    } else {
      lines.push("_No se registraron puntos anatómicos interactivos._");
    }
  }

  const phase3Fields = (caseData.additionalFields || []).filter((f) => f.phase === 3);
  if (phase3Fields.length > 0) {
    lines.push("");
    lines.push("### Campos Adicionales (Fase 3)");
    lines.push("");
    for (const f of phase3Fields) {
      lines.push(`- **${f.field?.name || "Campo adicional"}:** ${f.value}`);
    }
  }
  lines.push("");

  // 4. ESTUDIOS COMPLEMENTARIOS
  lines.push("## 4. Estudios Complementarios");
  lines.push("");
  if (caseData.studies && caseData.studies.length > 0) {
    for (const s of caseData.studies) {
      const studyName = s.studyType?.name || "Estudio";
      const statusText = s.performed ? "Realizado" : "No realizado";
      lines.push(`### ${studyName} (${statusText})`);
      if (s.performed) {
        lines.push(`- **Hallazgos:** ${s.findingsText?.trim() || "Sin hallazgos especificados"}`);
      }
      if (s.images && s.images.length > 0) {
        lines.push(`- **Imágenes asociadas (${s.images.length}):**`);
        s.images.forEach((img, idx) => {
          const desc = img.description?.trim() || `Imagen ${idx + 1}`;
          if (img.url?.startsWith("data:")) {
            lines.push(`  - ${desc} _(imagen embebida en el caso)_`);
          } else if (img.url) {
            lines.push(`  - [${desc}](${img.url})`);
          } else {
            lines.push(`  - ${desc}`);
          }
        });
      }
      lines.push("");
    }
  } else {
    lines.push("_No hay estudios complementarios registrados._");
    lines.push("");
  }

  // 5. DIAGNÓSTICO DIFERENCIAL
  lines.push("## 5. Diagnóstico Diferencial");
  lines.push("");
  if (caseData.diagnoses && caseData.diagnoses.length > 0) {
    caseData.diagnoses.forEach((d, idx) => {
      const orderNum = d.order || idx + 1;
      const badge = d.isCorrect ? " **(DIAGNÓSTICO CORRECTO)**" : "";
      lines.push(`${orderNum}. ${d.item?.name || "Diagnóstico"}${badge}`);
    });
  } else {
    lines.push("_Sin diagnósticos diferenciales registrados._");
  }
  lines.push("");

  // 6. TRATAMIENTO Y RESOLUCIÓN QUIRÚRGICA
  lines.push("## 6. Tratamiento y Resolución Quirúrgica");
  lines.push("");
  lines.push("### Tratamiento Médico General");
  lines.push("");
  lines.push(caseData.medicalTreatmentText?.trim() || "_No especificado._");
  lines.push("");
  lines.push(
    `- **Conducta Quirúrgica:** ${
      caseData.includesSurgery ? "Requiere Cirugía" : "Tratamiento no quirúrgico"
    }`
  );

  if (caseData.includesSurgery) {
    lines.push(
      `- **Técnica Quirúrgica:** ${caseData.surgicalTechnique?.name || "No especificada"}`
    );
    if (caseData.surgicalNote?.trim()) {
      lines.push(`- **Nota Quirúrgica:** ${caseData.surgicalNote.trim()}`);
    }
    if (caseData.openApproach?.trim()) {
      lines.push(`- **Abordaje Abierto:** ${caseData.openApproach.trim()}`);
    }
    if (caseData.minimInvasiveApproach?.trim()) {
      lines.push(`- **Abordaje Mínimamente Invasivo:** ${caseData.minimInvasiveApproach.trim()}`);
    }
    if (caseData.surgicalSteps && caseData.surgicalSteps.length > 0) {
      lines.push("");
      lines.push("### Principios Técnicos / Pasos Quirúrgicos");
      lines.push("");
      caseData.surgicalSteps.forEach((step, idx) => {
        const orderNum = step.order || idx + 1;
        lines.push(`${orderNum}. ${step.text}`);
      });
    }
  }
  lines.push("");

  // 7. COMPLICACIONES
  lines.push("## 7. Complicaciones Posibles y Riesgos");
  lines.push("");
  if (caseData.complicationsIntroText?.trim()) {
    lines.push(caseData.complicationsIntroText.trim());
    lines.push("");
  }
  if (caseData.complications && caseData.complications.length > 0) {
    for (const c of caseData.complications) {
      const compName = c.item?.name || "Complicación";
      if (c.note?.trim()) {
        lines.push(`- **${compName}:** ${c.note.trim()}`);
      } else {
        lines.push(`- **${compName}**`);
      }
    }
  } else {
    lines.push("_No se detallaron complicaciones específicas._");
  }
  lines.push("");

  // 8. RESUMEN
  lines.push("## 8. Resumen del Caso y Conclusiones Docentes");
  lines.push("");
  lines.push(caseData.summary?.trim() || "_Sin resumen clínico final redactado._");
  lines.push("");

  return lines.join("\n");
}

/**
 * Descarga en el navegador un archivo .md con el contenido del caso clínico.
 */
export function downloadCaseAsMarkdown(caseData: SavedCase): string {
  const markdown = caseToMarkdown(caseData);
  const rawTitle = caseData.finalDiagnosis?.name || caseData.principalReason?.name || `caso-${caseData.id}`;
  const safeSlug = rawTitle
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  const fileName = `${safeSlug || "caso-clinico"}.md`;
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return fileName;
}

