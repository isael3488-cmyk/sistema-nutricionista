create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.patients (
  id text primary key,
  name text not null,
  phone text not null default '',
  whatsapp text not null default '',
  email text not null default '',
  birth_date date not null,
  sex text not null check (sex in ('Masculino', 'Feminino', 'Outro')),
  height_cm numeric(8,2) not null default 0,
  current_weight_kg numeric(8,2) not null default 0,
  target_weight_kg numeric(8,2) not null default 0,
  objective text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.patient_anamneses (
  patient_id text primary key references public.patients(id) on delete cascade,
  water_intake text not null default '',
  sleep_hours text not null default '',
  training_frequency text not null default '',
  allergies text not null default '',
  intolerances text not null default '',
  medications text not null default '',
  diseases text not null default '',
  food_routine text not null default '',
  main_objective text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.patient_body_evaluations (
  id text primary key,
  patient_id text not null references public.patients(id) on delete cascade,
  evaluation_date date not null,
  weight_kg numeric(8,2) not null default 0,
  height_cm numeric(8,2) not null default 0,
  body_mass_index numeric(8,2) not null default 0,
  body_fat_percentage numeric(8,2) not null default 0,
  muscle_mass_kg numeric(8,2) not null default 0,
  waist_cm numeric(8,2) not null default 0,
  abdomen_cm numeric(8,2) not null default 0,
  hip_cm numeric(8,2) not null default 0,
  right_arm_cm numeric(8,2) not null default 0,
  left_arm_cm numeric(8,2) not null default 0,
  right_thigh_cm numeric(8,2) not null default 0,
  left_thigh_cm numeric(8,2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_patient_body_evaluations_patient_date
  on public.patient_body_evaluations (patient_id, evaluation_date desc, created_at desc);

create table if not exists public.patient_meal_plans (
  patient_id text primary key references public.patients(id) on delete cascade,
  meals jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id text primary key,
  patient_id text not null references public.patients(id) on delete cascade,
  date date not null,
  time time not null,
  type text not null,
  status text not null check (status in ('Agendada', 'Realizada', 'Cancelada')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_appointments_date_time
  on public.appointments (date desc, time desc);

drop trigger if exists trg_patients_updated_at on public.patients;
create trigger trg_patients_updated_at
before update on public.patients
for each row execute function public.set_updated_at();

drop trigger if exists trg_patient_anamneses_updated_at on public.patient_anamneses;
create trigger trg_patient_anamneses_updated_at
before update on public.patient_anamneses
for each row execute function public.set_updated_at();

drop trigger if exists trg_patient_meal_plans_updated_at on public.patient_meal_plans;
create trigger trg_patient_meal_plans_updated_at
before update on public.patient_meal_plans
for each row execute function public.set_updated_at();

drop trigger if exists trg_appointments_updated_at on public.appointments;
create trigger trg_appointments_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();

alter table public.patients enable row level security;
alter table public.patient_anamneses enable row level security;
alter table public.patient_body_evaluations enable row level security;
alter table public.patient_meal_plans enable row level security;
alter table public.appointments enable row level security;

drop policy if exists "allow all patients" on public.patients;
create policy "allow all patients" on public.patients
  for all using (true) with check (true);

drop policy if exists "allow all anamneses" on public.patient_anamneses;
create policy "allow all anamneses" on public.patient_anamneses
  for all using (true) with check (true);

drop policy if exists "allow all body evaluations" on public.patient_body_evaluations;
create policy "allow all body evaluations" on public.patient_body_evaluations
  for all using (true) with check (true);

drop policy if exists "allow all meal plans" on public.patient_meal_plans;
create policy "allow all meal plans" on public.patient_meal_plans
  for all using (true) with check (true);

drop policy if exists "allow all appointments" on public.appointments;
create policy "allow all appointments" on public.appointments
  for all using (true) with check (true);
