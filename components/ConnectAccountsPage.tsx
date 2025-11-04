import React from 'react';
import { Platform } from '../types';
import { PlatformIcons } from './PlatformIcons';

interface ConnectAccountsPageProps {
    onContinue: () => void;
    connectedPlatforms: Platform[];
    setConnectedPlatforms: (platforms: Platform[]) => void;
}

const ConnectAccountsPage: React.FC<ConnectAccountsPageProps> = ({ onContinue, connectedPlatforms, setConnectedPlatforms }) => {

    const handleConnect = (platform: Platform) => {
        // Simulate OAuth flow
        alert(`Simulando conexão com ${platform}... Em uma aplicação real, isso abriria uma janela de autorização.`);
        if (!connectedPlatforms.includes(platform)) {
            setConnectedPlatforms([...connectedPlatforms, platform]);
        }
    }

    const handleDisconnect = (platformToDisconnect: Platform) => {
        if (window.confirm(`Tem certeza que deseja desvincular sua conta do ${platformToDisconnect}?`)) {
            setConnectedPlatforms(connectedPlatforms.filter(p => p !== platformToDisconnect));
        }
    }
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-dark-bg p-4">
            <div className="w-full max-w-2xl">
                <div className="bg-white dark:bg-dark-card shadow-xl rounded-lg px-8 pt-6 pb-8 mb-4 text-center">
                    <h1 className="text-3xl font-bold text-brand-primary mb-2">Vincule suas mídias sociais</h1>
                    <p className="text-gray-600 dark:text-gray-300 mb-8">
                        Conecte as contas que deseja gerenciar. Você pode pular e fazer isso depois.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                        {Object.values(Platform).map(platform => {
                             const isConnected = connectedPlatforms.includes(platform);
                             return (
                                <div key={platform} className="relative">
                                    <button
                                        onClick={() => !isConnected && handleConnect(platform)}
                                        className={`w-full flex items-center justify-center gap-3 p-4 rounded-lg border-2 font-semibold transition-all duration-200 group
                                            ${isConnected 
                                                ? 'bg-gray-100 dark:bg-gray-700/50 border-gray-300 dark:border-dark-border text-gray-500 dark:text-gray-400 cursor-default' 
                                                : 'bg-transparent border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-200 hover:border-brand-primary hover:bg-brand-light dark:hover:bg-brand-primary/10'
                                            }`
                                        }
                                    >
                                        {PlatformIcons[platform]}
                                        <span>{platform}</span>
                                        {isConnected && (
                                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </button>
                                    {isConnected && (
                                        <button 
                                            onClick={() => handleDisconnect(platform)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 leading-none hover:bg-red-600 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-dark-card"
                                            aria-label={`Desvincular ${platform}`}
                                            title="Desvincular"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                             )
                        })}
                    </div>

                    <button
                        onClick={onContinue}
                        className="w-full sm:w-auto bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-12 rounded-lg focus:outline-none focus:shadow-outline transition-transform transform hover:scale-105 shadow-lg"
                    >
                        IR PARA O AGENDADOR
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConnectAccountsPage;
