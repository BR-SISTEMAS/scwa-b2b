# Support Chat B2B (Brasil)

Sistema de chat de suporte B2B multi-tenant com fila de atendimento, transferências, histórico exportável e conformidade LGPD.

📋 **Documentação Técnica Completa**: Ver arquivo `project-manual.xml` para especificações detalhadas de tarefas, sprints e arquitetura.

## Stack Tecnológico

- **Frontend**: Next.js (React) + shadcn/ui + Tailwind CSS
- **Backend**: NestJS (Node.js) + Socket.IO  
- **Database**: PostgreSQL com Prisma ORM
- **Real-time**: Socket.IO
- **Testes**: Playwright (E2E) + Jest (unit)
- **CI/CD**: GitHub Actions
- **Container**: Docker / docker-compose

## Como eu (Agente) Opero

Sigo rigorosamente o arquivo `project-manual.xml` que contém todas as definições de tarefas, sprints e convenções. Meu fluxo de trabalho segue 10 passos definidos:

### Rotina de Execução de Tarefas
1. **Identificar tarefa** - Leio README.md e manual-xml para determinar próxima tarefa pendente
2. **Criar pasta da tarefa** - Crio `/tasks/T{S}.{NNN}/` com arquivo de rastreamento
3. **Consultar documentação** - Uso context7 MCP quando detalhes de implementação não são claros
4. **Implementar** - Crio/modifico arquivos sempre com sufixo TaskID
5. **Validar localmente** - Executo linters, testes unitários e build
6. **Validar E2E** - Executo testes Playwright relevantes via MCP
7. **Logs de auditoria** - Registro ações no sistema de auditoria
8. **Git commit** - Crio branch, faço commit seguindo convenção
9. **Atualizar README** - Adiciono resumo da tarefa completa
10. **Notas finais** - Registro bibliotecas novas ou considerações especiais

### MCPs Utilizados
1. **filesystem**: Para validar/listar arquivos antes de edições
2. **context7**: Para consultar uso de bibliotecas e melhores práticas
3. **playwright**: Para executar testes E2E após implementações
4. **github**: Para commits, branches e PRs
5. **manual-xml**: Para ler definições de tarefas

## Convenções do Projeto

### Nomenclatura de Arquivos
- Todos os arquivos criados/modificados incluem sufixo do TaskID: `arquivo_T{S}.{NNN}.ext`
- Exemplo: `/frontend/src/pages/chat_T3.003.tsx`

### Branches e Commits
- **Branch**: `sprint/S{S}_task_T{S}.{NNN}-{short-desc}`
- **Commit**: `[S{S}][T{S}.{NNN}] - descrição`
- **PR**: `PR: S{S} - T{S}.{NNN} - descrição`

### Estrutura de Tarefas
Para cada tarefa, crio `/tasks/T{S}.{NNN}/` contendo:
- `created_files.txt` - Lista de arquivos criados
- `changes.diff` - Alterações realizadas (se houver)
- `run_logs.txt` - Logs de execução
- `test_results.xml` - Resultados dos testes

## Variáveis de Ambiente

Ver arquivo `.env.example` para configuração completa. Principais:
- `DATABASE_URL` - String de conexão PostgreSQL
- `JWT_SECRET` - Assinatura de tokens de autenticação
- `SOCKET_PORT` - Porta do servidor WebSocket
- `S3_BUCKET` - Configuração de armazenamento de arquivos
- `SMTP_HOST` - Serviço de email para exportações
- `RETENTION_DAYS` - Período de retenção LGPD

## Guia de Contribuição

### Fluxo de Desenvolvimento
1. Consulte `project-manual.xml` para a próxima tarefa
2. Crie branch seguindo padrão: `sprint/S{S}_task_T{S}.{NNN}-{desc}`
3. Implemente seguindo convenções de nomenclatura (sufixo TaskID)
4. Execute testes locais antes de commitar
5. Faça commit com mensagem padrão: `[S{S}][T{S}.{NNN}] - descrição`
6. Abra PR seguindo formato: `PR: S{S} - T{S}.{NNN} - descrição`

### Padrões de Código
- TypeScript para frontend e backend
- ESLint + Prettier para formatação
- Testes obrigatórios (cobertura mínima 70% backend)
- Documentação inline para funções complexas
- Interfaces tipadas para todas as APIs

## Comandos de Desenvolvimento

```bash
# === DESENVOLVIMENTO LOCAL ===
# Frontend
cd frontend && npm run dev

# Backend  
cd backend && npm run start:dev

# === DATABASE ===
# Criar migration
cd backend && npx prisma migrate dev --name nome_da_migration

# Aplicar migrations
npx prisma migrate dev --preview-feature

# Seed database
node ./database/seed/seed.js

# Abrir Prisma Studio
cd backend && npx prisma studio

# === BUILD & DEPLOY ===
# Build local
npm run build --prefix frontend
npm run build --prefix backend

# Docker desenvolvimento
docker compose up postgres redis minio -d

# Docker completo (com app)
docker compose --profile app up --build

# Docker produção
docker compose --profile production up --build

# === TESTES ===
# Testes unitários
npm test --prefix backend
npm test --prefix frontend

# Testes E2E
npx playwright test --project=chromium

# Testes com UI
npx playwright test --ui

# === UTILIDADES ===
# Limpar e reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Verificar vulnerabilidades
npm audit

# Atualizar dependências
npm update
```

## Estrutura de Sprints

### Sprint S0 - Repository init & infrastructure ✅ COMPLETO
Inicialização do repositório, configuração de MCPs, README draft, workflows e CI baseline.

### Sprint S1 - Backend foundation 🔨 Em Progresso
Scaffold NestJS, Prisma, conexão DB, autenticação básica e modelo de usuário.

### Sprint S2 - Frontend foundation
Scaffold Next.js, configurar shadcn/ui, fluxos de autenticação.

### Sprint S3 - Chat core & realtime
Ciclo de vida do chat: fila, atribuição, transferência, persistência de mensagens.

### Sprint S4 - Agent flows & manager panel
Fluxos de agente, dashboard de gerente, métricas, interceptação de conversas.

### Sprint S5 - History, export & LGPD
Histórico completo, exportações (PDF/XML), avaliação, conformidade LGPD.

### Sprint S6 - Hardening & production readiness
Hardening de segurança, SAST, auditoria de dependências, imagens Docker de produção.

---

## Log de Tarefas Executadas

### Sprint S0

#### [S0][T0.001] - Repository skeleton and MCP registrations
- **Status**: ✅ Concluído
- **Data**: 2025-08-28  
- **Arquivos criados**:
  - Estrutura completa de diretórios
  - `/README.md` (este arquivo)
  - `/tasks/T0.001/created_files.txt`
  - `.env.example`, `docker-compose.yml`, `/ops/warp.yaml`
- **Validação**: Estrutura de pastas criada, MCPs configurados no Warp
- **Notas**: Repositório inicializado com estrutura base conforme project-manual.xml
- **Commit**: d17c849

#### [S0][T0.002] - README initial and manual-xml
- **Status**: ✅ Concluído  
- **Data**: 2025-08-28
- **Arquivos modificados**:
  - `/README.md` - Aprimorado com guia de contribuição, comandos detalhados e rotina de 10 passos
- **Arquivos verificados**:
  - `project-manual.xml` - Confirmado na raiz do projeto
- **Validação**: Documentação completa e acessível
- **Notas**: README agora inclui seção detalhada "Como eu opero" e guia completo de contribuição
- **Commit**: ad1a8c2

#### [S0][T0.003] - Ops workflows, docker-compose and CI baseline
- **Status**: ✅ Concluído
- **Data**: 2025-08-28
- **Arquivos criados**:
  - `/.github/workflows/ci.yml` - Pipeline CI completo com lint, build, testes, segurança
  - `/package.json` - Scripts globais do projeto e configuração de workspaces
- **Arquivos verificados**:
  - `/ops/warp.yaml` - Workflows do Warp (criado em T0.001)
  - `/docker-compose.yml` - Orquestração Docker (criado em T0.001)
- **Validação**: CI configurado com suporte futuro para projetos não implementados
- **Notas**: Pipeline inclui segurança (Trivy), path filtering, e serviços de teste

---

### 🎉 Sprint S0 Concluído!

Todas as tarefas de infraestrutura foram completadas com sucesso:
- ✅ Estrutura do repositório criada
- ✅ Documentação completa
- ✅ CI/CD configurado
- ✅ Docker e workflows prontos

**Próximo Sprint**: S1 - Backend foundation (NestJS, Prisma, Auth)

---

### Sprint S1

#### [S1][T1.001] - Scaffold NestJS app
- **Status**: ✅ Concluído
- **Data**: 2025-08-28
- **Arquivos criados**:
  - Backend scaffolded com NestJS CLI
  - 14 arquivos base do NestJS
  - 9 pastas de módulos: users, auth, chats, tickets, metrics, companies, audit, export, privacy
- **MCPs utilizados**:
  - context7: Consulta de documentação NestJS (/nestjs/docs.nestjs.com)
  - filesystem: Validação de arquivos
- **Validação**: Projeto NestJS criado com sucesso, TypeScript configurado
- **Notas**: ESLint, Prettier e Jest pré-configurados pelo NestJS CLI

#### [S1][T1.002] - Prisma & DB connection
- **Status**: ✅ Concluído
- **Data**: 2025-08-28
- **Arquivos criados/modificados**:
  - `/database/schema_T1.002.prisma` com todos os modelos (companies, users, conversations, messages, tickets, evaluations, audit_logs, metrics_cache)
  - `/backend/src/prisma/prisma.service_T1.002.ts` e `/backend/src/prisma/prisma.module_T1.002.ts`
  - `/backend/src/app.module.ts` atualizado para importar PrismaModule
  - `/backend/prisma/schema.prisma` apontando para o schema do projeto
  - `/backend/.env` atualizado com DATABASE_URL local
- **Validação**: `npx prisma generate` OK; schema válido
- **Notas**: PostgreSQL como provider; JSONB para conteúdos/metadata; índices adicionados

#### [S1][T1.003] - Auth and roles implemented
- **Status**: ✅ Concluído
- **Data**: 2025-08-28
- **Arquivos criados**:
  - `/backend/src/modules/auth/auth.module_T1.003.ts` - AuthModule com configuração JWT
  - `/backend/src/modules/auth/jwt.strategy_T1.003.ts` - JWT Passport Strategy
  - `/backend/src/modules/auth/local.strategy_T1.003.ts` - Local Passport Strategy
- **Dependências instaladas**:
  - @nestjs/jwt, @nestjs/passport, passport, passport-local, passport-jwt, bcrypt
  - @types/bcrypt, @types/passport-local, @types/passport-jwt (dev)
- **Validação**: Build OK, teste unitário OK
- **Notas**: Strategies scaffolded; AuthService e password hashing a serem expandidos em T1.004
- **Commit**: e6a82e6

#### [S1][T1.004] - Users and companies CRUD
- **Status**: ✅ Concluído
- **Data**: 2025-08-28
- **Arquivos criados**: (11 arquivos total)
  - **Auth Service**:
    - `/backend/src/modules/auth/auth.service_T1.004.ts` - AuthService completo com hash bcrypt
  - **Users Module**:
    - `/backend/src/modules/users/users.service_T1.004.ts` - CRUD completo com paginação e filtros
    - `/backend/src/modules/users/users.controller_T1.004.ts` - REST endpoints
    - `/backend/src/modules/users/users.module_T1.004.ts` - Module configuration
    - `/backend/src/modules/users/dto/create-user.dto_T1.004.ts` - DTO com validação
    - `/backend/src/modules/users/dto/update-user.dto_T1.004.ts` - DTO parcial
  - **Companies Module**:
    - `/backend/src/modules/companies/companies.service_T1.004.ts` - CRUD com estatísticas
    - `/backend/src/modules/companies/companies.controller_T1.004.ts` - REST endpoints
    - `/backend/src/modules/companies/companies.module_T1.004.ts` - Module configuration
    - `/backend/src/modules/companies/dto/create-company.dto_T1.004.ts` - DTO com validação CNPJ
    - `/backend/src/modules/companies/dto/update-company.dto_T1.004.ts` - DTO parcial
- **Dependências instaladas**:
  - class-validator, class-transformer, @nestjs/mapped-types
- **Funcionalidades implementadas**:
  - CRUD completo para Users e Companies
  - Hash de senha com bcrypt (10 salt rounds)
  - Validação de dados com class-validator
  - Paginação e filtros em listagens
  - Estatísticas por empresa
  - Proteção contra exclusão de empresas com dependências
  - Busca por email (users) e CNPJ (companies)
- **Validação**: Build OK, teste unitário OK
- **MCPs utilizados**: context7 (consulta Prisma/NestJS best practices)
- **Notas**: LGPD compliance: soft delete preparado para implementação futura
- **Commit**: c2896fc
