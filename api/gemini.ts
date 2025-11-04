import { GoogleGenAI, Type } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt, type } = req.body;

  if (!prompt || !type) {
    return res.status(400).json({ error: 'Missing prompt or type in request body' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    let responseSchema;
    if (type === 'suggestions') {
        responseSchema = {
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
        };
    } else if (type === 'hashtags') {
        responseSchema = {
            type: Type.OBJECT,
            properties: {
                suggestions: {
                  type: Type.ARRAY,
                  description: "Uma lista de 4 strings, onde cada string contém um grupo de hashtags relevantes.",
                  items: { type: Type.STRING }
                }
            }
        };
    } else {
        return res.status(400).json({ error: 'Invalid type specified' });
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    // The response.text is a string containing JSON, so we parse it before sending.
    const jsonData = JSON.parse(response.text);
    return res.status(200).json(jsonData);

  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    return res.status(500).json({ error: 'Failed to generate content from AI', details: error.message });
  }
}
