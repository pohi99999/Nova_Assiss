import { test, expect } from '@playwright/test';

test.describe('Nova Chat Core Functionality', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the chat interface with greeting', async ({ page }) => {
    // Ellenőrizzük, hogy a fő elemek megjelennek-e
    await expect(page.getByRole('heading', { name: 'Nova' }).first()).toBeVisible();
    
    // Az első asszisztens üzenet (üdvözlés) látható
    const firstMessage = page.locator('.prose').first();
    await expect(firstMessage).toBeVisible();
    await expect(firstMessage).toContainText('Nova vagyok');
  });

  test('should allow user to send a message and receive a response', async ({ page }) => {
    const input = page.locator('textarea[placeholder="Írj üzenetet vagy adj feladatot..."]');
    const sendButton = page.locator('button[title="Küldés"]');

    // 1. Gépeljünk be egy teszt üzenetet
    await input.fill('Szia Nova, egy rövid teszt üzenetet küldök.');
    
    // Ellenőrizzük, hogy a gomb aktív lett
    await expect(sendButton).not.toBeDisabled();

    // 2. Küldés
    await sendButton.click();

    // 3. Ellenőrizzük, hogy a mi üzenetünk megjelent a chaten
    await expect(page.locator('text=Szia Nova, egy rövid teszt üzenetet küldök.')).toBeVisible();

    // 4. Megvárjuk a válasz stream befejezését (vagyis az AI választ)
    // Mivel az OpenAI API válaszol, várnunk kell pár másodpercet
    // Egy egyszerű módszer, ha egy második asszisztens buborékot keresünk
    const aiBubbles = page.locator('.prose');
    await expect(aiBubbles).toHaveCount(2, { timeout: 15000 }); // Az első a greeting, a második a válasz
  });
});
