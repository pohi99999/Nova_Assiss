# Streaming Válaszok Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Az OpenAI válasz valós időben jelenjen meg – szöveg streaming-gel, chunk-onként.

**Architecture:** A backend chat route a teljes RAG/web search pipeline után `stream: true`-val hívja az OpenAI-t, és `ReadableStream`-ként adja vissza a text chunkokat (nem JSON). A frontend `fetch` + `ReadableStream` reader-rel chunk-onként olvassa és frissíti az AI buborék tartalmát; loading dots az első chunk beérkezéséig láthatók.

**Tech Stack:** Next.js 15 `ReadableStream`, OpenAI Node SDK streaming, `TextDecoder`/`TextEncoder`, React state updates

---

### Task 1: Backend – streaming chat route

**Files:**
- Modify: `src/app/api/chat/route.ts`

A teljes fájl cseréje szükséges. Az egyetlen érdemi változás: a `stream: false` OpenAI hívás + `NextResponse.json({ reply })` → `stream: true` + `ReadableStream` + háttér ténykinyerés a stream végén.

- [ ] **Step 1: A fájl teljes tartalmának cseréje**

```ts
import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { getEmbedding } from '../../../lib/embeddings';
import { config, getSystemPrompt } from '../../../lib/config';
import { searchWeb, shouldSearchWeb } from '../../../lib/search';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const openai = new OpenAI();

async function extractAndSaveFact(
  message: string,
  source: 'user-extraction' | 'assistant-extraction' = 'user-extraction'
) {
  if (!message.trim()) return;
  try {
    const extractionResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Te egy memóriakezelő vagy. Elemezd a következő üzenetet. Ha tartalmaz egy új, hosszú távon fontos tényt (pl. preferencia, projekt adat, cégadat, jelszó, PIN, név, stb.), amit érdemes megjegyezni, írd le azt a tényt egyetlen rövid, tényszerű, E/3 személyű mondatban. Ha NINCS benne fontos tény, vagy csak általános csevegés (pl. "Szia", "Hogy vagy?", "Köszi", "Rendben"), válaszolj pontosan a "NINCS" szóval.',
        },
        { role: 'user', content: message }
      ],
      temperature: 0.1,
    });

    const fact = extractionResponse.choices[0].message.content?.trim();

    if (fact && fact !== 'NINCS') {
      const embedding = await getEmbedding(fact);
      db.memories.push({
        id: crypto.randomUUID(),
        text: fact,
        embedding,
        metadata: {
          source,
          createdAt: new Date().toISOString()
        }
      });
      await db.saveMemories();
    }
  } catch (error: unknown) {
    void error; // Ténykinyerés hiba nem blokkolja a chat választ
  }
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Nincsenek üzenetek megadva' }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1].content;

    // 1. DB init
    await db.init();

    // 2. Embedding a RAG query-hez
    const queryEmbedding = await getEmbedding(lastMessage);

    // 3. Top 3 dokumentum + top 3 memória
    const relevantDocs = db.search(queryEmbedding, 'documents', 3);
    const relevantFacts = db.search(queryEmbedding, 'memories', 3);

    // 4. RAG kontextus összeállítása
    let contextText = '';

    if (relevantDocs.length > 0) {
      contextText += '\n\n### RELEVÁNS DOKUMENTUMOK A TUDÁSBÁZISBÓL:\n';
      contextText += relevantDocs.map(d => `- [${typeof d.metadata?.['source'] === 'string' ? d.metadata['source'] : 'ismeretlen'}]: ${d.text}`).join('\n\n');
    }

    if (relevantFacts.length > 0) {
      contextText += '\n\n### RELEVÁNS KORÁBBI TÉNYEK (AMIKRE EMLÉKSZEL):\n';
      contextText += relevantFacts.map(f => `- ${f.text}`).join('\n');
    }

    // 4b. Web keresés döntés
    const maxRagScore = relevantDocs[0]?.score ?? 0;
    if (await shouldSearchWeb(lastMessage, maxRagScore)) {
      const webResults = await searchWeb(lastMessage);
      if (webResults) {
        contextText += '\n\n### AKTUÁLIS WEB KERESÉS EREDMÉNYE:\n' + webResults;
      }
    }

    // 5. System prompt összeállítás
    const personalityPrompt = await getSystemPrompt();
    const SYSTEM_PROMPT = `Te vagy ${config.name}, a(z) ${config.company} dedikált asszisztense.
Szlogened: "${config.slogan}"
Fő képességeid: ${config.capabilities.join(', ')}

${personalityPrompt}
${contextText}
`;

    // 6. OpenAI streaming
    const openaiStream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
      ],
      stream: true,
    });

    let fullReply = '';

    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of openaiStream) {
            const text = chunk.choices[0]?.delta?.content ?? '';
            if (text) {
              fullReply += text;
              controller.enqueue(encoder.encode(text));
            }
          }
        } finally {
          // 7. Háttér ténykinyerés – a teljes válasz rendelkezésre áll
          void Promise.all([
            extractAndSaveFact(lastMessage, 'user-extraction'),
            extractAndSaveFact(fullReply, 'assistant-extraction'),
          ]);
          controller.close();
        }
      }
    });

    return new Response(readableStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Szerver hiba';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 2: TypeScript ellenőrzés**

```bash
cd "G:/Brunella/.000_PROJEKTEK/005_Chat_Agent_Nova (cég botja)/Nova_assisst" && npx tsc --noEmit
```

Elvárt: hibamentes.

- [ ] **Step 3: Commit**

```bash
cd "G:/Brunella/.000_PROJEKTEK/005_Chat_Agent_Nova (cég botja)/Nova_assisst" && git add src/app/api/chat/route.ts && git commit -m "feat: stream OpenAI response as ReadableStream plain text

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 2: Frontend – stream olvasás a ChatInterface-ben

**Files:**
- Modify: `src/app/components/ChatInterface.tsx`

Csak a `handleSubmit` függvény cserélődik. Minden más logika (TTS, STT, file upload, MemoryModal stb.) érintetlen marad.

- [ ] **Step 1: `handleSubmit` teljes cseréje**

Keresd meg a `handleSubmit` függvényt a `ChatInterface.tsx`-ben és cseréld le teljesen:

```ts
const handleSubmit = async (e?: React.FormEvent) => {
  e?.preventDefault();
  if (!input.trim() || isLoading) return;

  const userMessage = input.trim();
  setInput("");
  const newMessages: Message[] = [
    ...messages,
    { id: crypto.randomUUID(), role: "user", content: userMessage, time: now() }
  ];
  setMessages(newMessages);
  setIsLoading(true);

  const aiMessageId = crypto.randomUUID();
  let aiMessageAdded = false;

  try {
    const apiMessages = newMessages.map(({ role, content }) => ({ role, content }));
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: apiMessages }),
    });

    if (!res.ok || !res.body) throw new Error("API hiba");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullReply = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      fullReply += chunk;

      if (!aiMessageAdded) {
        aiMessageAdded = true;
        setIsLoading(false);
        setMessages(prev => [
          ...prev,
          { id: aiMessageId, role: "assistant", content: fullReply, time: now() }
        ]);
      } else {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMessageId ? { ...msg, content: fullReply } : msg
          )
        );
      }
    }

    void speakNova(fullReply);

  } catch {
    setIsLoading(false);
    if (aiMessageAdded) {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessageId
            ? { ...msg, content: "Sajnálom, hiba történt a válaszadás közben." }
            : msg
        )
      );
    } else {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sajnálom, hiba történt a válaszadás közben.",
        time: now()
      }]);
    }
  } finally {
    setIsLoading(false);
  }
};
```

- [ ] **Step 2: TypeScript ellenőrzés**

```bash
cd "G:/Brunella/.000_PROJEKTEK/005_Chat_Agent_Nova (cég botja)/Nova_assisst" && npx tsc --noEmit
```

Elvárt: hibamentes.

- [ ] **Step 3: Dev szerver indítása és manuális tesztelés**

```bash
npm run dev
```

Ellenőrizendő:
- [ ] Üzenet küldésekor loading dots megjelenik
- [ ] Az első token érkezésekor loading dots eltűnik, AI buborék megjelenik és töltődik
- [ ] Szöveg valós időben jelenik meg (ne várja meg a teljes választ)
- [ ] Hibás hálózat esetén hibaüzenet jelenik meg a buborékban
- [ ] TTS (ha be van kapcsolva) a teljes szöveg után szólal meg

- [ ] **Step 4: Commit**

```bash
cd "G:/Brunella/.000_PROJEKTEK/005_Chat_Agent_Nova (cég botja)/Nova_assisst" && git add src/app/components/ChatInterface.tsx && git commit -m "feat: read streaming response chunk by chunk in ChatInterface

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```
