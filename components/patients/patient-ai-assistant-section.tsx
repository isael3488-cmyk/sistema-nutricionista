"use client";

import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { usePatientAnamnesis } from "@/components/patients/use-patient-anamnesis";
import { usePatientBodyEvaluations } from "@/components/patients/use-patient-body-evaluations";
import { usePatientMealPlan } from "@/components/patients/use-patient-meal-plan";
import {
  calculateAge,
  formatDate,
  formatWeight,
  type Patient,
} from "@/lib/patients";
import type { NutritionAssistantResult } from "@/lib/ai/nutrition-assistant";

type PatientAIAssistantSectionProps = {
  patient: Patient;
};

type AssistantState = "idle" | "loading" | "error" | "success";

export function PatientAIAssistantSection({
  patient,
}: Readonly<PatientAIAssistantSectionProps>) {
  const {
    ready: anamnesisReady,
    anamnesis,
    error: anamnesisError,
  } = usePatientAnamnesis(patient.id);
  const {
    ready: bodyReady,
    evaluations,
    error: bodyError,
  } = usePatientBodyEvaluations(patient.id);
  const {
    ready: mealReady,
    mealPlan,
    error: mealError,
  } = usePatientMealPlan(patient.id);
  const [consultationNotes, setConsultationNotes] = useState("");
  const [result, setResult] = useState<NutritionAssistantResult | null>(null);
  const [state, setState] = useState<AssistantState>("idle");
  const [error, setError] = useState<string | null>(null);

  const latestEvaluation = useMemo(() => evaluations[0] ?? null, [evaluations]);
  const ready = anamnesisReady && bodyReady && mealReady;
  const dataWarnings = [anamnesisError, bodyError, mealError].filter(Boolean);

  const handleGenerate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState("loading");
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient: {
            id: patient.id,
            name: patient.name,
            age: calculateAge(patient.birthDate),
            sex: patient.sex,
            heightCm: patient.heightCm,
            currentWeightKg: patient.currentWeightKg,
            targetWeightKg: patient.targetWeightKg,
            objective: patient.objective,
            notes: patient.notes,
          },
          anamnesis,
          latestEvaluation,
          mealPlan,
          consultationNotes,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { result?: NutritionAssistantResult; error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Falha ao gerar sugestoes.");
      }

      if (!payload?.result) {
        throw new Error("A IA nao retornou um resultado valido.");
      }

      setResult(payload.result);
      setState("success");
    } catch (assistantError) {
      setState("error");
      setError(
        assistantError instanceof Error
          ? assistantError.message
          : "Falha ao gerar sugestoes da IA.",
      );
    }
  };

  const summaryCards = [
    {
      label: "Idade",
      value: `${calculateAge(patient.birthDate)} anos`,
    },
    {
      label: "Peso atual",
      value: formatWeight(patient.currentWeightKg),
    },
    {
      label: "Peso objetivo",
      value: formatWeight(patient.targetWeightKg),
    },
    {
      label: "Ultima avaliacao",
      value: latestEvaluation ? formatDate(latestEvaluation.evaluationDate) : "Sem avaliacao",
    },
  ];

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white shadow-sm">
        <div className="grid gap-6 p-6 xl:grid-cols-[0.95fr_1.05fr] xl:p-8">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Assistente IA
            </p>
            <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Sugestoes para revisao profissional
            </h3>
            <p className="max-w-xl text-sm leading-6 text-slate-300">
              Este assistente ajuda a organizar ideias, sugerir estruturas de refeicao,
              levantar substituicoes e resumir a consulta. O nutricionista continua
              sendo o responsavel final pela conduta.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {summaryCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {card.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-50">
              A IA nao substitui a analise clinica. Use as sugestoes como rascunho para
              revisao, ajuste e aprovacao profissional.
            </div>

            {dataWarnings.length > 0 ? (
              <div className="rounded-3xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-50">
                Alguns dados nao puderam ser carregados integralmente. O assistente
                pode seguir com o contexto disponivel, mas vale revisar as fontes
                antes de aplicar a sugestao.
              </div>
            ) : null}
          </div>

          <form
            onSubmit={handleGenerate}
            className="rounded-[1.75rem] border border-white/10 bg-white p-5 text-slate-900 shadow-2xl shadow-slate-950/20"
          >
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
                Contexto da consulta
              </p>
              <h4 className="text-xl font-semibold text-slate-900">
                Gerar sugestoes da IA
              </h4>
              <p className="text-sm leading-6 text-slate-500">
                Adicione observacoes da consulta para ajudar a IA a resumir e organizar
                melhor as ideias.
              </p>
            </div>

            <label className="mt-5 block space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Observacoes da consulta
              </span>
              <textarea
                rows={8}
                value={consultationNotes}
                onChange={(event) => setConsultationNotes(event.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
                placeholder="Descreva sintomas, rotina, preferencias, dificuldades, adesao ao plano e qualquer observacao da conversa."
              />
            </label>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <MetaItem label="Anamnese" value={anamnesisReady ? "Carregada" : "Carregando..."} />
              <MetaItem label="Avaliacoes" value={bodyReady ? `${evaluations.length}` : "Carregando..."} />
              <MetaItem label="Plano alimentar" value={mealReady ? (mealPlan ? "Carregado" : "Sem plano") : "Carregando..."} />
              <MetaItem label="Paciente" value={patient.name} />
            </div>

            {error ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="submit"
                disabled={!ready || state === "loading"}
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {state === "loading" ? "Gerando..." : "Gerar sugestoes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {state === "success" && result ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card title="Resumo da consulta" description={result.consultationSummary} />

          <Card title="Aviso da IA" description={result.disclaimer} />

          <ListCard title="Plano alimentar sugerido" items={result.mealPlanSuggestions.map((item) => (
            <div key={`${item.meal}-${item.suggestion}`} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-semibold text-slate-900">{item.meal}</h4>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
                  Sugestao
                </span>
              </div>
              <p className="text-sm leading-6 text-slate-600">{item.suggestion}</p>
              <p className="text-sm leading-6 text-slate-500">{item.rationale}</p>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Exemplos
              </p>
              <div className="flex flex-wrap gap-2">
                {item.exampleFoods.map((food) => (
                  <span
                    key={food}
                    className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                  >
                    {food}
                  </span>
                ))}
              </div>
            </div>
          ))} />

          <ListCard title="Substituicoes alimentares" items={result.substitutionSuggestions.map((item) => (
            <div key={`${item.original}-${item.rationale}`} className="space-y-2">
              <h4 className="font-semibold text-slate-900">{item.original}</h4>
              <div className="flex flex-wrap gap-2">
                {item.alternatives.map((alternative) => (
                  <span
                    key={alternative}
                    className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                  >
                    {alternative}
                  </span>
                ))}
              </div>
              <p className="text-sm leading-6 text-slate-500">{item.rationale}</p>
            </div>
          ))} />

          <Card
            title="Observacoes profissionais"
            description={
              <ul className="space-y-2">
                {result.professionalObservations.map((item) => (
                  <li key={item} className="flex gap-2 text-sm leading-6 text-slate-600">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            }
          />

          <Card
            title="Pontos para revisar"
            description={
              <ul className="space-y-2">
                {result.reviewQuestions.map((item) => (
                  <li key={item} className="flex gap-2 text-sm leading-6 text-slate-600">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            }
          />

          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm xl:col-span-2">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
              Seguranca
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {result.safetyNotes.map((note) => (
                <div key={note} className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-200">
                  {note}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function MetaItem({
  label,
  value,
}: Readonly<{
  label: string;
  value: string;
}>) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function Card({
  title,
  description,
}: Readonly<{
  title: string;
  description: ReactNode;
}>) {
  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h4 className="text-lg font-semibold text-slate-900">{title}</h4>
      <div className="mt-4">{description}</div>
    </article>
  );
}

function ListCard({
  title,
  items,
}: Readonly<{
  title: string;
  items: ReactNode[];
}>) {
  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h4 className="text-lg font-semibold text-slate-900">{title}</h4>
      <div className="mt-4 space-y-5">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div key={index} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              {item}
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">Nenhuma sugestao retornada pela IA.</p>
        )}
      </div>
    </article>
  );
}
