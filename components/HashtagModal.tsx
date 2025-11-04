import React, { useState, useEffect } from 'react';
import { HashtagGroup } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface HashtagModalProps {
  onSave: (group: Omit<HashtagGroup, 'id'>) => boolean;
  onClose: () => void;
  postContent: string;
  onApplyAIHashtags: (hashtags: string) => void;
  aiHashtagsApplied: boolean;
}

const HashtagModal: React.FC<HashtagModalProps> = ({ onSave, onClose, postContent, onApplyAIHashtags, aiHashtagsApplied }) => {
  const [name, setName] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [error, setError] = useState('');
  
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (aiHashtagsApplied) {
      return;
    }

    const fetchHashtagSuggestions = async () => {
      if (!postContent) {
        setAiError("Escreva um texto no post para receber sugestões de hashtags.");
        return;
      }
      
      setIsLoading(true);
      setAiError(null);
      setSuggestedHashtags([]);

      try {
        // Chamar a API backend ao invés de chamar diretamente o Gemini
        const response = await fetch('/api/hashtag-suggestions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: postContent }),
        });

        if (!response.ok) {
          throw new Error(`Erro na requisição: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.suggestions && Array.isArray(result.suggestions)) {
          setSuggestedHashtags(result.suggestions);
        } else {
          throw new Error("Resposta da IA em formato inesperado.");
        }

      } catch (e) {
        console.error("Erro ao buscar sugestões de hashtags:", e);
        setAiError("Não foi possível gerar sugestões. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHashtagSuggestions();
  }, [postContent, aiHashtagsApplied]);


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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[60] p-4" onClick={onClose}>
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b dark:border-dark-border flex-shrink-0">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Gerenciar Hashtags</h2>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto">
                {/* AI Suggestions Section */}
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Sugestões da IA</h3>
                    {aiHashtagsApplied ? (
                       <div className="flex items-center justify-center h-24 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                           <p className="font-bold text-gray-600 dark:text-gray-300">SUGESTÃO DA IA JÁ FOI UTILIZADA!</p>
                       </div>
                    ) : isLoading ? (
                        <div className="flex items-center justify-center h-24">
                           <LoadingSpinner className="w-8 h-8"/>
                        </div>
                    ) : aiError ? (
                        <p className="text-red-500 text-sm">{aiError}</p>
                    ) : suggestedHashtags.length > 0 && (
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
                    )}
                </div>

                <div className="border-t border-gray-200 dark:border-dark-border my-4"></div>

                {/* Create Group Section */}
                 <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Criar Novo Grupo</h3>
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
