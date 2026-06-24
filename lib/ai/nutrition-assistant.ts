import type { Patient, PatientAnamnesis, PatientBodyEvaluation, MealPlan } from "@/lib/patients";

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
    "mealPlanSuggestions",
    "substitutionSuggestions",
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
    "Responda em portugues do Brasil, com linguagem profissional, clara e objetiva.",
    "Baseie a resposta no contexto abaixo:",
    JSON.stringify(patientContext, null, 2),
    "Gere:",
    "1. Sugestoes de plano alimentar com base no perfil do paciente.",
    "2. Sugestoes de substituicoes alimentares.",
    "3. Resumo da consulta.",
    "4. Observacoes profissionais e pontos de revisao.",
    "Evite linguagem prescritiva absoluta. Sempre use termos como 'sugestao', 'possivel', 'revisar' e 'considerar'.",
  ].join("\n\n");
}

export function createFallbackResult(
  patientName: string,
): NutritionAssistantResult {
  return {
    disclaimer: `Sugestoes geradas para revisao profissional. Nao substituem a avaliacao de ${patientName}.`,
    mealPlanSuggestions: [],
    substitutionSuggestions: [],
    consultationSummary: "",
    professionalObservations: [],
    reviewQuestions: [],
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
