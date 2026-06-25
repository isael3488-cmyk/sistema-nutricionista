import {
  calculateBodyMassIndex,
  type Patient,
  type PatientAnamnesis,
  type PatientBodyEvaluation,
  type MealPlan,
} from "@/lib/patients";

export type NutritionAssistantInput = {
  patient: {
    id: string;
    name: string;
    age: number;
    sex: string;
    heightCm: number;
    currentWeightKg: number;
    targetWeightKg: number;
    objective: string;
    notes: string;
  };
  anamnesis: PatientAnamnesis | null;
  latestEvaluation: PatientBodyEvaluation | null;
  mealPlan: MealPlan | null;
  consultationNotes: string;
};

export type NutritionAssistantResult = {
  disclaimer: string;
  statusSummary: string;
  projection: {
    direction: string;
    thirtyDays: string;
    sixtyDays: string;
    ninetyDays: string;
  };
  mealPlanSuggestions: Array<{
    meal: string;
    suggestion: string;
    rationale: string;
    exampleFoods: string[];
  }>;
  substitutionSuggestions: Array<{
    original: string;
    alternatives: string[];
    rationale: string;
  }>;
  trainingSuggestions: Array<{
    focus: string;
    frequency: string;
    intensity: string;
    rationale: string;
    examples: string[];
  }>;
  consultationSummary: string;
  professionalObservations: string[];
  reviewQuestions: string[];
  safetyNotes: string[];
};

export type NutritionAssistantApiResponse = {
  result: NutritionAssistantResult;
};

export const nutritionAssistantModel =
  process.env.OPENAI_MODEL ?? "gpt-5.5";

export const nutritionAssistantResponseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    disclaimer: {
      type: "string",
      description:
        "Mensagem curta reforcando que o conteudo e uma sugestao para revisao profissional.",
    },
    statusSummary: {
      type: "string",
      description: "Leitura objetiva do caso em uma frase curta.",
    },
    projection: {
      type: "object",
      additionalProperties: false,
      properties: {
        direction: {
          type: "string",
          description: "Linha de tendencia resumida.",
        },
        thirtyDays: {
          type: "string",
        },
        sixtyDays: {
          type: "string",
        },
        ninetyDays: {
          type: "string",
        },
      },
      required: ["direction", "thirtyDays", "sixtyDays", "ninetyDays"],
    },
    mealPlanSuggestions: {
      type: "array",
      minItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          meal: { type: "string" },
          suggestion: { type: "string" },
          rationale: { type: "string" },
          exampleFoods: {
            type: "array",
            minItems: 2,
            items: { type: "string" },
          },
        },
        required: ["meal", "suggestion", "rationale", "exampleFoods"],
      },
    },
    substitutionSuggestions: {
      type: "array",
      minItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          original: { type: "string" },
          alternatives: {
            type: "array",
            minItems: 2,
            items: { type: "string" },
          },
          rationale: { type: "string" },
        },
        required: ["original", "alternatives", "rationale"],
      },
    },
    trainingSuggestions: {
      type: "array",
      minItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          focus: { type: "string" },
          frequency: { type: "string" },
          intensity: { type: "string" },
          rationale: { type: "string" },
          examples: {
            type: "array",
            minItems: 2,
            items: { type: "string" },
          },
        },
        required: ["focus", "frequency", "intensity", "rationale", "examples"],
      },
    },
    consultationSummary: {
      type: "string",
      description: "Resumo objetivo da consulta a partir das anotacoes fornecidas.",
    },
    professionalObservations: {
      type: "array",
      minItems: 3,
      items: { type: "string" },
    },
    reviewQuestions: {
      type: "array",
      minItems: 2,
      items: { type: "string" },
    },
    safetyNotes: {
      type: "array",
      minItems: 2,
      items: { type: "string" },
    },
  },
  required: [
    "disclaimer",
    "statusSummary",
    "projection",
    "mealPlanSuggestions",
    "substitutionSuggestions",
    "trainingSuggestions",
    "consultationSummary",
    "professionalObservations",
    "reviewQuestions",
    "safetyNotes",
  ],
} as const;

export function buildNutritionAssistantPrompt(input: NutritionAssistantInput) {
  const patientContext = {
    ...input.patient,
    consultationNotes: input.consultationNotes,
    anamnesis: input.anamnesis,
    latestEvaluation: input.latestEvaluation,
    mealPlan: input.mealPlan,
  };

  return [
    "Voce e um assistente de apoio para nutricionistas.",
    "Sua funcao e gerar apenas sugestoes para revisao profissional.",
    "Nao substitua o julgamento clinico do nutricionista, nao faca diagnostico e nao apresente nada como conduta final.",
    "Se faltar informacao, diga o que esta ausente e sugira pontos de confirmacao.",
    "Responda em portugues do Brasil, com linguagem profissional, clara, objetiva e direta.",
    "Baseie a resposta no contexto abaixo:",
    JSON.stringify(patientContext, null, 2),
    "Gere:",
    "1. Leitura objetiva do caso e linha de projecao em 30, 60 e 90 dias.",
    "2. Sugestoes de plano alimentar com base no perfil do paciente.",
    "3. Sugestoes de substituicoes alimentares.",
    "4. Sugestoes de treino seguras e para revisao profissional.",
    "5. Resumo objetivo da consulta.",
    "6. Observacoes profissionais e pontos de revisao.",
    "Evite linguagem prescritiva absoluta. Sempre use termos como 'sugestao', 'possivel', 'revisar' e 'considerar'.",
  ].join("\n\n");
}

export function createFallbackResult(
  input: NutritionAssistantInput,
): NutritionAssistantResult {
  const latestWeight = input.latestEvaluation?.weightKg ?? input.patient.currentWeightKg;
  const targetWeight = input.patient.targetWeightKg;
  const currentBmi = calculateBodyMassIndex(
    latestWeight,
    input.latestEvaluation?.heightCm ?? input.patient.heightCm,
  );
  const delta = latestWeight - targetWeight;
  const direction = buildDirection(input.patient.objective, delta);
  const projection = buildProjection(direction, delta, currentBmi, input.patient.objective);
  const mealSuggestions = buildMealSuggestions(input.patient.objective);
  const substitutions = buildSubstitutions(input.patient.objective);
  const training = buildTrainingSuggestions(input.patient.objective);

  return {
    disclaimer: `Sugestoes geradas para revisao profissional. Nao substituem a avaliacao de ${input.patient.name}.`,
    statusSummary: `${input.patient.name} apresenta ${
      delta > 0 ? "espaco para reduzir" : delta < 0 ? "espaco para ajustar ganho" : "tendencia de manutencao"
    } com foco em ${input.patient.objective.toLowerCase() || "acompanhamento"}.`,
    projection,
    mealPlanSuggestions: mealSuggestions,
    substitutionSuggestions: substitutions,
    trainingSuggestions: training,
    consultationSummary: buildConsultationSummary(input, direction, currentBmi),
    professionalObservations: buildObservations(input, currentBmi, direction),
    reviewQuestions: buildReviewQuestions(input),
    safetyNotes: [
      "Revisar alergias, intolerancias e condicoes clinicas antes de aplicar qualquer sugestao.",
      "Confirmar com o nutricionista responsavel antes de transformar a sugestao em plano final.",
    ],
  };
}

export function mapPatientToAssistantContext(
  patient: Patient,
  age: number,
): NutritionAssistantInput["patient"] {
  return {
    id: patient.id,
    name: patient.name,
    age,
    sex: patient.sex,
    heightCm: patient.heightCm,
    currentWeightKg: patient.currentWeightKg,
    targetWeightKg: patient.targetWeightKg,
    objective: patient.objective,
    notes: patient.notes,
  };
}

function buildDirection(objective: string, deltaWeight: number) {
  const lowerObjective = objective.toLowerCase();

  if (lowerObjective.includes("hipertrof")) {
    return deltaWeight < 0
      ? "Linha de reforco calórico e ganho controlado."
      : "Linha de ganho gradual com monitoramento de massa magra.";
  }

  if (lowerObjective.includes("performance")) {
    return "Linha de ajuste fino com foco em energia e consistencia.";
  }

  return deltaWeight > 0
    ? "Linha de reducao progressiva com manutencao de massa magra."
    : "Linha de equilibrio com ajustes leves de adesao.";
}

function buildProjection(
  direction: string,
  deltaWeight: number,
  bmi: number,
  objective: string,
) {
  const base = objective.toLowerCase();
  const isGain = base.includes("hipertrof");
  const isPerformance = base.includes("performance");

  if (isGain) {
    return {
      direction,
      thirtyDays: "30 dias: consolidar rotina alimentar e monitorar resposta de treino.",
      sixtyDays: "60 dias: esperar ganho discreto e controle de medida corporal.",
      ninetyDays: "90 dias: manter progressao com ajuste fino de calorias e carga.",
    };
  }

  if (isPerformance) {
    return {
      direction,
      thirtyDays: "30 dias: estabilidade de energia, foco em adesao e recuperacao.",
      sixtyDays: "60 dias: melhora da consistencia de treino e tolerancia a volume.",
      ninetyDays: "90 dias: evolucao sustentada com ajuste periodico de refeicoes.",
    };
  }

  return {
    direction,
    thirtyDays:
      deltaWeight > 0
        ? "30 dias: tendencia de reducao leve com melhor consistencia alimentar."
        : "30 dias: estabilizacao com ajuste de habitos e monitoramento.",
    sixtyDays:
      deltaWeight > 0
        ? "60 dias: reducao gradual com preservacao de massa magra."
        : "60 dias: refinamento de rotina e maior previsibilidade de resultados.",
    ninetyDays:
      bmi > 30
        ? "90 dias: expectativa de melhora relevante de marcadores corporais."
        : "90 dias: linha de progresso sustentada e revisao de metas.",
  };
}

function buildMealSuggestions(objective: string) {
  const lowerObjective = objective.toLowerCase();
  const isGain = lowerObjective.includes("hipertrof");
  const isPerformance = lowerObjective.includes("performance");

  if (isGain) {
    return [
      {
        meal: "Cafe da manha",
        suggestion: "Priorizar refeicao com carboidrato, proteina e gordura boa para sustentar treino e rotina.",
        rationale: "Ajuda a subir densidade energetica sem pesar demais a digestao.",
        exampleFoods: ["Ovos", "Aveia", "Iogurte", "Frutas"],
      },
      {
        meal: "Almoco",
        suggestion: "Manter prato completo com carboidrato, proteina magra e vegetais.",
        rationale: "Favorece recuperacao e atingimento de meta energetica.",
        exampleFoods: ["Arroz", "Feijao", "Frango", "Legumes"],
      },
      {
        meal: "Jantar",
        suggestion: "Usar refeicao com boa proteina e carboidrato de facil adesao.",
        rationale: "Facilita regularidade calórica sem dispersar a rotina.",
        exampleFoods: ["Batata", "Carne magra", "Salada", "Azeite"],
      },
    ];
  }

  if (isPerformance) {
    return [
      {
        meal: "Cafe da manha",
        suggestion: "Combinar carboidratos de boa tolerancia com proteina para energia e foco.",
        rationale: "Ajuda a sustentar treino e demandas do dia.",
        exampleFoods: ["Pao integral", "Ovos", "Banana", "Cafe"],
      },
      {
        meal: "Pre treino",
        suggestion: "Ajustar lanche de facil digestao 60 a 90 minutos antes do treino.",
        rationale: "Melhora disponibilidade de energia e reduz desconforto gastrointestinal.",
        exampleFoods: ["Fruta", "Iogurte", "Tapioca", "Mel"],
      },
      {
        meal: "Pos treino",
        suggestion: "Priorizar proteina de alta qualidade e carboidrato para recuperacao.",
        rationale: "Suporta reposicao energetica e reparo muscular.",
        exampleFoods: ["Arroz", "Frango", "Whey", "Batata"],
      },
    ];
  }

  return [
    {
      meal: "Cafe da manha",
      suggestion: "Refeicao simples, com proteina e fibra para controle de fome.",
      rationale: "Ajuda adesao e reduz beliscos ao longo do dia.",
      exampleFoods: ["Ovos", "Fruta", "Iogurte", "Aveia"],
    },
    {
      meal: "Almoco",
      suggestion: "Prato com metade de vegetais, proteina magra e carboidrato moderado.",
      rationale: "Equilibra saciedade e controle de energia.",
      exampleFoods: ["Arroz", "Feijao", "Frango", "Salada"],
    },
    {
      meal: "Jantar",
      suggestion: "Refeicao mais leve, mantendo proteina e vegetais.",
      rationale: "Favorece controle de peso e melhor rotina noturna.",
      exampleFoods: ["Sopa", "Peixe", "Legumes", "Salada"],
    },
  ];
}

function buildSubstitutions(objective: string) {
  const lowerObjective = objective.toLowerCase();
  const isGain = lowerObjective.includes("hipertrof");

  if (isGain) {
    return [
      {
        original: "Lanche pouco calórico",
        alternatives: ["Sanduiche com pasta de amendoim", "Vitamina com aveia"],
        rationale: "Aumenta densidade energetica sem complicar a rotina.",
      },
      {
        original: "Proteina isolada apenas no jantar",
        alternatives: ["Proteina em todas as refeicoes principais", "Iogurte proteico no lanche"],
        rationale: "Distribui melhor a ingestao proteica.",
      },
      {
        original: "Carboidrato muito restrito",
        alternatives: ["Arroz", "Batata", "Macarrao", "Aveia"],
        rationale: "Melhora aporte energetico para treino e recuperacao.",
      },
      {
        original: "Refeicoes irregulares",
        alternatives: ["Tres refeicoes principais + dois lanches", "Rotina fixa com horarios"],
        rationale: "Aumenta consistencia para ganho controlado.",
      },
    ];
  }

  return [
    {
      original: "Bebidas com acucar",
      alternatives: ["Agua com gas", "Cha sem acucar", "Cafe sem acucar"],
      rationale: "Reduz calorias liquidas e melhora adesao.",
    },
    {
      original: "Lanche ultraprocessado",
      alternatives: ["Fruta", "Iogurte natural", "Castanhas"],
      rationale: "Melhora saciedade e qualidade nutricional.",
    },
    {
      original: "Sobremesa frequente",
      alternatives: ["Fruta", "Gelatina sem acucar", "Iogurte com canela"],
      rationale: "Mantem prazer com menor impacto calorico.",
    },
    {
      original: "Prato com excesso de farinha refinada",
      alternatives: ["Arroz integral", "Batata", "Legumes", "Feijao"],
      rationale: "Favorece controle glicemico e saciedade.",
    },
  ];
}

function buildTrainingSuggestions(objective: string) {
  const lowerObjective = objective.toLowerCase();
  const isGain = lowerObjective.includes("hipertrof");
  const isPerformance = lowerObjective.includes("performance");

  if (isGain) {
    return [
      {
        focus: "Forca",
        frequency: "4 a 6 vezes por semana",
        intensity: "Moderada a alta, com progressao de carga",
        rationale: "Sustenta ganho de massa e melhora resposta do plano.",
        examples: ["Agachamento", "Supino", "Levantamento terra", "Remada"],
      },
      {
        focus: "Recuperacao",
        frequency: "Diaria",
        intensity: "Baixa, com sono e mobilidade",
        rationale: "Favorece reparo muscular e continuidade de treino.",
        examples: ["Mobilidade", "Alongamento", "Sono regular", "Hidratacao"],
      },
      {
        focus: "Cardio estrategico",
        frequency: "2 a 3 vezes por semana",
        intensity: "Leve",
        rationale: "Ajuda condicao cardiovascular sem prejudicar hipertrofia.",
        examples: ["Caminhada", "Bike leve", "Eliptico", "Bolsas de passos"],
      },
    ];
  }

  if (isPerformance) {
    return [
      {
        focus: "Condicionamento",
        frequency: "3 a 5 vezes por semana",
        intensity: "Moderada",
        rationale: "Apoia capacidade de treino e recuperacao.",
        examples: ["Intervalados leves", "Bike", "Corrida leve", "Circuitos"],
      },
      {
        focus: "Forca base",
        frequency: "2 a 4 vezes por semana",
        intensity: "Moderada",
        rationale: "Mantem base muscular e previne lesao.",
        examples: ["Agachamento", "Puxadas", "Empurradas", "Core"],
      },
      {
        focus: "Mobilidade",
        frequency: "Diaria ou pos treino",
        intensity: "Baixa",
        rationale: "Apoia amplitude, tecnica e prevençao de lesao.",
        examples: ["Mobilidade de quadril", "Toracica", "Panturrilha", "Ombro"],
      },
    ];
  }

  return [
    {
      focus: "Forca",
      frequency: "3 a 4 vezes por semana",
      intensity: "Moderada",
      rationale: "Preserva massa magra durante o processo de ajuste de peso.",
      examples: ["Treino resistido", "Circuitos", "Core", "Exercicios multiarticulares"],
    },
    {
      focus: "Passos e NEAT",
      frequency: "Diario",
      intensity: "Baixa a moderada",
      rationale: "Aumenta gasto energetico sem sobrecarregar rotina.",
      examples: ["Caminhada", "Escadas", "Deslocamentos ativos", "Pausas curtas"],
    },
    {
      focus: "Cardio controlado",
      frequency: "2 a 4 vezes por semana",
      intensity: "Leve a moderada",
      rationale: "Apoia condicionamento e estrategia de reducao de peso.",
      examples: ["Bike", "Caminhada acelerada", "Eliptico", "Subida leve"],
    },
  ];
}

function buildConsultationSummary(
  input: NutritionAssistantInput,
  direction: string,
  bmi: number,
) {
  return [
    `${input.patient.name}: ${direction}`,
    `IMC atual aproximado de ${bmi.toFixed(1).replace(".", ",")}.`,
    `Objetivo principal: ${input.patient.objective || "nao informado"}.`,
    input.consultationNotes ? `Notas da consulta consideradas na analise.` : `Sem notas adicionais da consulta.`,
  ].join(" ");
}

function buildObservations(
  input: NutritionAssistantInput,
  bmi: number,
  direction: string,
) {
  const observations = [
    `Acompanhamento alinhado a ${input.patient.objective || "meta principal"}.`,
    `IMC calculado em ${bmi.toFixed(1).replace(".", ",")}, revisar com a serie historica.`,
    direction,
  ];

  if (!input.anamnesis) {
    observations.push("Anamnese ausente ou incompleta, vale revisar antes da conduta final.");
  }

  if (!input.latestEvaluation) {
    observations.push("Sem avaliacao corporal recente, a projecao fica mais conservadora.");
  }

  return observations.slice(0, 4);
}

function buildReviewQuestions(input: NutritionAssistantInput) {
  const questions = [
    "O paciente manteve adesao ao plano entre as consultas?",
    "Ha sinais de desconforto, fome excessiva ou baixa energia?",
    "A distribuicao das refeicoes esta compatível com a rotina atual?",
    "As preferencias alimentares foram respeitadas o suficiente para adesao?",
  ];

  if (!input.anamnesis) {
    questions.unshift("A anamnese inicial ja foi preenchida com os dados essenciais?");
  }

  return questions;
}
