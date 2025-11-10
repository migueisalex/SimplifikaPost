import React, { useState } from 'react';
import { HashtagGroup } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import LoadingSpinner from './LoadingSpinner';

interface HashtagModalProps {
  onSave: (group: Omit<HashtagGroup, 'id'>) => boolean;
  onClose: () => void;
  postContent: string;
  onApplyAIHashtags: (hashtags: string) => void;
  aiHashtagsApplied: boolean;
  canGenerateText: boolean;
  incrementAiGenerationCount: () => void;
  onUpgradeRequest: (reason: string) => void;
  userApiKey?: string;
}

const HashtagModal: React.FC<HashtagModalProps> = ({ onSave, onClose, postContent, onApplyAIHashtags, aiHashtagsApplied, canGenerateText, incrementAiGenerationCount, onUpgradeRequest, userApiKey }) => {
  const [name, setName] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [error, setError] = useState('');
  
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [didAttemptGeneration, setDidAttemptGeneration] = useState(false);

  const fetchHashtagSuggestions = async () => {
    if (!canGenerateText) {
        onUpgradeRequest("ai_text_limit");
        return;
    }
    if (!postContent) {
      setAiError("Escreva um texto no post para receber sugestões de hashtags.");
      return;
    }
    
    setIsLoading(true);
    setAiError(null);
    setSuggestedHashtags([]);

    try {
      const apiKey = userApiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        setAiError("A chave da API de IA não está configurada.");
        setIsLoading(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Baseado no seguinte texto de um post para redes sociais, gere 4 conjuntos distintos de hashtags otimizadas para engajamento. Cada conjunto deve ser uma única string de texto, com hashtags separadas por espaço. O texto é: "${postContent}"`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
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
        }
      });
      
      if (response.text) {
        const result = JSON.parse(response.text);
        if (result.suggestions && Array.isArray(result.suggestions)) {
          setSuggestedHashtags(result.suggestions);
          incrementAiGenerationCount();
        } else {
          throw new Error("Resposta da IA em formato inesperado.");
        }
      } else {
        throw new Error("A resposta da IA estava vazia.");
      }

    } catch (e) {
      console.error("Erro ao buscar sugestões de hashtags:", e);
      if (e instanceof Error && (e.message.includes("429") || e.message.includes("Quota exceeded"))) {
        setAiError("Limite de uso da API atingido. Verifique seu plano e faturamento, ou tente novamente mais tarde.");
      } else {
        setAiError("Não foi possível gerar sugestões. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateClick = () => {
    setDidAttemptGeneration(true);
    fetchHashtagSuggestions();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !hashtags.trim()) {
      setError('O nome do grupo e as hashtags não podem estar vazios.');
      return;
    }
    const success = onSave({ name, hashtags });
    if(success) {
        setName('');
        setHashtags('');
    }
  };

  const renderAiContent = () => {
    if (aiHashtagsApplied) {
      return (
        <div className="flex items-center justify-center h-24 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
          <p className="font-bold text-gray-600 dark:text-gray-300">SUGESTÃO DA IA JÁ FOI UTILIZADA!</p>
        </div>
      );
    }
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-24">
          <LoadingSpinner className="w-8 h-8"/>
        </div>
      );
    }
    if (aiError) {
        return <p className="text-red-500 text-sm">{aiError}</p>;
    }
    if (!didAttemptGeneration) {
      return (
        <button
          type="button"
          onClick={handleGenerateClick}
          className="w-full text-center cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-opacity"
        >
          ✨ Gerar Hashtags com IA
        </button>
      );
    }
    if (suggestedHashtags.length > 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {suggestedHashtags.map((suggestion, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border dark:border-dark-border">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 break-words h-16 overflow-y-auto">{suggestion}</p>
              <button 
                type="button" 
                onClick={() => onApplyAIHashtags(suggestion)}
                className="w-full text-center py-1.5 px-3 text-xs font-bold bg-brand-primary text-white rounded-md hover:bg-brand-secondary transition"
              >
                Aplicar
              </button>
            </div>
          ))}
        </div>
      );
    }
    return null; // Should not happen if no error
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[60] p-4" onClick={onClose}>
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b dark:border-dark-border flex-shrink-0">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Gerenciar Hashtags</h2>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto">
                {/* AI Suggestions Section */}
                <div className="space-y-3">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Sugestões da IA</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 -mt-1">A escolhida será aplicada diretamente na descrição</p>
                    </div>
                    {renderAiContent()}
                </div>

                <div className="border-t border-gray-200 dark:border-dark-border my-4"></div>

                {/* Create Group Section */}
                 <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Criar grupo de hashtags para usar com 1 clique!</h3>
                    <div>
                        <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Grupo</label>
                        <input
                            id="groupName"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-dark-border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition"
                            placeholder="Ex: Praia & Verão"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="hashtags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hashtags</label>
                        <textarea
                            id="hashtags"
                            value={hashtags}
                            onChange={(e) => setHashtags(e.target.value)}
                            rows={4}
                            className="w-full p-2 border border-gray-300 dark:border-dark-border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition"
                            placeholder="#viagem #verao #praia..."
                            required
                        />
                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Digite suas hashtags para criar um novo grupo.</p>
                    </div>
                    
                     <div className="bg-gray-100 dark:bg-gray-900/50 -m-6 mt-4 p-4 flex items-center justify-end gap-4 rounded-b-lg border-t dark:border-dark-border">
                        {error && (
                        <p className="text-red-500 text-sm font-semibold mr-auto">
                            {error}
                        </p>
                        )}
                         <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 dark:bg-dark-border text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                           Fechar
                         </button>
                        <button type="submit" className="py-2 px-6 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary shadow-md transition">
                           Salvar Grupo
                        </button>
                    </div>
                </form>
            </div>
      </div>
    </div>
  );
};

export default HashtagModal;