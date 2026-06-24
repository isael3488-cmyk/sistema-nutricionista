"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { AppointmentFormModal } from "@/components/appointments/appointment-form-modal";
import { useAppointments } from "@/components/appointments/use-appointments";
import { usePatients } from "@/components/patients/use-patients";
import {
  appointmentStatusClass,
  type Appointment,
  formatAppointmentDate,
  type AppointmentFormValues,
} from "@/lib/appointments";
import { getPatientNameById } from "@/lib/patients";

export function AppointmentsPage() {
  const {
    appointments,
    ready,
    error,
    addAppointment,
    updateAppointment,
    deleteAppointment,
  } = useAppointments();
  const { patients, ready: patientsReady } = usePatients();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);

  const appointmentsWithPatients = useMemo(() => {
    return [...appointments].sort(
      (a, b) =>
        new Date(`${b.date}T${b.time}`).getTime() -
        new Date(`${a.date}T${a.time}`).getTime(),
    );
  }, [appointments]);

  const stats = useMemo(() => {
    return {
      total: appointments.length,
      scheduled: appointments.filter((item) => item.status === "Agendada").length,
      done: appointments.filter((item) => item.status === "Realizada").length,
    };
  }, [appointments]);

  const openCreateModal = () => {
    setEditingAppointment(null);
    setModalOpen(true);
  };

  const openEditModal = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingAppointment(null);
  };

  const handleSaveAppointment = async (values: AppointmentFormValues) => {
    if (editingAppointment) {
      await updateAppointment({
        ...editingAppointment,
        ...values,
      });
      closeModal();
      return;
    }

    await addAppointment(values);
    closeModal();
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Tem certeza que deseja excluir esta consulta?")
    ) {
      return;
    }

    try {
      await deleteAppointment(appointmentId);
    } catch (error) {
      console.error("Falha ao excluir consulta:", error);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
            Agenda
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            Lista de consultas
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-slate-500">
            Organize consultas, retornos e acompanhamentos usando os pacientes
            cadastrados no Supabase.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Nova consulta
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Total" value={ready ? String(stats.total) : "..."} />
        <MetricCard
          label="Agendadas"
          value={ready ? String(stats.scheduled) : "..."}
        />
        <MetricCard label="Realizadas" value={ready ? String(stats.done) : "..."} />
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Consultas registradas
          </h3>
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <Th>Paciente</Th>
                <Th>Data</Th>
                <Th>Horario</Th>
                <Th>Tipo</Th>
                <Th>Status</Th>
                <Th>Observacoes</Th>
                <Th>Acoes</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {appointmentsWithPatients.length > 0 ? (
                appointmentsWithPatients.map((appointment) => {
                  const patientName =
                    getPatientNameById(patients, appointment.patientId) ??
                    "Paciente nao encontrado";

                  return (
                    <tr key={appointment.id} className="hover:bg-slate-50/80">
                      <Td>
                        <div className="font-semibold text-slate-900">
                          {patientName}
                        </div>
                      </Td>
                      <Td>
                        <div className="text-sm text-slate-600">
                          {formatAppointmentDate(appointment.date)}
                        </div>
                      </Td>
                      <Td>
                        <div className="text-sm text-slate-600">
                          {appointment.time}
                        </div>
                      </Td>
                      <Td>
                        <div className="text-sm text-slate-600">
                          {appointment.type}
                        </div>
                      </Td>
                      <Td>
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${appointmentStatusClass(
                            appointment.status,
                          )}`}
                        >
                          {appointment.status}
                        </span>
                      </Td>
                      <Td>
                        <div className="max-w-sm text-sm leading-6 text-slate-600">
                          {appointment.notes || "--"}
                        </div>
                      </Td>
                      <Td>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(appointment)}
                            className="inline-flex h-10 items-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAppointment(appointment.id)}
                            className="inline-flex h-10 items-center rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
                          >
                            Excluir
                          </button>
                        </div>
                      </Td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <EmptyState />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 p-4 lg:hidden">
          {appointmentsWithPatients.length > 0 ? (
            appointmentsWithPatients.map((appointment) => {
              const patientName =
                getPatientNameById(patients, appointment.patientId) ??
                "Paciente nao encontrado";

              return (
                <article
                  key={appointment.id}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-base font-semibold text-slate-900">
                        {patientName}
                      </h4>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatAppointmentDate(appointment.date)} -{" "}
                        {appointment.time}
                      </p>
                    </div>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${appointmentStatusClass(
                        appointment.status,
                      )}`}
                    >
                      {appointment.status}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-slate-600">
                    <InfoRow label="Tipo" value={appointment.type} />
                    <InfoRow
                      label="Observacoes"
                      value={appointment.notes || "--"}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(appointment)}
                      className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAppointment(appointment.id)}
                      className="inline-flex h-10 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
                    >
                      Excluir
                    </button>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
              <EmptyState />
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
          Vinculo
        </p>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Os pacientes usados no formulario sao carregados diretamente do
          Supabase via cadastro existente.
        </p>
        <div className="mt-4 text-sm text-slate-600">
          {patientsReady ? `${patients.length} paciente(s) disponivel(eis).` : "Carregando pacientes..."}
        </div>
      </div>

      <AppointmentFormModal
        open={modalOpen}
        onClose={closeModal}
        onSave={handleSaveAppointment}
        patients={patients}
        initialValues={editingAppointment ? mapAppointmentToFormValues(editingAppointment) : undefined}
        title={editingAppointment ? "Editar consulta" : "Nova consulta"}
        subtitle={
          editingAppointment
            ? "Atualize os dados do agendamento."
            : "Agende uma nova consulta do paciente."
        }
        submitLabel={editingAppointment ? "Salvar alterações" : "Salvar consulta"}
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
    <div className="flex items-start justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="space-y-2">
      <p className="font-medium text-slate-700">Nenhuma consulta registrada.</p>
      <p className="text-sm text-slate-500">
        Use o botao Nova consulta para criar o primeiro agendamento.
      </p>
    </div>
  );
}

function mapAppointmentToFormValues(
  appointment: Appointment,
): AppointmentFormValues {
  return {
    patientId: appointment.patientId,
    date: appointment.date,
    time: appointment.time,
    type: appointment.type,
    status: appointment.status,
    notes: appointment.notes,
  };
}
