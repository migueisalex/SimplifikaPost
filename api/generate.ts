// FIX: Replaced CommonJS 'require' with an ES module 'import' to resolve compilation error.
import { GoogleGenAI, Type } from "@google/genai";
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
  
  if (!process.env.API_KEY) {
      return response.status(500).json({ error: 'API key not configured on server' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const geminiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    // A resposta da API já é um JSON string, não precisamos parsear duas vezes.
    // A Vercel cuidará de stringificar a resposta final.
    const result = JSON.parse(geminiResponse.text);
    return response.status(200).json(result);

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return response.status(500).json({ error: 'Failed to generate content from AI', details: errorMessage });
  }
}
