

#### [S2][T2.002] - Login pages (client & agent)
- Status: ✅ Concluído (UI e build)
- Data: 2025-08-28
- Branch: sprint/S2_task_T2.002-login-pages
- Commit: 3a4624f
- PR (pendente abrir via MCP): https://github.com/BR-SISTEMAS/scwa-b2b/pull/new/sprint/S2_task_T2.002-login-pages
- Arquivos principais:
  - frontend/src/components/AuthForm_T2.002.tsx
  - frontend/src/app/login/client/page.tsx
  - frontend/src/app/login/agent/page.tsx
  - ops/tests/playwright/login_T2.002.spec.ts
- Validação: build Next OK; E2E a executar via Playwright quando servidor estiver rodando
- Notas: form envia POST para ${NEXT_PUBLIC_API_BASE_URL}/api/auth/login; redireciona para /chat (cliente) e /agent/queue (agente)
