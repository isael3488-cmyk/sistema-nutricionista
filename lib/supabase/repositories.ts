import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  Patient,
  PatientAnamnesis,
  PatientBodyEvaluation,
  MealPlan,
} from "@/lib/patients";
import {
  type AppointmentStatus,
  type Appointment,
  type AppointmentType,
} from "@/lib/appointments";

type PatientRow = {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  birth_date: string;
  sex: "Masculino" | "Feminino" | "Outro";
  height_cm: number;
  current_weight_kg: number;
  target_weight_kg: number;
  objective: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

type PatientAnamnesisRow = {
  patient_id: string;
  water_intake: string;
  sleep_hours: string;
  training_frequency: string;
  allergies: string;
  intolerances: string;
  medications: string;
  diseases: string;
  food_routine: string;
  main_objective: string;
  created_at: string;
  updated_at: string;
};

type PatientBodyEvaluationRow = {
  id: string;
  patient_id: string;
  evaluation_date: string;
  weight_kg: number;
  height_cm: number;
  body_mass_index: number;
  body_fat_percentage: number;
  muscle_mass_kg: number;
  waist_cm: number;
  abdomen_cm: number;
  hip_cm: number;
  right_arm_cm: number;
  left_arm_cm: number;
  right_thigh_cm: number;
  left_thigh_cm: number;
  created_at: string;
};

type PatientMealPlanRow = {
  patient_id: string;
  meals: Record<string, Array<Record<string, string>>>;
  created_at: string;
  updated_at: string;
};

type AppointmentRow = {
  id: string;
  patient_id: string;
  date: string;
  time: string;
  type: AppointmentType;
  status: AppointmentStatus;
  notes: string;
  created_at: string;
  updated_at: string;
};

const supabase = () => getSupabaseBrowserClient();

function toPatient(row: PatientRow): Patient {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    whatsapp: row.whatsapp,
    email: row.email,
    birthDate: row.birth_date,
    sex: row.sex,
    heightCm: Number(row.height_cm),
    currentWeightKg: Number(row.current_weight_kg),
    targetWeightKg: Number(row.target_weight_kg),
    objective: row.objective,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

function toPatientRow(patient: Patient): PatientRow {
  return {
    id: patient.id,
    name: patient.name,
    phone: patient.phone,
    whatsapp: patient.whatsapp,
    email: patient.email,
    birth_date: patient.birthDate,
    sex: patient.sex,
    height_cm: patient.heightCm,
    current_weight_kg: patient.currentWeightKg,
    target_weight_kg: patient.targetWeightKg,
    objective: patient.objective,
    notes: patient.notes,
    created_at: patient.createdAt,
    updated_at: new Date().toISOString(),
  };
}

function toAnamnesis(row: PatientAnamnesisRow): PatientAnamnesis {
  return {
    waterIntake: row.water_intake,
    sleepHours: row.sleep_hours,
    trainingFrequency: row.training_frequency,
    allergies: row.allergies,
    intolerances: row.intolerances,
    medications: row.medications,
    diseases: row.diseases,
    foodRoutine: row.food_routine,
    mainObjective: row.main_objective,
    updatedAt: row.updated_at,
  };
}

function toAnamnesisRow(patientId: string, values: PatientAnamnesis): PatientAnamnesisRow {
  return {
    patient_id: patientId,
    water_intake: values.waterIntake,
    sleep_hours: values.sleepHours,
    training_frequency: values.trainingFrequency,
    allergies: values.allergies,
    intolerances: values.intolerances,
    medications: values.medications,
    diseases: values.diseases,
    food_routine: values.foodRoutine,
    main_objective: values.mainObjective,
    created_at: values.updatedAt,
    updated_at: values.updatedAt,
  };
}

function toBodyEvaluation(row: PatientBodyEvaluationRow): PatientBodyEvaluation {
  return {
    id: row.id,
    patientId: row.patient_id,
    evaluationDate: row.evaluation_date,
    weightKg: Number(row.weight_kg),
    heightCm: Number(row.height_cm),
    bodyMassIndex: Number(row.body_mass_index),
    bodyFatPercentage: Number(row.body_fat_percentage),
    muscleMassKg: Number(row.muscle_mass_kg),
    waistCm: Number(row.waist_cm),
    abdomenCm: Number(row.abdomen_cm),
    hipCm: Number(row.hip_cm),
    rightArmCm: Number(row.right_arm_cm),
    leftArmCm: Number(row.left_arm_cm),
    rightThighCm: Number(row.right_thigh_cm),
    leftThighCm: Number(row.left_thigh_cm),
    createdAt: row.created_at,
  };
}

function toBodyEvaluationRow(
  evaluation: PatientBodyEvaluation,
): PatientBodyEvaluationRow {
  return {
    id: evaluation.id,
    patient_id: evaluation.patientId,
    evaluation_date: evaluation.evaluationDate,
    weight_kg: evaluation.weightKg,
    height_cm: evaluation.heightCm,
    body_mass_index: evaluation.bodyMassIndex,
    body_fat_percentage: evaluation.bodyFatPercentage,
    muscle_mass_kg: evaluation.muscleMassKg,
    waist_cm: evaluation.waistCm,
    abdomen_cm: evaluation.abdomenCm,
    hip_cm: evaluation.hipCm,
    right_arm_cm: evaluation.rightArmCm,
    left_arm_cm: evaluation.leftArmCm,
    right_thigh_cm: evaluation.rightThighCm,
    left_thigh_cm: evaluation.leftThighCm,
    created_at: evaluation.createdAt,
  };
}

function toMealPlanRow(mealPlan: MealPlan): PatientMealPlanRow {
  return {
    patient_id: mealPlan.patientId,
    meals: mealPlan.meals,
    created_at: mealPlan.updatedAt,
    updated_at: mealPlan.updatedAt,
  };
}

function toMealPlan(row: PatientMealPlanRow): MealPlan {
  return {
    id: `plan-${row.patient_id}`,
    patientId: row.patient_id,
    updatedAt: row.updated_at,
    meals: row.meals as MealPlan["meals"],
  };
}

function toAppointment(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    patientId: row.patient_id,
    date: row.date,
    time: row.time,
    type: row.type,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

function toAppointmentRow(appointment: Appointment): AppointmentRow {
  return {
    id: appointment.id,
    patient_id: appointment.patientId,
    date: appointment.date,
    time: appointment.time,
    type: appointment.type,
    status: appointment.status,
    notes: appointment.notes,
    created_at: appointment.createdAt,
    updated_at: new Date().toISOString(),
  };
}

export async function listPatients() {
  const { data, error } = await supabase()
    .from("patients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => toPatient(row as PatientRow));
}

export async function upsertPatient(patient: Patient) {
  const { data, error } = await supabase()
    .from("patients")
    .upsert([toPatientRow(patient)] as never[])
    .select("*")
    .single();

  if (error) throw error;
  return toPatient(data as PatientRow);
}

export async function deletePatient(patientId: string) {
  const { error } = await supabase().from("patients").delete().eq("id", patientId);
  if (error) throw error;
}

export async function getPatientAnamnesis(patientId: string) {
  const { data, error } = await supabase()
    .from("patient_anamneses")
    .select("*")
    .eq("patient_id", patientId)
    .maybeSingle();

  if (error) throw error;
  return data ? toAnamnesis(data as PatientAnamnesisRow) : null;
}

export async function upsertPatientAnamnesis(
  patientId: string,
  values: PatientAnamnesis,
) {
  const { data, error } = await supabase()
    .from("patient_anamneses")
    .upsert([toAnamnesisRow(patientId, values)] as never[], {
      onConflict: "patient_id",
    })
    .select("*")
    .single();

  if (error) throw error;
  return toAnamnesis(data as PatientAnamnesisRow);
}

export async function deletePatientAnamnesis(patientId: string) {
  const { error } = await supabase()
    .from("patient_anamneses")
    .delete()
    .eq("patient_id", patientId);

  if (error) throw error;
}

export async function listPatientBodyEvaluations(patientId: string) {
  const { data, error } = await supabase()
    .from("patient_body_evaluations")
    .select("*")
    .eq("patient_id", patientId)
    .order("evaluation_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => toBodyEvaluation(row as PatientBodyEvaluationRow));
}

export async function insertPatientBodyEvaluation(evaluation: PatientBodyEvaluation) {
  const { data, error } = await supabase()
    .from("patient_body_evaluations")
    .insert([toBodyEvaluationRow(evaluation)] as never[])
    .select("*")
    .single();

  if (error) throw error;
  return toBodyEvaluation(data as PatientBodyEvaluationRow);
}

export async function deletePatientBodyEvaluation(evaluationId: string) {
  const { error } = await supabase()
    .from("patient_body_evaluations")
    .delete()
    .eq("id", evaluationId);

  if (error) throw error;
}

export async function getPatientMealPlan(patientId: string) {
  const { data, error } = await supabase()
    .from("patient_meal_plans")
    .select("*")
    .eq("patient_id", patientId)
    .maybeSingle();

  if (error) throw error;
  return data ? toMealPlan(data as PatientMealPlanRow) : null;
}

export async function upsertPatientMealPlan(mealPlan: MealPlan) {
  const { data, error } = await supabase()
    .from("patient_meal_plans")
    .upsert([toMealPlanRow(mealPlan)] as never[], { onConflict: "patient_id" })
    .select("*")
    .single();

  if (error) throw error;
  return toMealPlan(data as PatientMealPlanRow);
}

export async function deletePatientMealPlan(patientId: string) {
  const { error } = await supabase()
    .from("patient_meal_plans")
    .delete()
    .eq("patient_id", patientId);

  if (error) throw error;
}

export async function listAppointments() {
  const { data, error } = await supabase()
    .from("appointments")
    .select("*")
    .order("date", { ascending: false })
    .order("time", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => toAppointment(row as AppointmentRow));
}

export async function insertAppointment(appointment: Appointment) {
  const { data, error } = await supabase()
    .from("appointments")
    .insert([toAppointmentRow(appointment)] as never[])
    .select("*")
    .single();

  if (error) throw error;
  return toAppointment(data as AppointmentRow);
}

export async function updateAppointment(appointment: Appointment) {
  const { data, error } = await supabase()
    .from("appointments")
    .update(toAppointmentRow(appointment) as never)
    .eq("id", appointment.id)
    .select("*")
    .single();

  if (error) throw error;
  return toAppointment(data as AppointmentRow);
}

export async function deleteAppointment(appointmentId: string) {
  const { error } = await supabase()
    .from("appointments")
    .delete()
    .eq("id", appointmentId);

  if (error) throw error;
}
