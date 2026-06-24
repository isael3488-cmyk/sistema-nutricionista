export type PatientSex = "Masculino" | "Feminino" | "Outro";

export type Patient = {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  birthDate: string;
  sex: PatientSex;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  objective: string;
  notes: string;
  createdAt: string;
};

export type PatientFormValues = Omit<Patient, "id" | "createdAt">;

export type PatientAnamnesis = {
  waterIntake: string;
  sleepHours: string;
  trainingFrequency: string;
  allergies: string;
  intolerances: string;
  medications: string;
  diseases: string;
  foodRoutine: string;
  mainObjective: string;
  updatedAt: string;
};

export type PatientAnamnesisFormValues = Omit<PatientAnamnesis, "updatedAt">;

export const emptyPatientAnamnesis: PatientAnamnesisFormValues = {
  waterIntake: "",
  sleepHours: "",
  trainingFrequency: "",
  allergies: "",
  intolerances: "",
  medications: "",
  diseases: "",
  foodRoutine: "",
  mainObjective: "",
};

export type PatientAnamnesisMap = Record<string, PatientAnamnesis>;

export type PatientBodyEvaluation = {
  id: string;
  patientId: string;
  evaluationDate: string;
  weightKg: number;
  heightCm: number;
  bodyMassIndex: number;
  bodyFatPercentage: number;
  muscleMassKg: number;
  waistCm: number;
  abdomenCm: number;
  hipCm: number;
  rightArmCm: number;
  leftArmCm: number;
  rightThighCm: number;
  leftThighCm: number;
  createdAt: string;
};

export type PatientBodyEvaluationFormValues = Omit<
  PatientBodyEvaluation,
  "id" | "patientId" | "bodyMassIndex" | "createdAt"
>;

export type PatientBodyEvaluationsMap = Record<string, PatientBodyEvaluation[]>;

export const emptyPatientBodyEvaluation: Omit<
  PatientBodyEvaluationFormValues,
  "evaluationDate"
> = {
  weightKg: 0,
  heightCm: 0,
  bodyFatPercentage: 0,
  muscleMassKg: 0,
  waistCm: 0,
  abdomenCm: 0,
  hipCm: 0,
  rightArmCm: 0,
  leftArmCm: 0,
  rightThighCm: 0,
  leftThighCm: 0,
};

export type MealSlot =
  | "Café da manhã"
  | "Lanche da manhã"
  | "Almoço"
  | "Lanche da tarde"
  | "Jantar"
  | "Ceia";

export const mealSlots: MealSlot[] = [
  "Café da manhã",
  "Lanche da manhã",
  "Almoço",
  "Lanche da tarde",
  "Jantar",
  "Ceia",
];

export type MealItem = {
  id: string;
  time: string;
  food: string;
  quantity: string;
  householdMeasure: string;
  observation: string;
};

export type MealPlan = {
  id: string;
  patientId: string;
  updatedAt: string;
  meals: Record<MealSlot, MealItem[]>;
};

export type MealPlanFormValues = Record<
  MealSlot,
  Array<Omit<MealItem, "id">>
>;

export type MealPlansMap = Record<string, MealPlan>;

export const emptyMealPlanFormValues = mealSlots.reduce((acc, meal) => {
  acc[meal] = [];
  return acc;
}, {} as MealPlanFormValues);

export function createPatientId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `pat-${crypto.randomUUID()}`;
  }

  return `pat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createPatient(values: PatientFormValues): Patient {
  return {
    ...values,
    id: createPatientId(),
    createdAt: new Date().toISOString(),
  };
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(date));
}

export function formatWeight(weightKg: number) {
  return `${weightKg.toFixed(1).replace(".", ",")} kg`;
}

export function formatHeight(heightCm: number) {
  return `${(heightCm / 100).toFixed(2).replace(".", ",")} m`;
}

export function getPatientNameById(
  patients: Patient[],
  patientId: string,
) {
  return patients.find((patient) => patient.id === patientId)?.name ?? null;
}

export function getPatientInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function calculateAge(birthDate: string) {
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age;
}

export function createAnamnesis(values: PatientAnamnesisFormValues): PatientAnamnesis {
  return {
    ...values,
    updatedAt: new Date().toISOString(),
  };
}

export function calculateBodyMassIndex(weightKg: number, heightCm: number) {
  if (!weightKg || !heightCm) {
    return 0;
  }

  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

export function createBodyEvaluation(
  patientId: string,
  values: PatientBodyEvaluationFormValues,
): PatientBodyEvaluation {
  return {
    ...values,
    id: `eval-${createPatientId()}`,
    patientId,
    bodyMassIndex: calculateBodyMassIndex(values.weightKg, values.heightCm),
    createdAt: new Date().toISOString(),
  };
}

export function createMealItem(values: Omit<MealItem, "id">): MealItem {
  return {
    ...values,
    id: `meal-${createPatientId()}`,
  };
}

export function createMealPlan(
  patientId: string,
  values: MealPlanFormValues,
): MealPlan {
  const meals = mealSlots.reduce((acc, slot) => {
    acc[slot] = (values[slot] ?? []).map((item) => createMealItem(item));
    return acc;
  }, {} as Record<MealSlot, MealItem[]>);

  return {
    id: `plan-${createPatientId()}`,
    patientId,
    updatedAt: new Date().toISOString(),
    meals,
  };
}
