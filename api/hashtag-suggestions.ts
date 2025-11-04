import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Apenas aceitar método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Texto é obrigatório' });
    }

    // Verificar se a API key está configurada
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY não está configurada');
      return res.status(500).json({ error: 'Configuração do servidor incompleta' });
    }

    // Inicializar o cliente Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            suggestions: {
              type: SchemaType.ARRAY,
              description: 'Uma lista de 4 strings, onde cada string contém um grupo de hashtags relevantes.',
              items: { 
                type: SchemaType.STRING 
              }
            }
          },
          required: ['suggestions'],
        },
      },
    });

    const prompt = `Baseado no seguinte texto de um post para redes sociais, gere 4 conjuntos distintos de hashtags otimizadas para engajamento. Cada conjunto deve ser uma única string de texto, com hashtags separadas por espaço. O texto é: "${text}"`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const generatedText = response.text();
    
    // O Gemini 2.0 Flash retorna o JSON como uma string dentro do texto.
    // Precisamos extrair e fazer o parse.
    const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/);
    let jsonString = generatedText;

    if (jsonMatch && jsonMatch[1]) {
        jsonString = jsonMatch[1];
    }
    
    // Parse do JSON retornado
    const data = JSON.parse(jsonString);

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Erro ao gerar sugestões de hashtags:', error);
    return res.status(500).json({ 
      error: 'Erro ao gerar sugestões de hashtags',
      details: error.message 
    });
  }
}
