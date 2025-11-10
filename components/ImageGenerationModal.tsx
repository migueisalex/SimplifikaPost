// FIX: Add reference to Vite client types to resolve TypeScript error for import.meta.env
/// <reference types="vite/client" />
import React, { useState } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import LoadingSpinner from './LoadingSpinner';
import GeminiIcon from './GeminiIcon';

interface ImageGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (base64Data: string, mimeType: string) => Promise<void>;
}

const ImageGenerationModal: React.FC<ImageGenerationModalProps> = ({ isOpen, onClose, onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Por favor, digite um prompt para gerar la imagem.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const apiKey = import.meta.env.GEMINI_API_KEY;
      if (!apiKey) {
        setError("A chave da API não foi configurada. Entre em contato com o suporte.");
        setIsLoading(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt.trim() }],
        },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });

      const parts = response.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData?.data && part.inlineData.mimeType) {
            await onGenerate(part.inlineData.data, part.inlineData.mimeType);
            onClose(); // Close modal on success
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
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-lg flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b dark:border-dark-border flex items-center gap-3">
          <GeminiIcon className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Gerar Imagem com IA</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="image-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descreva a imagem que você quer criar:
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