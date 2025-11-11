import React, { useState, useEffect } from 'react';
import { StaffMember } from '../../types';

interface EditStaffModalProps {
    staffMember: StaffMember;
    onSave: (updatedStaff: StaffMember) => void;
    onClose: () => void;
}

const EditStaffModal: React.FC<EditStaffModalProps> = ({ staffMember, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        email: staffMember.email,
        password: '',
        role: staffMember.role,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationError, setVerificationError] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        setFormData({
            email: staffMember.email,
            password: '',
            role: staffMember.role,
        });
        setShowPassword(false);
        setIsVerifying(false);
        setVerificationCode('');
        setError('');
        setVerificationError('');
    }, [staffMember]);

    const handleVerifyCode = () => {
        // Simulação com código fixo
        if (verificationCode === '123456') {
            setShowPassword(true);
            setIsVerifying(false);
            setVerificationError('');
        } else {
            setVerificationError('Código inválido.');
        }
    };
    
    const handleSaveChanges = () => {
        setError('');
        if (!formData.email) {
            setError('O e-mail não pode ficar em branco.');
            return;
        }
        
        const updatedStaff: StaffMember = {
            ...staffMember,
            email: formData.email,
            role: formData.role,
            // Only update password if a new one was entered
            password: formData.password ? formData.password : staffMember.password,
        };

        onSave(updatedStaff);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[80] p-4" onClick={onClose}>
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b dark:border-dark-border flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Editar Usuário</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-border transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-grow p-6 overflow-y-auto">
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Detalhes de {staffMember.email}</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-dark-border" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Função</label>
                            <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as 'admin' | 'financeiro'})} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-dark-border">
                                <option value="admin">Admin</option>
                                <option value="financeiro">Financeiro</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha Atual</label>
                            {showPassword ? (
                                <p className="font-mono p-2 bg-gray-100 dark:bg-gray-800 rounded-md">{staffMember.password}</p>
                            ) : isVerifying ? (
                                <div className="flex gap-2 items-start">
                                    <div className="flex-grow">
                                        <input
                                            type="text"
                                            placeholder="Código de 6 dígitos"
                                            value={verificationCode}
                                            onChange={e => setVerificationCode(e.target.value)}
                                            maxLength={6}
                                            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-dark-border"
                                        />
                                        {verificationError && <p className="text-xs text-red-500 mt-1">{verificationError}</p>}
                                    </div>
                                    <button onClick={handleVerifyCode} className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Verificar</button>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => {
                                        alert('Simulação: Um código foi enviado para o email do administrador. Use 123456 para testar.');
                                        setIsVerifying(true)
                                    }} 
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    Clique para visualizar (requer verificação)
                                </button>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Redefinir Senha</label>
                            <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Deixe em branco para não alterar" className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-dark-border" />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                </div>

                 <div className="bg-gray-100 dark:bg-gray-900/50 px-4 py-3 flex justify-end gap-4 rounded-b-lg border-t dark:border-dark-border">
                    <button onClick={onClose} className="py-2 px-4 bg-gray-200 dark:bg-dark-border text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                        Cancelar
                    </button>
                    <button onClick={handleSaveChanges} className="py-2 px-6 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary shadow-md transition">
                        Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditStaffModal;