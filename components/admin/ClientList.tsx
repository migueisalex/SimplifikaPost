import React, { useState, useMemo } from 'react';
import { Client, ClientStatus } from '../../types';

interface ClientListProps {
    clients: Client[];
    setClients: React.Dispatch<React.SetStateAction<Client[]>>;
    onViewClient: (client: Client) => void;
}

const statusConfig = {
    [ClientStatus.ACTIVE]: { text: 'Ativo', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    [ClientStatus.PAUSED]: { text: 'Pausado', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    [ClientStatus.BLOCKED]: { text: 'Bloqueado', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    [ClientStatus.IN_DEFAULT]: { text: 'Inadimplente', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
};

const ClientList: React.FC<ClientListProps> = ({ clients, setClients, onViewClient }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<ClientStatus | 'all'>('all');

    const filteredClients = useMemo(() => {
        return clients.filter(client => {
            const matchesSearch = client.userData.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  client.userData.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  client.id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [clients, searchTerm, statusFilter]);

    const toggleStatus = (id: string, currentStatus: ClientStatus, type: 'pause' | 'block') => {
        let newStatus = currentStatus;
        if (type === 'pause') {
            newStatus = currentStatus === ClientStatus.PAUSED ? ClientStatus.ACTIVE : ClientStatus.PAUSED;
        } else if (type === 'block') {
            newStatus = currentStatus === ClientStatus.BLOCKED ? ClientStatus.ACTIVE : ClientStatus.BLOCKED;
        }

        setClients(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    };

    return (
        <div className="bg-white dark:bg-dark-card p-4 sm:p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Gerenciamento de Clientes</h2>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <input 
                    type="text"
                    placeholder="Buscar por Cód, Nome ou Email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow p-2 border border-gray-300 dark:border-dark-border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white"
                />
                <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as ClientStatus | 'all')}
                    className="p-2 border border-gray-300 dark:border-dark-border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white"
                >
                    <option value="all">Todos os Status</option>
                    {Object.values(ClientStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {/* Client Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/50 border-b dark:border-dark-border">
                            <th className="p-3 font-semibold text-sm">Cód.</th>
                            <th className="p-3 font-semibold text-sm">Nome Completo</th>
                            <th className="p-3 font-semibold text-sm hidden md:table-cell">Status</th>
                            <th className="p-3 font-semibold text-sm text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredClients.map(client => (
                            <tr key={client.id} className="border-b dark:border-dark-border hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="p-3 text-sm font-mono">{client.id}</td>
                                <td className="p-3">
                                    <p className="font-semibold">{client.userData.fullName}</p>
                                    <p className="text-xs text-gray-500">{client.userData.email}</p>
                                </td>
                                <td className="p-3 hidden md:table-cell">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusConfig[client.status].color}`}>
                                        {statusConfig[client.status].text}
                                    </span>
                                </td>
                                <td className="p-3">
                                    <div className="flex justify-end items-center gap-2">
                                        <button 
                                            onClick={() => toggleStatus(client.id, client.status, 'pause')}
                                            className="p-2 text-xs font-semibold rounded-md bg-yellow-400 hover:bg-yellow-500 text-yellow-900 transition"
                                            title={client.status === ClientStatus.PAUSED ? 'Reativar' : 'Pausar'}
                                        >
                                            {client.status === ClientStatus.PAUSED ? 'Reativar' : 'Pausar'}
                                        </button>
                                        <button 
                                            onClick={() => toggleStatus(client.id, client.status, 'block')}
                                            className="p-2 text-xs font-semibold rounded-md bg-red-500 hover:bg-red-600 text-white transition"
                                            title={client.status === ClientStatus.BLOCKED ? 'Desbloquear' : 'Bloquear'}
                                        >
                                           {client.status === ClientStatus.BLOCKED ? 'Desbloquear' : 'Bloquear'}
                                        </button>
                                        <button 
                                            onClick={() => onViewClient(client)}
                                            className="p-2 text-xs font-semibold rounded-md bg-blue-500 hover:bg-blue-600 text-white transition"
                                            title="Ver Perfil"
                                        >
                                            VER
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredClients.length === 0 && (
                    <p className="text-center py-8 text-gray-500">Nenhum cliente encontrado.</p>
                )}
            </div>
        </div>
    );
};

export default ClientList;
