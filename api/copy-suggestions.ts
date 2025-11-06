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
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              title: {
                type: SchemaType.STRING,
                description: 'Um título criativo e curto para a sugestão de copy.',
              },
              copy: {
                type: SchemaType.STRING,
                description: 'A sugestão de copy reescrita de forma profissional, sem hashtags.',
              },
            },
            required: ['title', 'copy'],
          },
        },
      },
    });

    const prompt = `Você é um especialista em marketing de redes sociais. Transforme o seguinte texto em 3 versões de copy's profissionais, envolventes e otimizadas para engajamento. Mantenha a essência da mensagem original. Dê um título criativo para cada versão. IMPORTANTE: Não inclua nenhuma hashtag no texto da copy. O texto original é: "${text}"`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const generatedText = response.text();

    // Parse do JSON retornado
    const suggestions = JSON.parse(generatedText);

    return res.status(200).json(suggestions);
  } catch (error: any) {
    console.error('Erro ao gerar sugestões:', error);
    return res.status(500).json({ 
      error: 'Erro ao gerar sugestões',
      details: error.message 
    });
  }
}
