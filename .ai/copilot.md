# Copilot change log

Dátum: 2026-04-03

Ez a fájl rögzíti azokat a változtatásokat, amiket a Copilot segített végrehajtani a repóban a mai napon.

Változtatások (összefoglaló):

- `scripts/run-e2e-ci.js`
  - Hozzáadott fallback logika: ha nincs `.next/standalone/server.js`, akkor a script a Next dev szervert indítja (közvetlen `node node_modules/next/dist/bin/next dev -p <PORT>`) ahelyett, hogy `npx`-re támaszkodna.
  - Log üzenetek pontosítása és szerver stdout/stderr továbbítása a folyamat logjába.

- `.github/workflows/ci-build.yml`
  - Új GitHub Actions workflow, ami Node 20-on futtatja a `npm ci` és `npm run build` parancsokat, feltölti a `build.log`-ot és (ha létrejön) a `.next` kimenetet artifactként.

- `e2e` tesztek és helper-ek
  - `e2e/helpers.ts`: finomított overlay/portal elrejtő logika, csak fejlesztői overlay-eket rejt el (`pointer-events: none`, `visibility: hidden`) anélkül, hogy az alkalmazás valós oldalsávját eltávolítaná.
  - E2E tesztek (`e2e/chat.spec.ts`, `e2e/history.spec.ts`, `e2e/ui.spec.ts`) frissítve: hozzáférhető szelektorok (`getByRole`, `button:has-text()`), robosztusabb várakozások és konzol/pageerror figyelés a hibakereséshez.

- `src/app/components/ChatInterface.tsx`
  - `data-testid` attribútumok hozzáadva a fontos elemekhez (`chat-input`, `send-btn`, `knowledge-btn`), valamint abort logika a hosszú streaming kérésekhez.

Branch és commit

- Branch: `ci/add-node20-build`
- Commit: a változtatások helyben committed (beleértve a fenti fájlokat).

Megjegyzések és következő lépések

- Javasolt: pushold fel a `ci/add-node20-build` branch-et a GitHubra, és ellenőrizd a Actions futását. A workflow feltölti a `build.log`-ot és a `.next` artifactot, így megnézhetjük, hogy a standalone build valóban tartalmazza-e a `_next/static` kliens payloadokat.
- Ha a git push autentikációs hiba miatt meghiúsul, lokálisan válts Node 20-ra (`nvm`/`nvm-windows`) és futtasd újra a `npm run build`-et.

Ez a napló automatikusan generálva és commitolva lett a `ci/add-node20-build` branch-re.
