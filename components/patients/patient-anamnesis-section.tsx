"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePatientAnamnesis } from "@/components/patients/use-patient-anamnesis";
import { formatDate } from "@/lib/patients";

const fieldClassName =
  "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white";

type PatientAnamnesisSectionProps = {
  patientId: string;
};

export function PatientAnamnesisSection({
  patientId,
}: Readonly<PatientAnamnesisSectionProps>) {
  const { ready, anamnesis, saveAnamnesis } = usePatientAnamnesis(patientId);
  const [form, setForm] = useState({
    waterIntake: "",
    sleepHours: "",
    trainingFrequency: "",
    allergies: "",
    intolerances: "",
    medications: "",
    diseases: "",
    foodRoutine: "",
    mainObjective: "",
  });

  useEffect(() => {
    if (!ready) {
      return;
    }

    setForm({
      waterIntake: anamnesis?.waterIntake ?? "",
      sleepHours: anamnesis?.sleepHours ?? "",
      trainingFrequency: anamnesis?.trainingFrequency ?? "",
      allergies: anamnesis?.allergies ?? "",
      intolerances: anamnesis?.intolerances ?? "",
      medications: anamnesis?.medications ?? "",
      diseases: anamnesis?.diseases ?? "",
      foodRoutine: anamnesis?.foodRoutine ?? "",
      mainObjective: anamnesis?.mainObjective ?? "",
    });
  }, [anamnesis, ready]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await saveAnamnesis(form);
    } catch (error) {
      console.error("Falha ao salvar anamnese:", error);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
              Anamnese
            </p>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">
              Dados de acompanhamento do paciente
            </h3>
          </div>

          <p className="text-sm text-slate-500">
            {anamnesis?.updatedAt
              ? `Ultima atualizacao em ${formatDate(anamnesis.updatedAt)}`
              : "Nenhuma anamnese salva ainda."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid gap-5 lg:grid-cols-2">
            <Field label="Consumo de agua">
              <input
                value={form.waterIntake}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    waterIntake: event.target.value,
                  }))
                }
                className={fieldClassName}
                placeholder="Ex: 2,5 L por dia"
              />
            </Field>

            <Field label="Horas de sono">
              <input
                type="number"
                min="0"
                step="0.5"
                value={form.sleepHours}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    sleepHours: event.target.value,
                  }))
                }
                className={fieldClassName}
                placeholder="Ex: 7.5"
              />
            </Field>

            <Field label="Frequencia de treino" className="lg:col-span-2">
              <input
                value={form.trainingFrequency}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    trainingFrequency: event.target.value,
                  }))
                }
                className={fieldClassName}
                placeholder="Ex: 4x por semana"
              />
            </Field>

            <Field label="Alergias">
              <textarea
                rows={4}
                value={form.allergies}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    allergies: event.target.value,
                  }))
                }
                className={`${fieldClassName} min-h-[120px]`}
                placeholder="Liste alergias alimentares ou ambientais"
              />
            </Field>

            <Field label="Intolerancias">
              <textarea
                rows={4}
                value={form.intolerances}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    intolerances: event.target.value,
                  }))
                }
                className={`${fieldClassName} min-h-[120px]`}
                placeholder="Ex: lactose, gluten..."
              />
            </Field>

            <Field label="Medicamentos">
              <textarea
                rows={4}
                value={form.medications}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    medications: event.target.value,
                  }))
                }
                className={`${fieldClassName} min-h-[120px]`}
                placeholder="Medicamentos em uso"
              />
            </Field>

            <Field label="Doencas">
              <textarea
                rows={4}
                value={form.diseases}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    diseases: event.target.value,
                  }))
                }
                className={`${fieldClassName} min-h-[120px]`}
                placeholder="Condicoes clinicas relevantes"
              />
            </Field>

            <Field label="Rotina alimentar" className="lg:col-span-2">
              <textarea
                rows={5}
                value={form.foodRoutine}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    foodRoutine: event.target.value,
                  }))
                }
                className={`${fieldClassName} min-h-[140px]`}
                placeholder="Descreva cafe da manha, almoco, jantar, lanches e horarios"
              />
            </Field>

            <Field label="Objetivo principal" className="lg:col-span-2">
              <textarea
                rows={4}
                value={form.mainObjective}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    mainObjective: event.target.value,
                  }))
                }
                className={`${fieldClassName} min-h-[120px]`}
                placeholder="Ex: emagrecer com preservacao de massa magra"
              />
            </Field>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Salvar anamnese
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
  className = "",
}: Readonly<{
  label: string;
  children: ReactNode;
  className?: string;
}>) {
  return (
    <label className={`block space-y-2 ${className}`}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
