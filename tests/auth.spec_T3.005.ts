import { test, expect } from '@playwright/test';

/**
 * Testes E2E de Autenticação - Task T3.005
 * Valida login de cliente e atendente
 */

test.describe('Autenticação', () => {
  test.beforeEach(async ({ page }) => {
    // Garantir que começamos deslogados
    await page.context().clearCookies();
  });

  test('deve fazer login como cliente', async ({ page }) => {
    await page.goto('/login/client');
    
    // Verificar se a página carregou
    await expect(page.locator('h1')).toContainText('Login do Cliente');
    
    // Preencher formulário
    await page.fill('input[type="email"]', 'cliente@teste.com');
    await page.fill('input[type="password"]', 'senha123');
    
    // Submeter
    await page.click('button[type="submit"]');
    
    // Aguardar redirecionamento
    await page.waitForURL('/chat', { timeout: 10000 });
    
    // Verificar se chegou na página do chat
    const url = page.url();
    expect(url).toContain('/chat');
  });

  test('deve fazer login como atendente', async ({ page }) => {
    await page.goto('/login/agent');
    
    // Verificar se a página carregou
    await expect(page.locator('h1')).toContainText('Login do Atendente');
    
    // Preencher formulário
    await page.fill('input[type="email"]', 'atendente@teste.com');
    await page.fill('input[type="password"]', 'senha123');
    
    // Submeter
    await page.click('button[type="submit"]');
    
    // Aguardar redirecionamento
    await page.waitForURL('/agent/queue', { timeout: 10000 });
    
    // Verificar se chegou na página de fila
    const url = page.url();
    expect(url).toContain('/agent/queue');
  });

  test('deve mostrar erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/login/client');
    
    // Preencher com credenciais erradas
    await page.fill('input[type="email"]', 'invalido@teste.com');
    await page.fill('input[type="password"]', 'senhaerrada');
    
    // Submeter
    await page.click('button[type="submit"]');
    
    // Aguardar mensagem de erro
    const errorMessage = page.locator('[role="alert"]');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    await expect(errorMessage).toContainText('Invalid credentials');
  });

  test('deve validar campos obrigatórios', async ({ page }) => {
    await page.goto('/login/client');
    
    // Tentar submeter sem preencher
    await page.click('button[type="submit"]');
    
    // Verificar validação HTML5
    const emailInput = page.locator('input[type="email"]');
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBe(true);
  });

  test('deve mostrar indicador de carregamento', async ({ page }) => {
    await page.goto('/login/agent');
    
    // Preencher formulário
    await page.fill('input[type="email"]', 'atendente@teste.com');
    await page.fill('input[type="password"]', 'senha123');
    
    // Interceptar requisição para simular delay
    await page.route('**/api/auth/login', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });
    
    // Clicar e verificar loading
    await page.click('button[type="submit"]');
    
    const button = page.locator('button[type="submit"]');
    await expect(button).toContainText('Entrando...');
    await expect(button).toBeDisabled();
  });

  test('deve impedir login de cliente como atendente', async ({ page }) => {
    await page.goto('/login/agent');
    
    // Tentar logar com credenciais de cliente
    await page.fill('input[type="email"]', 'cliente@teste.com');
    await page.fill('input[type="password"]', 'senha123');
    
    await page.click('button[type="submit"]');
    
    // Deve mostrar erro
    const errorMessage = page.locator('[role="alert"]');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    await expect(errorMessage).toContainText('Invalid user type');
  });
});
