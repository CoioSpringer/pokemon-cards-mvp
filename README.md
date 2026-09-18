# PokéCards BR — MVP

Marketplace brasileiro de cartas Pokémon TCG (estilo Enjoei/OLX) para substituir grupos de WhatsApp de **Tenho / Quero**.

## Product brief

Colecionadores cadastram um **portfólio** de cartas (foto, nome, set, condição NM/LP/MP/HP, preço em R$, notas), publicam anúncios **Tenho** (vendo) ou **Quero** (procuro), navegam um **feed** com busca/filtros, abrem a **página do anúncio** e conversam por **chat direto**. Sem pagamentos, frete, leilões ou grading no MVP.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- Prisma + SQLite
- Auth por e-mail/senha (JWT em cookie httpOnly)

## Pré-requisitos

- Node.js 20+
- npm

## Setup local

```bash
git clone https://github.com/CoioSpringer/pokemon-cards-mvp.git
cd pokemon-cards-mvp
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### Variáveis (`.env`)

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | SQLite, ex.: `file:./dev.db` |
| `AUTH_SECRET` | Segredo longo para assinar a sessão |

## Scripts npm

| Script | O que faz |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Gera Prisma Client + build de produção |
| `npm run start` | Sobe o build de produção |
| `npm run db:migrate` | Migrações Prisma |
| `npm run db:seed` | Popula usuários e anúncios de exemplo |
| `npm run db:push` | Empurra schema sem migration (dev rápido) |

## Contas demo (seed)

| E-mail | Senha |
|--------|-------|
| `demo@pokemon.local` | `demo1234` |
| `maria@pokemon.local` | `demo1234` |
| `joao@pokemon.local` | `demo1234` |

## O que funciona no MVP

1. Cadastro / login / logout
2. CRUD de portfólio (foto via URL ou placeholder)
3. Criar anúncios Have/Want (opcionalmente a partir do portfólio)
4. Feed com filtros: modo, nome, set, faixa de preço
5. Detalhe do anúncio
6. Chat 1:1 ligado ao anúncio (polling leve)

## Fora de escopo

Pagamentos, frete, leilões, grading, integração WhatsApp, apps nativos.

## Licença

Uso livre para o projeto do repositório.
