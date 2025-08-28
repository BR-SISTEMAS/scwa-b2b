import { test, expect } from "@playwright/test";

// Teste básico de presença do formulário de login do cliente e do atendente.
// Pré-requisitos: servidor Next em dev (npm run dev --prefix frontend)
// Dica: configure BASE_URL via env (PLAYWRIGHT_BASE_URL) ou ajuste abaixo.

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("Login pages (T2.002)", () => {
  test("cliente: exibe formulário", async ({ page }) => {
    await page.goto(`${BASE_URL}/login/client`);
    await expect(page.getByRole("heading", { name: /login do cliente/i })).toBeVisible();
    await expect(page.getByLabel(/e-mail/i)).toBeVisible();
    await expect(page.getByLabel(/senha/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /entrar/i })).toBeVisible();
  });

  test("agente: exibe formulário", async ({ page }) => {
    await page.goto(`${BASE_URL}/login/agent`);
    await expect(page.getByRole("heading", { name: /login do atendente/i })).toBeVisible();
    await expect(page.getByLabel(/e-mail/i)).toBeVisible();
    await expect(page.getByLabel(/senha/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /entrar/i })).toBeVisible();
  });
});

