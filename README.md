# Sistema Nutricionista

SaaS moderno para nutricionistas construido com Next.js, TypeScript, Tailwind CSS, Supabase e OpenAI.

## Rotas

- `/login`
- `/dashboard`
- `/patients`
- `/appointments`
- `/nutrition-plans`
- `/reports`
- `/settings`

## Estrutura

- `app/` - rotas e layouts do Next.js
- `components/layout/` - shell, sidebar, header e blocos reutilizaveis
- `components/patients/` - lista, detalhes, anamnese, avaliacao, plano alimentar, PDF e IA
- `components/appointments/` - agenda e formulários
- `lib/` - tipos, helpers e integracao com Supabase e OpenAI
- `supabase/` - schema e seed do banco

## Variaveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-5.5
```

## Publicacao com GitHub + Vercel

1. Crie um repositório no GitHub e envie este projeto para ele.
2. Entre em https://vercel.com e faça login com o GitHub.
3. Clique em `Add New > Project`.
4. Importe o repositório.
5. Na seção `Environment Variables`, adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` opcional
6. No Supabase, abra `SQL Editor` e execute:
   - `supabase/schema.sql`
   - `supabase/seed.sql` opcional
7. Clique em `Deploy`.

## Publicacao manual local

1. Instale as dependências com `npm install`.
2. Rode `npm run build`.
3. Publique em um host compatível com Next.js.

## Observacao

O projeto foi preparado com `output: "standalone"` no `next.config.ts`, o que facilita deploy em ambientes de producao.

## Fase atual

- Layout principal
- Sidebar responsiva
- Header
- Tela visual de login
- Dashboard
- CRUD de pacientes
- Anamnese
- Avaliacao corporal
- Plano alimentar
- Agenda
- Botao de PDF do paciente
- Assistente de IA para revisao profissional

