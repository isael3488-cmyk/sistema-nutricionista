"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import type { Patient } from "@/lib/patients";
import type {
  AppointmentFormValues,
  AppointmentStatus,
  AppointmentType,
} from "@/lib/appointments";

const appointmentTypes: AppointmentType[] = [
  "Consulta inicial",
  "Retorno",
  "Acompanhamento",
  "Ajuste de plano",
  "Avaliação",
];

const appointmentStatuses: AppointmentStatus[] = [
  "Agendada",
  "Realizada",
  "Cancelada",
];

type AppointmentFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (values: AppointmentFormValues) => void | Promise<void>;
  patients: Patient[];
  initialValues?: AppointmentFormValues;
  title?: string;
  subtitle?: string;
  submitLabel?: string;
};

const emptyForm: AppointmentFormValues = {
  patientId: "",
  date: "",
  time: "",
  type: "Consulta inicial",
  status: "Agendada",
  notes: "",
};

export function AppointmentFormModal({
  open,
  onClose,
  onSave,
  patients,
  initialValues,
  title = "Nova consulta",
  subtitle = "Agendamento rapido",
  submitLabel = "Salvar consulta",
}: Readonly<AppointmentFormModalProps>) {
  const [form, setForm] = useState<AppointmentFormValues>(emptyForm);

  useEffect(() => {
    if (open) {
      setForm(
        initialValues ?? {
          ...emptyForm,
          patientId: patients[0]?.id ?? "",
        },
      );
    }
  }, [initialValues, open, patients]);

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === form.patientId) ?? null,
    [form.patientId, patients],
  );

  if (!open) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await onSave(form);
      onClose();
    } catch (error) {
      console.error("Falha ao salvar consulta:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-4 sm:items-center">
      <div className="w-full max-w-4xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
              Consulta
            </p>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">{title}</h3>
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
            <Field label="Paciente" required className="lg:col-span-2">
              <select
                required
                value={form.patientId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    patientId: event.target.value,
                  }))
                }
                className="input"
              >
                <option value="">Selecione um paciente</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Data" required>
              <input
                required
                type="date"
                value={form.date}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    date: event.target.value,
                  }))
                }
                className="input"
              />
            </Field>

            <Field label="Horario" required>
              <input
                required
                type="time"
                value={form.time}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    time: event.target.value,
                  }))
                }
                className="input"
              />
            </Field>

            <Field label="Tipo de consulta" required>
              <select
                required
                value={form.type}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    type: event.target.value as AppointmentType,
                  }))
                }
                className="input"
              >
                {appointmentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Status" required>
              <select
                required
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value as AppointmentStatus,
                  }))
                }
                className="input"
              >
                {appointmentStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Observacoes" className="lg:col-span-2">
              <textarea
                rows={4}
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
                className="input min-h-[120px]"
                placeholder="Observacoes da consulta"
              />
            </Field>
          </div>

          <div className="border-t border-slate-200 px-6 py-4">
            {selectedPatient ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Agendamento para <span className="font-semibold text-slate-900">{selectedPatient.name}</span>
              </div>
            ) : null}
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
