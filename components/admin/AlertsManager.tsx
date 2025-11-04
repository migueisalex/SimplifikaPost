import React from 'react';
import { AlertContact } from '../../types';

interface AlertsManagerProps {
    contacts: AlertContact[];
    onAddContact: () => void;
    onEditContact: (contact: AlertContact) => void;
    onDeleteContact: (contact: AlertContact) => void;
}

const AlertsManager: React.FC<AlertsManagerProps> = ({ contacts, onAddContact, onEditContact, onDeleteContact }) => {
    return (
         <div className="bg-white dark:bg-dark-card p-4 sm:p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Contatos para Alertas de Sistema</h2>
                <button
                    onClick={onAddContact}
                    className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 11a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1v-1z" />
                    </svg>
                    <span>Adicionar Contato</span>
                </button>
            </div>

            <div className="space-y-3">
                {contacts.length > 0 ? contacts.map(contact => (
                    <div key={contact.id} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex-grow">
                            <p className="font-bold text-lg">{contact.name}</p>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm text-gray-600 dark:text-gray-300 mt-1">
                                <span><strong>Email:</strong> {contact.email}</span>
                                <span><strong>WhatsApp:</strong> {contact.whatsapp}</span>
                            </div>
                        </div>
                        <div className="flex gap-3 flex-shrink-0 w-full sm:w-auto">
                            <button onClick={() => onEditContact(contact)} className="w-full sm:w-auto py-2 px-4 text-sm font-bold bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition">Editar</button>
                            <button onClick={() => onDeleteContact(contact)} className="w-full sm:w-auto py-2 px-4 text-sm font-bold bg-red-500 text-white rounded-lg hover:bg-red-600 transition">Excluir</button>
                        </div>
                    </div>
                )) : (
                    <p className="text-center py-8 text-gray-500">Nenhum contato de alerta cadastrado.</p>
                )}
            </div>
        </div>
    )
};

export default AlertsManager;
