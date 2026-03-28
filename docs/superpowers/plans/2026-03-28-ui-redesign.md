# UI Redesign v2.1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Teljes UI újraírás – modern minimál stílus, markdown renderelés, mobil fejléc, textarea input, Enter küldés, timestamp, fadeInUp animáció.

**Architecture:** A meglévő üzleti logika (`handleSubmit`, `speakNova`, STT, file upload, memory betöltés) érintetlen marad. Csak a JSX és a stílus cserélődik. Az akcentszín (`profile.accentColor`) inline CSS változóként (`--accent`) kerül átadásra a gyökér elemen, így minden komponens `style={{ color: profile.accentColor }}` mintával hivatkozik rá. `react-markdown` az AI buborékon belül.

**Tech Stack:** Next.js 15 App Router, Tailwind CSS v4, `react-markdown`, `profile.json` (meglévő)

---

### Task 1: Függőség telepítés + CSS animáció

**Files:**
- Modify: `package.json` (react-markdown hozzáadása)
- Modify: `src/app/globals.css`

- [ ] **Step 1: react-markdown telepítése**

```bash
npm install react-markdown
```

Elvárt kimenet: `added N packages` – hiba nélkül.

- [ ] **Step 2: fadeInUp keyframe hozzáadása globals.css-be**

A fájl jelenlegi tartalma után add hozzá:

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeInUp {
  animation: fadeInUp 0.2s ease-out;
}
```

A teljes `globals.css` így néz ki:

```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}

body,
html {
  height: 100%;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeInUp {
  animation: fadeInUp 0.2s ease-out;
}
```

- [ ] **Step 3: Ellenőrzés**

```bash
npx tsc --noEmit
```

Elvárt: hibamentes kimenet (vagy csak pre-existing hibák).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/app/globals.css
git commit -m "feat: add react-markdown + fadeInUp animation"
```

---

### Task 2: page.tsx újraírása

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: page.tsx teljes cseréje**

```tsx
import ChatInterface from "./components/ChatInterface";
import profile from "../config/profile.json";

export default function Home() {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-100 overflow-hidden">

      {/* Bal oldalsáv – csak desktopon */}
      <aside className="hidden md:flex md:w-72 lg:w-80 bg-white border-r border-slate-200 flex-col p-8 justify-between shrink-0">
        <div>
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-6"
            style={{ backgroundColor: profile.accentColor }}
          >
            {profile.name[0]}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">{profile.name}</h1>
          <p className="text-sm text-slate-500 mb-1">{profile.company}</p>
          <p className="text-xs text-slate-400 mb-8">{profile.slogan}</p>

          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <span className="text-blue-600 text-sm">🧠</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Dinamikus Emlékezet</h3>
                <p className="text-xs text-slate-400 leading-relaxed">Megjegyzi a fontos tényeket a beszélgetésekből.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                <span className="text-purple-600 text-sm">📚</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Élő Tudásbázis (RAG)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">Tölts fel fájlokat a 📎 gombbal, majd kérdezz róluk.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                <span className="text-green-600 text-sm">🗣️</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Hang Interakció</h3>
                <p className="text-xs text-slate-400 leading-relaxed">Diktálj 🎤 gombbal, hallgasd Nova hangján 🔊.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-300">
          <p>Powered by Next.js & OpenAI</p>
          <p>{profile.name} v2.1</p>
        </div>
      </aside>

      {/* Fő chat terület */}
      <main className="flex-1 p-4 md:p-6 h-full min-w-0">
        <ChatInterface />
      </main>

    </div>
  );
}
```

- [ ] **Step 2: TypeScript ellenőrzés**

```bash
npx tsc --noEmit
```

Elvárt: hibamentes.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: redesign desktop sidebar layout"
```

---

### Task 3: ChatInterface.tsx teljes újraírása

**Files:**
- Modify: `src/app/components/ChatInterface.tsx`

Ez a fő feladat. A logika (fetch, TTS, STT, file upload, memory) változatlan marad – csak a JSX és a state típus bővül `time` mezővel.

- [ ] **Step 1: ChatInterface.tsx teljes cseréje**

```tsx
"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import profile from '../../config/profile.json';

interface Message {
  role: string;
  content: string;
  time?: string;
}

interface ISpeechRecognitionEvent {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}

interface ISpeechRecognition {
  lang: string;
  continuous: boolean;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
}

interface ISpeechRecognitionConstructor {
  new (): ISpeechRecognition;
}

interface IWindow extends Window {
  webkitSpeechRecognition?: ISpeechRecognitionConstructor;
  SpeechRecognition?: ISpeechRecognitionConstructor;
}

function now(): string {
  return new Date().toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: profile.greeting, time: now() }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Textarea auto-grow: max ~4 sor (120px)
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, [input]);

  useEffect(() => {
    const loadMemories = async () => {
      try {
        const res = await fetch('/api/memories');
        if (!res.ok) return;
        const data = await res.json() as { memories: Array<{ text: string }> };
        if (data.memories && data.memories.length > 0) {
          const factList = data.memories
            .slice(0, 5)
            .map((m) => `– ${m.text}`)
            .join('\n');
          setMessages([{
            role: 'assistant',
            content: `Visszatértél! Ezeket tudom rólad:\n${factList}\n\nMiben segíthetek ma?`,
            time: now()
          }]);
        }
      } catch {
        // Ha sikertelen, az alapértelmezett greeting marad
      }
    };
    void loadMemories();
  }, []);

  const speakNova = async (text: string) => {
    if (!isSpeechEnabled) return;
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error('Audio generation failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      new Audio(url).play();
    } catch (err) {
      console.error('Nova TTS Error:', err);
    }
  };

  const startListening = () => {
    const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
    const Recognition = SpeechRecognition || webkitSpeechRecognition;
    if (!Recognition) {
      alert("A böngésződ nem támogatja a hangfelismerést.");
      return;
    }
    const recognition = new Recognition();
    recognition.lang = "hu-HU";
    recognition.continuous = false;
    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      setInput(event.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    setIsListening(true);
    recognition.start();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/ingest', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: `📁 Fájl feldolgozva: **${file.name}**. Már tudok válaszolni a benne lévő adatokra!`,
          time: now()
        }]);
      } else {
        alert('Hiba a fájl feltöltésekor: ' + data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage, time: now() }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // API-nak csak role + content kell, time nem
      const apiMessages = newMessages.map(({ role, content }) => ({ role, content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });
      if (!res.ok) throw new Error("API hiba");
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply, time: now() }]);
      void speakNova(data.reply);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sajnálom, hiba történt a válaszadás közben.",
        time: now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  const FileUploadButton = ({ mobile }: { mobile: boolean }) => (
    <label
      className={`cursor-pointer p-2 rounded-full transition-colors relative ${
        mobile ? 'hover:bg-white/20' : 'hover:bg-slate-100'
      }`}
      title="Tudásbázis bővítése (PDF/TXT/MD/CSV)"
    >
      <span className="text-lg">📎</span>
      <input
        type="file"
        className="hidden"
        accept=".txt,.pdf,.md,.csv"
        onChange={handleFileUpload}
        disabled={uploading}
      />
      {uploading && (
        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
        </span>
      )}
    </label>
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

      {/* Mobil fejléc – md alatt látható */}
      <div
        className="flex md:hidden items-center justify-between px-4 py-3 border-b border-slate-100"
        style={{ backgroundColor: profile.accentColor }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
            {profile.name[0]}
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">
              {profile.name} · {profile.company}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
              <span className="text-xs text-white/70">Online</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1 items-center">
          <FileUploadButton mobile={true} />
          <button
            onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
            className={`p-2 rounded-full hover:bg-white/20 transition-colors ${isSpeechEnabled ? 'text-green-300' : 'text-white/60'}`}
            title="Nova hang be/ki"
          >
            {isSpeechEnabled ? "🔊" : "🔇"}
          </button>
        </div>
      </div>

      {/* Desktop fejléc – md felett látható */}
      <div className="hidden md:flex items-center justify-between px-5 py-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: profile.accentColor }}
          >
            {profile.name[0]}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{profile.name}</p>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
              <span className="text-xs text-slate-400">Online</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1 items-center">
          <FileUploadButton mobile={false} />
          <button
            onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
            className={`p-2 rounded-full hover:bg-slate-100 transition-colors ${isSpeechEnabled ? '' : 'opacity-40'}`}
            style={isSpeechEnabled ? { color: profile.accentColor } : {}}
            title="Nova hang be/ki"
          >
            {isSpeechEnabled ? "🔊" : "🔇"}
          </button>
        </div>
      </div>

      {/* Üzenetek */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex animate-fadeInUp ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[80%] flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div
                className={`rounded-2xl px-4 py-3 shadow-sm text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "text-white rounded-tr-sm"
                    : "bg-white border border-slate-100 text-slate-800 rounded-tl-sm"
                }`}
                style={msg.role === "user" ? { backgroundColor: profile.accentColor } : {}}
              >
                {msg.role === "assistant" ? (
                  <ReactMarkdown
                    components={{
                      code: ({ children }) => (
                        <code className="bg-slate-100 rounded px-1 py-0.5 text-xs font-mono">{children}</code>
                      ),
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                )}
              </div>
              {msg.time && (
                <span className="text-xs text-slate-400 px-1">{msg.time}</span>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-fadeInUp">
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-slate-100 flex gap-1.5 items-center">
              <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: `${profile.accentColor}55` }}></div>
              <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: `${profile.accentColor}99`, animationDelay: "0.2s" }}></div>
              <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: profile.accentColor, animationDelay: "0.4s" }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-slate-100">
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={startListening}
            className={`p-3 rounded-full transition-all shrink-0 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
            disabled={isLoading}
            title="Diktálás (Magyar STT)"
          >
            🎤
          </button>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Kérdezz vagy küldj feladatot..."
            rows={1}
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-800 resize-none overflow-hidden bg-slate-50"
            disabled={isLoading}
          />
          <button
            onClick={() => void handleSubmit()}
            disabled={!input.trim() || isLoading}
            className="p-3 rounded-full text-white transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: profile.accentColor }}
            title="Küldés"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-slate-300 text-center mt-2">Enter = küldés · Shift+Enter = új sor</p>
      </div>

    </div>
  );
}
```

- [ ] **Step 2: TypeScript ellenőrzés**

```bash
npx tsc --noEmit
```

Elvárt: hibamentes.

- [ ] **Step 3: Dev szerver indítása és manuális tesztelés**

```bash
npm run dev
```

Ellenőrizendő pontok:
- [ ] Desktopon: bal oldalsáv látható, jobb oldalt a chat
- [ ] Mobilon (böngésző DevTools, < 768px): oldalsáv rejtett, a kék mobil fejléc látható név + cég + Online chip + 📎 + 🔊
- [ ] Üzenet küldése: Enter működik, Shift+Enter új sort ad
- [ ] AI válasz: markdown renderelve (ha a válasz tartalmaz **félkövér** vagy listát)
- [ ] Textarea: 1 sorból indul, hosszú szövegnél nő (max 4 sor)
- [ ] Küldés gomb: nyíl ikon, `profile.accentColor` háttér
- [ ] Loading indikátor: 3 bouncing pont, akcentszínnel
- [ ] Timestamp: minden üzenet alatt HH:MM formátumban
- [ ] fadeInUp: új üzenet felfelé úszik be

- [ ] **Step 4: Commit**

```bash
git add src/app/components/ChatInterface.tsx
git commit -m "feat: redesign ChatInterface – markdown, mobile header, textarea, Enter-to-send, timestamps"
```
