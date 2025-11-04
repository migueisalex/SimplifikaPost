import React, { useState, useEffect } from 'react';
import { AlertContact } from '../../types';

interface AlertContactModalProps {
    contact: AlertContact | null;
    onSave: (contact: Omit<AlertContact, 'id'> & { id?: string }) => void;
    onClose: () => void;
}

const AlertContactModal: React.FC<AlertContactModalProps> = ({ contact, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
    });
    
    useEffect(() => {
        if (contact) {
            setFormData({
                name: contact.name,
                email: contact.email,
                whatsapp: contact.whatsapp,
            });
        } else {
            setFormData({ name: '', email: '', whatsapp: '' });
        }
    }, [contact]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: contact?.id });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-lg flex flex-col" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b dark:border-dark-border">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">{contact ? 'Editar Contato' : 'Adicionar Contato de Alerta'}</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                            />
                        </div>
                         <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                            />
                        </div>
                         <div>
                            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">WhatsApp</label>
                            <input
                                type="tel"
                                name="whatsapp"
                                id="whatsapp"
                                value={formData.whatsapp}
                                onChange={handleChange}
                                required
                                placeholder="+5511987654321"
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                            />
                        </div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-900/50 px-4 py-3 flex justify-end gap-4 rounded-b-lg border-t dark:border-dark-border">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 dark:bg-dark-border text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                            Cancelar
                        </button>
                        <button type="submit" className="py-2 px-6 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary shadow-md transition">
                            Salvar Contato
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AlertContactModal;
