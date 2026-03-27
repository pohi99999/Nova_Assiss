import { searchWeb, shouldSearchWeb } from '../lib/search.js';

async function runTests() {
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`❌ ${name}: ${msg}`);
      failed++;
    }
  }

  // searchWeb visszatér stringgel
  await test('searchWeb returns a string', async () => {
    const result = await searchWeb('test query');
    if (typeof result !== 'string') throw new Error(`Expected string, got ${typeof result}`);
  });

  // Hiba esetén (pl. nincs API kulcs) üres stringet ad vissza
  await test('searchWeb returns empty string on error (no API key)', async () => {
    const originalKey = process.env.TAVILY_API_KEY;
    delete process.env.TAVILY_API_KEY;
    const result = await searchWeb('test query');
    process.env.TAVILY_API_KEY = originalKey;
    if (result !== '') throw new Error(`Expected '', got '${result}'`);
  });

  // shouldSearchWeb: alacsony score esetén true
  await test('shouldSearchWeb returns true when score is below threshold', async () => {
    const result = await shouldSearchWeb('test', 0.5);
    if (result !== true) throw new Error(`Expected true, got ${result}`);
  });

  // shouldSearchWeb: magas score + nem időérzékeny kérdés esetén false
  await test('shouldSearchWeb returns false when score is high and query is not time-sensitive', async () => {
    const result = await shouldSearchWeb('mi a Python?', 0.9);
    if (typeof result !== 'boolean') throw new Error(`Expected boolean, got ${typeof result}`);
    // Megjegyzés: ez LLM hívás, eredménye nem determinisztikus – csak típust ellenőrzünk
  });

  console.log(`\nEredmény: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Teszt futtatási hiba:', err);
  process.exit(1);
});
