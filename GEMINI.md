# GEMINI.md – Nova Irodai Asszisztens v3.0

Ez a fájl tartalmazza a projekt aktuális állapotát, a legutóbbi fejlesztéseket és a jövőbeli irányelveket.

## 🚀 Projekt Áttekintés
**Nova** egy proaktív, magyar nyelvű AI irodai asszisztens a **Sólyom Daru Kft.** számára. Next.js 15 alapú, OpenAI integrációval, RAG képességgel és dinamikus memóriával rendelkezik.

**Aktuális verzió:** v3.0 (2026.03.30)
**Alapértelmezett port:** 3005 (konfliktuskerülés miatt)

---

## ✅ Legutóbbi Fejlesztések (v3.0)

### 1. Rebranding és Persona
- Az "Atlasz" nevet mindenhol lecseréltük **Nova**-ra.
- Új irodavezetői személyiség: barátságos, proaktív, feladat-orientált.
- Frissített `profile.json` és `system-prompt.md`.

### 2. Architektúra Tisztítás
- A felesleges Python `agent/` mappát eltávolítottuk (a Next.js API-k stabilabbak).
- Töröltük a nem használt demó komponenseket (`weather`, `moon`, `proverbs`).
- Eltávolítottuk a zavaró, lassú natív `sqlite3` függőséget a Windows-os kompatibilitási hibák miatt.

### 3. Adatkezelés és Memória
- **Dinamikus Memória:** A Tavily webes keresések eredményeit Nova mostantól azonnal "tényként" rögzíti a memóriájába.
- **SQLite-Ready Interfész:** A `db.ts` teljesen aszinkron lett, felkészítve a későbbi SQL átállásra, jelenleg stabil JSON FileDB alapon fut (Docker perzisztenciával).
- **Chat History:** Megvalósult a beszélgetések mentése, listázása és visszatöltése (Threads API).

### 4. Modern UI és UX
- **Reszponzív Sidebar:** Bal oldali sáv a korábbi beszélgetéseknek.
- **Tudásbázis Kezelő:** Új modal felület a feltöltött dokumentumok kezeléséhez.
- **Info Modal:** Mobilon is elérhető névjegy az asszisztensről.
- **Mobilbarát Navigáció:** Adaptív fejléc és optimalizált beviteli mező.

### 5. Telepíthetőség
- **Docker & Docker Compose:** Kész konfiguráció a könnyű hostoláshoz.
- **E2E Tesztek:** Playwright tesztcsomag beállítva az alapfunkciók (chat, history, UI) ellenőrzésére.

---

## 📊 Jelenlegi Állapot: TEST-READY
A rendszer funkcionálisan kész az irodai tesztelésre.

- **Frontend:** ✅ Működőképes, modern, reszponzív.
- **API (Chat/RAG):** ✅ Stabil, aszinkron, tanulóképes.
- **Adattárolás:** ✅ JSON FileDB (data/ mappában), Docker volume támogatással.
- **Keresés:** ✅ Tavily integráció aktív.
- **Hang:** ✅ TTS (OpenAI Nova) és STT (Browser) elérhető.

---

## ⚠️ Technikai Tapasztalatok (Gotchas)
1. **Port Konfliktus:** A Brunella Core (port 3000) miatt a projektet a **3005**-ös portra költöztettük.
2. **SQLite Windows-on:** A natív `sqlite3` driver gyakran okoz build timeoutot/deadlockot Windows fejlesztői környezetben. A tiszta aszinkron FileDB jelenleg megbízhatóbb a gyors fejlesztéshez.
3. **Standalone Build:** A `next.config.ts` tartalmazza az `output: 'standalone'` beállítást a hatékony Docker build érdekében.

---

## 🛠️ Parancsok
```bash
npm run dev          # Indítás a 3005-ös porton
npm run test:e2e     # E2E tesztek futtatása (Playwright)
docker-compose up -d # Éles indítás konténerben
```
