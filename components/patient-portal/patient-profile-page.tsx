"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useCurrentPatient } from "@/components/patient-portal/use-current-patient";
import { createPatientProfile, type Patient } from "@/lib/patients";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const planOptions = [
  { value: "Basico", label: "Basico", description: "Acompanhamento essencial." },
  { value: "Pro", label: "Pro", description: "Plano completo com mais controle." },
  { value: "Premium", label: "Premium", description: "Experiencia completa e personalizada." },
];

export function PatientProfilePage() {
  const router = useRouter();
  const { patient, patientsReady, loadingUser, userError, userId, upsertPatient } =
    useCurrentPatient();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    birthDate: "",
    sex: "Feminino" as Patient["sex"],
    heightCm: "",
    currentWeightKg: "",
    targetWeightKg: "",
    objective: "",
    preferredPlan: "Basico",
  });

  useEffect(() => {
    if (!patient) {
      return;
    }

    setForm({
      name: patient.name,
      birthDate: patient.birthDate,
      sex: patient.sex,
      heightCm: String(patient.heightCm ?? ""),
      currentWeightKg: String(patient.currentWeightKg ?? ""),
      targetWeightKg: String(patient.targetWeightKg ?? ""),
      objective: patient.objective,
      preferredPlan: patient.preferredPlan ?? "Basico",
    });
  }, [patient]);

  const selectedPlan = useMemo(
    () => planOptions.find((plan) => plan.value === form.preferredPlan) ?? planOptions[0],
    [form.preferredPlan],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      if (!userId) {
        throw new Error("Nao foi possivel identificar o usuario.");
      }

      const supabase = getSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email ?? "";

      const nextPatient = patient
        ? {
            ...patient,
            name: form.name,
            birthDate: form.birthDate,
            sex: form.sex,
            heightCm: Number(form.heightCm || 0),
            currentWeightKg: Number(form.currentWeightKg || 0),
            targetWeightKg: Number(form.targetWeightKg || 0),
            objective: form.objective,
            preferredPlan: form.preferredPlan,
            email: patient.email || email,
          }
        : createPatientProfile(userId, {
            name: form.name,
            phone: "",
            whatsapp: "",
            email,
            birthDate: form.birthDate,
            sex: form.sex,
            heightCm: Number(form.heightCm || 0),
            currentWeightKg: Number(form.currentWeightKg || 0),
            targetWeightKg: Number(form.targetWeightKg || 0),
            objective: form.objective,
            notes: "",
            preferredPlan: form.preferredPlan,
          });

      await upsertPatient(nextPatient);
      setSuccess("Seu perfil foi salvo com sucesso.");
      router.replace("/patient");
      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Nao foi possivel salvar seu perfil.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loadingUser || !patientsReady) {
    return <StateBox title="Carregando seu perfil..." />;
  }

  if (userError) {
    return <StateBox title="Acesso indisponivel" description={userError} />;
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
          Perfil do paciente
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          Complete seus dados para liberar a IA e as metricas
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Essas informacoes ajudam a gerar sugestoes alimentares, acompanhar
          evolucao e organizar seu plano.
        </p>
      </div>

      {error ? <Alert type="error" message={error} /> : null}
      {success ? <Alert type="success" message={success} /> : null}

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-5 lg:grid-cols-2">
            <Field label="Nome completo" required>
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                className="input"
                placeholder="Seu nome"
              />
            </Field>

            <Field label="Data de nascimento" required>
              <input
                required
                type="date"
                value={form.birthDate}
                onChange={(event) =>
                  setForm((current) => ({ ...current, birthDate: event.target.value }))
                }
                className="input"
              />
            </Field>

            <Field label="Sexo" required>
              <select
                required
                value={form.sex}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    sex: event.target.value as Patient["sex"],
                  }))
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
                  setForm((current) => ({ ...current, heightCm: event.target.value }))
                }
                className="input"
                placeholder="Ex: 168"
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
                  setForm((current) => ({
                    ...current,
                    currentWeightKg: event.target.value,
                  }))
                }
                className="input"
                placeholder="Ex: 67.5"
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
                  setForm((current) => ({
                    ...current,
                    targetWeightKg: event.target.value,
                  }))
                }
                className="input"
                placeholder="Ex: 62"
              />
            </Field>

            <Field label="Objetivo principal" className="lg:col-span-2" required>
              <textarea
                required
                rows={4}
                value={form.objective}
                onChange={(event) =>
                  setForm((current) => ({ ...current, objective: event.target.value }))
                }
                className="input min-h-[120px]"
                placeholder="Ex: emagrecer com mais energia e rotina equilibrada"
              />
            </Field>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Salvar perfil"}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
              Escolha do plano
            </p>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">
              Selecione seu nivel de acompanhamento
            </h3>

            <div className="mt-5 space-y-3">
              {planOptions.map((plan) => (
                <button
                  key={plan.value}
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      preferredPlan: plan.value,
                    }))
                  }
                  className={`w-full rounded-3xl border p-4 text-left transition ${
                    form.preferredPlan === plan.value
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{plan.label}</p>
                      <p
                        className={`mt-1 text-sm ${
                          form.preferredPlan === plan.value
                            ? "text-slate-300"
                            : "text-slate-500"
                        }`}
                      >
                        {plan.description}
                      </p>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                      {form.preferredPlan === plan.value ? "Ativo" : "Escolher"}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Plano atual
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {selectedPlan.label}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Seu cadastro alimenta a IA, metricas e evolucao clinica.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
              Acesso rapido
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Depois de salvar seu perfil, voce sera levado para o painel do paciente.
            </p>
          </div>
        </div>
      </form>

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
    </section>
  );
}

function StateBox({
  title,
  description,
}: Readonly<{
  title: string;
  description?: string;
}>) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-lg font-semibold text-slate-900">{title}</p>
      {description ? <p className="mt-2 text-sm text-slate-500">{description}</p> : null}
    </div>
  );
}

function Alert({
  type,
  message,
}: Readonly<{
  type: "error" | "success";
  message: string;
}>) {
  const styles =
    type === "error"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <div className={`rounded-3xl border px-4 py-3 text-sm ${styles}`}>{message}</div>
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
