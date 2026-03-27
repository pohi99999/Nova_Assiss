import OpenAI from 'openai';

const RELEVANCE_THRESHOLD = 0.75;

interface TavilyResult {
  title: string;
  content: string;
  url: string;
}

interface TavilyResponse {
  results: TavilyResult[];
}

/**
 * Webes keresés Tavily API-val.
 * Hiba esetén csendesen '' ad vissza.
 */
export async function searchWeb(query: string): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return '';

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        max_results: 3,
        search_depth: 'basic',
      }),
    });

    if (!response.ok) return '';

    const data = (await response.json()) as TavilyResponse;
    if (!data.results?.length) return '';

    return data.results
      .map((r) => `[${r.title}]: ${r.content}`)
      .join('\n\n');
  } catch {
    return '';
  }
}

/**
 * Eldönti, kell-e webes keresés.
 * true ha: RAG relevancia alacsony VAGY az LLM szerint időérzékeny a kérdés.
 */
export async function shouldSearchWeb(
  query: string,
  maxRagScore: number
): Promise<boolean> {
  if (maxRagScore < RELEVANCE_THRESHOLD) return true;

  // Intent check: csak ha a RAG score egyébként jó
  try {
    const openai = new OpenAI();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Döntsd el, hogy a következő kérdés megválaszolásához friss, aktuális webes információ szükséges-e (pl. hírek, időjárás, árfolyam, mai események). Válaszolj pontosan: "igen" vagy "nem".',
        },
        { role: 'user', content: query },
      ],
      max_tokens: 5,
      temperature: 0,
    });

    const answer = response.choices[0].message.content?.trim().toLowerCase();
    return answer === 'igen';
  } catch {
    return false;
  }
}
