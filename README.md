# 🌌 Nova Irodai Asszisztens (v3.0)

A Nova egy proaktív, magyar nyelvű AI irodai asszisztens, amely a **Sólyom Daru Kft.** specifikus igényeire lett szabva. Képes tanulni a feltöltött dokumentumokból, emlékezni a korábbi beszélgetésekre, és szükség esetén az interneten is keresni.

## 🚀 Főbb Jellemzők
- **Proaktív Segítségnyújtás:** Nova nemcsak válaszol, hanem javaslatokat tesz a következő lépésekre.
- **RAG (Retrieval-Augmented Generation):** Saját tudásbázis PDF, TXT és MD fájlokból.
- **Folyamatos Tanulás:** Minden beszélgetésből fontos tényeket nyer ki és ment el a hosszú távú memóriájába.
- **Webes Keresés:** Tavily integráció a naprakész információkért.
- **Hangvezérlés:** OpenAI Nova hang alapú TTS (Text-to-Speech) és Push-to-Talk bevitel.
- **Self-Hosted:** Docker-alapú egyszerű telepítés bármilyen VPS-re.

## 🛠️ Technológiai Stack
- **Frontend:** Next.js 15 (React 19, Tailwind CSS v4)
- **AI/LLM:** OpenAI GPT-4o, GPT-4o-mini
- **Keresés:** Tavily API
- **Adattárolás:** Helyi JSON vektoros adatbázis (Docker Volume perzisztenciával)

## 📦 Gyors Telepítés (Docker)
*(Hamarosan)*
```bash
docker-compose up -d
```

## 💻 Fejlesztés
```bash
npm install
npm run dev
```

Olvasd el a [GEMINI.md](./GEMINI.md) fájlt a részletes fejlesztői irányelvekért.
