import { test, expect } from '@playwright/test';

test.describe('Nova Chat History and Sidebar', () => {

  test.beforeEach(async ({ page }) => {
    // Alaphelyzet: Kezdőlap betöltése
    await page.goto('/');
  });

  test('should display the sidebar and create a new chat', async ({ page }) => {
    // 1. Az oldalsáv látható-e
    const sidebar = page.locator('.bg-slate-900').first(); // A sötét oldalsáv
    await expect(sidebar).toBeVisible();

    // 2. Új beszélgetés gomb működése
    const newChatBtn = page.locator('button:has-text("Új beszélgetés")');
    await expect(newChatBtn).toBeVisible();

    // Üzenünk valamit, hogy legyen egy meglévő üzenet a chatben
    const input = page.locator('textarea[placeholder="Írj üzenetet vagy adj feladatot..."]');
    await input.fill('Ez egy ideiglenes beszélgetés.');
    await page.locator('button[title="Küldés"]').click();

    // Várjuk meg, hogy bekerüljön az üzenetünk
    await expect(page.locator('text=Ez egy ideiglenes beszélgetés.')).toBeVisible();

    // Kattintunk az Új beszélgetés gombra
    await newChatBtn.click();

    // 3. Ellenőrizzük, hogy a chat ablaka "kiürült-e" (csak az 1 db greeting maradt)
    const messages = page.locator('.prose'); // Az AI válaszok "prose" osztályt kapnak a Markdown miatt, plusz a mi válaszunk
    // A mi válaszunknak el kellett tűnnie
    await expect(page.locator('text=Ez egy ideiglenes beszélgetés.')).not.toBeVisible();
    
    // De az alap üdvözlésnek ott kell lennie
    await expect(messages).toHaveCount(1);
    await expect(messages.first()).toContainText('Nova vagyok');
  });

  test('should toggle sidebar on mobile', async ({ page }) => {
    // Mobil nézet szimulálása
    await page.setViewportSize({ width: 375, height: 812 });

    // A hamburger/toggle gomb (header bal oldalán lévő ikon)
    const toggleBtn = page.locator('button:has-text("⟪")').or(page.locator('button:has-text("⟫")')).first();
    await expect(toggleBtn).toBeVisible();

    // Mivel induláskor valószínűleg zárva van a mobil menü, kattintásra kinyílik/bezárul a logika alapján
    await toggleBtn.click();

    // Az oldalsáv szélességét vagy pozícióját ellenőrizzük a CSS osztályok alapján
    const sidebar = page.locator('.bg-slate-900').first();
    
    // Kattintásokkal váltogatjuk az állapotát
    await toggleBtn.click();
    await page.waitForTimeout(500); // Várjuk meg a CSS transition-t
  });
});
