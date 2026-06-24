"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PatientFormModal } from "@/components/patients/patient-form-modal";
import { usePatients } from "@/components/patients/use-patients";
import {
  calculateAge,
  formatWeight,
  getPatientInitials,
  type Patient,
  type PatientFormValues,
} from "@/lib/patients";

export function PatientsPage() {
  const { patients, ready, error, addPatient, updatePatient, deletePatient } =
    usePatients();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const stats = useMemo(() => {
    const total = patients.length;
    const averageAge =
      total === 0
        ? 0
        : Math.round(
            patients.reduce((sum, patient) => sum + calculateAge(patient.birthDate), 0) /
              total,
          );

    return { total, averageAge };
  }, [patients]);

  const handleOpenCreate = () => {
    setEditingPatient(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingPatient(null);
  };

  const handleSavePatient = async (values: PatientFormValues) => {
    if (editingPatient) {
      await updatePatient({
        ...editingPatient,
        ...values,
      });
      handleCloseModal();
      return;
    }

    await addPatient(values);
    handleCloseModal();
  };

  const handleDeletePatient = async (patientId: string) => {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Tem certeza que deseja excluir este paciente?")
    ) {
      return;
    }

    try {
      await deletePatient(patientId);
    } catch (error) {
      console.error("Falha ao excluir paciente:", error);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
            Pacientes
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            Lista de pacientes
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-slate-500">
            Cadastre, acompanhe e acesse os detalhes dos pacientes. Os dados sao
            salvos no Supabase.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Novo Paciente
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Total de pacientes" value={stats.total.toString()} />
        <MetricCard
          label="Idade media"
          value={stats.total ? `${stats.averageAge} anos` : "--"}
        />
        <MetricCard
          label="Origem"
          value={ready ? "Supabase conectado" : "Carregando..."}
        />
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">Registros</h3>
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <Th>Paciente</Th>
                <Th>Contato</Th>
                <Th>Objetivo</Th>
                <Th>Peso</Th>
                <Th>Acoes</Th>
                <Th>Detalhes</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {patients.map((patient) => (
                <tr key={patient.id} className="group hover:bg-slate-50/80">
                  <Td>
                    <PatientIdentity patientId={patient.id} name={patient.name} />
                  </Td>
                  <Td>
                    <div className="space-y-1 text-sm text-slate-600">
                      <div>{patient.phone}</div>
                      <div>{patient.email}</div>
                    </div>
                  </Td>
                  <Td>
                    <Badge>{patient.objective}</Badge>
                  </Td>
                  <Td>
                    <div className="space-y-1 text-sm text-slate-600">
                      <div>Atual: {formatWeight(patient.currentWeightKg)}</div>
                      <div>Meta: {formatWeight(patient.targetWeightKg)}</div>
                    </div>
                  </Td>
                  <Td>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(patient)}
                        className="inline-flex h-10 items-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePatient(patient.id)}
                        className="inline-flex h-10 items-center rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
                      >
                        Excluir
                      </button>
                    </div>
                  </Td>
                  <Td>
                    <Link
                      href={`/patients/${patient.id}`}
                      className="inline-flex h-10 items-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-900 hover:text-white"
                    >
                      Ver detalhes
                    </Link>
                  </Td>
                </tr>
              ))}

              {patients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <EmptyMessage />
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 p-4 lg:hidden">
          {patients.length > 0 ? (
            patients.map((patient) => (
              <article
                key={patient.id}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <PatientIdentity patientId={patient.id} name={patient.name} />
                  <Badge>{patient.objective}</Badge>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-slate-600">
                  <InfoRow label="Telefone" value={patient.phone} />
                  <InfoRow label="Email" value={patient.email} />
                  <InfoRow label="Peso atual" value={formatWeight(patient.currentWeightKg)} />
                  <InfoRow label="Peso objetivo" value={formatWeight(patient.targetWeightKg)} />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(patient)}
                    className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePatient(patient.id)}
                    className="inline-flex h-10 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
                  >
                    Excluir
                  </button>
                </div>

                <Link
                  href={`/patients/${patient.id}`}
                  className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Ver detalhes
                </Link>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
              <EmptyMessage />
            </div>
          )}
        </div>
      </div>

      <PatientFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSavePatient}
        initialValues={editingPatient ? mapPatientToFormValues(editingPatient) : undefined}
        title={editingPatient ? "Editar paciente" : "Novo paciente"}
        subtitle={
          editingPatient
            ? "Atualize os dados cadastrais do paciente."
            : "Cadastre um novo paciente na base do Supabase."
        }
        submitLabel={editingPatient ? "Salvar alteracoes" : "Salvar paciente"}
      />
    </section>
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

function PatientIdentity({
  patientId,
  name,
}: Readonly<{
  patientId: string;
  name: string;
}>) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
        {getPatientInitials(name)}
      </div>
      <div>
        <Link
          href={`/patients/${patientId}`}
          className="font-semibold text-slate-900 transition hover:text-blue-600"
        >
          {name}
        </Link>
        <p className="text-sm text-slate-500">Cadastro ativo</p>
      </div>
    </div>
  );
}

function Badge({
  children,
}: Readonly<{
  children: string;
}>) {
  return (
    <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
      {children}
    </span>
  );
}

function Th({ children }: Readonly<{ children: ReactNode }>) {
  return <th className="px-6 py-4 font-semibold">{children}</th>;
}

function Td({ children }: Readonly<{ children: ReactNode }>) {
  return <td className="px-6 py-5 align-top">{children}</td>;
}

function InfoRow({
  label,
  value,
}: Readonly<{
  label: string;
  value: string;
}>) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}

function EmptyMessage() {
  return (
    <div className="space-y-2">
      <p className="font-medium text-slate-700">Nenhum paciente cadastrado.</p>
      <p className="text-sm text-slate-500">
        Use o botao Novo Paciente para criar o primeiro registro.
      </p>
    </div>
  );
}

function mapPatientToFormValues(patient: Patient): PatientFormValues {
  return {
    name: patient.name,
    phone: patient.phone,
    whatsapp: patient.whatsapp,
    email: patient.email,
    birthDate: patient.birthDate,
    sex: patient.sex,
    heightCm: patient.heightCm,
    currentWeightKg: patient.currentWeightKg,
    targetWeightKg: patient.targetWeightKg,
    objective: patient.objective,
    notes: patient.notes,
  };
}
