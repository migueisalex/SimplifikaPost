import { GoogleGenAI, Type } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Inicializa o cliente com a chave da API a partir das variáveis de ambiente do servidor
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { type, prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const model = "gemini-2.5-flash";
    let config = {};

    if (type === 'suggestions') {
      config = {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: 'Um título criativo e curto para a sugestão de copy.',
              },
              copy: {
                type: Type.STRING,
                description: 'A sugestão de copy reescrita de forma profissional, sem hashtags.',
              },
            },
            required: ["title", "copy"],
          },
        },
      };
    } else if (type === 'hashtags') {
      config = {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              description: "Uma lista de 4 strings, onde cada string contém um grupo de hashtags relevantes.",
              items: { type: Type.STRING }
            }
          }
        }
      };
    } else {
      return res.status(400).json({ error: 'Invalid request type' });
    }

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config,
    });
    
    // Envia o texto da resposta de volta para o cliente
    res.status(200).json({ result: response.text });

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
}
