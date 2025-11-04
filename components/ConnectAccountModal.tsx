import React from 'react';
import { Platform } from '../types';
import { PlatformIcons } from './PlatformIcons';

interface ConnectAccountModalProps {
  platform: Platform;
  onConnect: (platform: Platform) => void;
  onClose: () => void;
}

const ConnectAccountModal: React.FC<ConnectAccountModalProps> = ({ platform, onConnect, onClose }) => {
  const handleConnect = () => {
    onConnect(platform);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[70] p-4" onClick={onClose}>
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-md flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b dark:border-dark-border flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Vincular Conta</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-8 text-center">
            <div className="flex justify-center mb-4 text-brand-primary">
              {React.cloneElement(PlatformIcons[platform], { className: "w-16 h-16" })}
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
                Você precisa vincular sua conta <strong>{platform}</strong> para continuar.
            </p>
            <p className="text-sm text-gray-500 mb-6 italic">
              (Em uma aplicação real, isso abriria uma nova janela para autorização segura.)
            </p>
            <button
              onClick={handleConnect}
              className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-transform transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
            >
              {React.cloneElement(PlatformIcons[platform])}
              Vincular {platform} Agora
            </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectAccountModal;
