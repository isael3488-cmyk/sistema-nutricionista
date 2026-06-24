export type AppointmentStatus = "Agendada" | "Realizada" | "Cancelada";

export type AppointmentType =
  | "Consulta inicial"
  | "Retorno"
  | "Acompanhamento"
  | "Ajuste de plano"
  | "Avaliação";

export type Appointment = {
  id: string;
  patientId: string;
  date: string;
  time: string;
  type: AppointmentType;
  status: AppointmentStatus;
  notes: string;
  createdAt: string;
};

export type AppointmentFormValues = Omit<Appointment, "id" | "createdAt">;

export function createAppointmentId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `apt-${crypto.randomUUID()}`;
  }

  return `apt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createAppointment(values: AppointmentFormValues): Appointment {
  return {
    ...values,
    id: createAppointmentId(),
    createdAt: new Date().toISOString(),
  };
}

export function formatAppointmentDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(`${date}T00:00:00`));
}

export function appointmentStatusClass(status: AppointmentStatus) {
  switch (status) {
    case "Agendada":
      return "border-blue-100 bg-blue-50 text-blue-700";
    case "Realizada":
      return "border-emerald-100 bg-emerald-50 text-emerald-700";
    case "Cancelada":
      return "border-rose-100 bg-rose-50 text-rose-700";
  }
}
