"use client";

import Link from "next/link";
import { useState } from "react";
import { PatientAIAssistantSection } from "@/components/patients/patient-ai-assistant-section";
import { PatientBodyEvaluationSection } from "@/components/patients/patient-body-evaluation-section";
import { PatientAnamnesisSection } from "@/components/patients/patient-anamnesis-section";
import { PatientPdfButton } from "@/components/patients/patient-pdf-button";
import { PatientMealPlanSection } from "@/components/patients/patient-meal-plan-section";
import { usePatients } from "@/components/patients/use-patients";
import {
  calculateAge,
  formatDate,
  formatHeight,
  formatWeight,
  getPatientInitials,
} from "@/lib/patients";

type PatientDetailsScreenProps = {
  patientId: string;
};

type ActiveTab = "geral" | "anamnesis" | "body" | "meal-plan" | "ai";

export function PatientDetailsScreen({
  patientId,
}: Readonly<PatientDetailsScreenProps>) {
  const { ready, error, getPatientById } = usePatients();
  const [activeTab, setActiveTab] = useState<ActiveTab>("geral");
  const patient = getPatientById(patientId);

  if (!ready) {
    return <LoadingState />;
  }

  if (!patient) {
    if (error) {
      return <ErrorState message={error} />;
    }

    return <NotFoundState />;
  }

  const age = calculateAge(patient.birthDate);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-900 text-lg font-semibold text-white">
            {getPatientInitials(patient.name)}
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
              Detalhes do paciente
            </p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
              {patient.name}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Cadastro realizado em {formatDate(patient.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <PatientPdfButton patient={patient} patientId={patientId} />
          <Link
            href="/patients"
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Voltar para pacientes
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DetailCard label="Idade" value={`${age} anos`} />
        <DetailCard label="Altura" value={formatHeight(patient.heightCm)} />
        <DetailCard
          label="Peso atual"
          value={formatWeight(patient.currentWeightKg)}
        />
        <DetailCard
          label="Peso objetivo"
          value={formatWeight(patient.targetWeightKg)}
        />
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-2 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <TabButton
            active={activeTab === "geral"}
            onClick={() => setActiveTab("geral")}
          >
            Geral
          </TabButton>
          <TabButton
            active={activeTab === "anamnesis"}
            onClick={() => setActiveTab("anamnesis")}
          >
            Anamnese
          </TabButton>
          <TabButton
            active={activeTab === "body"}
            onClick={() => setActiveTab("body")}
          >
            Avaliacao corporal
          </TabButton>
          <TabButton
            active={activeTab === "meal-plan"}
            onClick={() => setActiveTab("meal-plan")}
          >
            Plano alimentar
          </TabButton>
          <TabButton
            active={activeTab === "ai"}
            onClick={() => setActiveTab("ai")}
          >
            Assistente IA
          </TabButton>
        </div>
      </div>

      {activeTab === "geral" ? (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Informacoes gerais
            </h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Info label="Telefone" value={patient.phone} />
              <Info label="WhatsApp" value={patient.whatsapp} />
              <Info label="Email" value={patient.email} />
              <Info
                label="Data de nascimento"
                value={formatDate(patient.birthDate)}
              />
              <Info label="Sexo" value={patient.sex} />
              <Info label="Objetivo" value={patient.objective} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                Observacoes do nutricionista
              </h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {patient.notes || "Sem observacoes cadastradas."}
              </p>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                Resumo rapido
              </p>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <SummaryRow label="Nome" value={patient.name} />
                <SummaryRow label="Contato" value={patient.phone} />
                <SummaryRow
                  label="Peso atual"
                  value={formatWeight(patient.currentWeightKg)}
                />
                <SummaryRow
                  label="Peso objetivo"
                  value={formatWeight(patient.targetWeightKg)}
                />
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === "anamnesis" ? (
        <PatientAnamnesisSection patientId={patientId} />
      ) : activeTab === "body" ? (
        <PatientBodyEvaluationSection
          patientId={patientId}
          patientHeightCm={patient.heightCm}
          patientCurrentWeightKg={patient.currentWeightKg}
        />
      ) : activeTab === "ai" ? (
        <PatientAIAssistantSection patient={patient} />
      ) : (
        <PatientMealPlanSection
          patientId={patientId}
          patientName={patient.name}
        />
      )}
    </section>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: Readonly<{
  active: boolean;
  children: string;
  onClick: () => void;
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-11 items-center justify-center rounded-2xl px-5 text-sm font-semibold transition ${
        active
          ? "bg-slate-900 text-white shadow-sm"
          : "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );
}

function DetailCard({
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

function LoadingState() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
      Carregando paciente...
    </div>
  );
}

function NotFoundState() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">
        Paciente nao encontrado
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        Esse registro nao foi encontrado no banco do Supabase.
      </p>
      <Link
        href="/patients"
        className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Voltar para a lista
      </Link>
    </div>
  );
}

function ErrorState({ message }: Readonly<{ message: string }>) {
  return (
    <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8 shadow-sm">
      <h2 className="text-2xl font-semibold text-rose-900">
        Nao foi possivel carregar o paciente
      </h2>
      <p className="mt-2 text-sm text-rose-700">{message}</p>
      <Link
        href="/patients"
        className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-rose-600 px-5 text-sm font-semibold text-white transition hover:bg-rose-500"
      >
        Voltar para a lista
      </Link>
    </div>
  );
}
