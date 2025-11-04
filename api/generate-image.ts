import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt é obrigatório' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY não está configurada');
      return res.status(500).json({ error: 'Configuração do servidor incompleta' });
    }

    // Inicializar o cliente Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Usar o modelo de geração de imagens
    const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
            // Não é necessário configurar responseModalities, o SDK lida com isso
        },
    });

    // Extrair a imagem em base64 e o mimeType
    const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

    if (!imagePart || !imagePart.inlineData) {
        throw new Error("Nenhuma imagem foi retornada pela API.");
    }

    const { data, mimeType } = imagePart.inlineData;

    return res.status(200).json({
        success: true,
        base64Data: data,
        mimeType: mimeType,
    });

  } catch (error: any) {
    console.error('Erro ao gerar imagem:', error);
    // Retorna o erro detalhado para o frontend para debug
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao gerar imagem',
      details: error.message 
    });
  }
}
