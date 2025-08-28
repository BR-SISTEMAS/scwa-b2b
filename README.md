# Support Chat B2B (Brasil)

Sistema de chat de suporte B2B multi-tenant com fila de atendimento, transferências, histórico exportável e conformidade LGPD.

## Stack Tecnológico

- **Frontend**: Next.js (React) + shadcn/ui + Tailwind CSS
- **Backend**: NestJS (Node.js) + Socket.IO  
- **Database**: PostgreSQL com Prisma ORM
- **Real-time**: Socket.IO
- **Testes**: Playwright (E2E) + Jest (unit)
- **CI/CD**: GitHub Actions
- **Container**: Docker / docker-compose

## Como eu (Agente) Opero

Sigo rigorosamente o arquivo `project-manual.xml` que contém todas as definições de tarefas, sprints e convenções. Utilizo os seguintes MCPs:

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

## Comandos de Desenvolvimento

```bash
# Frontend
cd frontend && npm run dev

# Backend  
cd backend && npm run start:dev

# Database
npx prisma migrate dev --preview-feature
node ./database/seed/seed.js

# Build
npm run build --prefix frontend
npm run build --prefix backend

# Docker
docker compose up --build

# Testes
npx playwright test --project=chromium
```

## Estrutura de Sprints

### Sprint S0 - Repository init & infrastructure ✅ Em Progresso
Inicialização do repositório, configuração de MCPs, README draft, workflows e CI baseline.

### Sprint S1 - Backend foundation  
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
  - `.env.example`, `docker-compose.yml`, `/ops/warp.yaml` (próximos passos)
- **Validação**: Estrutura de pastas criada, MCPs configurados no Warp
- **Notas**: Repositório inicializado com estrutura base conforme project-manual.xml
