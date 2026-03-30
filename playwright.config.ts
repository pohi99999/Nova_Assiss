import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Playwright Konfiguráció az E2E tesztekhez.
 * További részletek: https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Maximum time one test can run for. */
  timeout: 30 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000
  },
  /* Futtatás párhuzamosan fájlok szerint */
  fullyParallel: true,
  /* Ha az első teszt hibás, ne álljon le azonnal, kivéve CI-ban */
  forbidOnly: !!process.env.CI,
  /* Újrapróbálkozás hibás teszteknél csak CI-ban */
  retries: process.env.CI ? 2 : 0,
  /* Max workers aszerint, hogy CI-ban vagyunk-e */
  workers: process.env.CI ? 1 : undefined,
  /* HTML riport generálása a futás után */
  reporter: 'html',
  
  use: {
    /* Az alkalmazás címe, amin a tesztek futni fognak */
    baseURL: 'http://localhost:3005',

    /* Hiba esetén készítsen stack trace-t és screenshotot a teszt végén */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  /* Projektek a különböző böngészőkhöz és eszközökhöz */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    /*
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    */
    /* Tesztelés mobilnézeten (opcionális, de jó ha van) */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  /* A Next.js fejlesztői szerver indítása a tesztek előtt */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3005',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
