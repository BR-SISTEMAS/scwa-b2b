# Como Habilitar GitHub Copilot Review no Repositório

## Problema
O GitHub Copilot não está revisando automaticamente os PRs mesmo com o workflow configurado e o comando `@copilot review` sendo adicionado nos comentários.

## Solução

### Para Administradores do Repositório:

1. **Acesse as configurações do repositório**
   - Vá para https://github.com/BR-SISTEMAS/scwa-b2b/settings

2. **Configure o GitHub Copilot**
   - No menu lateral, procure por "Code security and analysis" ou "Copilot"
   - Habilite "GitHub Copilot for pull requests"

3. **Verifique as permissões da organização**
   - Acesse https://github.com/organizations/BR-SISTEMAS/settings/copilot
   - Certifique-se de que o Copilot está habilitado para a organização
   - Verifique se o repositório `scwa-b2b` tem permissão para usar o Copilot

4. **Configure o Copilot App (se necessário)**
   - Instale o GitHub Copilot app: https://github.com/apps/github-copilot
   - Dê permissões para o repositório `BR-SISTEMAS/scwa-b2b`

### Para Desenvolvedores:

Uma vez configurado pelos admins, você pode solicitar reviews do Copilot de duas formas:

1. **Via comentário no PR**:
   ```
   @copilot review
   ```

2. **Via GitHub Actions** (já configurado):
   - O workflow `.github/workflows/copilot-review.yml` solicita automaticamente review em novos PRs

### Verificação

Para verificar se está funcionando:
1. Abra um PR
2. Adicione um comentário com `@copilot review`
3. O Copilot deve responder em alguns segundos com uma análise do código

### Troubleshooting

Se o Copilot não responder:
- Verifique se você tem uma licença ativa do GitHub Copilot
- Confirme que a organização tem Copilot habilitado
- Verifique os logs do GitHub Actions para erros
- Tente mencionar `@github-copilot` ao invés de apenas `@copilot`

### Alternativas

Se o Copilot não estiver disponível, considere:
- Code review manual entre membros da equipe
- Ferramentas de análise estática (ESLint, SonarQube)
- GitHub Code Scanning com CodeQL
- Revisar com ChatGPT/Claude copiando o diff do PR

## Status Atual
- Workflow configurado: ✅
- Copilot habilitado no repo: ❌ (necessita ação do admin)
- Auto-merge configurado: ✅
- Label auto-merge aplicada: ✅
