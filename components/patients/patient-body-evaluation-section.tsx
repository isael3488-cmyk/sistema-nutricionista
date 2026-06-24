"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { usePatientBodyEvaluations } from "@/components/patients/use-patient-body-evaluations";
import {
  calculateBodyMassIndex,
  formatDate,
  formatHeight,
  formatWeight,
  type PatientBodyEvaluation,
  type PatientBodyEvaluationFormValues,
} from "@/lib/patients";

type PatientBodyEvaluationSectionProps = {
  patientId: string;
  patientHeightCm: number;
  patientCurrentWeightKg: number;
};

type FormState = {
  evaluationDate: string;
  weightKg: string;
  heightCm: string;
  bodyFatPercentage: string;
  muscleMassKg: string;
  waistCm: string;
  abdomenCm: string;
  hipCm: string;
  rightArmCm: string;
  leftArmCm: string;
  rightThighCm: string;
  leftThighCm: string;
};

const numberFieldClassName =
  "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white";

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function createDefaultForm(
  patientHeightCm: number,
  patientCurrentWeightKg: number,
): FormState {
  return {
    evaluationDate: getTodayDate(),
    weightKg: patientCurrentWeightKg ? String(patientCurrentWeightKg) : "",
    heightCm: patientHeightCm ? String(patientHeightCm) : "",
    bodyFatPercentage: "",
    muscleMassKg: "",
    waistCm: "",
    abdomenCm: "",
    hipCm: "",
    rightArmCm: "",
    leftArmCm: "",
    rightThighCm: "",
    leftThighCm: "",
  };
}

export function PatientBodyEvaluationSection({
  patientId,
  patientHeightCm,
  patientCurrentWeightKg,
}: Readonly<PatientBodyEvaluationSectionProps>) {
  const { ready, evaluations, saveEvaluation } = usePatientBodyEvaluations(
    patientId,
  );
  const [form, setForm] = useState<FormState>(
    createDefaultForm(patientHeightCm, patientCurrentWeightKg),
  );

  useEffect(() => {
    if (!ready) {
      return;
    }

    const latest = evaluations[0];

    setForm(
      latest
        ? {
            evaluationDate: latest.evaluationDate,
            weightKg: String(latest.weightKg ?? ""),
            heightCm: String(latest.heightCm ?? patientHeightCm ?? ""),
            bodyFatPercentage: String(latest.bodyFatPercentage ?? ""),
            muscleMassKg: String(latest.muscleMassKg ?? ""),
            waistCm: String(latest.waistCm ?? ""),
            abdomenCm: String(latest.abdomenCm ?? ""),
            hipCm: String(latest.hipCm ?? ""),
            rightArmCm: String(latest.rightArmCm ?? ""),
            leftArmCm: String(latest.leftArmCm ?? ""),
            rightThighCm: String(latest.rightThighCm ?? ""),
            leftThighCm: String(latest.leftThighCm ?? ""),
          }
        : createDefaultForm(patientHeightCm, patientCurrentWeightKg),
    );
  }, [evaluations, patientCurrentWeightKg, patientHeightCm, ready]);

  const numericValues = useMemo(
    () => ({
      weightKg: parseNumber(form.weightKg),
      heightCm: parseNumber(form.heightCm),
      bodyFatPercentage: parseNumber(form.bodyFatPercentage),
      muscleMassKg: parseNumber(form.muscleMassKg),
      waistCm: parseNumber(form.waistCm),
      abdomenCm: parseNumber(form.abdomenCm),
      hipCm: parseNumber(form.hipCm),
      rightArmCm: parseNumber(form.rightArmCm),
      leftArmCm: parseNumber(form.leftArmCm),
      rightThighCm: parseNumber(form.rightThighCm),
      leftThighCm: parseNumber(form.leftThighCm),
    }),
    [form],
  );

  const bmiPreview = calculateBodyMassIndex(
    numericValues.weightKg,
    numericValues.heightCm,
  );

  const orderedEvaluations = useMemo(
    () =>
      [...evaluations].sort(
        (a, b) =>
          new Date(a.evaluationDate).getTime() -
          new Date(b.evaluationDate).getTime(),
      ),
    [evaluations],
  );

  const chartData = useMemo(() => buildChartData(orderedEvaluations), [orderedEvaluations]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await saveEvaluation({
        evaluationDate: form.evaluationDate,
        weightKg: numericValues.weightKg,
        heightCm: numericValues.heightCm || patientHeightCm,
        bodyFatPercentage: numericValues.bodyFatPercentage,
        muscleMassKg: numericValues.muscleMassKg,
        waistCm: numericValues.waistCm,
        abdomenCm: numericValues.abdomenCm,
        hipCm: numericValues.hipCm,
        rightArmCm: numericValues.rightArmCm,
        leftArmCm: numericValues.leftArmCm,
        rightThighCm: numericValues.rightThighCm,
        leftThighCm: numericValues.leftThighCm,
      } satisfies PatientBodyEvaluationFormValues);
    } catch (error) {
      console.error("Falha ao salvar avaliacao corporal:", error);
    }
  };

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
                Avaliacao corporal
              </p>
              <h3 className="mt-1 text-xl font-semibold text-slate-900">
                Nova avaliacao do paciente
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <MetricPill label="IMC" value={formatBmi(bmiPreview)} />
              <MetricPill
                label="Peso base"
                value={formatWeight(patientCurrentWeightKg)}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="grid gap-5 lg:grid-cols-2">
              <Field label="Data da avaliacao" required>
                <input
                  required
                  type="date"
                  value={form.evaluationDate}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      evaluationDate: event.target.value,
                    }))
                  }
                  className={numberFieldClassName}
                />
              </Field>

              <Field label="Peso (kg)" required>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.weightKg}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      weightKg: event.target.value,
                    }))
                  }
                  className={numberFieldClassName}
                  placeholder="Ex: 68.2"
                />
              </Field>

              <Field label="Altura (cm)" required>
                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  value={form.heightCm}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      heightCm: event.target.value,
                    }))
                  }
                  className={numberFieldClassName}
                  placeholder="Ex: 168"
                />
              </Field>

              <Field label="IMC automatico">
                <div className="flex h-[52px] items-center rounded-2xl border border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-900">
                  {formatBmi(bmiPreview)}
                </div>
              </Field>

              <Field label="Percentual de gordura">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.bodyFatPercentage}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      bodyFatPercentage: event.target.value,
                    }))
                  }
                  className={numberFieldClassName}
                  placeholder="Ex: 24.5"
                />
              </Field>

              <Field label="Massa muscular">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.muscleMassKg}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      muscleMassKg: event.target.value,
                    }))
                  }
                  className={numberFieldClassName}
                  placeholder="Ex: 28.7"
                />
              </Field>

              <Field label="Cintura">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.waistCm}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      waistCm: event.target.value,
                    }))
                  }
                  className={numberFieldClassName}
                  placeholder="Ex: 82.0"
                />
              </Field>

              <Field label="Abdomen">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.abdomenCm}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      abdomenCm: event.target.value,
                    }))
                  }
                  className={numberFieldClassName}
                  placeholder="Ex: 86.0"
                />
              </Field>

              <Field label="Quadril">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.hipCm}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      hipCm: event.target.value,
                    }))
                  }
                  className={numberFieldClassName}
                  placeholder="Ex: 98.0"
                />
              </Field>

              <Field label="Braco direito">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.rightArmCm}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      rightArmCm: event.target.value,
                    }))
                  }
                  className={numberFieldClassName}
                  placeholder="Ex: 31.5"
                />
              </Field>

              <Field label="Braco esquerdo">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.leftArmCm}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      leftArmCm: event.target.value,
                    }))
                  }
                  className={numberFieldClassName}
                  placeholder="Ex: 31.0"
                />
              </Field>

              <Field label="Coxa direita">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.rightThighCm}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      rightThighCm: event.target.value,
                    }))
                  }
                  className={numberFieldClassName}
                  placeholder="Ex: 53.0"
                />
              </Field>

              <Field label="Coxa esquerda">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.leftThighCm}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      leftThighCm: event.target.value,
                    }))
                  }
                  className={numberFieldClassName}
                  placeholder="Ex: 52.5"
                />
              </Field>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Salvar avaliacao
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
                  Evolucao
                </p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">
                  Grafico de peso
                </h3>
              </div>
              <div className="text-right text-sm text-slate-500">
                <p>{orderedEvaluations.length} avaliacoes</p>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <WeightChart points={chartData} />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <MiniStat
                label="Primeira"
                value={chartData.length ? formatWeight(chartData[0].weightKg) : "--"}
              />
              <MiniStat
                label="Ultima"
                value={
                  chartData.length
                    ? formatWeight(chartData[chartData.length - 1].weightKg)
                    : "--"
                }
              />
              <MiniStat
                label="Delta"
                value={getDeltaLabel(chartData)}
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
                  Historico
                </p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">
                  Avaliacoes registradas
                </h3>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {orderedEvaluations.length > 0 ? (
                orderedEvaluations
                  .slice()
                  .reverse()
                  .map((evaluation) => (
                    <EvaluationCard
                      key={evaluation.id}
                      evaluation={evaluation}
                    />
                  ))
              ) : (
                <EmptyState />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function parseNumber(value: string) {
  const normalized = Number(value.replace(",", "."));
  return Number.isFinite(normalized) ? normalized : 0;
}

function formatBmi(value: number) {
  return value ? value.toFixed(1).replace(".", ",") : "--";
}

function buildChartData(evaluations: PatientBodyEvaluation[]) {
  return evaluations.map((evaluation) => ({
    label: evaluation.evaluationDate,
    weightKg: evaluation.weightKg,
  }));
}

function getDeltaLabel(points: Array<{ weightKg: number }>) {
  if (points.length < 2) {
    return "--";
  }

  const delta = points[points.length - 1].weightKg - points[0].weightKg;
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(1).replace(".", ",")} kg`;
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
      <div className="flex h-56 items-center justify-center rounded-3xl border border-slate-200 bg-white text-sm text-slate-500">
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
          <linearGradient id="weightLine" x1="0" y1="0" x2="1" y2="0">
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
          stroke="url(#weightLine)"
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
            <p className="font-medium text-slate-700">
              {formatDate(point.label)}
            </p>
            <p className="mt-1 text-slate-500">{formatWeight(point.weightKg)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EvaluationCard({
  evaluation,
}: Readonly<{
  evaluation: PatientBodyEvaluation;
}>) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {formatDate(evaluation.evaluationDate)}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Peso {formatWeight(evaluation.weightKg)} | Altura{" "}
            {formatHeight(evaluation.heightCm)}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
          IMC {evaluation.bodyMassIndex.toFixed(1).replace(".", ",")}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <EvaluationMetric label="Gordura" value={formatPercent(evaluation.bodyFatPercentage)} />
        <EvaluationMetric label="Massa muscular" value={formatMetricValue(evaluation.muscleMassKg)} />
        <EvaluationMetric label="Cintura" value={formatMetricValue(evaluation.waistCm)} />
        <EvaluationMetric label="Abdomen" value={formatMetricValue(evaluation.abdomenCm)} />
        <EvaluationMetric label="Quadril" value={formatMetricValue(evaluation.hipCm)} />
        <EvaluationMetric label="Braco direito" value={formatMetricValue(evaluation.rightArmCm)} />
        <EvaluationMetric label="Braco esquerdo" value={formatMetricValue(evaluation.leftArmCm)} />
        <EvaluationMetric label="Coxa direita" value={formatMetricValue(evaluation.rightThighCm)} />
        <EvaluationMetric label="Coxa esquerda" value={formatMetricValue(evaluation.leftThighCm)} />
      </div>
    </article>
  );
}

function EvaluationMetric({
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
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function MetricPill({
  label,
  value,
}: Readonly<{
  label: string;
  value: string;
}>) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
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
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
      Nenhuma avaliacao registrada ainda.
    </div>
  );
}

function Field({
  label,
  children,
  required,
}: Readonly<{
  label: string;
  children: ReactNode;
  required?: boolean;
}>) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </span>
      {children}
    </label>
  );
}

function formatMetricValue(value: number) {
  return value ? `${value.toFixed(1).replace(".", ",")}` : "--";
}

function formatPercent(value: number) {
  return value ? `${value.toFixed(1).replace(".", ",")}%` : "--";
}
