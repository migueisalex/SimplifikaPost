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
    
    // Usar o método generateImages para o modelo Imagen
    const imageResponse = await genAI.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '1:1', // Padrão para posts de feed
        }
    });

    // Extrair a imagem em base64 e o mimeType
    const generatedImage = imageResponse.generatedImages[0];
    const base64Data = generatedImage.image.imageBytes;
    const mimeType = generatedImage.image.mimeType;

    if (!base64Data || !mimeType) {
        throw new Error("Nenhuma imagem foi retornada pela API.");
    }

    return res.status(200).json({
        success: true,
        base64Data: base64Data,
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
