import React, { useState, useCallback } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { Client, AlertContact, UserData, PaymentData, Subscription } from '../../types';
import { initialClients, initialAlertContacts } from '../../data/mockData';
import AdminHeader from './AdminHeader';
import ClientList from './ClientList';
import AlertsManager from './AlertsManager';
import ProfileModal from '../ProfileModal';
import AlertContactModal from './AlertContactModal';
import ConfirmationModal from '../ConfirmationModal';

type AdminView = 'clients' | 'alerts';

interface AdminPanelProps {
    onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
    const [view, setView] = useState<AdminView>('clients');
    const [clients, setClients] = useLocalStorage<Client[]>('admin-clients', initialClients);
    const [alertContacts, setAlertContacts] = useLocalStorage<AlertContact[]>('admin-alert-contacts', initialAlertContacts);
    
    const [viewingClient, setViewingClient] = useState<Client | null>(null);
    const [editingContact, setEditingContact] = useState<AlertContact | null>(null);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    
    const [contactToDelete, setContactToDelete] = useState<AlertContact | null>(null);

    const handleSaveClient = (updatedUserData: UserData, updatedPaymentData: PaymentData, updatedSubscription?: Subscription) => {
        if (!viewingClient) return;
        
        setClients(prevClients => 
            prevClients.map(client => 
                client.id === viewingClient.id 
                ? { ...client, userData: updatedUserData, paymentData: updatedPaymentData, subscription: updatedSubscription || client.subscription }
                : client
            )
        );
        setViewingClient(null);
    };

    const handleSaveContact = (contact: Omit<AlertContact, 'id'> & { id?: string }) => {
        setAlertContacts(prev => {
            if (contact.id) {
                // Editing existing contact
                return prev.map(c => c.id === contact.id ? { ...c, ...contact } : c);
            }
            // Adding new contact
            return [...prev, { ...contact, id: `AC${Date.now()}` }];
        });
        setIsContactModalOpen(false);
        setEditingContact(null);
    };

    const handleDeleteContact = () => {
        if (!contactToDelete) return;
        setAlertContacts(prev => prev.filter(c => c.id !== contactToDelete.id));
        setContactToDelete(null);
    };
    
    const openNewContactModal = () => {
        setEditingContact(null);
        setIsContactModalOpen(true);
    };
    
    const openEditContactModal = (contact: AlertContact) => {
        setEditingContact(contact);
        setIsContactModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-dark-bg text-gray-800 dark:text-gray-200 font-sans">
            <AdminHeader onLogout={onLogout} />
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                 <div className="mb-6 flex justify-center sm:justify-start bg-gray-200 dark:bg-dark-card p-1 rounded-lg shadow-inner w-full sm:w-auto">
                    <button
                        onClick={() => setView('clients')}
                        className={`px-4 sm:px-6 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${view === 'clients' ? 'bg-brand-primary text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-dark-border'}`}
                    >
                        Clientes
                    </button>
                    <button
                        onClick={() => setView('alerts')}
                        className={`px-4 sm:px-6 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${view === 'alerts' ? 'bg-brand-primary text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-dark-border'}`}
                    >
                        Alertas do Sistema
                    </button>
                </div>
                
                {view === 'clients' ? (
                    <ClientList 
                        clients={clients} 
                        setClients={setClients} 
                        onViewClient={setViewingClient} 
                    />
                ) : (
                    <AlertsManager 
                        contacts={alertContacts}
                        onAddContact={openNewContactModal}
                        onEditContact={openEditContactModal}
                        onDeleteContact={setContactToDelete}
                    />
                )}
            </main>

            {viewingClient && (
                <ProfileModal
                    isAdmin
                    initialUserData={viewingClient.userData}
                    initialPaymentData={viewingClient.paymentData}
                    initialSubscription={viewingClient.subscription}
                    onSave={handleSaveClient}
                    onClose={() => setViewingClient(null)}
                />
            )}
            
            {(isContactModalOpen || editingContact) && (
                <AlertContactModal
                    contact={editingContact}
                    onSave={handleSaveContact}
                    onClose={() => {
                        setIsContactModalOpen(false);
                        setEditingContact(null);
                    }}
                />
            )}

            <ConfirmationModal
                isOpen={contactToDelete !== null}
                onClose={() => setContactToDelete(null)}
                onConfirm={handleDeleteContact}
                title="Excluir Contato de Alerta"
                message={`Você tem certeza que deseja excluir o contato \"${contactToDelete?.name}\"? Esta ação não pode ser desfeita.`}
                confirmButtonText="Excluir Contato"
            />
        </div>
    )
};

export default AdminPanel;
