import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, schema } = request.body;

  if (!prompt || !schema) {
    return response.status(400).json({ error: 'Prompt and schema are required' });
  }
  
  // FIX 1: Explicitly handle the 'string | undefined' type for the API key.
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
      // This error is more specific and helpful for debugging.
      return response.status(500).json({ error: 'A variável de ambiente API_KEY não está configurada no servidor Vercel.' });
  }

  try {
    // Pass the validated apiKey constant to the constructor.
    const ai = new GoogleGenAI({ apiKey }); 
    const geminiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    // FIX 2: Explicitly handle the possibility of an undefined text response.
    const responseText = geminiResponse.text;
    if (responseText === undefined) {
        // This makes it clear that the API returned an unexpected empty response.
        throw new Error("A API da Gemini retornou uma resposta de texto vazia (undefined).");
    }

    const result = JSON.parse(responseText);
    return response.status(200).json(result);

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return response.status(500).json({ error: 'Falha ao gerar conteúdo da IA.', details: errorMessage });
  }
}
