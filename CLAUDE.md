# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projekt áttekintés

**Atlasz AI Chat** – Next.js 15 + FastAPI hibrid alkalmazás. Magyar nyelvű, RAG-képes AI chat asszisztens OpenAI API-val. A Python agent (`agent/`) a Microsoft Agent Framework + AG-UI protokoll implementációja – a projekt szerves része.

**Aktuális verzió:** v2.0
**Fő chat végpont:** `/api/chat` (saját RAG pipeline)
**Legacy végpont:** `/api/copilotkit` (megtartva, de a UI nem használja)

---

## Parancsok

```bash
# Fejlesztés – teljes stack (két terminálban futtatandó)
npm run dev          # Next.js frontend (alapértelmezett Next.js port)
npm run dev:agent    # Python agent (port 8000)

# Alternatív
npm run dev:ui       # Next.js Turbopack módban
npm run dev:debug    # Debug loggal

# Build / Lint / TypeScript
npm run build
npm run lint
npx tsc --noEmit     # Csak TypeScript ellenőrzés (gyorsabb mint a build)

# Python agent
cd agent && uv sync
uv run src/main.py   # Agent manuális indítása

# Tesztelés (nincs teszt-keretrendszer, kézi tsx scriptek)
npx tsx src/__tests__/db.test.ts
npx tsx src/__tests__/config.test.ts
npx tsx src/__tests__/search.test.ts
```

---

## Architektúra és adatfolyam

### POST /api/chat – fő pipeline (src/app/api/chat/route.ts)

```
1. DB init (idempotens)
2. Utolsó üzenet embedding → getEmbedding()
3. RAG keresés → top 3 dokumentum + top 3 memória (cosine similarity)
4. Web search döntés:
   - ha maxRagScore < 0.75 → Tavily keresés
   - ha score OK → LLM intent check (gpt-4o-mini) → időérzékeny? → Tavily
5. System prompt összeállítás:
   profile.json adatok + system-prompt.md + RAG kontextus + web eredmény
6. OpenAI válasz: gpt-4o (stream: true) → ReadableStream plain text chunkok
7. Háttérben (void, a stream végén): ténykinyerés user + AI üzenetből (gpt-4o-mini) → memories.json
```

### API végpontok

| Route | Metódus | Funkció |
|-------|---------|---------|
| `/api/chat` | POST | Fő pipeline (ld. fent) |
| `/api/ingest` | POST | Fájl (PDF/TXT/MD/CSV) chunking + embedding → documents.json |
| `/api/tts` | POST | OpenAI TTS (`tts-1`, `nova` hang) → audio blob |
| `/api/memories` | GET | Összes kinyert tény listázása |
| `/api/copilotkit` | POST | Legacy végpont, gpt-4o, saját system prompt (UI nem használja) |

### Könyvtár modulok (src/lib/)

| Fájl | Tartalom |
|------|---------|
| `db.ts` | `LocalVectorDB` singleton – dokumentumok + memóriák JSON fájlokban, cosine similarity keresés. `init()` idempotens. |
| `embeddings.ts` | `getEmbedding()` (OpenAI `text-embedding-3-small`), `chunkText()` (1000 char, paragrafus alapú) |
| `config.ts` | `profile.json` betöltése → `AssistantProfile`, `getSystemPrompt()` → `system-prompt.md` olvasása |
| `search.ts` | `searchWeb(query)` (Tavily REST), `shouldSearchWeb(query, score)` – hiba esetén csendesen `''` |
| `types.ts` | Template maradvány (AG-UI `AgentState`) – nem használja a fő chat |

### Frontend (src/app/ és src/components/)

- **`page.tsx`** – Kétpaneles layout: bal infósáv (desktop) + jobb `<ChatInterface />`; `accentColor` a `profile.json`-ból
- **`components/ChatInterface.tsx`** – Teljes chat UI:
  - Induláskor: `GET /api/memories` → ha van emlékezet, köszöntőben listázza
  - Ha nincs emlékezet: `profile.greeting` jelenik meg
  - 📎 gomb → `/api/ingest` (fájl feltöltés)
  - 🎤 gomb → böngésző `SpeechRecognition` (`hu-HU` locale)
  - 🔊/🔇 toggle → TTS be/ki (`/api/tts` → `nova` hang)
  - Küldés → `/api/chat` → `ReadableStream` (plain text, chunk-onként) → AI buborék valós időben töltődik
- **`src/components/`** (`moon.tsx`, `proverbs.tsx`, `weather.tsx`) – CopilotKit starter template maradványok, a jelenlegi UI **nem használja őket**

### Python Agent (agent/)

Microsoft Agent Framework + AG-UI protokoll. `agent/src/main.py` FastAPI szerver (port 8000). Az `/api/copilotkit` route kapcsolódik hozzá. Konfigurálás: `agent/.env`.

---

## Testreszabás – ezeket kell szerkeszteni

| Fájl | Mit állít be |
|------|-------------|
| `src/config/profile.json` | Asszisztens neve, cég, slogan, képességek, TTS hang (`voice`), kiemelőszín (`accentColor`), induláskor megjelenő üdvözlőszöveg |
| `src/config/system-prompt.md` | Viselkedési irányelvek, stílus, RAG-utasítások – szabad szöveges, minden kérésnél automatikusan betöltődik |

---

## Környezeti változók (.env)

```env
OPENAI_API_KEY=sk-...          # Kötelező – chat, TTS, embedding, ténykinyerés
TAVILY_API_KEY=tvly-...        # Web kereséshez (tavily.com, ingyenes tier: 1000/hó)
GEMINI_API_KEY=...             # Opcionális
GOOGLE_API_KEY=...             # Opcionális
```

`agent/.env`:
```env
OPENAI_API_KEY=sk-...
OPENAI_CHAT_MODEL_ID=gpt-4o-mini
# VAGY Azure:
# AZURE_OPENAI_ENDPOINT=...
# AZURE_OPENAI_CHAT_DEPLOYMENT_NAME=...
```

---

## Adattárolás

| Fájl | Tartalom |
|------|---------|
| `data/documents.json` | RAG tudásbázis – feltöltött fájlok chunk-jai + embedding vektorok |
| `data/memories.json` | Automatikusan kinyert tények a beszélgetésekből (user + AI üzenetekből) |

Mindkét fájl runtime jön létre. A `data/` mappa gitignore-olva van.

---

## OpenAI modellek és szerepük

| Feladat | Model |
|---------|-------|
| Fő chat válasz | `gpt-4o` |
| Ténykinyerés (memória) | `gpt-4o-mini` |
| Web search intent check | `gpt-4o-mini` |
| TTS | `tts-1`, `nova` hang |
| Embedding | `text-embedding-3-small` |

---

## Web search logika (src/lib/search.ts)

- Trigger: `maxRagScore < 0.75` VAGY LLM szerint időérzékeny a kérdés
- Tavily REST API (`fetch`, nincs SDK), top 3 eredmény
- Hiba / nincs API kulcs → csendes fallback (`''`), nem blokkol
- Küszöb konstans: `RELEVANCE_THRESHOLD = 0.75` a `search.ts`-ben

---

## Fontos tudnivalók (gotchas)

- **Import kiterjesztések**: Next.js webpack nem kezeli a `.js` ESM importokat – **ne használj `.js` kiterjesztést** az importokban (pl. `from '../lib/db'` és NEM `from '../lib/db.js'`)
- **`db` singleton**: A `LocalVectorDB` modul szintjén van példányosítva. Az `init()` idempotens – bátran hívható többször.
- **Streaming válasz**: `/api/chat` `Content-Type: text/plain` stream-et ad vissza (nem JSON). A frontend `ReadableStream` reader-rel chunk-onként olvassa, az AI buborék azonnal frissül. TTS a teljes szöveg megérkezése után indul.
- **Ténykinyerés async**: `void Promise.all(...)` – a stream lezárása után háttérben fut, nem blokkolja a választ
- **`src/lib/types.ts`**: Csak template maradvány (AG-UI `AgentState`), a fő chat pipeline nem használja
- **`/api/copilotkit`**: Legacy, hardcoded system prompttal – a UI a `/api/chat`-et használja

