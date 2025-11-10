import React from 'react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  reason?: string;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onUpgrade, reason = 'default' }) => {
  if (!isOpen) return null;

  const messages: Record<string, { title: string; message: string }> = {
    platform: { 
        title: "Plataforma Indisponível", 
        message: "Você precisa de um plano superior para postar nesta plataforma. Deseja alterar seu plano agora?" 
    },
    ai_image: { 
        title: "Recurso Avançado", 
        message: "A geração de imagens com IA é um recurso adicional. Faça o upgrade para desbloqueá-lo." 
    },
    post_limit: { 
        title: "Limite de Posts Atingido", 
        message: "Você atingiu seu limite de 5 posts/mês do plano Tester. Faça o upgrade para ter posts ilimitados!" 
    },
    ai_text_limit: { 
        title: "Limite de IA Atingido", 
        message: "Você atingiu seu limite de 4 gerações de texto/dia do plano Tester. Faça o upgrade para ter sugestões ilimitadas!" 
    },
    default: { 
        title: "Recurso Indisponível", 
        message: "Você não tem acesso a essa funcionalidade no seu pacote atual." 
    }
  };

  const { title, message } = messages[reason] || messages.default;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[70] p-4" onClick={onClose}>
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-md flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50 sm:mx-0 sm:h-10 sm:w-10">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-white" id="modal-title">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  {message}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-primary text-base font-medium text-white hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary dark:focus:ring-offset-dark-card sm:ml-3 sm:w-auto sm:text-sm transition"
            onClick={onUpgrade}
          >
            Alterar Pacote
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-dark-border shadow-sm px-4 py-2 bg-white dark:bg-dark-card text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-dark-card sm:mt-0 sm:w-auto sm:text-sm transition"
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;