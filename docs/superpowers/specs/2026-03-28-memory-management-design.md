# Memória Menedzsment – Design Spec

**Dátum:** 2026-03-28
**Projekt:** Nova_assisst (Atlasz AI Chat)
**Típus:** Új feature – memóriák megtekintése és törlése

---

## Célkitűzés

A felhasználó láthassa és törölhesse az AI által automatikusan kinyert tényeket (memóriákat). A felület a chat fejlécébe integrált 🧠 gombból nyílik meg modal formában.

---

## Backend változások

### GET /api/memories – id mező hozzáadása

Jelenlegi válasz: `{ memories: [{ text, source, createdAt }] }`
Új válasz: `{ memories: [{ id, text, source, createdAt }] }`

Az `id` az `db.memories` `VectorRecord.id` mezőjéből jön.

### DELETE /api/memories/[id] – új endpoint

- Fájl: `src/app/api/memories/[id]/route.ts`
- Paraméter: `id` (URL szegmens)
- Művelet: megkeresi a `db.memories` tömbben az `id`-t, eltávolítja, menti a fájlt (`db.saveMemories()`)
- Siker: `200 { success: true }`
- Nem találja: `404 { error: 'Nem található' }`

---

## Frontend változások

### ChatInterface.tsx – 🧠 gomb és modal

**Állapotok:**
- `isMemoryOpen: boolean` – modal nyitva/zárva
- `memories: MemoryItem[]` – betöltött memóriák listája
- `MemoryItem: { id: string; text: string; source: string; createdAt: string }`

**🧠 gomb elhelyezése:**
- Desktop fejlécbe: a 📎 és 🔊 gombok mellé
- Mobil fejlécbe: ugyanoda

**Modal:**
- Overlay: `fixed inset-0 bg-black/40 z-50 flex items-center justify-center`
- Kártya: `bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6`
- Fejléc: "Megjegyzett tények" cím + X bezáró gomb
- Lista: minden sor tartalmaz:
  - Tény szövege (`text-sm text-slate-800`)
  - Forrás chip: `user-extraction` → "Te mondtad" (blue-50/blue-600), `assistant-extraction` → "AI kinyerte" (purple-50/purple-600)
  - X törlés gomb (`text-slate-400 hover:text-red-500`)
- Üres állapot: "Még nincs megjegyezett tény." (`text-slate-400 text-sm text-center py-4`)
- Törlés: optimistic UI – azonnal eltávolítja a listából, háttérben `DELETE /api/memories/[id]`

**Modal megnyitásakor:** `GET /api/memories` friss hívás (mindig aktuális adatok).

---

## Érintett fájlok

| Fájl | Változás |
|------|---------|
| `src/app/api/memories/route.ts` | `id` mező hozzáadása a GET válaszhoz |
| `src/app/api/memories/[id]/route.ts` | Új DELETE endpoint |
| `src/app/components/ChatInterface.tsx` | 🧠 gomb + modal + törlés logika |

---

## Nem változik

- `src/lib/db.ts` – nincs szükség módosításra, `db.memories` már tartalmazza az `id`-t
- Chat pipeline, TTS, STT, file upload – érintetlen
