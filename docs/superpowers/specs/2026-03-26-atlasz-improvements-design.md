# Atlasz AI – 4 Fejlesztés Design Spec

**Dátum:** 2026-03-26
**Státusz:** Jóváhagyva
**Projekt:** chat_v1_Atlasz

---

## Összefoglaló

Négy önálló fejlesztés az Atlasz AI chat asszisztenshez. Minden fejlesztés a meglévő kódbázisra épít, új fájl minimálisan keletkezik.

---

## 1. Konverzáció Perzisztencia

### Döntés
A tények (`memories.json`) megmaradnak oldalújratöltés után. A chat előzmény nem szükséges – az asszisztens a memóriából "emlékezik" a lényegre.

### Új végpont
`GET /api/memories/route.ts`

- Visszaadja a `memories.json` tartalmát
- Csak `text` és `metadata.source` mezők (embedding kihagyva – felesleges a frontendnek)
- Üres tömb ha nincs még mentett tény

```typescript
// Válasz formátum
{ memories: Array<{ text: string; source: string; createdAt: string }> }
```

### Frontend változás (`ChatInterface.tsx`)
`useEffect` induláskor lekéri a memóriákat:
- **Ha van tény:** az asszisztens első üzenete memória-alapú üdvözlés (felsorolja a tényeket)
- **Ha nincs tény:** az eredeti köszöntő üzenet jelenik meg (változatlan)

### Érintett fájlok
- `src/app/api/memories/route.ts` — ÚJ
- `src/app/components/ChatInterface.tsx` — módosítás (useEffect + üdvözlés logika)

---

## 2. Szervezeti Testreszabhatóság

### Döntés
Deploy-onként egy szervezet. Egy új szervezethez csak két fájlt kell szerkeszteni, TypeScript tudás nélkül.

### `profile.json` bővítés
```json
{
  "name": "Atlasz",
  "company": "Sólyom Daru Kft.",
  "slogan": "AI Stratégiai Tanácsadó",
  "voice": "nova",
  "accentColor": "#2563eb",
  "greeting": "Szia! Én vagyok Atlasz, a személyes AI asszisztensed."
}
```

Új mezők: `accentColor` (CSS hex szín, pl. `#2563eb` – inline style-ként használjuk), `greeting` (első üzenet szövege).

### Új fájl: `src/config/system-prompt.md`
A teljes system prompt plain Markdown szövegként. Nem TypeScript, nem backtick-ek, szabadon szerkeszthető.

A `/api/chat/route.ts` és `/api/copilotkit/route.ts` ebből olvassa a system promptot – a jelenlegi hardcoded string-ek törlésre kerülnek.

### `config.ts` bővítés
```typescript
export interface AssistantProfile {
  name: string;
  company: string;
  slogan: string;
  voice: string;
  accentColor: string;
  greeting: string;
}

export async function getSystemPrompt(): Promise<string> {
  const md = await fs.readFile(
    path.join(process.cwd(), 'src/config/system-prompt.md'),
    'utf-8'
  );
  return md;
}
```

### Frontend változás
A `ChatInterface.tsx` és `page.tsx` az `accentColor` és `greeting` értékeket **direct import**ként kapja (`import profile from '@/config/profile.json'`). Nincs szükség új API végpontra – a config statikus, build-time elérhető.

### Érintett fájlok
- `src/config/profile.json` — módosítás (új mezők)
- `src/config/system-prompt.md` — ÚJ (jelenlegi hardcoded prompt ide kerül)
- `src/lib/config.ts` — módosítás (getSystemPrompt + bővített interfész)
- `src/app/api/chat/route.ts` — módosítás (getSystemPrompt() hívás)
- `src/app/api/copilotkit/route.ts` — módosítás (getSystemPrompt() hívás)

---

## 3. Memória Minőség

### Döntés
User üzenetéből ÉS az AI válaszából is kinyerjük a tényeket. A `metadata.source` mező jelzi a forrást.

### Forrásértékek
| Érték | Jelentés |
|-------|---------|
| `user-extraction` | A felhasználó mondta |
| `assistant-extraction` | Az AI válaszában jelent meg |

### `extractAndSaveFact` függvény módosítás
A függvény kap egy opcionális `source` paramétert (alapértelmezett: `'user-extraction'`):

```typescript
async function extractAndSaveFact(
  message: string,
  source: 'user-extraction' | 'assistant-extraction' = 'user-extraction'
)
```

### Párhuzamos futtatás
```typescript
// A választ azonnal visszaküldjük, a ténykinyerés háttérben fut
Promise.all([
  extractAndSaveFact(userMessage, 'user-extraction'),
  extractAndSaveFact(assistantReply, 'assistant-extraction')
]);

return NextResponse.json({ reply: assistantReply });
```

A `Promise.all` **nem `await`-elve** – nem blokkolja a válasz visszaküldését.

### Érintett fájlok
- `src/app/api/chat/route.ts` — módosítás (source paraméter + párhuzamos hívás)

---

## 4. Build Javítás (TypeScript + ESLint)

### Döntés
Fokozatos, valódi javítás. Nincs `@ts-ignore`, nincs `@ts-expect-error` elnyomás.

### `next.config.ts` változás
```typescript
// Töröljük ezeket:
// typescript: { ignoreBuildErrors: true }
// eslint: { ignoreDuringBuilds: true }
```

### Várható TypeScript hibák és javításuk

| Hiba | Javítás |
|------|---------|
| `SpeechRecognition` / `webkitSpeechRecognition` típus hiány | `npm install -D @types/dom-speech-recognition` vagy explicit interfész deklaráció |
| `catch (error: any)` | `catch (error: unknown)` + `instanceof Error` ellenőrzés |
| `pdf-parse` típusdefiníció | `@types/pdf-parse` telepítés vagy lokális `.d.ts` |
| `any` az API route válaszoknál | Explicit return típus `NextResponse<T>` |

### Folyamat
1. `next.config.ts`-ből törölni az `ignore` flageket
2. `npm run build` – hibák listája
3. Hibák javítása egyenként
4. `npm run lint` – ESLint hibák javítása
5. Sikeres build = kész

### Érintett fájlok
- `next.config.ts` — módosítás
- `src/app/components/ChatInterface.tsx` — valószínű típusjavítások
- `src/app/api/*/route.ts` — valószínű típusjavítások

---

## Implementációs Sorrend

```
1. TypeScript build fix (önálló, nincs függőség)
2. system-prompt.md + config.ts bővítés (alapja a többi API változásnak)
3. profile.json bővítés + greeting az UI-ban
4. /api/memories GET végpont + ChatInterface startup logika
5. extractAndSaveFact source paraméter + párhuzamos hívás
```

---

## Nem változik

- `data/documents.json` és `data/memories.json` séma (visszafelé kompatibilis, a `source` mező opcionális)
- RAG keresés logikája (cosine similarity mindkét forrásra működik)
- TTS (Nova hang) – érintetlen
- STT (böngésző Speech API) – érintetlen
- Deploy folyamat (Vercel) – érintetlen
