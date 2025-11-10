import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import LoadingSpinner from './LoadingSpinner';
import GeminiIcon from './GeminiIcon';

interface ImageGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (base64Data: string, mimeType: string) => Promise<void>;
  userApiKey?: string;
  referenceImageUrl?: string | null;
}

const ImageGenerationModal: React.FC<ImageGenerationModalProps> = ({ isOpen, onClose, onGenerate, userApiKey, referenceImageUrl }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentReferenceImage, setCurrentReferenceImage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
        if (referenceImageUrl) {
            setPrompt("Aprimore a qualidade da imagem de referência, melhorando a resolução, nitidez e iluminação para um resultado profissional, mantendo a composição original.");
            setCurrentReferenceImage(referenceImageUrl);
        } else {
            setPrompt('');
            setCurrentReferenceImage(null);
        }
    }
  }, [isOpen, referenceImageUrl]);

  const handleReferenceImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit for inline data
        setError('A imagem de referência é muito grande. O limite é 4MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentReferenceImage(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = ''; // Reset input to allow re-selecting the same file
  };
  
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Por favor, digite um prompt para gerar a imagem.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const apiKey = userApiKey || process.env.API_KEY;
      if (!apiKey) {
        setError("A chave da API de IA não está configurada.");
        setIsLoading(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });

      // 1. Translate prompt to English for better results
      let translatedPrompt = prompt.trim();
      try {
        const translateResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Translate the following text to English for an AI image generator. Keep the core creative meaning. If it's already in English, just return the original text. Text: "${prompt.trim()}"`,
          config: { temperature: 0.2, thinkingConfig: { thinkingBudget: 0 } }
        });

        if (translateResponse.text) {
            translatedPrompt = translateResponse.text.replace(/^"(.*)"$/, '$1').trim();
        }
      } catch (e) {
        console.warn("Translation failed, using original prompt.", e);
      }

      // 2. Build parts for image generation request
      const parts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] = [{ text: translatedPrompt }];
      if (currentReferenceImage) {
        const [header, base64Data] = currentReferenceImage.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
        parts.unshift({
          inlineData: { mimeType, data: base64Data }
        });
      }

      // 3. Generate image
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });

      const responseParts = response.candidates?.[0]?.content?.parts;
      if (responseParts) {
        for (const part of responseParts) {
          if (part.inlineData?.data && part.inlineData.mimeType) {
            await onGenerate(part.inlineData.data, part.inlineData.mimeType);
            // onClose(); // Let parent handle closing
            return;
          }
        }
      }
      throw new Error("Nenhuma imagem foi retornada pela API.");

    } catch (e) {
      console.error("Erro ao gerar imagem:", e);
      if (e instanceof Error && (e.message.includes("429") || e.message.includes("Quota exceeded"))) {
        setError("Limite de uso da API atingido. Verifique seu plano e faturamento, ou tente novamente mais tarde.");
      } else {
        setError("Não foi possível gerar a imagem. Verifique o prompt ou tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[70] p-4" onClick={onClose}>
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-lg flex flex-col relative" onClick={(e) => e.stopPropagation()}>
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-dark-card/80 flex flex-col justify-center items-center z-10 rounded-lg">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600 dark:text-gray-300 font-semibold animate-pulse">Aprimorando imagem com IA...</p>
          </div>
        )}
        
        <div className="p-6 border-b dark:border-dark-border flex items-center gap-3">
          <GeminiIcon className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Gerar Imagem com IA</h2>
        </div>
        
        <div className="p-6 space-y-4">
          {currentReferenceImage ? (
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Imagem de Referência:
                </label>
                <div className="relative w-24 h-24 border dark:border-dark-border rounded-lg p-1">
                    <img src={currentReferenceImage} alt="Referência" className="w-full h-full object-contain" />
                    <button 
                        onClick={() => setCurrentReferenceImage(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 leading-none hover:bg-red-600 transition-transform transform hover:scale-110"
                        title="Remover Referência"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            </div>
          ) : (
             <div>
                <label htmlFor="reference-upload" className="w-full text-center cursor-pointer border-2 border-dashed border-gray-300 dark:border-dark-border hover:border-brand-primary dark:hover:border-brand-secondary hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-bold py-3 px-4 rounded-lg block transition">
                    Anexar Imagem de Referência (Opcional)
                </label>
                <input
                    type="file"
                    id="reference-upload"
                    accept="image/*"
                    onChange={handleReferenceImageChange}
                    className="hidden"
                    disabled={isLoading}
                />
            </div>
          )}

          <div>
            <label htmlFor="image-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descreva a imagem que você quer criar (ou as melhorias para a referência):
            </label>
            <textarea
              id="image-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="w-full p-2 border border-gray-300 dark:border-dark-border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition"
              placeholder="Ex: Um astronauta surfando em uma onda cósmica, estilo aquarela..."
              disabled={isLoading}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-900/50 px-6 py-4 flex justify-end items-center gap-4 rounded-b-lg border-t dark:border-dark-border">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isLoading}
            className="py-2 px-4 bg-gray-200 dark:bg-dark-border text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            type="button" 
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="py-2 px-6 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <><LoadingSpinner className="w-5 h-5" /> Gerando...</> : 'Gerar Imagem'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerationModal;