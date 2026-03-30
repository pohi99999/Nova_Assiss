# Nova Irodai Asszisztens – Design Dokumentum (v3.0)

**Dátum:** 2026. március 30.
**Cél:** Az Atlasz Chatbot átalakítása Novává, egy proaktív, könnyen hostolható irodai asszisztenssé.

## 1. Architektúra és Telepítés
- **Self-Hosted Fokus:** Docker és Docker Compose támogatás a könnyű VPS telepítéshez.
- **Adattárolás:** Helyi JSON fájlok (`data/documents.json`, `data/memories.json`) Docker volume-ban a költséghatékony perzisztencia érdekében.
- **Tisztítás:** A `agent/` (Python) mappa eltávolítása, a Next.js API-k kizárólagos használata a komplexitás csökkentésére.

## 2. Intelligencia és Memória
- **Persona:** Segítőkész, proaktív virtuális irodavezető (magyar nyelvű).
- **Proaktív Tanulás:** A webes keresések (Tavily) eredményei automatikusan mentésre kerülnek a `memories.json`-ba.
- **Kontextus-visszacsatolás:** Induláskor Nova felidézi a legutóbbi tevékenységeket az emlékezetéből.
- **RAG Prioritás:** Először a feltöltött belső dokumentumokban keres, utána a memóriában, végül a weben.

## 3. Felhasználói Élmény (UX/UI)
- **Minimalista UI:** A felesleges demó komponensek (`weather`, `moon`, `proverbs`) törlése.
- **Mobilbarát Nézet:** Adaptív elrendezés, ahol mobilon a chat kitölti a képernyőt, a mikrofon gombok pedig kiemelt szerepet kapnak.
- **Hangvezérlés:** Klasszikus "Push-to-Talk" mód OpenAI Nova hanggal (TTS).
- **Fájlkezelés:** Egyszerűsített dokumentum feltöltés irodai használatra.

## 4. Technológiai Stack
- **Frontend/Backend:** Next.js 15 (App Router), React 19, Tailwind CSS.
- **AI:** OpenAI (gpt-4o, gpt-4o-mini, tts-1, text-embedding-3-small).
- **Keresés:** Tavily API.
- **Konténerizáció:** Docker.
