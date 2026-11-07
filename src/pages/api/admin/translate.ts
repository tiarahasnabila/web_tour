import type { APIRoute } from 'astro';
import { verifySessionToken } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
  // Wajib admin login
  const sessionCookie = cookies.get('admin_session')?.value;
  const user = verifySessionToken(sessionCookie);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { texts, targetLang = 'id' } = body;

    if (!Array.isArray(texts) || texts.length === 0) {
      return new Response(JSON.stringify({ error: 'texts array required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Helper untuk menerjemahkan teks satuan via MyMemory Translation API
    async function translateOne(text: string): Promise<string> {
      if (!text || !text.trim()) return text;
      // Jangan terjemahkan jika hanya berisi angka atau simbol
      if (!/[a-zA-Z]/.test(text)) return text;

      try {
        // Potong per baris jika multi-line agar terjemahan rute/poin tetap rapi
        const lines = text.split('\n');
        const translatedLines: string[] = [];

        for (const line of lines) {
          if (!line.trim() || !/[a-zA-Z]/.test(line)) {
            translatedLines.push(line);
            continue;
          }

          // Format itinerary: "08:00 | Title | Desc"
          if (line.includes('|')) {
            const parts = line.split('|');
            const translatedParts: string[] = [];
            for (let i = 0; i < parts.length; i++) {
              const part = parts[i].trim();
              if (i === 0 && /\d/.test(part)) {
                // Jam/waktu tidak perlu diterjemahkan
                translatedParts.push(part);
              } else if (part) {
                const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(part)}&langpair=en|${targetLang}`;
                const res = await fetch(url);
                const data = await res.json();
                translatedParts.push(data?.responseData?.translatedText || part);
              } else {
                translatedParts.push('');
              }
            }
            translatedLines.push(translatedParts.join(' | '));
          } else {
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(line)}&langpair=en|${targetLang}`;
            const res = await fetch(url);
            const data = await res.json();
            translatedLines.push(data?.responseData?.translatedText || line);
          }
        }

        return translatedLines.join('\n');
      } catch (err) {
        console.error('Translation error on text:', text, err);
        return text;
      }
    }

    // Terjemahkan secara paralel dengan batasan
    const translatedTexts = await Promise.all(texts.map(t => translateOne(t)));

    return new Response(JSON.stringify({ success: true, translatedTexts }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('API translate error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
