insert into public.patients (
  id, name, phone, whatsapp, email, birth_date, sex, height_cm, current_weight_kg, target_weight_kg, objective, notes
) values
  ('pat-001', 'Ana Souza', '(11) 99999-1111', '(11) 99999-1111', 'ana.souza@email.com', '1994-03-22', 'Feminino', 168, 67.4, 62, 'Emagrecimento', 'Paciente com rotina agitada. Prefere plano simples e pratico.'),
  ('pat-002', 'Carlos Lima', '(11) 98888-2222', '(11) 98888-2222', 'carlos.lima@email.com', '1988-08-15', 'Masculino', 179, 82.1, 78, 'Hipertrofia', 'Treina 5x por semana e precisa monitorar proteina diaria.'),
  ('pat-003', 'Marina Costa', '(11) 97777-3333', '(11) 97777-3333', 'marina.costa@email.com', '1998-11-02', 'Feminino', 162, 58.9, 60, 'Performance', 'Busca melhorar energia para corridas e provas de 10 km.')
on conflict (id) do nothing;

insert into public.appointments (
  id, patient_id, date, time, type, status, notes
) values
  ('apt-001', 'pat-001', '2026-06-26', '08:30', 'Consulta inicial', 'Agendada', 'Trazer exames recentes e rotina alimentar da semana.'),
  ('apt-002', 'pat-002', '2026-06-24', '14:00', 'Retorno', 'Realizada', 'Revisar estrategia de proteina e pre treino.')
on conflict (id) do nothing;
