import React, { useState } from 'react';
import { UserData, PaymentData, Subscription, PackageTier } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { GoogleGenAI } from "@google/genai";
import GeminiIcon from './GeminiIcon';

interface ProfileModalProps {
  initialUserData: UserData;
  initialPaymentData: PaymentData;
  initialSubscription?: Subscription;
  onSave: (userData: UserData, paymentData: PaymentData, subscription?: Subscription) => void;
  onClose: () => void;
  onUpgradePlan?: () => void;
  isAdmin?: boolean;
}

const brazilianStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const packageDetails: Record<PackageTier, { name: string, features: string[]}> = {
    0: { name: 'Plano Tester', features: ['Instagram', 'Facebook']},
    1: { name: 'Pacote 1', features: ['Instagram', 'Facebook']},
    2: { name: 'Pacote 2', features: ['Instagram', 'Facebook', 'TikTok']},
    3: { name: 'Pacote 3', features: ['Instagram', 'Facebook', 'TikTok', 'YouTube']},
};

const CardIcon = () => (
    <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-24 h-16 rounded-md shadow-md">
        <defs>
            <linearGradient id="cardGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4e87b8" />
                <stop offset="100%" stopColor="#42739e" />
            </linearGradient>
        </defs>
        <rect width="48" height="32" rx="4" fill="url(#cardGradient)"/>
        <rect x="4" y="22" width="40" height="4" fill="rgba(255,255,255,0.2)"/>
        <circle cx="40" cy="8" r="4" fill="rgba(255,255,255,0.4)" />
        <circle cx="34" cy="8" r="4" fill="rgba(255,255,255,0.6)" />
    </svg>
);


const ProfileModal: React.FC<ProfileModalProps> = ({ initialUserData, initialPaymentData, initialSubscription, onSave, onClose, isAdmin = false, onUpgradePlan }) => {
  // FIX: Removed 'api' tab and related state to comply with guidelines prohibiting user-managed API keys.
  const [activeTab, setActiveTab] = useState<'data' | 'payment' | 'subscription'>('data');
  const [formData, setFormData] = useState<UserData>(initialUserData);
  const [paymentFormData, setPaymentFormData] = useState<PaymentData>(initialPaymentData);
  const [subscriptionData, setSubscriptionData] = useState<Subscription>(initialSubscription || { package: 1, hasAiAddon: false });
  
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  
  const [isEditing, setIsEditing] = useState(!isAdmin); 
  const [isEditingCard, setIsEditingCard] = useState(false);

  const [isCepLoading, setIsCepLoading] = useState(false);
  const [cepError, setCepError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setPaymentFormData({ ...paymentFormData, [e.target.name]: e.target.value });
  };
  
  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
    setPasswordError(''); 
  };

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, ''); // Remove non-numeric characters
    if (cep.length !== 8) {
      setCepError(cep.length > 0 ? 'CEP inválido. Deve conter 8 dígitos.' : '');
      return;
    }
    
    setCepError('');
    setIsCepLoading(true);
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!response.ok) {
        throw new Error('Erro na resposta da rede');
      }
      const data = await response.json();
      
      if (data.erro) {
        setCepError('CEP não encontrado.');
        setPaymentFormData(prev => ({
            ...prev,
            address: '',
            district: '',
            city: '',
            state: '',
        }));
      } else {
        setPaymentFormData(prev => ({
          ...prev,
          address: data.logradouro,
          district: data.bairro,
          city: data.localidade,
          state: data.uf,
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      setCepError('Erro ao buscar CEP. Verifique sua conexão.');
    } finally {
      setIsCepLoading(false);
    }
  };
  
  const handleSave = () => {
    setPasswordError('');
    if (showPasswordFields) {
      if (passwords.new !== passwords.confirm) {
        setPasswordError('As senhas não coincidem.');
        return;
      }
      if (passwords.new.length > 0 && passwords.new.length < 6) {
        setPasswordError('A nova senha deve ter pelo menos 6 caracteres.');
        return;
      }
      if (passwords.new.length > 0 && !passwords.current) {
         setPasswordError('Por favor, insira sua senha atual.');
         return;
      }
       if (passwords.new.length > 0) {
        // Simulation of saving the password
        console.log("Simulating password change...");
        alert('Senha alterada com sucesso! (Simulação)');
       }
    }
    onSave(formData, paymentFormData, isAdmin ? subscriptionData : undefined);

    if (isAdmin) {
      setIsEditing(false); // Go back to view mode after saving
    } else {
      setIsEditingCard(false);
      onClose();
    }
  };

  const renderDataTab = () => (
    <div className="space-y-4">
        <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome Completo</label>
            <input
                type="text"
                name="fullName"
                id="fullName"
                value={formData.fullName}
                onChange={handleChange}
                disabled={!isEditing}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed"
            />
        </div>
        <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data de Nascimento</label>
            <input
                type="date"
                name="birthDate"
                id="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                disabled={!isEditing}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed"
            />
        </div>
        <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <div className="flex items-center gap-2 mt-1">
                <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    readOnly={!isAdmin || !isEditing} // Only admin can edit email
                    onChange={handleChange}
                    className="flex-grow px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-dark-border rounded-md shadow-sm sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed"
                />
                 {!isAdmin && <a 
                    href="mailto:suporte@simplifika.post?subject=Solicitação de Troca de E-mail"
                    className="flex-shrink-0 py-2 px-4 text-sm font-semibold bg-gray-200 dark:bg-dark-border rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                    Solicitar troca
                </a>}
            </div>
        </div>
        {!isAdmin && (
            <div className="border-t border-gray-200 dark:border-dark-border pt-4">
                <button 
                    type="button"
                    onClick={() => {
                        setShowPasswordFields(!showPasswordFields);
                        setPasswordError('');
                        setPasswords({ current: '', new: '', confirm: '' });
                    }}
                    className="text-brand-primary font-semibold hover:underline"
                >
                    {showPasswordFields ? 'Cancelar Alteração de Senha' : 'Alterar Senha'}
                </button>
                {showPasswordFields && (
                    <div className="mt-4 space-y-4">
                        <div>
                            <label htmlFor="current" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha Atual</label>
                            <input
                                type="password" name="current" id="current" value={passwords.current} onChange={handlePasswordInputChange}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label htmlFor="new" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nova Senha</label>
                            <input
                                type="password" name="new" id="new" value={passwords.new} onChange={handlePasswordInputChange}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                                placeholder="Mínimo 6 caracteres"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirmar Nova Senha</label>
                            <input
                                type="password" name="confirm" id="confirm" value={passwords.confirm} onChange={handlePasswordInputChange}
                                className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border rounded-md shadow-sm focus:outline-none sm:text-sm ${passwordError && passwords.new !== passwords.confirm ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-dark-border focus:ring-brand-primary focus:border-brand-primary'}`}
                            />
                        </div>
                        {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
                    </div>
                )}
            </div>
        )}
    </div>
  );
  
  const renderPaymentForm = () => {
    const fieldsDisabled = isAdmin && !isEditing;
    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 dark:text-gray-300">CPF</label>
                <input type="text" name="cpf" id="cpf" value={paymentFormData.cpf} onChange={handlePaymentChange} disabled={fieldsDisabled} className="mt-1 block w-full md:w-1/2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed" placeholder="000.000.000-00"/>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                <div>
                  <label htmlFor="cep" className="block text-sm font-medium text-gray-700 dark:text-gray-300">CEP</label>
                  <div className="relative mt-1">
                    <input 
                        type="text" 
                        name="cep" 
                        id="cep" 
                        value={paymentFormData.cep} 
                        onChange={handlePaymentChange} 
                        onBlur={handleCepBlur}
                        disabled={fieldsDisabled}
                        className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed" 
                        placeholder="00000-000"
                    />
                     {isCepLoading && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <LoadingSpinner className="w-5 h-5" />
                        </div>
                     )}
                  </div>
                  {cepError && <p className="mt-1 text-xs text-red-500">{cepError}</p>}
                </div>
            </div>
            <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Endereço</label>
                <input type="text" name="address" id="address" value={paymentFormData.address} onChange={handlePaymentChange} disabled={fieldsDisabled} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed" placeholder="Rua, Av, etc."/>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <div>
                  <label htmlFor="number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número</label>
                  <input type="text" name="number" id="number" value={paymentFormData.number} onChange={handlePaymentChange} disabled={fieldsDisabled} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed" />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="complement" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Complemento <span className="text-gray-400">(Opcional)</span></label>
                  <input type="text" name="complement" id="complement" value={paymentFormData.complement} onChange={handlePaymentChange} disabled={fieldsDisabled} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed" placeholder="Apto, Bloco, etc."/>
                </div>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="district" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bairro</label>
                  <input type="text" name="district" id="district" value={paymentFormData.district} onChange={handlePaymentChange} disabled={fieldsDisabled} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed"/>
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cidade</label>
                  <input type="text" name="city" id="city" value={paymentFormData.city} onChange={handlePaymentChange} disabled={fieldsDisabled} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed"/>
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
                  <select id="state" name="state" value={paymentFormData.state} onChange={handlePaymentChange} disabled={fieldsDisabled} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed">
                    <option value="">Selecione...</option>
                    {brazilianStates.map(state => <option key={state} value={state}>{state}</option>)}
                  </select>
                </div>
            </div>
            {!isAdmin && (
                <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número do Cartão</label>
                    <input type="text" name="cardNumber" id="cardNumber" value={paymentFormData.cardNumber} onChange={handlePaymentChange} disabled={fieldsDisabled} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" placeholder="0000 0000 0000 0000"/>
                </div>
            )}
        </div>
    );
  };

  const renderPaymentView = () => {
    const last4 = paymentFormData.cardNumber ? paymentFormData.cardNumber.slice(-4) : '????';
    return (
      <div className="flex flex-col items-center justify-center space-y-6 p-8">
          <CardIcon />
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Cartão com final <span className="font-mono">{last4}</span>
          </p>
          <button onClick={() => setIsEditingCard(true)} className="py-2 px-6 bg-gray-200 dark:bg-dark-border text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
              Alterar Cartão
          </button>
      </div>
    );
  };
  
  const renderPaymentTab = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-dark-border">
            <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Nome Completo</label>
                <p className="text-sm font-semibold truncate">{formData.fullName || 'Não informado'}</p>
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Data de Nascimento</label>
                <p className="text-sm font-semibold">{formData.birthDate ? new Date(formData.birthDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'Não informada'}</p>
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Email</label>
                <p className="text-sm font-semibold truncate">{formData.email}</p>
            </div>
        </div>
        
        {(!isAdmin && !isEditingCard) ? renderPaymentView() : renderPaymentForm()}
    </div>
  );
  
  const renderAdminSubscriptionTab = () => (
    <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Plano do Cliente</h3>
        <div className="space-y-2">
            {(Object.keys(packageDetails) as any[]).map((pkgTier: PackageTier) => {
                if(pkgTier === 0) return null; // Don't show tester plan in admin panel
                return (
                    <label key={pkgTier} className={`flex items-start p-4 border rounded-lg transition ${!isEditing ? 'cursor-not-allowed' : 'cursor-pointer'} ${subscriptionData.package == pkgTier ? 'border-brand-primary bg-brand-light dark:bg-brand-primary/10' : 'border-gray-300 dark:border-dark-border'}`}>
                        <input
                            type="radio"
                            name="package"
                            value={pkgTier}
                            checked={subscriptionData.package == pkgTier}
                            onChange={() => setSubscriptionData(prev => ({...prev, package: pkgTier}))}
                            disabled={!isEditing}
                            className="h-5 w-5 text-brand-primary focus:ring-brand-secondary border-gray-300 mt-0.5"
                        />
                        <div className="ml-3 text-sm">
                            <span className="font-bold text-gray-900 dark:text-gray-100">Pacote {pkgTier}</span>
                            <p className="text-gray-500 dark:text-gray-400">Plataformas: {packageDetails[pkgTier].features.join(', ')}</p>
                        </div>
                    </label>
                )
            })}
        </div>

        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Recursos Adicionais</h3>
        <div className={`relative flex items-start p-3 rounded-md ${!isEditing ? 'opacity-70' : ''}`}>
            <div className="flex items-center h-5">
                <input
                    id="ai-addon"
                    name="ai-addon"
                    type="checkbox"
                    checked={subscriptionData.hasAiAddon}
                    onChange={(e) => setSubscriptionData(prev => ({...prev, hasAiAddon: e.target.checked}))}
                    disabled={!isEditing}
                    className="focus:ring-brand-secondary h-4 w-4 text-brand-primary border-gray-300 rounded"
                />
            </div>
            <div className="ml-3 text-sm">
                <label htmlFor="ai-addon" className={`font-medium text-gray-700 dark:text-gray-300 ${!isEditing ? 'cursor-not-allowed' : ''}`}>Criação de Imagens com IA</label>
                <p className="text-gray-500 dark:text-gray-400">Permite que o cliente gere até 60 imagens por mês usando IA.</p>
            </div>
        </div>
    </div>
  );
  
  const renderUserSubscriptionTab = () => (
    <div className="space-y-6 text-center">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Seu Plano Atual</h3>
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-dark-border inline-block shadow-sm">
            <p className="text-3xl font-bold text-brand-primary mb-2">{packageDetails[subscriptionData.package].name}</p>
            <p className="text-gray-600 dark:text-gray-300">Acesso a: {packageDetails[subscriptionData.package].features.join(', ')}</p>
            {subscriptionData.hasAiAddon && (
                <div className="mt-3 text-sm font-semibold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/50 rounded-full px-3 py-1 inline-block">
                    + Adicional de Imagens com IA
                </div>
            )}
        </div>
        <div className="pt-4">
            <button onClick={onUpgradePlan} className="py-2 px-6 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary shadow-md transition transform hover:scale-105">
                Alterar Plano
            </button>
        </div>
    </div>
  );
  
  const renderSubscriptionTab = () => {
    return isAdmin ? renderAdminSubscriptionTab() : renderUserSubscriptionTab();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b dark:border-dark-border flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Área do Usuário</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-border transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="flex border-b dark:border-dark-border flex-wrap">
          <button 
            onClick={() => setActiveTab('data')}
            className={`flex-1 py-3 px-4 text-center font-semibold transition-colors ${activeTab === 'data' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-border'}`}
          >
            Meus Dados
          </button>
          <button 
            onClick={() => setActiveTab('payment')}
            className={`flex-1 py-3 px-4 text-center font-semibold transition-colors ${activeTab === 'payment' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-border'}`}
          >
            Pagamento
          </button>
           <button 
            onClick={() => setActiveTab('subscription')}
            className={`flex-1 py-3 px-4 text-center font-semibold transition-colors ${activeTab === 'subscription' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-border'}`}
          >
            {isAdmin ? 'Plano e Permissões' : 'Meu Plano'}
          </button>
        </div>

        <div className="flex-grow p-6 overflow-y-auto">
          {activeTab === 'data' && renderDataTab()}
          {activeTab === 'payment' && renderPaymentTab()}
          {activeTab === 'subscription' && renderSubscriptionTab()}
        </div>
        
        {isAdmin && !isEditing && (
             <div className="bg-gray-100 dark:bg-gray-900/50 px-4 py-3 flex justify-between items-center gap-4 border-t dark:border-dark-border">
                <div className="flex gap-2">
                    <button onClick={() => alert('Lembrete de pagamento enviado!')} className="py-2 px-4 text-sm bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 shadow-md transition">
                        Enviar Lembrete
                    </button>
                    <button onClick={() => alert('Link de pagamento gerado e copiado!')} className="py-2 px-4 text-sm bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 shadow-md transition">
                        Gerar Link de Pagamento
                    </button>
                </div>
                 <button onClick={() => setIsEditing(true)} className="py-2 px-6 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary shadow-md transition">
                    Editar Cliente
                </button>
            </div>
        )}

        {isEditing && (
            <div className="bg-gray-100 dark:bg-gray-900/50 px-4 py-3 flex justify-end gap-4 rounded-b-lg border-t dark:border-dark-border">
              <button onClick={isAdmin ? () => setIsEditing(false) : onClose} className="py-2 px-4 bg-gray-200 dark:bg-dark-border text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                {isAdmin ? 'Cancelar' : 'Fechar'}
              </button>
              <button onClick={handleSave} className="py-2 px-6 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary shadow-md transition">
                Salvar Alterações
              </button>
            </div>
        )}

      </div>
    </div>
  );
};

export default ProfileModal;