# Pull Request Review Process

## Overview
Todos os Pull Requests neste repositório passam por um processo automatizado de revisão para garantir qualidade, segurança e conformidade com os padrões do projeto.

## Processo Automático

### 1. Abertura do PR
Quando um PR é aberto, os seguintes processos são iniciados automaticamente:

#### a) Copilot Review (Imediato)
- GitHub Copilot analisa o código automaticamente
- Comentários são adicionados sobre:
  - Problemas de segurança
  - Code smells
  - Sugestões de melhorias
  - Conformidade com best practices

#### b) CI/CD Pipeline (Imediato)
- **Linting**: ESLint e Prettier
- **Type checking**: TypeScript compilation
- **Tests**: Jest (unit) e Playwright (E2E)
- **Build**: Verificação de build de produção
- **Security**: Trivy scan para vulnerabilidades

### 2. Status Checks
Para um PR ser elegível para merge, deve ter:
- ✅ Copilot review sem issues críticas
- ✅ Todos os checks do CI passando
- ✅ Sem conflitos com a branch principal
- ✅ Conformidade com convenções de nomenclatura

## Convenções do Projeto

### Nomenclatura
- **Branch**: `sprint/S{N}_task_T{N}.{NNN}-{description}`
- **PR Title**: `PR: S{N} - T{N}.{NNN} - {description}`
- **Files**: Todos os arquivos devem incluir sufixo `_T{N}.{NNN}`

### Commit Messages
```
[S{N}][T{N}.{NNN}] - Descrição breve

- Detalhes da implementação
- Mudanças realizadas
- Notas importantes
```

## Processo Manual (Opcional)

### Solicitar Review Adicional
Para solicitar uma nova revisão do Copilot após mudanças:
```
@copilot review
```

### Merge Criteria
PRs podem ser mergeados quando:
1. Todos os checks automáticos passarem
2. Copilot não reportar issues críticas
3. Código segue as convenções do projeto
4. README foi atualizado com log da tarefa

## Auto-merge
PRs com label `auto-merge` serão automaticamente mergeados quando todos os checks passarem.

## Rollback
Em caso de problemas após merge:
1. Criar PR de revert imediatamente
2. Documentar o problema no PR original
3. Aplicar fixes em nova branch

## LGPD Compliance
Para features que lidam com dados pessoais:
- [ ] Dados pessoais são criptografados
- [ ] Logs de auditoria implementados
- [ ] Política de retenção aplicada
- [ ] Direito ao esquecimento garantido

## Contato
Para dúvidas sobre o processo, abra uma issue com label `question`.
