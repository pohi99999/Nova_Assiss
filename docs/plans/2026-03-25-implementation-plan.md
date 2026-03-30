# Atlasz Chat Asszisztens v2.0 - Implementation Plan

> **For Gemini:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the existing chat application into a white-label, dynamic learning AI assistant with local RAG, semantic memory, web search, and OpenAI's Nova voice (TTS).

**Architecture:** We will replace the current CopilotKit-centric backend logic with a custom Next.js Route Handler (`api/chat/route.ts`) that manages the conversation flow, vector database queries (using `sqlite-vec` or `better-sqlite3` with embeddings), and calls OpenAI for text and TTS generation. The frontend will be updated to handle audio playback and a dynamic configuration profile.

**Tech Stack:** Next.js 15 (App Router), `ai` (Vercel AI SDK - stable non-streaming/streaming JSON), `openai` SDK, `better-sqlite3` (for local memory), Web Speech API (STT), OpenAI TTS.

---

### Task 1: Setup White-Label Configuration

**Files:**
- Create: `src/config/profile.json`
- Create: `src/lib/config.ts`

**Step 1: Write the failing test**
Create `src/__tests__/config.test.ts` to assert that the profile is loaded correctly. (Note: We'll use a simple node script if Jest/Vitest isn't configured yet).

**Step 2: Run test to verify it fails**
Run: `npx tsx src/__tests__/config.test.ts`
Expected: FAIL with module not found.

**Step 3: Write minimal implementation**
Create `src/config/profile.json` with base Atlasz data.
Create `src/lib/config.ts` to read and parse this JSON.

**Step 4: Run test to verify it passes**
Run: `npx tsx src/__tests__/config.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add src/config/profile.json src/lib/config.ts src/__tests__/config.test.ts
git commit -m "feat: add white-label configuration module"
```

---

### Task 2: Setup Local SQLite Vector Database for RAG & Memory

**Files:**
- Modify: `package.json` (add `better-sqlite3`)
- Create: `src/lib/db.ts`

**Step 1: Install dependencies**
Run: `npm install better-sqlite3 && npm install -D @types/better-sqlite3`

**Step 2: Write the failing test**
Create `src/__tests__/db.test.ts` to test table creation (Documents and Memories).

**Step 3: Write minimal implementation**
Implement `src/lib/db.ts` to initialize `better-sqlite3`, creating tables `documents` (id, text, embedding) and `memories` (id, fact, embedding) if they don't exist.

**Step 4: Run test to verify it passes**
Run: `npx tsx src/__tests__/db.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add package.json package-lock.json src/lib/db.ts src/__tests__/db.test.ts
git commit -m "feat: initialize local SQLite database for RAG and semantic memory"
```

---

### Task 3: Ingestion API (File Upload & Chunking)

**Files:**
- Create: `src/app/api/ingest/route.ts`
- Create: `src/lib/embeddings.ts`

**Step 1: Write the failing test**
Create a mock test to send a sample text to the ingest API.

**Step 2: Write minimal implementation**
Implement `src/lib/embeddings.ts` using `openai.embeddings.create`.
Implement `src/app/api/ingest/route.ts` to receive text/files, chunk them, embed them, and save to `db.ts`.

**Step 3: Run test to verify it passes**
Manually or via script post to `/api/ingest`.

**Step 4: Commit**
```bash
git add src/app/api/ingest/route.ts src/lib/embeddings.ts
git commit -m "feat: add file ingestion and embedding generation API"
```

---

### Task 4: Dynamic Chat API with RAG & Fact Extraction

**Files:**
- Create/Modify: `src/app/api/chat/route.ts` (We will bypass or replace the copilotkit route if needed, to build a direct custom endpoint for full control over the RAG flow).

**Step 1: Write the minimal implementation**
Implement the POST handler in `src/app/api/chat/route.ts`.
Flow:
1. Embed the user's message.
2. Query `db.ts` for top 3 similar documents/facts.
3. Construct the System Prompt using `src/lib/config.ts` + retrieved context.
4. Call `openai.chat.completions.create`.
5. Run a background task to extract new facts from the user message and save to `memories` table.
6. Return JSON response `{ reply: string }`.

**Step 2: Commit**
```bash
git add src/app/api/chat/route.ts
git commit -m "feat: implement custom RAG chat endpoint with dynamic memory extraction"
```

---

### Task 5: OpenAI TTS (Nova) Integration

**Files:**
- Create: `src/app/api/tts/route.ts`

**Step 1: Write minimal implementation**
Create a new route that accepts text and returns an audio stream using `openai.audio.speech.create({ model: 'tts-1', voice: 'nova', input: text })`.

**Step 2: Commit**
```bash
git add src/app/api/tts/route.ts
git commit -m "feat: add TTS endpoint using OpenAI Nova voice"
```

---

### Task 6: UI Update (Voice, Drag&Drop, Layout)

**Files:**
- Modify: `src/app/components/ChatInterface.tsx`
- Modify: `src/app/page.tsx`

**Step 1: Write minimal implementation**
Update `ChatInterface.tsx` to:
- Call `/api/chat` instead of the old copilotkit endpoint.
- Add an "Upload Document" button that calls `/api/ingest`.
- Handle Web Speech API for the microphone input.
- Automatically call `/api/tts` with the assistant's reply and play the audio.

**Step 2: Run dev server and manually test**
Verify layout, STT, and TTS.

**Step 3: Commit**
```bash
git add src/app/components/ChatInterface.tsx src/app/page.tsx
git commit -m "feat: update UI with custom chat, file upload, and Nova voice integration"
```

---

### Task 7: Web Search Integration (Optional/Fallback)

**Files:**
- Modify: `src/app/api/chat/route.ts`
- Create: `src/lib/search.ts`

**Step 1: Write minimal implementation**
If the context score is low, call `src/lib/search.ts` (using a free search API or dummy placeholder until API keys are set) to fetch live data and inject it into the prompt.

**Step 2: Commit**
```bash
git add src/app/api/chat/route.ts src/lib/search.ts
git commit -m "feat: add fallback web search to chat context"
```
