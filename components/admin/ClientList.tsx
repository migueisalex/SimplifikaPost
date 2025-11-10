import React, { useState, useMemo } from 'react';
import { Client } from '../../types';
import ConfirmationModal from '../ConfirmationModal';

interface ClientListProps {
    clients: Client[];
    setClients: React.Dispatch<React.SetStateAction<Client[]>>;
    onViewClient: (client: Client) => void;
}

const ClientList: React.FC<ClientListProps> = ({ clients, setClients, onViewClient }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

    const filteredClients = useMemo(() => {
        return clients.filter(client =>
            client.userData.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.userData.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [clients, searchTerm]);

    const handleDeleteClient = () => {
        if (!clientToDelete) return;
        setClients(prev => prev.filter(c => c.id !== clientToDelete.id));
        setClientToDelete(null);
    };

    return (
        <div className="bg-white dark:bg-dark-card p-4 sm:p-6 rounded-lg shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Lista de Clientes ({clients.length})</h2>
                <input
                    type="text"
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-brand-primary focus:border-brand-primary dark:bg-gray-700 dark:text-white"
                />
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Nome
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                                Plano
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-dark-border">
                        {filteredClients.map((client) => (
                            <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-150">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    {client.userData.fullName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 hidden sm:table-cell">
                                    {client.userData.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 hidden md:table-cell">
                                    {client.subscription.package === 0 ? 'Tester' : `Pacote ${client.subscription.package}`}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                                    <button
                                        onClick={() => onViewClient(client)}
                                        className="text-brand-primary hover:text-brand-secondary font-semibold"
                                    >
                                        Ver/Editar
                                    </button>
                                    <button
                                        onClick={() => setClientToDelete(client)}
                                        className="text-red-600 hover:text-red-800 font-semibold"
                                    >
                                        Excluir
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {filteredClients.length === 0 && (
                <p className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhum cliente encontrado.</p>
            )}

            <ConfirmationModal
                isOpen={clientToDelete !== null}
                onClose={() => setClientToDelete(null)}
                onConfirm={handleDeleteClient}
                title="Excluir Cliente"
                message={`Você tem certeza que deseja excluir o cliente \"${clientToDelete?.userData.fullName}\"? Esta ação não pode ser desfeita.`}
                confirmButtonText="Excluir Cliente"
            />
        </div>
    );
};

export default ClientList;
