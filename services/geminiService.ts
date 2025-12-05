import { GoogleGenAI } from "@google/genai";
import { NewsResult, Source } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const fetchNews = async (topic: string): Promise<NewsResult> => {
  try {
    const modelId = 'gemini-2.5-flash';
    
    // Construct a prompt that encourages a good summary suitable for a "daily briefing"
    // Updated to request Spanish response and specific date formatting at the top
    const prompt = `
      Actúa como un asistente de noticias personal. 
      Genera un resumen conciso, atractivo y actualizado sobre "${topic}".
      Céntrate en eventos de hoy o de esta semana.
      
      **INSTRUCCIONES CRÍTICAS:**
      1. Responde SIEMPRE en ESPAÑOL.
      2. FORMATO OBLIGATORIO: Para cada noticia o evento, debes poner la fecha en la parte superior en formato "**DD Mes AAAA**" (Ejemplo: **12 Octubre 2023**).
      3. Debajo de la fecha, escribe el resumen de la noticia.
      
      Ejemplo de estructura deseada:
      
      **15 Marzo 2024**
      Resumen de la primera noticia importante del día...
      
      **14 Marzo 2024**
      Resumen de otra noticia anterior...

      Usa negrita para las fechas. No uses encabezados markdown (##).
      Si hay varias noticias, sepáralas claramente.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // Note: responseMimeType and responseSchema are NOT allowed with googleSearch
      },
    });

    const text = response.text || "No se encontraron noticias recientes sobre este tema.";

    // Extract grounding chunks for sources
    const sources: Source[] = [];
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || "Fuente",
            uri: chunk.web.uri,
          });
        }
      });
    }

    // Deduplicate sources based on URI
    const uniqueSources = sources.filter((v, i, a) => a.findIndex(t => (t.uri === v.uri)) === i);

    return {
      summary: text,
      sources: uniqueSources,
    };

  } catch (error) {
    console.error("Error fetching news:", error);
    throw error;
  }
};