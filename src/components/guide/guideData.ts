import { CaseDraft } from "@/types/clinical";

export interface GuideField {
  name: string;
  type: string;
  required: boolean;
  description: string;
  tips: string;
  example: string;
}

export interface GuideSection {
  id: string;
  number: number;
  title: string;
  badge: string;
  category: "anamnesis" | "exploracion" | "diagnostico" | "tratamiento" | "sistema";
  summary: string;
  purpose: string;
  fields: GuideField[];
  pedagogicalImpact: string;
  bestPractice: string;
  avoid: string;
}

export interface RealCaseExample {
  id: string;
  title: string;
  diagnosis: string;
  specialty: string;
  age: string;
  tagline: string;
  draft: CaseDraft;
  pedagogicalKey: string;
}

export const REAL_CASE_EXAMPLES: RealCaseExample[] = [
  {
    id: "ehp",
    title: "Estenosis Hipertrófica del Píloro en Lactante",
    diagnosis: "Estenosis Hipertrófica de Píloro (EHP)",
    specialty: "Cirugía Pediátrica / Gastroenterología",
    age: "1 mes (4 semanas)",
    tagline:
      "El cuadro clásico de alcalosis metabólica hipoclorémica con peristaltismo gástrico visible y palpación de oliva.",
    pedagogicalKey:
      "Evalúa que el alumno no opere de urgencia sin antes corregir el desequilibrio hidroelectrolítico y ácido-base.",
    draft: {
      title: "Estenosis Hipertrófica del Píloro en Lactante",
      consultationReason:
        "Lactante de 4 semanas con vómitos postprandiales en proyectil, no biliosos, e irritabilidad progresiva tras alimentarse.",
      clinicalHistory:
        "Lactante masculino de 30 días de vida, nacido a término por parto vaginal sin complicaciones (peso al nacer 3.350 g). Alimentado exclusivamente con lactancia materna. La madre refiere cuadro de 5 días de evolución caracterizado por vómitos postprandiales inmediatos, de contenido lácteo no bilioso, expulsados con notable fuerza ('en proyectil'). Presenta apetito voraz e insaciable posterior al vómito. En las últimas 36 horas se constata marcada disminución del número de pañales mojados (oliguria relativa) y pérdida ponderal de 220 gramos respecto al último control.",
      hasVideo: true,
      videoDescription:
        "Registro de 15 segundos en decúbito supino donde se visualizan ondas peristálticas gástricas progresando de hipocondrio izquierdo a epigastrio, seguidas de llanto por hambre y vómito en proyectil.",
      isInteractiveExam: true,
      examZone: "Epigastrio y cuadrante superior derecho",
      examRefPoint:
        "Palpación profunda de masa ovoide firme (oliva pilórica de 2 cm) con maniobra bimanual tras evacuar contenido gástrico",
      painLevel: "Dolor moderado a la palpación profunda con irritabilidad inconsolable",
      structuredTreatments: [
        {
          description:
            "Plan de hidratación parenteral y corrección hidroelectrolítica previa a resolución quirúrgica",
          isCorrect: true,
          feedback:
            "Excelente conducta. En estenosis pilórica la urgencia inicial es médica para estabilizar el medio interno antes de inducir anestesia.",
          order: 1,
        },
        {
          description: "Indicar pase inmediato a quirófano sin reposición hidroelectrolítica",
          isCorrect: false,
          feedback:
            "Peligro crítico: Alto riesgo de arritmias intraoperatorias y paro cardíaco por alcalosis metabólica e hipopotasemia no corregidas.",
          order: 2,
        },
        {
          description: "Administrar ranitidina oral y alta médica con fraccionamiento de tomas",
          isCorrect: false,
          feedback:
            "Error grave: Confunde reflujo gastroesofágico fisiológico con una obstrucción mecánica pilórica.",
          order: 3,
        },
        {
          description: "Iniciar antibioticoterapia empírica parenteral y ayuno",
          isCorrect: false,
          feedback:
            "Conducta inadecuada: No existe foco infeccioso primario; retrasa la estabilización electrolítica.",
          order: 4,
        },
      ],
      clinicalSummary:
        "La estenosis hipertrófica de píloro es la causa quirúrgica más frecuente de vómitos no biliosos en el lactante menor. El diagnóstico precoz ecográfico evita la progresión a deshidratación severa con alcalosis hipoclorémica e hipopotasemia. El tratamiento definitivo es la piloromiotomía de Fredet-Ramstedt, pero siempre tras compensar el medio interno.",
      epidemiology:
        "Incidencia de 1 a 3 por cada 1.000 nacidos vivos. Predilección marcada por el sexo masculino (proporción 4:1) y con mayor frecuencia en primogénitos. Se ha vinculado al uso neonatal de macrólidos.",
      complications:
        "Alcalosis metabólica hipoclorémica grave, deshidratación con hipoperfusión tisular, insuficiencia renal prerrenal, arritmias cardíacas intraoperatorias por hipopotasemia severa.",
      selectedKeywords: [
        "Lactante",
        "Vómito en proyectil",
        "Deshidratación",
        "Alcalosis metabólica",
        "Masa palpable",
        "Ecografía pilórica",
      ],
      addedStudies: [
        {
          name: "Ecografía Abdominal Pediátrica",
          isAdequate: true,
          findings:
            "Canal pilórico elongado de 18 mm (normal < 14 mm) con espesor de la capa muscular de 4.3 mm (normal < 3 mm). Signo del 'doble riel' y del 'ojo de buey' característicos. Retardo crítico del vaciamiento gástrico.",
          imageUrl: null,
          imageName: null,
        },
        {
          name: "Ionograma y Estado Ácido-Base Venoso",
          isAdequate: true,
          findings:
            "pH: 7.51 (alcalosis), HCO3: 31 mEq/L, Cloro: 88 mEq/L (hipocloremia), Potasio: 3.1 mEq/L (hipopotasemia), Sodio: 134 mEq/L.",
          imageUrl: null,
          imageName: null,
        },
        {
          name: "Tomografía Computada de Abdomen con Contraste",
          isAdequate: false,
          findings:
            "Estudio no indicado en sospecha de EHP. Expone innecesariamente al lactante a radiación ionizante.",
          imageUrl: null,
          imageName: null,
        },
      ],
    },
  },
  {
    id: "bronquiolitis",
    title: "Bronquiolitis Aguda en Lactante de 3 Meses",
    diagnosis: "Bronquiolitis Aguda por Virus Respiratorio Sincicial (VRS)",
    specialty: "Neumotisiología Pediátrica / Urgencias",
    age: "3 meses",
    tagline:
      "El reto del uso racional de medicación: oxigenoterapia y soporte sin antibióticos ni corticoides de rutina.",
    pedagogicalKey:
      "Premia el manejo de soporte no invasivo y penaliza el sobretratamiento farmacológico según guías AAP/NICE.",
    draft: {
      title: "Bronquiolitis Aguda en Lactante de 3 Meses",
      consultationReason:
        "Lactante de 3 meses con dificultad respiratoria progresiva, tos húmeda y dificultad para alimentarse al pecho.",
      clinicalHistory:
        "Lactante femenina de 3 meses y medio que consulta por tos húmeda, rinorrea serosa y febrícula de 38°C de 48 horas de evolución. En las últimas 12 horas la madre nota agitación respiratoria, tiraje intercostal y gran dificultad para prenderse al pecho materno, logrando alimentarse solo por períodos breves de 2 minutos antes de soltarlo con quejido.",
      hasVideo: true,
      videoDescription:
        "Video de 20 segundos que muestra taquipnea (FR 62 rpm), aleteo nasal moderado, tiraje subcostal e intercostal con balanceo toracoabdominal.",
      isInteractiveExam: false,
      examStandardText:
        "Regular estado general, taquipneica, reactiva. Saturación de O2 al aire ambiente: 90%. Auscultación pulmonar: espiración prolongada, sibilancias espiratorias bilaterales difusas y subcrepitantes tele-inspiratorios en ambas bases pulmonares. Sin signos de condensación.",
      painLevel: "Sin dolor espontáneo, irritabilidad vinculada al esfuerzo respiratorio e hipoxemia",
      structuredTreatments: [
        {
          description:
            "Oxigenoterapia por cánula nasal para mantener SatO2 > 92%, aspiración suave de secreciones y fraccionamiento de tomas",
          isCorrect: true,
          feedback:
            "Correcto. El pilar de la bronquiolitis es el soporte respiratorio y nutricional; los fármacos broncodilatadores o antibióticos no modifican el curso.",
          order: 1,
        },
        {
          description: "Prescribir amoxicilina oral por 10 días y nebulizaciones con budesonide",
          isCorrect: false,
          feedback:
            "Error común: La etiología es viral (VRS) y los corticoides inhalados no han demostrado eficacia clínica en bronquiolitis típica.",
          order: 2,
        },
        {
          description: "Indicar antitusígenos y jarabe mucolítico cada 8 horas",
          isCorrect: false,
          feedback:
            "Contraindicado: Los antitusígenos deprimen el centro respiratorio y aumentan el riesgo de apneas en menores de 1 año.",
          order: 3,
        },
        {
          description: "Administrar dexametasona intramuscular y alta a domicilio",
          isCorrect: false,
          feedback:
            "Inadecuado: Los corticoides sistémicos no reducen la hospitalización ni mejoran la saturación en lactantes sin antecedentes atópicos.",
          order: 4,
        },
      ],
      clinicalSummary:
        "Infección del tracto respiratorio inferior más frecuente en menores de 2 años. El VRS es el agente causal predominante. El manejo es esencialmente de soporte: hidratación, despeje nasal y oxigenoterapia normada. El sobretratamiento con antibióticos o corticoides debe ser desalentado.",
      epidemiology:
        "Picos estacionales en otoño e invierno. Mayor gravedad en menores de 3 meses, prematuros y pacientes con cardiopatías congénitas o displasia broncopulmonar.",
      complications:
        "Apneas centrales en lactantes pequeños, insuficiencia respiratoria aguda hipercápnica, atelectasias secundarias a tapones mucosos, sobreinfección bacteriana infrecuente.",
      selectedKeywords: ["Lactante", "Fiebre", "Dificultad respiratoria", "Sibilancias", "VRS"],
      addedStudies: [
        {
          name: "Saturometría y Oximetría de Pulso Continua",
          isAdequate: true,
          findings:
            "Saturación basal de 90% que asciende a 96% con oxígeno suplementario por cánula a 1 L/min.",
          imageUrl: null,
          imageName: null,
        },
        {
          name: "Panel de Detección Rápida de Virus Respiratorios (Hisopado)",
          isAdequate: true,
          findings:
            "Positivo para Virus Respiratorio Sincicial (VRS). Negativo para Influenza A/B y SARS-CoV-2.",
          imageUrl: null,
          imageName: null,
        },
        {
          name: "Radiografía de Tórax Frente",
          isAdequate: false,
          findings:
            "Atrapamiento aéreo leve. Las guías internacionales recomiendan no solicitar radiografía de rutina en casos leves/moderados típicos.",
          imageUrl: null,
          imageName: null,
        },
      ],
    },
  },
];

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "sec-fase-1",
    number: 1,
    title: "Fase 1: Motivo de Consulta",
    badge: "Fase 1 • Motivo de Consulta",
    category: "anamnesis",
    summary:
      "Apertura del caso: nombre docente, motivo de consulta real, anamnesis para el simulador, recurso audiovisual y examen físico.",
    purpose:
      "Recrear el momento exacto en que la familia ingresa a la consulta médica y se evalúan los signos clínicos iniciales.",
    fields: [
      {
        name: "Nombre / Título del Caso",
        type: "Texto formal (input)",
        required: true,
        description: "Denominación patológica o docente formal del caso para indexación académica.",
        tips: "Sea preciso y descriptivo (ej: Estenosis Hipertrófica del Píloro en Lactante).",
        example: "Estenosis Hipertrófica del Píloro en Lactante",
      },
      {
        name: "Motivo de Consulta",
        type: "Texto breve (input)",
        required: true,
        description: "Lo que refiere la madre o tutor al llegar a la guardia.",
        tips: "No use diagnósticos; describa el síntoma cardinal que detona la consulta.",
        example: "Lactante de 4 semanas con vómitos postprandiales en proyectil e irritabilidad",
      },
      {
        name: "Signos, Síntomas y Anamnesis",
        type: "Área narrativa (textarea)",
        required: true,
        description: "Historia cronológica y descripción visual del paciente para el simulador.",
        tips: "Incluya edad, antecedentes perinatales, signos de alarma y tiempo de evolución.",
        example: "Lactante de 30 días con vómitos de contenido lácteo no bilioso de 5 días de evolución...",
      },
      {
        name: "Recurso Audiovisual (Opcional)",
        type: "Conmutador Sí/No + Detalle",
        required: false,
        description: "Detalle del video o animación de semiología dinámica que verá el alumno.",
        tips: "Especifique el movimiento o signo a observar (ej: ondas peristálticas visibles).",
        example: "Video de 15 segundos que muestra ondas peristálticas gástricas en epigastrio.",
      },
      {
        name: "Examen Físico (3D vs Estándar)",
        type: "Selector conmutador + Campos específicos",
        required: true,
        description: "Configuración interactiva de puntos anatómicos y nivel de dolor.",
        tips: "Si es interactivo, detalle la región y el signo palpatorio (ej: oliva pilórica).",
        example: "Epigastrio / Hipocondrio derecho — Palpación de tumoración móvil de 2 cm.",
      },
    ],
    pedagogicalImpact:
      "Estimula la formulación de hipótesis diagnósticas tempranas a partir de la semiología visual y táctil.",
    bestPractice:
      "Describa los signos tal como los percibiría el médico de guardia en la exploración clínica directa.",
    avoid:
      "Adelantar el tratamiento o resultados paraclínicos dentro de la anamnesis.",
  },
  {
    id: "sec-fase-2",
    number: 2,
    title: "Fase 2: Diagnóstico",
    badge: "Fase 2 • Diagnóstico",
    category: "diagnostico",
    summary:
      "Panel de solicitudes paraclínicas: botonera rápida de estudios frecuentes, criterio docente (adecuado/penaliza), hallazgo e imágenes WebP.",
    purpose:
      "Enseñar al alumno a solicitar estudios complementarios racionales y a interpretar informes reales e imágenes.",
    fields: [
      {
        name: "Botonera Rápida de Estudios",
        type: "Botones de acceso directo",
        required: false,
        description: "Incorpora con un toque ecografías, hemogramas, radiografías u orina.",
        tips: "Ahorra tiempo de tipeo y estandariza la nomenclatura paraclínica.",
        example: "[+ Ecografía Abdominal] [+ Hemograma Completo] [+ Ionograma]",
      },
      {
        name: "Criterio de Evaluación Pedagógica",
        type: "Toggle conmutador [Adecuado / Penaliza]",
        required: true,
        description: "Define si la solicitud es médicamente correcta o representa un error formativo.",
        tips: "Los estudios inadecuados descuentan puntaje en el simulador para desalentar el sobretesteo.",
        example: "Tomografía computada de abdomen en EHP -> Inadecuado (Penaliza).",
      },
      {
        name: "Informe / Hallazgo para el Alumno",
        type: "Área de texto (textarea)",
        required: true,
        description: "Informe detallado con valores numéricos y signos que verá el estudiante al pedir la prueba.",
        tips: "Provea valores de referencia y mediciones cuantitativas reales.",
        example: "Canal pilórico elongado de 18 mm, espesor muscular de 4.3 mm (signo del ojo de buey).",
      },
      {
        name: "Imagen Diagnóstica (Opcional)",
        type: "Carga WebP con Zoom Lightbox",
        required: false,
        description: "Placa radiográfica, ecografía o foto macroscópica asociada al estudio.",
        tips: "El sistema convierte automáticamente PNG o JPG a formato WebP optimizado.",
        example: "ecografia_pilorica_eje_transversal.webp",
      },
    ],
    pedagogicalImpact:
      "Inculca el principio de medicina basada en el valor: pedir solo lo necesario y evitar radiaciones o gastos fútiles.",
    bestPractice:
      "Incluya al menos un estudio contraindicado o no pertinente (marcado como Penaliza) para desafiar el criterio del alumno.",
    avoid:
      "Crear estudios con informes ambiguos o sin valores cuantitativos cuando correspondan.",
  },
  {
    id: "sec-fase-3",
    number: 3,
    title: "Fase 3: Tratamiento",
    badge: "Fase 3 • Tratamiento",
    category: "tratamiento",
    summary:
      "Conductas terapéuticas con menú rápido de incorporación, distinción de conducta correcta/incorrecta y justificación docente individual.",
    purpose:
      "Poner a prueba el criterio resolutivo del estudiante ante las conductas terapéuticas prioritarias.",
    fields: [
      {
        name: "Menú de Conductas Frecuentes",
        type: "Botones de acceso rápido",
        required: false,
        description: "Permite incorporar con 1 clic hidratación parenteral, piloromiotomía, descompresión o errores típicos.",
        tips: "Evita tener que escribir manualmente las conductas terapéuticas habituales.",
        example: "[+ Hidratación Parenteral y Corrección] [+ Piloromiotomía]",
      },
      {
        name: "Alternativas Médicas y Selector Correcto",
        type: "Renglones dinámicos + Selector Correcta/Incorrecta",
        required: true,
        description: "Opciones de conducta médica marcando la acertada y los distractores.",
        tips: "Construya distractores plausibles que reflejen errores conceptuales frecuentes en la guardia.",
        example: "Opción 1: Rehidratación y corrección electrolítica [Correcta]. Opción 2: Cirugía de urgencia sin hidratar.",
      },
      {
        name: "Feedback / Justificación Docente",
        type: "Casillero explicativo por opción",
        required: false,
        description: "Devolución formativa que el alumno leerá al elegir la alternativa.",
        tips: "Explique no solo qué es correcto, sino por qué las opciones erróneas son peligrosas.",
        example: "Peligro crítico: Alto riesgo de arritmias intraoperatorias por hipopotasemia severa.",
      },
    ],
    pedagogicalImpact:
      "Cierra la experiencia de simulación con un aprendizaje significativo mediante retroalimentación constructiva inmediata.",
    bestPractice:
      "Asegúrese de redactar feedback constructivo para todos los distractores, no solo para la opción correcta.",
    avoid:
      "Opciones ridículas o inverosímiles que se descarten por descarte lógico en vez de razonamiento clínico.",
  },
  {
    id: "sec-fase-4",
    number: 4,
    title: "Fase 4: Resumen del Caso",
    badge: "Fase 4 • Resumen del Caso",
    category: "sistema",
    summary:
      "Revisión integral de fases anteriores con edición directa inline, fundamentos fisiopatológicos, palabras clave y botón único de finalización.",
    purpose:
      "Auditar holísticamente el caso clínico completo, permitiendo correcciones directas de Fases 1, 2 y 3 antes de su publicación definitiva.",
    fields: [
      {
        name: "Panel de Revisión & Edición Directa",
        type: "Bloques desplegables con edición inline",
        required: true,
        description: "Permite inspeccionar y modificar datos de Fases 1, 2 y 3 directamente sin perder el hilo o saltar a la fase requerida.",
        tips: "Use los botones 'Editar en Fase X' o modifique los valores directamente en los campos del resumen.",
        example: "Edición directa de Anamnesis, agregado de nuevos estudios o ajustes en feedback de tratamientos.",
      },
      {
        name: "Resumen Clínico y Discusión Docente",
        type: "Área narrativa amplia",
        required: false,
        description: "Visión global del cuadro fisiopatológico y conclusiones docentes del caso.",
        tips: "Sintetice el mensaje formativo clave que el estudiante debe recordar en su práctica médica.",
        example: "La EHP es una urgencia médica y no quirúrgica inmediata. Primero se estabiliza el medio interno...",
      },
      {
        name: "Epidemiología y Factores de Riesgo",
        type: "Área de texto (textarea)",
        required: false,
        description: "Datos de prevalencia, proporción por sexo, grupo etario y factores predisponentes.",
        tips: "Mencione estadísticas poblacionales relevantes para el contexto pediátrico.",
        example: "Predominio en varones (4:1), primogénitos, entre 2 y 8 semanas de vida.",
      },
      {
        name: "Complicaciones Principales",
        type: "Área de texto (textarea)",
        required: false,
        description: "Riesgos evolutivos en caso de retraso diagnóstico o manejo inadecuado.",
        tips: "Señale las complicaciones metabólicas, hemodinámicas o respiratorias.",
        example: "Alcalosis hipoclorémica grave, deshidratación con hipoperfusión, paro cardíaco.",
      },
      {
        name: "Palabras Clave (Keywords)",
        type: "Input inteligente con Enter + Sugerencias",
        required: false,
        description: "Etiquetas normalizadas para búsqueda, indexación y filtrado en el repositorio.",
        tips: "Escriba y presione Enter o haga clic en las sugerencias del catálogo.",
        example: "Lactante, Vómito en proyectil, Deshidratación, Alcalosis, Ecografía",
      },
      {
        name: "Botón Único de Finalización",
        type: "Acción principal consolidada",
        required: true,
        description: "Botón único al pie para guardar o actualizar el caso clínico en el repositorio sin duplicación de acciones.",
        tips: "Valida automáticamente la integridad de los datos obligatorios antes de persistir.",
        example: "[💾 Finalizar Caso y Guardar] / [💾 Actualizar Caso Clínico]",
      },
    ],
    pedagogicalImpact:
      "Garantiza el control de calidad docente al permitir auditar el caso clínico en una vista unificada previa a la publicación para los alumnos.",
    bestPractice:
      "Aproveche la edición directa para pulir inconsistencias entre los hallazgos de Fase 2 y la conducta prioritaria de Fase 3.",
    avoid:
      "Publicar casos sin verificar que la opción correcta de tratamiento responda con coherencia a la clínica presentada.",
  },
];
