# Escoltran CRM — Manual de Deploy

## Índice

1. [Requisitos](#1-requisitos)
2. [Desenvolvimento Local](#2-desenvolvimento-local)
3. [Configuração do Banco de Dados](#3-configuração-do-banco-de-dados)
4. [Variáveis de Ambiente](#4-variáveis-de-ambiente)
5. [Deploy em Produção — EasyPanel + VPS](#5-deploy-em-produção--easypanel--vps)
6. [Deploy Alternativo — Docker Compose](#6-deploy-alternativo--docker-compose)
7. [Manutenção e Atualizações](#7-manutenção-e-atualizações)
8. [Checklist Final](#8-checklist-final)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Requisitos

### Localmente (Desenvolvimento)

| Ferramenta | Versão mínima |
|---|---|
| Node.js | 20.x |
| npm | 10.x |
| PostgreSQL | 14.x |
| Git | 2.x |

### Em Produção (VPS)

| Recurso | Mínimo recomendado |
|---|---|
| CPU | 2 vCPU |
| RAM | 2 GB |
| Disco | 20 GB SSD |
| OS | Ubuntu 22.04 LTS |
| Docker | 24.x |

---

## 2. Desenvolvimento Local

### 2.1 Clonar / Entrar no projeto

```bash
cd escoltran
```

### 2.2 Instalar dependências

```bash
npm install
```

### 2.3 Copiar e configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais locais (ver seção 4).

### 2.4 Configurar banco de dados local

**Opção A — PostgreSQL local instalado:**

```bash
# Criar banco
psql -U postgres -c "CREATE DATABASE escoltran_crm;"

# Rodar migrations
npm run db:migrate

# Popular banco com dados iniciais
npm run db:seed
```

**Opção B — PostgreSQL via Docker:**

```bash
docker run -d \
  --name escoltran-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=escoltran_crm \
  -p 5432:5432 \
  postgres:16-alpine
```

```bash
npm run db:migrate
npm run db:seed
```

### 2.5 Iniciar servidor de desenvolvimento

```bash
npm run dev
```

Acesse: **http://localhost:3000**

Credenciais de teste (após seed):
- Email: `admin@escoltran.com`
- Senha: `Admin@123`

### 2.6 Scripts disponíveis

```bash
npm run dev          # Servidor de desenvolvimento (Turbopack)
npm run build        # Build de produção
npm run start        # Iniciar servidor de produção (porta 3000)
npm run lint         # Lint com ESLint
npm run db:push      # Sincronizar schema sem migrations (dev rápido)
npm run db:migrate   # Criar e rodar migration
npm run db:seed      # Popular banco com dados iniciais
npm run db:studio    # Abrir Prisma Studio (GUI do banco)
```

---

## 3. Configuração do Banco de Dados

### 3.1 Estrutura das Migrations

As migrations ficam em `prisma/migrations/`. **Nunca edite manualmente** — use sempre os comandos Prisma.

```bash
# Criar nova migration após alterar schema.prisma
npx prisma migrate dev --name descricao_da_mudanca

# Ver status das migrations
npx prisma migrate status

# Em produção (sem criar arquivos de migration)
npx prisma migrate deploy
```

### 3.2 Prisma Studio (GUI)

```bash
npm run db:studio
```

Abre em **http://localhost:5555** — interface visual para visualizar e editar dados.

### 3.3 Backup do Banco

```bash
# Exportar
pg_dump -U postgres -d escoltran_crm > backup_$(date +%Y%m%d).sql

# Importar
psql -U postgres -d escoltran_crm < backup_20241201.sql
```

---

## 4. Variáveis de Ambiente

### 4.1 Arquivo `.env` (desenvolvimento)

```env
# ─────────────────────────────────────────
# BANCO DE DADOS
# ─────────────────────────────────────────
DATABASE_URL="postgresql://postgres:password@localhost:5432/escoltran_crm"

# ─────────────────────────────────────────
# AUTENTICAÇÃO (NextAuth.js)
# ─────────────────────────────────────────
# Gerar secret: openssl rand -base64 32
NEXTAUTH_SECRET="seu-secret-gerado-com-openssl"
NEXTAUTH_URL="http://localhost:3000"

# ─────────────────────────────────────────
# AMBIENTE
# ─────────────────────────────────────────
NODE_ENV="development"

# ─────────────────────────────────────────
# INTEGRAÇÕES (opcionais em dev)
# ─────────────────────────────────────────
N8N_WEBHOOK_URL=""
DISPARO_WEBHOOK_URL=""
DISPARO_CANCELAR_WEBHOOK_URL=""
DISPARO_STATUS_WEBHOOK_URL=""
OPENAI_API_KEY=""
```

### 4.2 Variáveis em Produção

| Variável | Valor / Observação |
|---|---|
| `DATABASE_URL` | `postgresql://user:pass@escoltran-postgres:5432/escoltran_crm` (host interno Docker) |
| `NEXTAUTH_SECRET` | Gerar com: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://crm.escoltran.com.br` (domínio real com https) |
| `NODE_ENV` | `production` |
| `N8N_WEBHOOK_URL` | URL base do N8N |
| `DISPARO_WEBHOOK_URL` | Webhook de disparo WhatsApp |
| `DISPARO_CANCELAR_WEBHOOK_URL` | Webhook de cancelamento |
| `DISPARO_STATUS_WEBHOOK_URL` | Webhook de status |
| `OPENAI_API_KEY` | Chave da OpenAI para agente IA |

> **Segurança:** Nunca commite o `.env` no Git. O `.gitignore` já exclui este arquivo.

---

## 5. Deploy em Produção — EasyPanel + VPS

### 5.1 Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────┐
│                   EasyPanel                      │
│                                                  │
│  ┌─────────────────────┐  ┌──────────────────┐  │
│  │   escoltran-crm     │  │ escoltran-postgres│  │
│  │  (App / Nixpacks)   │◄─►  (PostgreSQL 16) │  │
│  │  Next.js :3000      │  │  :5432            │  │
│  └─────────────────────┘  └──────────────────┘  │
│           │                                      │
│     SSL (Let's Encrypt)                          │
│     crm.escoltran.com.br                         │
└─────────────────────────────────────────────────┘
```

Os dois serviços comunicam-se pela **rede interna Docker** — o host do banco é o nome do serviço (`escoltran-postgres`), nunca `localhost`.

---

### 5.2 Passo 1 — Criar Serviço PostgreSQL

1. No EasyPanel, clique em **"Create Service"**
2. Selecione **PostgreSQL**
3. Configure:
   - **Service Name:** `escoltran-postgres`
   - **Database:** `escoltran_crm`
   - **Username:** `escoltran`
   - **Password:** `[senha forte, anote!]`
4. Habilite **Volume Persistente** para os dados
5. A porta `5432` fica exposta internamente (outros serviços no mesmo projeto acessam pelo nome)

> **Anote as credenciais** — serão usadas na `DATABASE_URL` do serviço app.

---

### 5.3 Passo 2 — Preparar Repositório Git

O projeto precisa estar em um repositório Git acessível (GitHub, GitLab ou Gitea).

```bash
# Inicializar repositório (caso não exista)
git init
git add .
git commit -m "feat: initial Escoltran CRM"

# Conectar ao GitHub
git remote add origin https://github.com/seu-usuario/escoltran-crm.git
git push -u origin main
```

> Certifique-se que o `nixpacks.toml` está na raiz do repositório.

---

### 5.4 Passo 3 — Criar Serviço App

1. No EasyPanel, clique em **"Create Service"**
2. Selecione **App**
3. Configure a **Source:**
   - Provider: GitHub / GitLab / Gitea
   - Repository: `seu-usuario/escoltran-crm`
   - Branch: `main`
4. **Build Method:** Nixpacks (detecção automática)
5. **Published Port:** `3000`
6. Ative **Auto Deploy** (rebuild automático a cada push)

---

### 5.5 Passo 4 — Configurar Variáveis de Ambiente

Na aba **"Environment"** do serviço App, adicione:

```
DATABASE_URL=postgresql://escoltran:SUA_SENHA@escoltran-postgres:5432/escoltran_crm
NEXTAUTH_SECRET=GERAR_COM_OPENSSL
NEXTAUTH_URL=https://crm.escoltran.com.br
NODE_ENV=production
```

Para gerar o `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

---

### 5.6 Passo 5 — Configurar Domínio e SSL

1. Na aba **"Domains"** do serviço App:
   - Adicione o domínio: `crm.escoltran.com.br`
   - Marque **"Generate SSL Certificate"** (Let's Encrypt)
2. No seu provedor DNS, crie um registro:
   ```
   Tipo: A
   Nome: crm
   Valor: IP_DO_SEU_VPS
   TTL: 300
   ```
3. Aguarde propagação DNS (geralmente 5–30 minutos)
4. O EasyPanel emitirá o certificado SSL automaticamente

---

### 5.7 Passo 6 — Primeiro Deploy

Clique em **"Deploy"** no serviço App. O Nixpacks executará:

```
[setup]    → Instala nodejs_20 + openssl
[install]  → npm ci
[build]    → npx prisma generate && npm run build
[start]    → npx prisma migrate deploy && npm run start
```

> `prisma migrate deploy` aplica automaticamente todas as migrations no primeiro start.

Acompanhe os logs em tempo real na aba **"Logs"** do EasyPanel.

---

### 5.8 Passo 7 — Validação Pós-Deploy

Após o deploy concluir, verifique:

```bash
# Via logs do EasyPanel, confirme:
✓ "Ready in Xms"
✓ "Listening on port 3000"

# Acesse o domínio e verifique:
https://crm.escoltran.com.br         → Redireciona para /auth
https://crm.escoltran.com.br/auth    → Tela de login Escoltran
```

---

## 6. Deploy Alternativo — Docker Compose

Para ambientes sem EasyPanel, use Docker Compose diretamente na VPS:

### 6.1 Arquivo `docker-compose.yml`

Crie na raiz do projeto:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: escoltran-postgres
    restart: always
    environment:
      POSTGRES_USER: escoltran
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: escoltran_crm
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - escoltran-network

  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: escoltran-app
    restart: always
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://escoltran:${POSTGRES_PASSWORD}@postgres:5432/escoltran_crm
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
      NODE_ENV: production
    depends_on:
      - postgres
    networks:
      - escoltran-network

volumes:
  postgres_data:

networks:
  escoltran-network:
    driver: bridge
```

### 6.2 Dockerfile

Crie na raiz do projeto:

```dockerfile
FROM node:20-alpine AS base
RUN apk add --no-cache openssl

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
```

> Para usar `output: 'standalone'`, adicione ao `next.config.ts`:
> ```ts
> output: 'standalone'
> ```

### 6.3 Subir com Docker Compose

```bash
# Criar arquivo de secrets
cat > .env.production << EOF
POSTGRES_PASSWORD=senha_forte_aqui
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=https://crm.escoltran.com.br
EOF

# Subir os serviços
docker compose --env-file .env.production up -d

# Ver logs
docker compose logs -f app

# Parar
docker compose down
```

---

## 7. Manutenção e Atualizações

### 7.1 Atualizar a Aplicação

**Via EasyPanel (recomendado):**
```bash
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
# → Auto-deploy dispara automaticamente
```

**Via Docker Compose:**
```bash
git pull origin main
docker compose build app
docker compose up -d app
```

### 7.2 Migrations em Produção

As migrations são aplicadas automaticamente no start via `prisma migrate deploy`.

Para criar uma nova migration:
```bash
# Em desenvolvimento
npx prisma migrate dev --name nome_da_migration

# Commit as migrations junto com o código
git add prisma/migrations
git commit -m "db: add migration nome_da_migration"
git push origin main
```

### 7.3 Backup Automatizado

Configure um cron job na VPS para backup diário:

```bash
# Editar crontab
crontab -e

# Adicionar linha (backup diário às 2h da manhã)
0 2 * * * docker exec escoltran-postgres pg_dump -U escoltran escoltran_crm | gzip > /backups/escoltran_$(date +\%Y\%m\%d).sql.gz

# Criar diretório de backups
mkdir -p /backups
```

### 7.4 Rollback

**Via EasyPanel:**
- Aba **"Deployments"** → selecione versão anterior → **"Redeploy"**

**Via Docker:**
```bash
# Ver imagens disponíveis
docker images escoltran-app

# Revertir para versão anterior
docker tag escoltran-app:previous escoltran-app:latest
docker compose up -d app
```

---

## 8. Checklist Final

### Pré-Deploy
- [ ] `nixpacks.toml` na raiz com `openssl` nos `nixPkgs`
- [ ] Migrations commitadas no repo (`prisma/migrations/`)
- [ ] `.env` **não** commitado no Git (verificar `.gitignore`)
- [ ] `NEXTAUTH_SECRET` gerado com `openssl rand -base64 32`

### Configuração EasyPanel
- [ ] Serviço PostgreSQL criado com nome `escoltran-postgres`
- [ ] Volume persistente habilitado no PostgreSQL
- [ ] `DATABASE_URL` apontando para host interno (nome do serviço)
- [ ] `NEXTAUTH_URL` com domínio real (`https://`)
- [ ] Todas as variáveis de ambiente configuradas

### DNS e SSL
- [ ] Registro DNS tipo A apontando para IP da VPS
- [ ] Certificado SSL emitido pelo Let's Encrypt
- [ ] HTTPS funcionando no domínio

### Pós-Deploy
- [ ] Logs verificados — app respondendo na porta 3000
- [ ] Migrations aplicadas com sucesso (`migrate deploy`)
- [ ] Login funcionando (`/auth`)
- [ ] Dashboard carregando (`/dashboard`)
- [ ] Backup periódico configurado

---

## 9. Troubleshooting

### Erro: `prisma generate` falha no build

**Causa:** OpenSSL não disponível no ambiente Nix.

**Solução:** Verificar `nixpacks.toml`:
```toml
[phases.setup]
nixPkgs = ["nodejs_20", "openssl"]
```

---

### Erro: `Cannot connect to database`

**Causa:** `DATABASE_URL` incorreta ou banco inacessível.

**Verificações:**
```bash
# Testar conexão manualmente
psql "postgresql://user:pass@host:5432/database"

# Em Docker, verificar se os serviços estão na mesma rede
docker network ls
docker inspect escoltran-network
```

> Em Docker/EasyPanel, o host deve ser o **nome do container/serviço**, não `localhost`.

---

### Erro: `NEXTAUTH_SECRET` missing

**Causa:** Variável não configurada em produção.

**Solução:**
```bash
openssl rand -base64 32
# Copiar o resultado e adicionar em NEXTAUTH_SECRET
```

---

### Erro: `Module not found` no build

**Causa:** Dependência não instalada ou import incorreto.

**Solução:**
```bash
npm install
npm run build 2>&1 | grep "Module not found"
```

---

### Porta 3000 já em uso

**Causa:** Outro processo usando a porta.

**Solução:**
```bash
# Verificar qual processo usa a porta
lsof -i :3000
# ou
ss -tlnp | grep 3000

# Matar o processo
kill -9 <PID>

# Ou usar outra porta
PORT=3001 npm run dev
```

---

### Prisma Studio não conecta

**Causa:** `DATABASE_URL` não configurada no `.env`.

**Solução:**
```bash
# Verificar variável
echo $DATABASE_URL

# Executar com variável explícita
DATABASE_URL="postgresql://..." npx prisma studio
```

---

## Estrutura do Projeto

```
escoltran/
├── app/
│   ├── (app)/                    # Rotas protegidas
│   │   ├── dashboard/            # Dashboard principal
│   │   ├── pipeline/             # Kanban CRM
│   │   ├── contacts/             # Gestão de contatos
│   │   ├── lead-search/          # Busca de leads
│   │   ├── listas-disparo/       # Listas WhatsApp
│   │   ├── activities/           # Atividades
│   │   ├── utm-analytics/        # Analytics UTM
│   │   ├── ai-insights/          # Agente IA
│   │   ├── settings/             # Configurações
│   │   └── layout.tsx            # Layout com sidebar
│   ├── api/                      # Route Handlers
│   │   ├── auth/                 # NextAuth
│   │   ├── contacts/             # CRUD contatos
│   │   ├── deals/                # CRUD deals
│   │   ├── activities/           # CRUD atividades
│   │   ├── dashboard/metrics/    # Métricas
│   │   ├── webhooks/             # Webhooks inbound
│   │   └── ai/                   # Endpoints IA
│   ├── auth/                     # Página de login/cadastro
│   ├── globals.css               # Estilos globais + tema Escoltran
│   └── layout.tsx                # Root layout
├── components/
│   ├── layout/                   # AppSidebar, TopBar, GlobalSearch
│   ├── pipeline/                 # KanbanBoard, DealCard, DealDetailSheet
│   ├── providers/                # ReactQueryProvider
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── auth.ts                   # NextAuth config + getTeamUserIds
│   ├── prisma.ts                 # Prisma singleton
│   └── utils.ts                  # Utilitários
├── prisma/
│   ├── schema.prisma             # Schema completo
│   ├── migrations/               # Histórico de migrations
│   └── seed.ts                   # Dados iniciais
├── middleware.ts                 # Proteção de rotas
├── nixpacks.toml                 # Config deploy EasyPanel
├── .env                          # Variáveis locais (não commitado)
├── .env.example                  # Template de variáveis
└── DEPLOY.md                     # Este manual
```

---

*Escoltran CRM — Documentação de Deploy*
*Versão 1.0 — Next.js 16 + PostgreSQL + Prisma + NextAuth*
