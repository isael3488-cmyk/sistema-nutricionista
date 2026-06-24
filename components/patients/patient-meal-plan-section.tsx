"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { usePatientMealPlan } from "@/components/patients/use-patient-meal-plan";
import {
  formatDate,
  mealSlots,
  type MealItem,
  type MealPlan,
  type MealPlanFormValues,
  type MealSlot,
} from "@/lib/patients";

type PatientMealPlanSectionProps = {
  patientId: string;
  patientName: string;
};

type MealItemField = Omit<MealItem, "id">;

type MealPlanState = MealPlanFormValues;

function createEmptyMealItem(): MealItemField {
  return {
    time: "",
    food: "",
    quantity: "",
    householdMeasure: "",
    observation: "",
  };
}

function createEmptyMealPlan(): MealPlanState {
  return mealSlots.reduce((acc, slot) => {
    acc[slot] = [];
    return acc;
  }, {} as MealPlanState);
}

export function PatientMealPlanSection({
  patientId,
  patientName,
}: Readonly<PatientMealPlanSectionProps>) {
  const { ready, mealPlan, saveMealPlan } = usePatientMealPlan(patientId);
  const [form, setForm] = useState<MealPlanState>(createEmptyMealPlan());

  useEffect(() => {
    if (!ready) {
      return;
    }

    setForm(mealPlan ? toFormState(mealPlan) : createEmptyMealPlan());
  }, [mealPlan, ready]);

  const totalItems = useMemo(
    () => mealSlots.reduce((sum, slot) => sum + (form[slot]?.length ?? 0), 0),
    [form],
  );

  const handleSave = async () => {
    try {
      await saveMealPlan(form);
    } catch (error) {
      console.error("Falha ao salvar plano alimentar:", error);
    }
  };

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
                Plano alimentar
              </p>
              <h3 className="mt-1 text-xl font-semibold text-slate-900">
                Montar refeicoes do paciente
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Estruture cada refeicao com horario, alimento, quantidade,
                medida caseira e observacao.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <MetricCard label="Refeicoes" value={`${mealSlots.length}`} />
              <MetricCard label="Itens" value={`${totalItems}`} />
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {mealSlots.map((slot) => (
              <MealEditor
                key={slot}
                slot={slot}
                items={form[slot]}
                onAddItem={() =>
                  setForm((current) => ({
                    ...current,
                    [slot]: [...current[slot], createEmptyMealItem()],
                  }))
                }
                onRemoveItem={(index) =>
                  setForm((current) => ({
                    ...current,
                    [slot]: current[slot].filter((_, itemIndex) => itemIndex !== index),
                  }))
                }
                onChangeItem={(index, field, value) =>
                  setForm((current) => {
                    const items = current[slot].map((item, itemIndex) =>
                      itemIndex === index ? { ...item, [field]: value } : item,
                    );

                    return {
                      ...current,
                      [slot]: items,
                    };
                  })
                }
              />
            ))}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Salvar plano alimentar
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
                  Visualizacao
                </p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">
                  Plano completo do paciente
                </h3>
              </div>

              <div className="rounded-2xl bg-slate-50 px-3 py-2 text-right text-xs text-slate-500">
                <p>{patientName}</p>
                <p>{mealPlan?.updatedAt ? formatDate(mealPlan.updatedAt) : "Nao salvo"}</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {mealSlots.map((slot) => (
                <PreviewMealCard key={slot} slot={slot} items={form[slot]} />
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
              Estado atual
            </p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <SummaryRow label="Refeicoes configuradas" value={`${configuredMeals(form)}`} />
              <SummaryRow label="Total de itens" value={`${totalItems}`} />
              <SummaryRow
                label="Ultima atualizacao"
                value={mealPlan?.updatedAt ? formatDate(mealPlan.updatedAt) : "Sem salvamento"}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function toFormState(mealPlan: MealPlan): MealPlanState {
  return mealSlots.reduce((acc, slot) => {
    acc[slot] = mealPlan.meals[slot].map(({ id, ...item }) => {
      void id;
      return item;
    });
    return acc;
  }, createEmptyMealPlan());
}

function configuredMeals(form: MealPlanState) {
  return mealSlots.filter((slot) => (form[slot] ?? []).length > 0).length;
}

function MealEditor({
  slot,
  items,
  onAddItem,
  onRemoveItem,
  onChangeItem,
}: Readonly<{
  slot: MealSlot;
  items: MealItemField[];
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onChangeItem: (index: number, field: keyof MealItemField, value: string) => void;
}>) {
  return (
    <details
      className="group rounded-3xl border border-slate-200 bg-slate-50 p-4"
      open={slot === mealSlots[2]}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
        <div>
          <h4 className="text-base font-semibold text-slate-900">{slot}</h4>
          <p className="text-sm text-slate-500">
            {items.length} item(ns) configurado(s)
          </p>
        </div>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
          Expandir
        </span>
      </summary>

      <div className="mt-4 space-y-4">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">
                  Item {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => onRemoveItem(index)}
                  className="text-sm font-medium text-rose-600 hover:text-rose-700"
                >
                  Remover
                </button>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Horario">
                  <input
                    type="time"
                    value={item.time}
                    onChange={(event) =>
                      onChangeItem(index, "time", event.target.value)
                    }
                    className="input"
                  />
                </Field>

                <Field label="Alimento">
                  <input
                    value={item.food}
                    onChange={(event) =>
                      onChangeItem(index, "food", event.target.value)
                    }
                    className="input"
                    placeholder="Ex: Aveia"
                  />
                </Field>

                <Field label="Quantidade">
                  <input
                    value={item.quantity}
                    onChange={(event) =>
                      onChangeItem(index, "quantity", event.target.value)
                    }
                    className="input"
                    placeholder="Ex: 2 colheres"
                  />
                </Field>

                <Field label="Medida caseira">
                  <input
                    value={item.householdMeasure}
                    onChange={(event) =>
                      onChangeItem(index, "householdMeasure", event.target.value)
                    }
                    className="input"
                    placeholder="Ex: 1 tigela"
                  />
                </Field>

                <Field label="Observacao" className="sm:col-span-2">
                  <textarea
                    rows={3}
                    value={item.observation}
                    onChange={(event) =>
                      onChangeItem(index, "observation", event.target.value)
                    }
                    className="input min-h-[96px]"
                    placeholder="Observacoes da refeicao"
                  />
                </Field>
              </div>
            </div>
          ))
        ) : (
          <EmptyMealState />
        )}

        <button
          type="button"
          onClick={onAddItem}
          className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Adicionar item
        </button>
      </div>
    </details>
  );
}

function PreviewMealCard({
  slot,
  items,
}: Readonly<{
  slot: MealSlot;
  items: MealItemField[];
}>) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-base font-semibold text-slate-900">{slot}</h4>
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {items.length} item(ns)
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {item.food || "Alimento nao informado"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.time || "--:--"} | {item.quantity || "--"} |{" "}
                    {item.householdMeasure || "--"}
                  </p>
                </div>
              </div>
              {item.observation ? (
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {item.observation}
                </p>
              ) : null}
            </div>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
            Refeicao sem itens.
          </p>
        )}
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: Readonly<{
  label: string;
  value: string;
}>) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
      <span className="text-slate-400">{label}</span>
      <span className="text-right font-medium text-white">{value}</span>
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
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function EmptyMealState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
      Nenhum item adicionado ainda.
    </div>
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
