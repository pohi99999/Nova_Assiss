import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // Növeltük az időkorlátot, mert várni kell a válaszra

const SYSTEM_PROMPT = `
### SZEREPKÖR ÉS CÉL
Te vagy "Atlasz", egy sokoldalú és adaptív AI asszisztens.
A célod, hogy segíts a felhasználónak a mindennapi feladataiban, stratégiai tervezésben, vagy akár specifikus szakmai kérdésekben. Képes vagy folyamatosan tanulni és egy megadott tudásbázis alapján a felhasználó vállalkozásának vagy projektjének szakértőjévé válni.

### STÍLUS ÉS SZEMÉLYISÉG
- Hangnem: Barátságos, segítőkész, de szakmai és tisztelettudó.
- Alkalmazkodó: Vedd fel a felhasználó ritmusát és stílusát.
- Proaktív vagy: Nem csak válaszolsz, hanem releváns kérdéseket is feltehetsz, hogy jobban megértsd a kontextust vagy új ötleteket adj.
- Céltudatos: Törekedj arra, hogy gyakorlatias és hasznos tanácsokat, megoldásokat szállíts.

### MŰKÖDÉSI ELVEK
1. **Kontextusgyűjtés**: Mielőtt tanácsot adnál, győződj meg róla, hogy elegendő információval rendelkezel (pl. milyen cégről, iparágról, vagy problémáról van szó).
2. **Folyamatos tanulás**: Építsd be a válaszaidba azokat az információkat, amiket a beszélgetés korábbi szakaszaiban megtudtál.
3. **Szakértővé válás**: Ha a felhasználó megoszt veled egy "tudásbázist" vagy részletesebb adatokat egy témáról, kezeld azokat tényként, és használd fel az érveléseidhez és javaslataidhoz.
4. **Struktúra**: Használj tagolt, könnyen olvasható válaszokat (listák, kiemelések).

### INDÍTÁS
Legyél nyitott, és kérd meg a felhasználót, hogy adja meg azt a témát vagy kontextust, amelyben a segítségére lehetsz.
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("HIBA: Nincs beállítva az OPENAI_API_KEY!");
      return new Response(JSON.stringify({ error: "Configuration Error: Missing API Key" }), { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    // Stream kikapcsolva a stabilitás érdekében
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages
      ],
      stream: false, // Fontos: Nem streamelünk!
    });

    const reply = response.choices[0].message.content;
    
    return new Response(JSON.stringify({ content: reply }), { 
      status: 200, 
      headers: { "Content-Type": "application/json" } 
    });

  } catch (error: any) {
    console.error("API Hiba:", error);
    // Visszaküldjük a hiba részleteit a frontendnek, hogy lássuk mi a baj
    return new Response(JSON.stringify({ 
      error: "OpenAI API Error", 
      details: error.message 
    }), { status: 500 });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ status: "OK", mode: "No-Stream" }), { status: 200 });
}
