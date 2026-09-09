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
    title: "Lactante de 4 semanas con vómitos recurrentes en proyectil e irritabilidad",
    diagnosis: "Estenosis Hipertrófica de Píloro (EHP)",
    specialty: "Cirugía Pediátrica / Gastroenterología",
    age: "1 mes (4 semanas)",
    tagline:
      "El cuadro clásico de alcalosis metabólica hipoclorémica con peristaltismo gástrico visible y palpación de oliva.",
    pedagogicalKey:
      "Evalúa que el alumno no opere de urgencia sin antes corregir el desequilibrio hidroelectrolítico y ácido-base.",
    draft: {
      title: "Lactante de 4 semanas con vómitos recurrentes en proyectil e irritabilidad",
      selectedKeywords: [
        "Lactante",
        "Vómito en proyectil",
        "Deshidratación",
        "Alcalosis metabólica",
        "Masa palpable",
      ],
      clinicalHistory:
        "Lactante masculino de 30 días de vida, nacido a término por parto vaginal sin complicaciones (peso al nacer 3.350 g). Alimentado exclusivamente con lactancia materna. La madre refiere cuadro de 5 días de evolución caracterizado por vómitos postprandiales inmediatos, de contenido lácteo no bilioso, expulsados con notable fuerza ('en proyectil'). Presenta apetito voraz e insaciable posterior al vómito. En las últimas 36 horas se constata marcada disminución del número de pañales mojados (oliguria relativa) y pérdida ponderal de 220 gramos respecto al último control.",
      hasVideo: true,
      videoDescription:
        "Registro de 15 segundos en decúbito supino donde se visualizan ondas peristálticas gástricas progresando de hipocondrio izquierdo a epigastrio, seguidas de llanto por hambre.",
      isInteractiveExam: true,
      examZone: "Epigastrio y cuadrante superior derecho",
      examRefPoint:
        "Palpación profunda de masa ovoide firme (oliva pilórica de 2 cm) con maniobra bimanual tras evacuar contenido gástrico",
      painLevel: "Dolor moderado a la palpación profunda con irritabilidad inconsolable",
      treatmentOptions:
        "- Plan de hidratación parenteral y corrección hidroelectrolítica previa a resolución quirúrgica [CORRECTA]\n- Indicar pase inmediato a quirófano sin reposición hidroelectrolítica\n- Administrar ranitidina oral y alta médica con fraccionamiento de tomas\n- Iniciar antibioticoterapia empírica parenteral",
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
    title: "Lactante de 3 meses con dificultad respiratoria progresiva y rechazo del alimento",
    diagnosis: "Bronquiolitis Aguda por Virus Respiratorio Sincicial (VRS)",
    specialty: "Neumotisiología Pediátrica / Urgencias",
    age: "3 meses",
    tagline:
      "El reto del uso racional de medicación: oxigenoterapia y soporte sin antibióticos ni corticoides de rutina.",
    pedagogicalKey:
      "Premia el manejo de soporte no invasivo y penaliza el sobretratamiento farmacológico según guías AAP/NICE.",
    draft: {
      title: "Lactante de 3 meses con dificultad respiratoria progresiva y rechazo del alimento",
      selectedKeywords: ["Lactante", "Fiebre", "Dificultad respiratoria", "Sibilancias"],
      clinicalHistory:
        "Lactante femenina de 3 meses y medio que consulta por tos húmeda, rinorrea serosa y febrícula de 38°C de 48 horas de evolución. En las últimas 12 horas la madre nota agitación respiratoria, tiraje intercostal y gran dificultad para prenderse al pecho materno, logrando alimentarse solo por períodos breves de 2 minutos antes de soltarlo con quejido.",
      hasVideo: true,
      videoDescription:
        "Video de 20 segundos que muestra taquipnea (FR 62 rpm), aleteo nasal moderado, tiraje subcostal e intercostal con balanceo toracoabdominal.",
      isInteractiveExam: false,
      examStandardText:
        "Regular estado general, taquipneica, reactiva. Saturación de O2 al aire ambiente: 90%. Auscultación pulmonar: espiración prolongada, sibilancias espiratorias bilaterales difusas y subcrepitantes tele-inspiratorios en ambas bases pulmonares. Sin signos de condensación.",
      painLevel: "Sin dolor espontáneo, irritabilidad vinculada al esfuerzo respiratorio e hipoxemia",
      treatmentOptions:
        "- Oxigenoterapia por cánula nasal para mantener SatO2 > 92%, aspiración suave de secreciones y fraccionamiento de tomas [CORRECTA]\n- Prescribir amoxicilina oral por 10 días y nebulizaciones con budesonide\n- Indicar antitusígenos y jarabe mucolítico cada 8 horas\n- Administrar dexametasona intramuscular y alta a domicilio",
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
            "Atrapamiento aéreo bilateral leve con horizontalización costal. No se evidencian consolidaciones. En cuadros típicos leves/moderados no está indicada de rutina.",
          imageUrl: null,
          imageName: null,
        },
      ],
    },
  },
  {
    id: "intususcepcion",
    title: "Lactante de 7 meses con crisis de llanto paroxístico e hipoactividad episódica",
    diagnosis: "Invaginación Intestinal Aguda (Intususcepción Ileo-cólica)",
    specialty: "Urgencias Pediátricas / Cirugía",
    age: "7 meses",
    tagline:
      "El dolor cólico intermitente con letargia paradójica y signo de la morcilla invaginada.",
    pedagogicalKey:
      "Destaca la ecografía como gold standard y la reducción neumática/hidrostática previa a la laparotomía.",
    draft: {
      title: "Lactante de 7 meses con crisis de llanto paroxístico e hipoactividad episódica",
      selectedKeywords: ["Lactante", "Dolor abdominal", "Masa palpable", "Vómito"],
      clinicalHistory:
        "Lactante masculino de 7 meses, previamente sano y con carnet de vacunación al día. Acude traído por sus padres por episodios recurrentes de llanto desgarrador con flexión de miembros inferiores sobre el abdomen que duran entre 10 y 15 minutos, alternados con períodos de marcada somnolencia, letargia y palidez cutánea. Hace 2 horas presentó vómito de contenido alimentario y recientemente expulsó heces con aspecto mucoso y estrías de sangre oscura ('jalea de grosella').",
      hasVideo: false,
      videoDescription: null,
      isInteractiveExam: true,
      examZone: "Flanco e hipocondrio derecho",
      examRefPoint:
        "Palpación de masa cilíndrica alargada, elástica ('morcilla') en cuadrante superior derecho con fosa ilíaca derecha vacía (Signo de Dance)",
      painLevel: "Dolor severo cólico paroxístico con defensa voluntaria durante las crisis",
      treatmentOptions:
        "- Colocación de sonda nasogástrica, reanimación hídrica e interconsulta urgente para desinvaginación neumática o hidrostática guiada [CORRECTA]\n- Laparotomía exploradora de urgencia sin intento previo de reducción por enema\n- Administrar antiespasmódicos orales y enviar a domicilio con reposo\n- Indicar enema jabonoso evacuante a alta presión en sala general",
      addedStudies: [
        {
          name: "Ecografía Abdominal Focalizada",
          isAdequate: true,
          findings:
            "Imagen en 'diana' o 'pseudoriñón' en corte transversal de 32 mm en hipocondrio derecho. Flujo Doppler conservado en asas invaginadas sin signos de perforación ni líquido libre.",
          imageUrl: null,
          imageName: null,
        },
        {
          name: "Radiografía Simple de Abdomen de Pie",
          isAdequate: false,
          findings:
            "Escaso gas en fosa ilíaca derecha. Menor sensibilidad y especificidad que la ecografía; no descarta el cuadro.",
          imageUrl: null,
          imageName: null,
        },
      ],
    },
  },
];

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "sec-1",
    number: 1,
    title: "Título del Caso Clínico",
    badge: "Paso 1 • Obligatorio",
    category: "anamnesis",
    summary: "Primera información que el estudiante lee al iniciar su guardia pediátrica virtual.",
    purpose:
      "Plantear el dilema clínico desde la perspectiva del motivo de consulta real sin adelantar el desenlace patológico.",
    fields: [
      {
        name: "Título que verá el alumno",
        type: "Texto breve (input)",
        required: true,
        description:
          "Es el encabezado del caso. Debe sintetizar la edad o grupo etario del paciente, el motivo de consulta cardinal y las características temporales de la enfermedad.",
        tips: "Evite nombres de diagnósticos finales, bacterias, síndromes genéticos o tratamientos definitivos.",
        example:
          "Lactante de 4 semanas con vómitos recurrentes en proyectil e irritabilidad progresiva",
      },
    ],
    pedagogicalImpact:
      "Estimula la hipótesis diagnóstica temprana y el diagnóstico diferencial desde el primer segundo de la simulación.",
    bestPractice:
      "Estructura recomendada: [Edad / Grupo Etario] + [Signo o Síntoma Guía] + [Patrón de Presentación].",
    avoid:
      "Titular 'Estenosis Hipertrófica de Píloro' o 'Caso de Neumonía Lobar' (invalida el razonamiento del alumno).",
  },
  {
    id: "sec-2",
    number: 2,
    title: "Palabras Clave (Keywords)",
    badge: "Paso 2 • Taxonomía",
    category: "anamnesis",
    summary:
      "Descriptores clínicos normalizados para indizar, filtrar y agrupar casos en el catálogo docente.",
    purpose:
      "Permitir que los estudiantes y docentes encuentren casos por síntomas, hallazgos semiológicos y diagnósticos.",
    fields: [
      {
        name: "Catálogo de Palabras Clave",
        type: "Chips interactivos conmutables",
        required: false,
        description:
          "Banco de términos médicos disponibles en la plataforma. Haga clic en un chip para asignarlo al caso (se resaltará en el color de su tema).",
        tips: "Seleccione entre 3 y 5 palabras clave que representen tanto signos visibles como elementos fisiopatológicos.",
        example: "Lactante, Vómito en proyectil, Deshidratación, Alcalosis metabólica",
      },
      {
        name: "Añadir nueva palabra clave",
        type: "Input + Botón (+ Agregar)",
        required: false,
        description:
          "Crea instantáneamente un nuevo término en la base de datos si no existía en el catálogo previo.",
        tips: "Escriba en mayúscula inicial y respete la ortografía médica en español.",
        example: "Oliva pilórica, Signo de Dance, Hipoacusia sensorioneural",
      },
    ],
    pedagogicalImpact:
      "Entrena la capacidad del estudiante para vincular términos semiológicos con entidades nosológicas en el motor de búsqueda.",
    bestPractice: "Combinar 2 signos clínicos + 1 hallazgo de laboratorio + 1 descriptor de edad.",
    avoid: "Crear términos genéricos como 'Urgente', 'Niño', 'Enfermedad' o 'Médico'.",
  },
  {
    id: "sec-3",
    number: 3,
    title: "Historia Clínica y Anamnesis",
    badge: "Paso 3 • Obligatorio",
    category: "anamnesis",
    summary:
      "Relato cronológico y circunstanciado de la enfermedad actual, antecedentes y motivo de consulta.",
    purpose:
      "Simular la conversación médica del alumno con los padres o cuidadores del paciente pediátrico.",
    fields: [
      {
        name: "Descripción del Paciente y Motivo de Consulta",
        type: "Área de texto narrativa",
        required: true,
        description:
          "Redacción en prosa médica formal: antecedentes perinatales, alimentación, curvas de crecimiento, evolución hora a hora de los síntomas y estado general.",
        tips: "Incluya datos negativos clave (ej: 'afebril, sin diarrea') que permitan descartar diagnósticos diferenciales.",
        example:
          "Lactante masculino de 32 días de vida, nacido a término sin complicaciones neonatales. Alimentado con lactancia materna exclusiva. La madre refiere que desde hace 5 días presenta vómitos postprandiales inmediatos, de aspecto lácteo no bilioso, con fuerza expulsiva notable. Manifiesta apetito voraz posterior a la emesis. Disminución de la diuresis y pérdida ponderal de 250 g en la última semana.",
      },
      {
        name: "¿Incluye recurso audiovisual?",
        type: "Selector binario (Sí / No)",
        required: true,
        description:
          "Indica si el caso cuenta con un video o animación clínica para exhibir signos dinámicos en la estación virtual.",
        tips: "Ideal para signos difíciles de ilustrar solo con texto: tiraje respiratorio, convulsiones, facies o peristaltismo.",
        example: "Sí, incluye Video",
      },
      {
        name: "Descripción del Video Clínico",
        type: "Área de texto (condicional)",
        required: false,
        description:
          "Detalla qué observará el estudiante en el reproductor multimedia integrado del simulador.",
        tips: "Describa duración estimada y hallazgo semiológico exacto.",
        example:
          "Video de 15 segundos que muestra ondas de peristaltismo gástrico visibles desplazándose de izquierda a derecha en epigastrio previo al vómito.",
      },
    ],
    pedagogicalImpact:
      "Enseña a filtrar información irrelevante y a detectar banderas rojas (red flags) en pediatría.",
    bestPractice:
      "Especificar peso al nacer, edad gestacional, esquema de vacunación y diuresis en lactantes.",
    avoid: "Omitir datos sobre hidratación, fontanela o tolerancia oral.",
  },
  {
    id: "sec-4",
    number: 4,
    title: "Examen Físico y Nivel de Dolor",
    badge: "Paso 4 • Interactivo 3D o Estándar",
    category: "exploracion",
    summary:
      "Exploración semiológica del paciente mediante simulación de maniquí 3D o reporte por sistemas.",
    purpose:
      "Evaluar la técnica de exploración del alumno y la interpretación de respuestas al dolor.",
    fields: [
      {
        name: "Modalidad de Examen",
        type: "Interruptor (Interactivo 3D vs. Estándar)",
        required: true,
        description:
          "El modo Interactivo sitúa al alumno frente a un maniquí virtual donde debe presionar regiones anatómicas. El modo Estándar presenta la semiología tradicional escrita.",
        tips: "Elija 'Interactivo' si el caso tiene un signo cardinal localizable (abdomen agudo, dolor articular, tórax).",
        example: "Modo Interactivo (3D/Hotspot)",
      },
      {
        name: "Zona Anatómica y Punto de Referencia (Modo 3D)",
        type: "Campos de texto anatómico",
        required: false,
        description:
          "Define las coordenadas topográficas y la maniobra semiológica clave que activa el hallazgo en el maniquí.",
        tips: "Nombre la maniobra o signo semiológico epónimo si corresponde.",
        example:
          "Zona: Epigastrio e hipocondrio derecho | Punto: Palpación profunda de oliva pilórica bimanual",
      },
      {
        name: "Nivel de Dolor / Respuesta al Estímulo",
        type: "Selector con catálogo ampliable (+ Nuevo)",
        required: true,
        description:
          "Gradúa el disconfort infantil ante la palpación. Puede incorporar nuevos niveles clínicos en un clic.",
        tips: "En lactantes, refleje el llanto, la posición antiálgica o la defensa abdominal voluntaria.",
        example: "Dolor moderado a la palpación profunda con irritabilidad inconsolable",
      },
    ],
    pedagogicalImpact:
      "Fomenta la destreza de exploración selectiva y penaliza las maniobras diagnósticas intempestivas.",
    bestPractice:
      "Registrar signos vitales basales (frecuencia cardíaca, respiratoria, temperatura y saturometría).",
    avoid: "Describir el examen con frases ambiguas como 'Abdomen regular' o 'Sin particularidades'.",
  },
  {
    id: "sec-5",
    number: 5,
    title: "Estudios Complementarios e Imágenes",
    badge: "Paso 5 • Evaluación y Penalizaciones",
    category: "diagnostico",
    summary:
      "Estudios diagnósticos (laboratorio, radiología, ecografía) con calificación de adecuación docente.",
    purpose:
      "Entrenar en medicina basada en valor y penalizar la solicitud indiscriminada de estudios invasivos o innecesarios.",
    fields: [
      {
        name: "Catálogo de Estudios",
        type: "Selector desplegable",
        required: false,
        description:
          "Estudios disponibles en el catálogo (Ecografía abdominal, Ionograma, Rx de tórax, Hemograma, etc.).",
        tips: "Añada tanto los estudios que confirman el diagnóstico como aquellos que descartan diferenciales.",
        example: "Ecografía Abdominal Pediátrica",
      },
      {
        name: "¿El estudio es Clínicamente Adecuado?",
        type: "Interruptor booleano (Adecuado vs. Inadecuado)",
        required: true,
        description:
          "Define si la indicación está justificada por la clínica. Si el alumno solicita un estudio inadecuado en el simulador, se le descuentan puntos de eficiencia y costo sanitario.",
        tips: "Incluya al menos 1 estudio inadecuado (ej: TAC en patología benigna o radiación innecesaria) como prueba de criterio.",
        example: "Adecuado: Ecografía | Inadecuado: TAC de abdomen con contraste",
      },
      {
        name: "Hallazgos / Informe del Estudio",
        type: "Área de texto de reporte",
        required: true,
        description:
          "El texto exacto que el alumno recibirá del informe del radiólogo o del laboratorio al pedir el examen.",
        tips: "Aporte mediciones milimétricas, valores de referencia y signos clásicos.",
        example:
          "Canal pilórico elongado de 18 mm (normal < 14 mm) con espesor de capa muscular de 4.2 mm (normal < 3 mm). Signo de 'ojo de buey' positivo.",
      },
      {
        name: "Imagen Diagnóstica",
        type: "Carga de archivo con compresión automática",
        required: false,
        description:
          "Sube la placa radiográfica o corte ecográfico. El sistema la optimiza en el navegador antes de subirla a la nube.",
        tips: "Formatos permitidos: JPG, PNG, WebP. La compresión inteligente garantiza apertura instantánea en móviles.",
        example: "corte_longitudinal_pilorico_medidas.webp",
      },
    ],
    pedagogicalImpact:
      "Enseña al futuro médico a jerarquizar exámenes y desalienta la conducta de 'pedir todo por si acaso'.",
    bestPractice:
      "Añadir el estudio confirmatorio (gold standard) y el estudio básico de medio interno.",
    avoid: "No detallar los valores anormales del informe.",
  },
  {
    id: "sec-6",
    number: 6,
    title: "Conducta Terapéutica y Opciones",
    badge: "Paso 6 • Sintaxis [CORRECTA]",
    category: "tratamiento",
    summary:
      "Alternativas de conducta terapéutica que alimentan el cuestionario de opción múltiple del alumno.",
    purpose: "Evaluar la capacidad de priorizar el manejo clínico y terapéutico correcto.",
    fields: [
      {
        name: "Opciones de Tratamiento (Una por línea)",
        type: "Área de texto con detección automática",
        required: true,
        description:
          "Escriba cada alternativa médica en un renglón separado. El sistema procesa cada línea como una opción de examen para el simulador.",
        tips: "Añada [CORRECTA] al final de la opción u opciones médicas indicadas. El sistema lo detecta y lo marca en la base de datos.",
        example:
          "- Plan de hidratación parenteral y corrección electrolítica previa a cirugía [CORRECTA]\n- Indicar pase urgente a quirófano sin hidratación previa\n- Administrar ranitidina oral y dar de alta con pautas de alarma\n- Iniciar antibioticoterapia empírica de amplio espectro",
      },
    ],
    pedagogicalImpact:
      "Mide si el estudiante comprende las prioridades médicas (ej: estabilización prequirúrgica vs. apuro quirúrgico).",
    bestPractice:
      "Incluir distractores clínicos creíbles basados en errores frecuentes de los estudiantes.",
    avoid:
      "Olvidar escribir [CORRECTA] en la opción adecuada, o redactar opciones ridículas que no planteen desafío.",
  },
  {
    id: "sec-7",
    number: 7,
    title: "Publicación y Ciclo de Simulación",
    badge: "Paso 7 • Guardado y Persistencia",
    category: "sistema",
    summary:
      "Procesamiento en base de datos PostgreSQL y disponibilidad inmediata para la cátedra.",
    purpose:
      "Asegurar que el caso quede registrado de forma atómica y disponible en el repositorio docente.",
    fields: [
      {
        name: "Botón 'Guardar Caso Pediátrico'",
        type: "Botón de acción principal",
        required: true,
        description:
          "Valida los campos obligatorios, sincroniza palabras clave y estudios en una sola transacción optimizada y genera el ID único del caso.",
        tips: "Al finalizar, se exhibirá la tarjeta de confirmación con accesos directos para inspeccionar la ficha o iniciar otro caso.",
        example: "Caso registrado con éxito en la plataforma Vinko.",
      },
    ],
    pedagogicalImpact:
      "El caso se publica instantáneamente para que cientos de estudiantes puedan resolverlo en tiempo real.",
    bestPractice:
      "Revisar la ficha creada en la pestaña 'Casos Cargados' para verificar el formato final.",
    avoid:
      "Recargar o cerrar la pestaña mientras el botón muestra 'Guardando caso en base de datos...'.",
  },
];
