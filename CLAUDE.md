# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: Atlasz AI Chat

Next.js 15 + FastAPI hibrid alkalmazás. A frontend egy magyar nyelvű RAG-képes AI chat asszisztenst valósít meg (neve: **Atlasz**), a háttérben OpenAI API-val. A Python agent (`agent/`) a Microsoft Agent Framework + AG-UI protokoll implementációja – a projekt szerves része.

## Parancsok

```bash
# Fejlesztés – teljes stack (két terminálban futtatandó)
npm run dev          # Next.js frontend
npm run dev:agent    # Python agent (port 8000)

# Alternatív
npm run dev:ui       # Next.js Turbopack módban
npm run dev:debug    # Debug loggal

# Build / Lint
npm run build
npm run lint

# Python agent függőségek
cd agent && uv sync
uv run src/main.py   # Agent manuális indítása

# Tesztelés (nincs teszt-keretrendszer, kézi Node scriptek)
npx tsx src/__tests__/db.test.ts
npx tsx src/__tests__/config.test.ts
```

## Architektúra

### Frontend → API Routes (Next.js App Router, `src/app/api/`)

| Route | Funkció |
|-------|---------|
| `POST /api/chat` | Fő chat végpont: RAG (dokumentumok + memória), ténykinyerés. Válasz: `gpt-4o`, ténykinyerés: `gpt-4o-mini` |
| `POST /api/ingest` | Fájl (PDF/TXT/MD/CSV) feltöltése, chunking, embedding, mentés `data/documents.json`-ba |
| `POST /api/tts` | OpenAI TTS (`tts-1`, Nova hang) – audiót ad vissza |
| `POST /api/copilotkit` | Alternatív chat végpont (gpt-4o, no-stream) |
| `GET /api/memories` | Összes kinyert tény listázása (szöveg, forrás, dátum) |

### Adat- és memóriaréteg (`src/lib/`)

- **`db.ts`** – `LocalVectorDB` osztály: dokumentumokat (`data/documents.json`) és memóriákat (`data/memories.json`) JSON fájlokban tárol. Cosine similarity alapú keresés. A `db` singleton – az `init()` idempotens.
- **`embeddings.ts`** – `getEmbedding()` (OpenAI `text-embedding-3-small`), `chunkText()` (1000 karakteres paragrafus-chunker).
- **`config.ts`** – `src/config/profile.json` betöltése (`AssistantProfile` interfész: név, cég, hang, képességek).

### Frontend (`src/app/`)

- **`page.tsx`** – Kétpaneles layout: infósáv + `<ChatInterface />`
- **`components/ChatInterface.tsx`** – Teljes chat UI: üzenetlista, file upload (`/api/ingest`), STT (böngésző `SpeechRecognition`, `hu-HU`), TTS toggle (`/api/tts`), küldés (`/api/chat`)

### Python Agent (`agent/`)

Microsoft Agent Framework + AG-UI protokoll implementációja. `agent/src/main.py` indítja a FastAPI szervert (port 8000). Az `agent/.env` fájlban kell megadni az OpenAI vagy Azure OpenAI hitelesítőket.

## Testreszabás

- **`src/config/profile.json`** – Asszisztens neve, cég, slogan, képességek, TTS hang (`voice`), kiemelőszín (`accentColor`), üdvözlőszöveg
- **`src/config/system-prompt.md`** – Viselkedési irányelvek, RAG-utasítások (szabad szöveges, automatikusan betöltődik minden kérésnél)

## Környezeti változók

Gyökérkönyvtárban `.env.local`:
```env
OPENAI_API_KEY=sk-...
```

`agent/.env`:
```env
OPENAI_API_KEY=sk-...
OPENAI_CHAT_MODEL_ID=gpt-4o-mini
# VAGY Azure:
# AZURE_OPENAI_ENDPOINT=...
# AZURE_OPENAI_CHAT_DEPLOYMENT_NAME=...
```

## Az asszisztens személyisége

Az Atlasz profil forrása: `src/config/profile.json`. A system prompt szövege: `src/config/system-prompt.md` (szerkeszthető). Az `/api/chat/route.ts` ezt kombinálja RAG-kontextussal és memóriával minden kérésnél.

## Adattárolás

- `data/documents.json` – RAG tudásbázis (feltöltött fájlok vektorjai)
- `data/memories.json` – Automatikusan kinyert tények a beszélgetésekből

Mindkét fájl runtime jön létre, nincs pre-commit ellenőrzés. A `data/` mappa gitignore-olva van.
