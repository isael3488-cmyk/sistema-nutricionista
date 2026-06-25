"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useCurrentPatient } from "@/components/patient-portal/use-current-patient";
import { usePatientBodyEvaluations } from "@/components/patients/use-patient-body-evaluations";
import { usePatientMealPlan } from "@/components/patients/use-patient-meal-plan";
import { calculateBodyMassIndex, formatDate, formatHeight, formatWeight, mealSlots } from "@/lib/patients";

const planCards = [
  { value: "Basico", title: "Basico", description: "Orientacao inicial e ajustes simples." },
  { value: "Pro", title: "Pro", description: "Acompanhamento com evolucao e mais suporte." },
  { value: "Premium", title: "Premium", description: "Experiencia completa com personalizacao." },
];

export function PatientPortalPage() {
  const { patient, patientsReady, loadingUser, userError, upsertPatient } =
    useCurrentPatient();
  const [savingPlan, setSavingPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    ready: bodyReady,
    evaluations,
    error: bodyError,
  } = usePatientBodyEvaluations(patient?.id ?? "");
  const {
    ready: mealPlanReady,
    mealPlan: patientMealPlan,
    error: mealPlanError,
  } = usePatientMealPlan(patient?.id ?? "");

  const latestEvaluation = evaluations[0] ?? null;
  const bmi = useMemo(() => {
    if (latestEvaluation) {
      return latestEvaluation.bodyMassIndex;
    }

    return patient ? calculateBodyMassIndex(patient.currentWeightKg, patient.heightCm) : 0;
  }, [latestEvaluation, patient]);

  async function handleChoosePlan(plan: string) {
    if (!patient) {
      return;
    }

    setSavingPlan(true);
    setError(null);

    try {
      await upsertPatient({
        ...patient,
        preferredPlan: plan,
      });
    } catch (chooseError) {
      setError(
        chooseError instanceof Error ? chooseError.message : "Nao foi possivel salvar o plano.",
      );
    } finally {
      setSavingPlan(false);
    }
  }

  if (loadingUser || !patientsReady || bodyReady === false || mealPlanReady === false) {
    return <LoadingState />;
  }

  if (userError) {
    return <EmptyNotice title="Acesso indisponivel" description={userError} />;
  }

  if (!patient) {
    return (
      <EmptyNotice
        title="Complete seu perfil"
        description="Voce ainda nao possui um cadastro vinculado. Crie seu perfil para liberar as metricas e a dieta."
        action={
          <Link
            href="/patient/profile"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Criar perfil
          </Link>
        }
      />
    );
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Altura" value={formatHeight(patient.heightCm)} />
        <MetricCard label="Peso atual" value={formatWeight(patient.currentWeightKg)} />
        <MetricCard label="IMC" value={bmi ? bmi.toFixed(1).replace(".", ",") : "--"} />
        <MetricCard label="Plano" value={patient.preferredPlan ?? "Basico"} />
      </div>

      {bodyError ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {bodyError}
        </div>
      ) : null}

      {mealPlanError ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {mealPlanError}
        </div>
      ) : null}

      {error ? <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <div className="space-y-6">
          <Panel title="Evolucao" eyebrow="Metrica principal">
            {evaluations.length > 0 ? (
              <div className="space-y-3">
                {evaluations.slice(0, 3).map((evaluation) => (
                  <div key={evaluation.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{formatDate(evaluation.evaluationDate)}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          Peso {formatWeight(evaluation.weightKg)} | IMC {evaluation.bodyMassIndex.toFixed(1).replace(".", ",")}
                        </p>
                      </div>
                      <span className="rounded-2xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
                        {evaluation.bodyMassIndex.toFixed(1).replace(".", ",")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyBlock text="Ainda nao ha avaliacoes registradas para este perfil." />
            )}
          </Panel>

          <Panel title="Sua dieta" eyebrow="Plano alimentar">
            {patientMealPlan ? (
              <div className="space-y-4">
                {mealSlots.map((slot) => {
                  const items = patientMealPlan.meals[slot] ?? [];

                  return (
                    <div key={slot} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-slate-900">{slot}</p>
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          {items.length} item(ns)
                        </span>
                      </div>
                      <div className="mt-3 space-y-2">
                        {items.length > 0 ? (
                          items.slice(0, 2).map((item) => (
                            <div key={item.id} className="rounded-xl bg-white px-3 py-3 text-sm text-slate-600">
                              <p className="font-semibold text-slate-900">{item.food}</p>
                              <p className="mt-1">
                                {item.time || "--:--"} | {item.quantity || "--"} | {item.householdMeasure || "--"}
                              </p>
                            </div>
                          ))
                        ) : (
                          <EmptyBlock text="Nenhum item cadastrado para esta refeicao." />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyBlock text="Seu plano alimentar ainda nao foi liberado." />
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Escolha do plano" eyebrow="Atualize seu nivel">
            <div className="space-y-3">
              {planCards.map((plan) => {
                const active = patient.preferredPlan === plan.value;
                return (
                  <button
                    key={plan.value}
                    type="button"
                    onClick={() => handleChoosePlan(plan.value)}
                    disabled={savingPlan}
                    className={`w-full rounded-3xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      active
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{plan.title}</p>
                        <p className={`mt-1 text-sm ${active ? "text-slate-300" : "text-slate-500"}`}>
                          {plan.description}
                        </p>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                        {active ? "Ativo" : "Escolher"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Cadastro
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {patient.objective || "Seu perfil ainda esta em evolucao."}
              </p>
            </div>
          </Panel>

          <Panel title="Seu perfil" eyebrow="Dados vinculados">
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Nome" value={patient.name} />
              <Info label="Email" value={patient.email} />
              <Info label="Sexo" value={patient.sex} />
              <Info label="Objetivo" value={patient.objective || "--"} />
            </div>
            <div className="mt-5">
              <Link
                href="/patient/profile"
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Atualizar perfil
              </Link>
            </div>
          </Panel>
        </div>
      </div>
    </section>
  );
}

function LoadingState() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
      Carregando sua area...
    </div>
  );
}

function EmptyNotice({
  title,
  description,
  action,
}: Readonly<{
  title: string;
  description: string;
  action?: ReactNode;
}>) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

function Panel({
  title,
  eyebrow,
  children,
}: Readonly<{
  title: string;
  eyebrow: string;
  children: ReactNode;
}>) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
        {eyebrow}
      </p>
      <h3 className="mt-1 text-xl font-semibold text-slate-900">{title}</h3>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function MetricCard({
  label,
  value,
}: Readonly<{
  label: string;
  value: string;
}>) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function Info({
  label,
  value,
}: Readonly<{
  label: string;
  value: string;
}>) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function EmptyBlock({ text }: Readonly<{ text: string }>) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-5 text-sm text-slate-500">
      {text}
    </div>
  );
}
