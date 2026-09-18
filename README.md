# PokéCards BR — MVP

Marketplace brasileiro de cartas Pokémon TCG (estilo Enjoei/OLX) para substituir grupos de WhatsApp de **Tenho / Quero**.

## Product brief

Colecionadores cadastram um **portfólio** de cartas (foto, nome, set, condição NM/LP/MP/HP, preço em R$, notas), publicam anúncios **Tenho** (vendo) ou **Quero** (procuro), navegam um **feed** com busca/filtros, abrem a **página do anúncio** e conversam por **chat direto**. Sem pagamentos, frete, leilões ou grading no MVP.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- Prisma + **PostgreSQL** (Neon recomendado; Supabase também ok)
- Auth por e-mail/senha (JWT em cookie httpOnly, `AUTH_SECRET`)
- Fotos: **Vercel Blob** em produção; disco local (`public/uploads`) só em `npm run dev`
- Integração com Pokémon TCG API v2 (busca + autofill via proxy Next.js)
- Deploy: **Vercel**

## Pré-requisitos

- Node.js 20+
- npm
- Um banco PostgreSQL (Neon free, Supabase free, ou Postgres local/Docker)

## Setup local

```bash
git clone https://github.com/CoioSpringer/pokemon-cards-mvp.git
cd pokemon-cards-mvp
cp .env.example .env
# Edite .env: DATABASE_URL (Postgres) e AUTH_SECRET
npm install
npx prisma migrate dev
npm run db:seed   # opcional — dados demo
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### Migrando de SQLite (setup antigo)

Se você já rodava o projeto com `file:./dev.db`:

1. As migrations SQLite foram **substituídas** por uma migration limpa de Postgres (`prisma/migrations/20260918210000_init`).
2. Apague ou ignore o `prisma/dev.db` antigo (não é mais usado).
3. Configure `DATABASE_URL` com Postgres e rode `npx prisma migrate dev` (cria o schema do zero).
4. Rode `npm run db:seed` de novo se quiser os dados demo.
5. Fotos em `public/uploads/` continuam válidas **só no seu disco local**; em produção use Vercel Blob.

### Variáveis (`.env`)

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | Sim | Postgres, ex. Neon: `postgresql://…?sslmode=require` |
| `AUTH_SECRET` | Sim | Segredo longo para assinar a sessão (`openssl rand -base64 32`) |
| `BLOB_READ_WRITE_TOKEN` | Em produção | Token do Vercel Blob (uploads). Em local, deixe vazio → disco |
| `POKEMONTCG_API_KEY` | Não | Chave da [Pokémon TCG API](https://docs.pokemontcg.io/) — eleva o rate limit |

## Scripts npm

| Script | O que faz |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | `prisma generate` + `migrate deploy` + `next build` |
| `npm run start` | Sobe o build de produção |
| `npm run db:migrate` | Migrações Prisma (dev) |
| `npm run db:migrate:deploy` | Aplica migrations pendentes (prod / CI) |
| `npm run db:seed` | Popula usuários e anúncios de exemplo (**local**; precisa de `DATABASE_URL`) |
| `npm run db:push` | Empurra schema sem migration (dev rápido) |

## Contas demo (seed)

| E-mail | Senha |
|--------|-------|
| `demo@pokemon.local` | `demo1234` |
| `maria@pokemon.local` | `demo1234` |
| `joao@pokemon.local` | `demo1234` |

## Uploads de foto

- Formulários de **portfólio** e **anúncio** aceitam arquivo de imagem (JPG, PNG, WebP, GIF · máx. 5 MB).
- **Produção (Vercel):** com `BLOB_READ_WRITE_TOKEN`, o arquivo vai para o [Vercel Blob](https://vercel.com/docs/storage/vercel-blob); a URL pública `https://….public.blob.vercel-storage.com/…` é salva no banco.
- **Desenvolvimento:** sem o token, arquivos ficam em `public/uploads/` e a URL `/uploads/…` é salva no banco.
- Campo de **URL** continua disponível (imagens remotas, TCG API, seed).
- Binários em `public/uploads/` entram no `.gitignore`.

## Pokédex TCG (autofill)

- Nos formulários de portfólio e anúncio, use **Buscar carta na Pokédex TCG…** (debounce ~350 ms).
- O browser chama `GET /api/tcg/search?q=…`, que faz proxy para `https://api.pokemontcg.io/v2/cards` (chave só no servidor).
- Ao selecionar um resultado, nome, set e foto (`images.large`) são preenchidos; o id externo fica em `tcgId` (opcional).
- Sem `POKEMONTCG_API_KEY` a API pública funciona, mas o rate limit é baixo.

## O que funciona no MVP

1. Cadastro / login / logout
2. CRUD de portfólio (upload de foto ou URL + busca TCG)
3. Criar, editar, desativar e reativar anúncios Have/Want (+ busca TCG)
4. Feed com filtros: modo, nome, set, faixa de preço
5. Detalhe do anúncio
6. Chat 1:1 ligado ao anúncio (polling leve)

## Publicar na Vercel

Passo a passo para colocar o app no ar (público no Brasil via edge da Vercel).

### 1. Criar Postgres (Neon — recomendado)

1. Conta em [https://neon.tech](https://neon.tech) (plano free).
2. Crie um projeto / database.
3. Copie a **connection string** (`DATABASE_URL`), no formato `postgresql://…?sslmode=require`.
4. (Alternativa) [Supabase](https://supabase.com) → Project Settings → Database → URI (modo Session/Transaction ok para Prisma; use a string com `sslmode=require`).

### 2. Criar projeto na Vercel ligado a este GitHub

1. Em [https://vercel.com](https://vercel.com), **Add New Project** → importe `CoioSpringer/pokemon-cards-mvp`.
2. Framework: Next.js (detectado automaticamente).
3. **Root Directory:** `.` (raiz).
4. Build Command (já no `package.json`): `prisma generate && prisma migrate deploy && next build`  
   - As migrations rodam no **build** (`migrate deploy`). Não precisa de hook extra na primeira vez, desde que `DATABASE_URL` esteja setada **antes** do deploy.
5. Não faça o primeiro deploy ainda — configure as env vars e o Blob primeiro.

### 3. Variáveis de ambiente na Vercel

Em **Project → Settings → Environment Variables**, adicione (Production + Preview):

| Nome | Valor |
|------|--------|
| `DATABASE_URL` | Connection string do Neon/Supabase |
| `AUTH_SECRET` | Saída de `openssl rand -base64 32` |
| `BLOB_READ_WRITE_TOKEN` | Criado automaticamente ao habilitar Blob (passo 4) |
| `POKEMONTCG_API_KEY` | (Opcional) chave Pokémon TCG API |

### 4. Habilitar Vercel Blob

1. No projeto Vercel: **Storage** → **Create** → **Blob**.
2. Conecte o store ao projeto.
3. A Vercel injeta `BLOB_READ_WRITE_TOKEN` nas env vars. Confirme que aparece em Settings → Environment Variables.
4. Sem Blob, uploads de arquivo **falham em produção** (URL/manual e fotos TCG continuam ok).

### 5. Deploy

1. **Deploy** (ou push em `main` se o Git integração estiver ativa).
2. No build log, confirme que `prisma migrate deploy` aplicou `20260918210000_init` sem erro.
3. Abra a URL `*.vercel.app`, cadastre um usuário e teste upload + feed + chat.

### 6. Seed (opcional, só local ou one-off)

O seed **não** roda automaticamente na Vercel. Para popular demo no banco de produção (cuidado — apaga e recria dados do seed):

```bash
# Com DATABASE_URL apontando para o Postgres de produção (localmente):
export DATABASE_URL="postgresql://…"
npm run db:seed
```

Prefira seed só em desenvolvimento. Em produção, usuários reais se cadastram pela UI.

### Checklist rápido

- [ ] Neon (ou Supabase) criado + `DATABASE_URL`
- [ ] Projeto Vercel ligado ao repo
- [ ] `AUTH_SECRET` gerado e setado
- [ ] Blob store criado → `BLOB_READ_WRITE_TOKEN`
- [ ] (Opcional) `POKEMONTCG_API_KEY`
- [ ] Deploy com `migrate deploy` ok
- [ ] Teste: signup, upload de foto, anúncio, chat

## Fora de escopo

Pagamentos, frete, leilões, grading, integração WhatsApp, apps nativos, domínio custom, browser completo de sets / price guides TCGPlayer.

## Licença

Uso livre para o projeto do repositório.
