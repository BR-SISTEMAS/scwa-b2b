# Agent Rules - Regras Obrigatórias para o Agente

## Uso Obrigatório dos MCPs

### 1. SEMPRE usar filesystem MCP para ler e editar código
- **REGRA**: Antes de editar qualquer arquivo, SEMPRE use `read_files` para ler o conteúdo atual
- **REGRA**: Use `find_files` para descobrir estrutura de diretórios e arquivos existentes
- **REGRA**: Use `edit_files` para fazer alterações, nunca assuma o conteúdo dos arquivos
- **Exemplo**: 
  ```
  1. find_files para localizar arquivos
  2. read_files para ler conteúdo atual
  3. edit_files para aplicar mudanças
  ```

### 2. SEMPRE usar context7 MCP para documentação
- **REGRA**: Consulte context7 para qualquer uso de biblioteca incerto
- **REGRA**: Verifique melhores práticas e APIs antes de implementar
- **REGRA**: Use para descobrir versões atualizadas e métodos corretos
- **Contextos disponíveis**:
  - `/nestjs/docs.nestjs.com` - Documentação NestJS
  - `/prisma/www.prisma.io` - Documentação Prisma
  - `/nextjs/nextjs.org` - Documentação Next.js
  - `/mariadb/mariadb.com` - Documentação MariaDB

### 3. SEMPRE usar github MCP para versionamento
- **REGRA**: Use comandos git através do github MCP quando disponível
- **REGRA**: Crie branches seguindo a convenção: `sprint/S{S}_task_T{S}.{NNN}-{short-desc}`
- **REGRA**: Commits devem seguir formato: `[S{S}][T{S}.{NNN}] - descrição`
- **REGRA**: Sempre faça push das alterações para o repositório remoto

### 4. SEMPRE usar manual-xml MCP
- **REGRA**: Leia o project-manual.xml antes de iniciar qualquer tarefa
- **REGRA**: Siga estritamente as convenções definidas no manual
- **REGRA**: Use as definições de tarefas como guia de implementação

### 5. SEMPRE usar playwright MCP para testes E2E
- **REGRA**: Execute testes E2E após implementações de frontend
- **REGRA**: Documente resultados em `/tasks/{TaskID}/test_results.xml`
- **REGRA**: Valide fluxos críticos antes de fazer commit

## Workflow Obrigatório

### Para cada tarefa:
1. **LEIA** project-manual.xml usando manual-xml MCP
2. **CONSULTE** context7 MCP para documentação das bibliotecas
3. **USE** filesystem MCP para ler código existente
4. **EDITE** arquivos usando filesystem MCP (edit_files)
5. **VALIDE** com testes locais e playwright MCP
6. **COMMITE** usando github MCP ou run_command
7. **DOCUMENTE** no README.md e /tasks/{TaskID}/

## Convenções de Nomenclatura

### Arquivos
- Todos os arquivos criados/modificados DEVEM incluir sufixo TaskID
- Formato: `arquivo_T{S}.{NNN}.ext`
- Exemplo: `/backend/src/services/chat_T3.001.ts`

### Branches
- Formato: `sprint/S{S}_task_T{S}.{NNN}-{short-desc}`
- Exemplo: `sprint/S3_task_T3.001-conversation-queue`

### Commits
- Formato: `[S{S}][T{S}.{NNN}] - descrição`
- Exemplo: `[S3][T3.001] - Implementar fila de conversas`

## Stack Atualizada

### Database
- **ENGINE**: MariaDB (não PostgreSQL)
- **ORM**: Prisma com provider mysql
- **Connection**: Usar mysql:// no DATABASE_URL

### Backend
- **Framework**: NestJS
- **Realtime**: Socket.IO
- **Auth**: JWT com bcrypt

### Frontend
- **Framework**: Next.js com App Router
- **UI**: shadcn/ui + Tailwind CSS
- **State**: React hooks + Context API

## Notas Importantes

1. **MariaDB**: O projeto usa MariaDB, não PostgreSQL. Sempre configure:
   - Prisma provider como "mysql"
   - DATABASE_URL com mysql://
   - docker-compose com imagem mariadb

2. **Rastreabilidade**: Sempre crie `/tasks/T{S}.{NNN}/` com:
   - created_files.txt
   - changes.diff
   - run_logs.txt
   - test_results.xml

3. **Validação**: Sempre execute antes de commitar:
   - `npm run lint`
   - `npm run build`
   - `npm test`

4. **Documentação**: Sempre atualize README.md após completar tarefa
