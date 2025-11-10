// FIX: Add reference to Vite client types to resolve TypeScript error for import.meta.env
/// <reference types="vite/client" />
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Suggestion } from '../types';
import LoadingSpinner from './LoadingSpinner';
import GeminiIcon from './GeminiIcon';

interface SuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
  onSelectSuggestion: (text: string) => void;
}

const SuggestionsModal: React.FC<SuggestionsModalProps> = ({ isOpen, onClose, originalText, onSelectSuggestion }) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && originalText) {
      const fetchSuggestions = async () => {
        setIsLoading(true);
        setError(null);
        setSuggestions([]);

        try {
          const apiKey = import.meta.env.GEMINI_API_KEY;
          if (!apiKey) {
            setError("A chave da API não foi configurada. Entre em contato com o suporte.");
            setIsLoading(false);
            return;
          }
          const ai = new GoogleGenAI({ apiKey });
          
          const prompt = `Você é um especialista em marketing de redes sociais. Transforme o seguinte texto em 3 versões de copy's profissionais, envolventes e otimizadas para engajamento. Mantenha a essência da mensagem original. Dê um título criativo para cada versão. IMPORTANTE: Não inclua nenhuma hashtag no texto da copy. O texto original é: "${originalText}"`;

          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
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
            },
          });
          
          if (response.text) {
            const parsedSuggestions = JSON.parse(response.text);
            setSuggestions(parsedSuggestions);
          } else {
            throw new Error("A resposta da IA estava vazia.");
          }

        } catch (e) {
          console.error("Erro ao buscar sugestões:", e);
          if (e instanceof Error && (e.message.includes("429") || e.message.includes("Quota exceeded"))) {
            setError("Limite de uso da API atingido. Verifique seu plano e faturamento, ou tente novamente mais tarde.");
          } else {
            setError("Não foi possível gerar sugestões. Tente novamente mais tarde.");
          }
        } finally {
          setIsLoading(false);
        }
      };

      fetchSuggestions();
    }
  }, [isOpen, originalText]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[60] p-4" onClick={onClose}>
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b dark:border-dark-border flex items-center gap-3">
            <GeminiIcon className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Sugestões de Copy com IA</h2>
        </div>

        <div className="flex-grow overflow-y-auto p-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <LoadingSpinner />
              <p className="text-gray-600 dark:text-gray-300 animate-pulse">Gerando ideias incríveis...</p>
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center h-full text-center text-red-500">
                <p className="font-semibold">Ocorreu um erro</p>
                <p>{error}</p>
            </div>
          )}
          {!isLoading && !error && (
            <div className="space-y-4">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border dark:border-dark-border transition-all hover:shadow-md hover:border-brand-secondary">
                  <h3 className="font-bold text-lg text-brand-primary mb-2">{suggestion.title}</h3>
                  <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-200 mb-4">{suggestion.copy}</p>
                  <button
                    onClick={() => onSelectSuggestion(suggestion.copy)}
                    className="w-full sm:w-auto py-2 px-5 text-sm font-bold bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition shadow"
                  >
                    Usar este texto
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-100 dark:bg-gray-900/50 px-6 py-4 flex justify-end gap-4 rounded-b-lg border-t dark:border-dark-border">
          <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 dark:bg-dark-border text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuggestionsModal;