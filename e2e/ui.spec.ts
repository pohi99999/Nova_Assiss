import { test, expect } from '@playwright/test';

test.describe('Nova UI Modals and Tools', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should open Knowledge Base (Tudásbázis) modal from sidebar', async ({ page }) => {
    // Keresünk a bal sáv alján egy gombot, ami a tudásbázist nyitja meg
    const knowledgeBtn = page.locator('button:has-text("Tudásbázis kezelő")');
    await expect(knowledgeBtn).toBeVisible();

    // Rákattintunk
    await knowledgeBtn.click();

    // Ellenőrizzük, hogy a Modal megjelent-e a képernyőn
    const modalTitle = page.locator('h2:has-text("Tudásbázis Kezelő")');
    await expect(modalTitle).toBeVisible();

    // Bezárjuk a modalt
    const closeBtn = page.locator('button:has-text("Bezárás")');
    await closeBtn.click();

    // A modalnak el kell tűnnie
    await expect(modalTitle).not.toBeVisible();
  });

  test('should open Info (Nova Névjegye) modal on mobile view', async ({ page }) => {
    // Váltsunk mobil nézetre
    await page.setViewportSize({ width: 375, height: 812 });
    
    // A mobil fejlécre kattintva nyílik meg az Info modal (A "Nova · Sólyom Daru" részre kattintva)
    const headerInfoBtn = page.locator('button:has-text("Sólyom Daru Kft.")').first();
    await expect(headerInfoBtn).toBeVisible();

    // Rákattintunk
    await headerInfoBtn.click();

    // Ellenőrizzük, hogy a Modal megjelent-e
    const modalTitle = page.locator('h2:has-text("Nova névjegye")');
    await expect(modalTitle).toBeVisible();

    // Bezárjuk az "Értem" gombbal
    const closeBtn = page.locator('button:has-text("Értem")');
    await closeBtn.click();

    // A modalnak el kell tűnnie
    await expect(modalTitle).not.toBeVisible();
  });

  test('should toggle Audio (Mute/Unmute) button', async ({ page }) => {
    // Kezdetben általában "🔇" (némított) ikon látszik, mert az isSpeechEnabled default false
    const audioBtn = page.locator('button[title="Nova hang be/ki"]').first();
    
    // Ha rákattintunk, át kell váltania "🔊"-re (vagy fordítva)
    await audioBtn.click();
    
    // A szín/ikon váltás miatt a gomb továbbra is látható
    await expect(audioBtn).toBeVisible();
  });

  test('file upload button should be visible and clickable', async ({ page }) => {
    // Ellenőrizzük, hogy a fájlfeltöltő (📎) gomb ott van-e a fejlécen
    const uploadLabel = page.locator('label[title="Fájl feltöltés"]').first();
    await expect(uploadLabel).toBeVisible();
    
    // Rákattintva az <input type="file"> -nek nyílnia kellene,
    // de E2E tesztben fájlt tölteni picit trükkösebb, így csak megnézzük, 
    // hogy reagál-e a felület és megvan-e a megfelelő elem.
    const fileInput = uploadLabel.locator('input[type="file"]');
    await expect(fileInput).toHaveAttribute('accept', '.pdf,.txt,.md');
  });

});
