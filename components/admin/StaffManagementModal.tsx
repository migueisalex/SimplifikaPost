import React, { useState } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { StaffMember } from '../../types';
import ConfirmationModal from '../ConfirmationModal';
import EditStaffModal from './EditStaffModal';
import AccessLogsModal from './AccessLogsModal';

interface StaffManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const initialStaff: StaffMember[] = [
    { id: 'staff-1', email: 'migueisalex@gmail.com', password: '062301', role: 'admin', accessLogs: [] },
    { id: 'staff-2', email: 'financeiro@simplifika.post', password: 'finance123', role: 'financeiro', accessLogs: [] },
];

const StaffManagementModal: React.FC<StaffManagementModalProps> = ({ isOpen, onClose }) => {
    const [staff, setStaff] = useLocalStorage<StaffMember[]>('admin-staff-list', initialStaff);
    const [newStaff, setNewStaff] = useState({ email: '', password: '', role: 'financeiro' as 'admin' | 'financeiro' });
    const [error, setError] = useState('');
    const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);
    const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
    const [viewingLogsFor, setViewingLogsFor] = useState<StaffMember | null>(null);

    const handleAddStaff = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!newStaff.email || !newStaff.password) {
            setError('Email e senha são obrigatórios.');
            return;
        }
        if (staff.some(s => s.email === newStaff.email)) {
            setError('Este email já está em uso.');
            return;
        }

        setStaff(prev => [...prev, { id: `staff-${Date.now()}`, email: newStaff.email, password: newStaff.password, role: newStaff.role, accessLogs: [] }]);
        setNewStaff({ email: '', password: '', role: 'financeiro' });
        alert(`Usuário ${newStaff.email} adicionado com sucesso!`);
    };
    
    const handleConfirmDelete = () => {
        if (staffToDelete) {
            if (staffToDelete.email === 'migueisalex@gmail.com') {
                alert('Não é possível remover o administrador principal.');
                setStaffToDelete(null);
                return;
            }
            setStaff(prev => prev.filter(s => s.id !== staffToDelete.id));
            setStaffToDelete(null);
        }
    };

    const handleSaveStaff = (updatedStaff: StaffMember) => {
        setStaff(prev => prev.map(s => s.id === updatedStaff.id ? updatedStaff : s));
        setEditingStaff(null);
    }

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[70] p-4" onClick={onClose}>
                <div className="bg-white dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                    <div className="p-4 border-b dark:border-dark-border flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Gerenciar Acessos da Equipe</h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-border transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="flex-grow p-6 overflow-y-auto space-y-6">
                        {/* Add Staff Form */}
                        <form onSubmit={handleAddStaff} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-dark-border">
                            <h3 className="font-semibold mb-3">Adicionar Novo Usuário</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                                <input
                                    type="email"
                                    placeholder="Email do usuário"
                                    value={newStaff.email}
                                    onChange={e => setNewStaff({ ...newStaff, email: e.target.value })}
                                    className="p-2 border border-gray-300 dark:border-dark-border rounded-md bg-white dark:bg-gray-700"
                                />
                                <input
                                    type="password"
                                    placeholder="Senha temporária"
                                    value={newStaff.password}
                                    onChange={e => setNewStaff({ ...newStaff, password: e.target.value })}
                                    className="p-2 border border-gray-300 dark:border-dark-border rounded-md bg-white dark:bg-gray-700"
                                />
                                <div className="flex gap-2">
                                    <select
                                        value={newStaff.role}
                                        onChange={e => setNewStaff({ ...newStaff, role: e.target.value as 'admin' | 'financeiro' })}
                                        className="flex-grow p-2 border border-gray-300 dark:border-dark-border rounded-md bg-white dark:bg-gray-700"
                                    >
                                        <option value="financeiro">Financeiro</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <button type="submit" className="py-2 px-4 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary transition">
                                        Adicionar
                                    </button>
                                </div>
                            </div>
                             {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                        </form>
                        
                        {/* Staff List */}
                        <div>
                            <h3 className="font-semibold mb-3">Usuários Atuais</h3>
                            <div className="space-y-2">
                                {staff.map(s => (
                                    <div key={s.id} className="flex justify-between items-center p-3 bg-gray-100 dark:bg-dark-border rounded-lg">
                                        <div>
                                            <p className="font-medium">{s.email}</p>
                                            <p className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full inline-block mt-1 ${s.role === 'admin' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>{s.role}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setViewingLogsFor(s)}
                                                className="py-1 px-3 text-xs font-semibold rounded-md bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                                                title="Ver Logs de Acesso"
                                            >
                                                Logs
                                            </button>
                                            <button
                                                onClick={() => setEditingStaff(s)}
                                                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                                                title="Editar Usuário"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                                            </button>
                                            <button
                                                onClick={() => setStaffToDelete(s)}
                                                className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors"
                                                title="Revogar Acesso"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {editingStaff && (
                <EditStaffModal
                    staffMember={editingStaff}
                    onSave={handleSaveStaff}
                    onClose={() => setEditingStaff(null)}
                />
            )}

            {viewingLogsFor && (
                <AccessLogsModal
                    staffMember={viewingLogsFor}
                    onClose={() => setViewingLogsFor(null)}
                />
            )}

            <ConfirmationModal
                isOpen={staffToDelete !== null}
                onClose={() => setStaffToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Revogar Acesso"
                message={`Tem certeza de que deseja remover o acesso para ${staffToDelete?.email}?`}
                confirmButtonText="Sim, Revogar"
            />
        </>
    );
};

export default StaffManagementModal;