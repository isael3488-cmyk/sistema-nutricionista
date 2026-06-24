"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useState } from "react";
import type { PatientFormValues, PatientSex } from "@/lib/patients";

const emptyForm: PatientFormValues = {
  name: "",
  phone: "",
  whatsapp: "",
  email: "",
  birthDate: "",
  sex: "Feminino",
  heightCm: 0,
  currentWeightKg: 0,
  targetWeightKg: 0,
  objective: "Emagrecimento",
  notes: "",
};

const objectiveOptions = [
  "Emagrecimento",
  "Hipertrofia",
  "Performance",
  "Reeducacao alimentar",
  "Controle clinico",
  "Outro",
];

type PatientFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (values: PatientFormValues) => void | Promise<void>;
  initialValues?: PatientFormValues;
  title?: string;
  subtitle?: string;
  submitLabel?: string;
};

export function PatientFormModal({
  open,
  onClose,
  onSave,
  initialValues,
  title = "Novo Paciente",
  subtitle = "Cadastro rapido",
  submitLabel = "Salvar paciente",
}: Readonly<PatientFormModalProps>) {
  const [form, setForm] = useState<PatientFormValues>(emptyForm);

  useEffect(() => {
    if (open) {
      setForm(initialValues ?? emptyForm);
    }
  }, [initialValues, open]);

  if (!open) {
    return null;
  }

  const updateField = <K extends keyof PatientFormValues>(
    key: K,
    value: PatientFormValues[K],
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await onSave({
        ...form,
        heightCm: Number(form.heightCm),
        currentWeightKg: Number(form.currentWeightKg),
        targetWeightKg: Number(form.targetWeightKg),
      });
      onClose();
    } catch (error) {
      console.error("Falha ao salvar paciente:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-4 sm:items-center">
      <div className="w-full max-w-4xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
              Paciente
            </p>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">
              {title}
            </h3>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
            aria-label="Fechar formulario"
          >
            X
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto">
          <div className="grid gap-5 px-6 py-6 lg:grid-cols-2">
            <Field label="Nome" required>
              <input
                required
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="input"
                placeholder="Nome completo"
              />
            </Field>

            <Field label="Telefone" required>
              <input
                required
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                className="input"
                placeholder="(11) 99999-9999"
              />
            </Field>

            <Field label="WhatsApp" required>
              <input
                required
                value={form.whatsapp}
                onChange={(event) => updateField("whatsapp", event.target.value)}
                className="input"
                placeholder="(11) 99999-9999"
              />
            </Field>

            <Field label="Email" required>
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="input"
                placeholder="paciente@email.com"
              />
            </Field>

            <Field label="Data de nascimento" required>
              <input
                required
                type="date"
                value={form.birthDate}
                onChange={(event) =>
                  updateField("birthDate", event.target.value)
                }
                className="input"
              />
            </Field>

            <Field label="Sexo" required>
              <select
                required
                value={form.sex}
                onChange={(event) =>
                  updateField("sex", event.target.value as PatientSex)
                }
                className="input"
              >
                <option value="Feminino">Feminino</option>
                <option value="Masculino">Masculino</option>
                <option value="Outro">Outro</option>
              </select>
            </Field>

            <Field label="Altura (cm)" required>
              <input
                required
                type="number"
                min="0"
                step="1"
                value={form.heightCm}
                onChange={(event) =>
                  updateField("heightCm", Number(event.target.value))
                }
                className="input"
                placeholder="168"
              />
            </Field>

            <Field label="Peso atual (kg)" required>
              <input
                required
                type="number"
                min="0"
                step="0.1"
                value={form.currentWeightKg}
                onChange={(event) =>
                  updateField("currentWeightKg", Number(event.target.value))
                }
                className="input"
                placeholder="67.4"
              />
            </Field>

            <Field label="Peso objetivo (kg)" required>
              <input
                required
                type="number"
                min="0"
                step="0.1"
                value={form.targetWeightKg}
                onChange={(event) =>
                  updateField("targetWeightKg", Number(event.target.value))
                }
                className="input"
                placeholder="62"
              />
            </Field>

            <Field label="Objetivo" required className="lg:col-span-2">
              <select
                required
                value={form.objective}
                onChange={(event) =>
                  updateField("objective", event.target.value)
                }
                className="input"
              >
                {objectiveOptions.map((objective) => (
                  <option key={objective} value={objective}>
                    {objective}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Observacoes" className="lg:col-span-2">
              <textarea
                rows={4}
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                className="input min-h-[120px]"
                placeholder="Informacoes relevantes sobre rotina, preferencias ou restricoes."
              />
            </Field>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 1rem;
          border: 1px solid rgb(226 232 240);
          background: rgb(248 250 252);
          padding: 0.8rem 1rem;
          font-size: 0.95rem;
          color: rgb(15 23 42);
          outline: none;
          transition: border-color 0.15s ease, background-color 0.15s ease;
        }

        .input:focus {
          border-color: rgb(59 130 246);
          background: rgb(255 255 255);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
  required,
  className = "",
}: Readonly<{
  label: string;
  children: ReactNode;
  required?: boolean;
  className?: string;
}>) {
  return (
    <label className={`block space-y-2 ${className}`}>
      <span className="text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </span>
      {children}
    </label>
  );
}
