

#### [S2][T2.001] - Frontend scaffold and theme tokens
- Status: ✅ Concluído
- Data: 2025-08-28
- Branch: sprint/S2_task_T2.001-nextjs-scaffold-fix1
- Commit: 92f91d4
- PR (pendente abrir via MCP): https://github.com/BR-SISTEMAS/scwa-b2b/pull/new/sprint/S2_task_T2.001-nextjs-scaffold-fix1
- Arquivos principais:
  - frontend/package.json, tsconfig.json, next.config.ts, postcss.config.mjs
  - frontend/src/app/(layout.tsx, page.tsx, globals.css, favicon.ico)
  - frontend/src/styles/theme_T2.001.ts
- Validação: build Next 15.5.2 (Turbopack) OK
- Notas: instalação direta de shadcn/ui via npm falhou (workspace:*). Ação planejada: `npx shadcn@latest init` na T2.002 com flags não-interativas.
