"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { usePatientAnamnesis } from "@/components/patients/use-patient-anamnesis";
import { useCurrentPatient } from "@/components/patient-portal/use-current-patient";
import { usePatientBodyEvaluations } from "@/components/patients/use-patient-body-evaluations";
import { usePatientMealPlan } from "@/components/patients/use-patient-meal-plan";
import type { NutritionAssistantResult } from "@/lib/ai/nutrition-assistant";
import {
  calculateAge,
  calculateBodyMassIndex,
  formatDate,
  formatHeight,
  formatWeight,
  mealSlots,
} from "@/lib/patients";

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
  const [aiResult, setAiResult] = useState<NutritionAssistantResult | null>(null);
  const [aiState, setAiState] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [aiError, setAiError] = useState<string | null>(null);

  const { ready: anamnesisReady, anamnesis } = usePatientAnamnesis(patient?.id ?? "");
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

  const orderedEvaluations = useMemo(
    () =>
      [...evaluations].sort(
        (a, b) =>
          new Date(a.evaluationDate).getTime() - new Date(b.evaluationDate).getTime(),
      ),
    [evaluations],
  );

  const firstEvaluation = orderedEvaluations[0] ?? null;
  const latestEvaluation = orderedEvaluations.at(-1) ?? null;

  const bmi = useMemo(() => {
    if (latestEvaluation) {
      return latestEvaluation.bodyMassIndex;
    }

    return patient ? calculateBodyMassIndex(patient.currentWeightKg, patient.heightCm) : 0;
  }, [latestEvaluation, patient]);

  const chartPoints = useMemo(
    () =>
      orderedEvaluations.map((evaluation) => ({
        label: evaluation.evaluationDate,
        weightKg: evaluation.weightKg,
      })),
    [orderedEvaluations],
  );

  const beforeAfter = useMemo(() => {
    if (!patient) {
      return null;
    }

    const currentWeight = latestEvaluation?.weightKg ?? patient.currentWeightKg;
    const startingWeight = firstEvaluation?.weightKg ?? currentWeight;
    const currentBmi = latestEvaluation?.bodyMassIndex ?? bmi;
    const startingBmi = firstEvaluation?.bodyMassIndex ?? currentBmi;

    return {
      currentWeight,
      startingWeight,
      currentBmi,
      startingBmi,
      weightDelta: currentWeight - startingWeight,
      bmiDelta: currentBmi - startingBmi,
    };
  }, [bmi, firstEvaluation, latestEvaluation, patient]);

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

  useEffect(() => {
    const currentPatient = patient;

    if (
      !currentPatient ||
      !patientsReady ||
      !anamnesisReady ||
      !bodyReady ||
      !mealPlanReady ||
      loadingUser ||
      userError
    ) {
      return;
    }

    const assistantPatient = currentPatient as NonNullable<typeof currentPatient>;
    const assistantPayload = {
      patient: {
        id: assistantPatient.id,
        name: assistantPatient.name,
        age: calculateAge(assistantPatient.birthDate),
        sex: assistantPatient.sex,
        heightCm: assistantPatient.heightCm,
        currentWeightKg: assistantPatient.currentWeightKg,
        targetWeightKg: assistantPatient.targetWeightKg,
        objective: assistantPatient.objective,
        notes: assistantPatient.notes,
      },
      anamnesis,
      latestEvaluation,
      mealPlan: patientMealPlan,
      consultationNotes: "",
    };

    let cancelled = false;

    async function loadAiInsight() {
      setAiState("loading");
      setAiError(null);

      try {
        const response = await fetch("/api/ai-assistant", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(assistantPayload),
        });

        const payload = (await response.json().catch(() => null)) as
          | { result?: NutritionAssistantResult; error?: string }
          | null;

        if (!response.ok) {
          throw new Error(payload?.error ?? "Falha ao gerar leitura da IA.");
        }

        if (!payload?.result) {
          throw new Error("A IA nao retornou um resultado valido.");
        }

        if (!cancelled) {
          setAiResult(payload.result);
          setAiState("success");
        }
      } catch (aiLoadError) {
        if (!cancelled) {
          setAiState("error");
          setAiError(
            aiLoadError instanceof Error
              ? aiLoadError.message
              : "Falha ao carregar a leitura da IA.",
          );
        }
      }
    }

    void loadAiInsight();

    return () => {
      cancelled = true;
    };
  }, [
    anamnesis,
    anamnesisReady,
    bodyReady,
    latestEvaluation,
    loadingUser,
    mealPlanReady,
    patient,
    patientMealPlan,
    patientsReady,
    userError,
  ]);

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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Altura" value={formatHeight(patient.heightCm)} />
        <MetricCard label="Peso atual" value={formatWeight(patient.currentWeightKg)} />
        <MetricCard label="Peso objetivo" value={formatWeight(patient.targetWeightKg)} />
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

      {aiError ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {aiError}
        </div>
      ) : null}

      {error ? <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Panel title="Evolucao do peso" eyebrow="Linha do tempo">
            <WeightChart points={chartPoints} />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <MiniStat
                label="Primeira medicao"
                value={chartPoints.length ? formatWeight(chartPoints[0].weightKg) : "--"}
              />
              <MiniStat
                label="Ultima medicao"
                value={
                  chartPoints.length
                    ? formatWeight(chartPoints[chartPoints.length - 1].weightKg)
                    : "--"
                }
              />
              <MiniStat label="Variacao" value={getTrendDelta(chartPoints)} />
            </div>
          </Panel>

          <Panel title="Antes e depois" eyebrow="Comparacao objetiva">
            {beforeAfter ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <ComparisonCard
                  title="Antes"
                  date={firstEvaluation ? formatDate(firstEvaluation.evaluationDate) : "Sem referencia"}
                  weight={beforeAfter.startingWeight}
                  bmi={beforeAfter.startingBmi}
                />
                <ComparisonCard
                  title="Agora"
                  date={latestEvaluation ? formatDate(latestEvaluation.evaluationDate) : "Hoje"}
                  weight={beforeAfter.currentWeight}
                  bmi={beforeAfter.currentBmi}
                />
                <div className="rounded-3xl bg-slate-950 p-5 text-white sm:col-span-2">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Leitura
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-slate-400">Delta de peso</p>
                      <p className="mt-1 text-2xl font-semibold">
                        {formatDelta(beforeAfter.weightDelta)} kg
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Delta de IMC</p>
                      <p className="mt-1 text-2xl font-semibold">
                        {formatDelta(beforeAfter.bmiDelta)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyBlock text="Ainda nao ha comparativo suficiente para mostrar antes e depois." />
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
          <Panel title="Leitura IA" eyebrow="Projecao objetiva">
            {aiState === "loading" ? (
              <EmptyBlock text="Analisando suas metricas..." />
            ) : aiResult ? (
              <div className="space-y-5">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Situacao atual
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {aiResult.statusSummary}
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Linha de projecao
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {aiResult.projection.direction}
                  </p>
                  <div className="mt-4 grid gap-3">
                    <ProjectionCard label="30 dias" value={aiResult.projection.thirtyDays} />
                    <ProjectionCard label="60 dias" value={aiResult.projection.sixtyDays} />
                    <ProjectionCard label="90 dias" value={aiResult.projection.ninetyDays} />
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Acoes diretas
                  </p>
                  <div className="mt-3 space-y-3">
                    {aiResult.trainingSuggestions.slice(0, 2).map((item) => (
                      <div key={item.focus} className="rounded-2xl border border-slate-200 bg-white p-3">
                        <p className="font-semibold text-slate-900">{item.focus}</p>
                        <p className="mt-1 text-sm text-slate-600">{item.frequency}</p>
                        <p className="mt-1 text-sm text-slate-500">{item.rationale}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Observacoes
                  </p>
                  <ul className="mt-3 space-y-2">
                    {aiResult.professionalObservations.slice(0, 3).map((item) => (
                      <li key={item} className="flex gap-2 text-sm leading-6 text-slate-600">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-950 p-4 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Seguranca
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {aiResult.disclaimer}
                  </p>
                </div>
              </div>
            ) : (
              <EmptyBlock text="A leitura da IA aparecera assim que houver dados suficientes." />
            )}
          </Panel>

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

function MiniStat({
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
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function WeightChart({
  points,
}: Readonly<{
  points: Array<{ label: string; weightKg: number }>;
}>) {
  if (points.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white text-sm text-slate-500">
        Nenhuma avaliacao registrada ainda.
      </div>
    );
  }

  if (points.length === 1) {
    return (
      <div className="flex h-56 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white text-sm text-slate-500">
        Adicione mais avaliacoes para ver a evolucao do peso.
      </div>
    );
  }

  const padding = 28;
  const width = 640;
  const height = 240;
  const weights = points.map((point) => point.weightKg);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = max - min || 1;
  const xStep = (width - padding * 2) / (points.length - 1);

  const chartPoints = points.map((point, index) => {
    const x = padding + index * xStep;
    const y = padding + ((max - point.weightKg) / range) * (height - padding * 2);
    return { ...point, x, y };
  });

  const linePoints = chartPoints.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className="w-full overflow-hidden rounded-3xl bg-white">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full">
        <defs>
          <linearGradient id="patientWeightLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>

        {[0, 1, 2, 3].map((step) => {
          const y = padding + ((height - padding * 2) / 3) * step;
          return (
            <line
              key={step}
              x1={padding}
              x2={width - padding}
              y1={y}
              y2={y}
              stroke="#e2e8f0"
              strokeDasharray="4 4"
            />
          );
        })}

        <polyline
          points={linePoints}
          fill="none"
          stroke="url(#patientWeightLine)"
          strokeWidth="4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {chartPoints.map((point) => (
          <g key={`${point.label}-${point.x}-${point.y}`}>
            <circle cx={point.x} cy={point.y} r="6" fill="#2563eb" />
            <circle cx={point.x} cy={point.y} r="3" fill="#ffffff" />
          </g>
        ))}
      </svg>

      <div className="grid grid-cols-2 gap-2 border-t border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-500 sm:grid-cols-4">
        {points.slice(-4).map((point) => (
          <div key={point.label} className="rounded-2xl bg-white px-3 py-2">
            <p className="font-medium text-slate-700">{formatDate(point.label)}</p>
            <p className="mt-1 text-slate-500">{formatWeight(point.weightKg)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComparisonCard({
  title,
  date,
  weight,
  bmi,
}: Readonly<{
  title: string;
  date: string;
  weight: number;
  bmi: number;
}>) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
        {title}
      </p>
      <p className="mt-2 text-sm text-slate-500">{date}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-white px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Peso
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {formatWeight(weight)}
          </p>
        </div>
        <div className="rounded-2xl bg-white px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            IMC
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {bmi ? bmi.toFixed(1).replace(".", ",") : "--"}
          </p>
        </div>
      </div>
    </article>
  );
}

function ProjectionCard({
  label,
  value,
}: Readonly<{
  label: string;
  value: string;
}>) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{value}</p>
    </div>
  );
}

function getTrendDelta(points: Array<{ weightKg: number }>) {
  if (points.length < 2) {
    return "--";
  }

  const delta = points[points.length - 1].weightKg - points[0].weightKg;
  return formatDelta(delta);
}

function formatDelta(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1).replace(".", ",")}`;
}
