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
  const [activeTab, setActiveTab] = useState<'data' | 'payment' | 'subscription' | 'api'>('data');
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

  const [geminiApiKey, setGeminiApiKey] = useState(initialUserData.geminiApiKey || '');
  const [apiKeyStatus, setApiKeyStatus] = useState(initialUserData.geminiApiKeyTestStatus || 'idle');
  const [isTesting, setIsTesting] = useState(false);


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
  
  const handleTestApiKey = async () => {
    if (!geminiApiKey.trim()) return;
    setIsTesting(true);
    setApiKeyStatus('testing');
    try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey.trim() });
        // Use a very cheap, simple call to test the key
        await ai.models.generateContent({ model: "gemini-2.5-flash", contents: "test" });
        setApiKeyStatus('success');
    } catch (error) {
        console.error("API Key test failed:", error);
        setApiKeyStatus('error');
    } finally {
        setIsTesting(false);
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
    const finalUserData = { ...formData, geminiApiKey, geminiApiKeyTestStatus: apiKeyStatus };
    onSave(finalUserData, paymentFormData, isAdmin ? subscriptionData : undefined);

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

  const renderPaymentTab = () => (
    <div className="space-y-4">
        <div className="flex justify-between items-center border-b dark:border-dark-border pb-4">
            <h3 className="text-lg font-bold">Informações de Cobrança</h3>
            {isEditing && (
                <button onClick={() => setIsEditingCard(true)} className="text-brand-primary font-semibold hover:underline text-sm">
                    {isEditingCard ? 'Cancelar Edição' : 'Editar Cartão'}
                </button>
            )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 dark:text-gray-300">CPF</label>
                <input
                    type="text" name="cpf" id="cpf" value={paymentFormData.cpf} onChange={handlePaymentChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-dark-border rounded-md shadow-sm sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed"
                />
            </div>
            <div className="relative">
                <label htmlFor="cep" className="block text-sm font-medium text-gray-700 dark:text-gray-300">CEP</label>
                <input
                    type="text" name="cep" id="cep" value={paymentFormData.cep} onChange={handlePaymentChange} onBlur={handleCepBlur}
                    disabled={!isEditing}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-dark-border rounded-md shadow-sm sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed"
                />
                {isCepLoading && <div className="absolute right-2 top-8"><LoadingSpinner className="w-5 h-5"/></div>}
                {cepError && <p className="text-red-500 text-xs mt-1">{cepError}</p>}
            </div>
        </div>
        
        <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Endereço</label>
            <input
                type="text" name="address" id="address" value={paymentFormData.address} onChange={handlePaymentChange}
                disabled={!isEditing}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-dark-border rounded-md shadow-sm sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed"
            />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
            <div>
                <label htmlFor="number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número</label>
                <input
                    type="text" name="number" id="number" value={paymentFormData.number} onChange={handlePaymentChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-dark-border rounded-md shadow-sm sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed"
                />
            </div>
            <div className="col-span-2">
                <label htmlFor="complement" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Complemento</label>
                <input
                    type="text" name="complement" id="complement" value={paymentFormData.complement} onChange={handlePaymentChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-dark-border rounded-md shadow-sm sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed"
                />
            </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
            <div>
                <label htmlFor="district" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bairro</label>
                <input
                    type="text" name="district" id="district" value={paymentFormData.district} onChange={handlePaymentChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-dark-border rounded-md shadow-sm sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed"
                />
            </div>
            <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cidade</label>
                <input
                    type="text" name="city" id="city" value={paymentFormData.city} onChange={handlePaymentChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-dark-border rounded-md shadow-sm sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed"
                />
            </div>
            <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
                <select
                    name="state" id="state" value={paymentFormData.state} onChange={handlePaymentChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-dark-border rounded-md shadow-sm sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed"
                >
                    <option value="">Selecione</option>
                    {brazilianStates.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
        </div>
        
        <div className="border-t dark:border-dark-border pt-4">
            <h3 className="text-lg font-bold mb-2">Cartão de Crédito</h3>
            <div className="flex items-center justify-between">
                <CardIcon />
                {isEditingCard && (
                    <input
                        type="text" name="cardNumber" id="cardNumber" value={paymentFormData.cardNumber || ''} onChange={handlePaymentChange}
                        placeholder="Número do Cartão (simulação)"
                        className="mt-1 block w-1/2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-dark-border rounded-md shadow-sm sm:text-sm"
                    />
                )}
                {!isEditingCard && <p className="text-gray-500 dark:text-gray-400">**** **** **** {paymentFormData.cardNumber?.slice(-4) || '0000'}</p>}
            </div>
        </div>
    </div>
  );

  const renderSubscriptionTab = () => (
    <div className="space-y-4">
        <div className="flex justify-between items-center border-b dark:border-dark-border pb-4">
            <h3 className="text-lg font-bold">Detalhes do Plano</h3>
            {!isAdmin && onUpgradePlan && (
                <button onClick={onUpgradePlan} className="py-2 px-4 text-sm bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary shadow-md transition">
                    Alterar Plano
                </button>
            )}
        </div>
        
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-xl font-bold text-brand-primary">{packageDetails[subscriptionData.package].name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Postagens para: {packageDetails[subscriptionData.package].features.join(', ')}</p>
            
            {isAdmin && isEditing && (
                <div className="mt-4">
                    <label htmlFor="package" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mudar Pacote</label>
                    <select
                        name="package" id="package" value={subscriptionData.package} onChange={e => setSubscriptionData(prev => ({...prev, package: Number(e.target.value) as PackageTier}))}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-dark-border rounded-md shadow-sm sm:text-sm"
                    >
                        {Object.entries(packageDetails).map(([key, details]) => (
                            <option key={key} value={key}>{details.name}</option>
                        ))}
                    </select>
                </div>
            )}
        </div>
        
        <div className={`p-4 rounded-lg ${subscriptionData.hasAiAddon ? 'bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700' : 'bg-gray-100 dark:bg-gray-800'}`}>
            <div className="flex justify-between items-center">
                <p className="font-bold">Criação de Imagens com IA</p>
                {isAdmin && isEditing && (
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={subscriptionData.hasAiAddon} onChange={e => setSubscriptionData(prev => ({...prev, hasAiAddon: e.target.checked}))} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-primary"></div>
                    </label>
                )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {subscriptionData.hasAiAddon ? 'Recurso Ativo. 60 criações/mês.' : 'Recurso Inativo. Faça o upgrade para desbloquear.'}
            </p>
        </div>
    </div>
  );

  const renderApiTab = () => (
    <div className="space-y-4">
        <h3 className="text-lg font-bold border-b dark:border-dark-border pb-4">Configuração da API Gemini</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
            Insira sua chave de API Gemini para usar as funcionalidades de IA.
        </p>
        
        <div>
            <label htmlFor="geminiApiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Chave de API</label>
            <div className="mt-1 flex rounded-md shadow-sm">
                <input
                    type="password" name="geminiApiKey" id="geminiApiKey" value={geminiApiKey} onChange={e => { setGeminiApiKey(e.target.value); setApiKeyStatus('idle'); }}
                    className="flex-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-dark-border rounded-l-md shadow-sm sm:text-sm"
                    placeholder="AIzaSy..."
                />
                <button
                    type="button"
                    onClick={handleTestApiKey}
                    disabled={isTesting || !geminiApiKey.trim()}
                    className={`inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 dark:border-dark-border rounded-r-md bg-gray-50 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50`}
                >
                    {isTesting ? <LoadingSpinner className="w-5 h-5 mr-2"/> : <GeminiIcon className="w-5 h-5 mr-2" />}
                    {isTesting ? 'Testando...' : 'Testar Chave'}
                </button>
            </div>
            <div className="mt-2 text-sm">
                {apiKeyStatus === 'success' && <p className="text-green-500">Chave de API válida! 🎉</p>}
                {apiKeyStatus === 'error' && <p className="text-red-500">Chave de API inválida. Verifique a chave e tente novamente.</p>}
                {apiKeyStatus === 'testing' && <p className="text-blue-500">Testando a chave...</p>}
                {apiKeyStatus === 'idle' && <p className="text-gray-500 dark:text-gray-400">A chave será salva ao clicar em "Salvar Alterações".</p>}
            </div>
        </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[70] p-4" onClick={onClose}>
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b dark:border-dark-border flex justify-between items-center">
          <h2 className="text-2xl font-bold">{isAdmin ? 'Detalhes do Cliente' : 'Meu Perfil'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="flex border-b dark:border-dark-border bg-gray-50 dark:bg-gray-900/50">
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
           { (initialSubscription?.package === 2 || initialSubscription?.package === 3) && !isAdmin && (
                <button
                    onClick={() => setActiveTab('api')}
                    className={`flex-1 py-3 px-4 text-center font-semibold transition-colors ${activeTab === 'api' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-border'}`}
                >
                    API de IA
                </button>
           )}
        </div>

        <div className="flex-grow p-6 overflow-y-auto">
          {activeTab === 'data' && renderDataTab()}
          {activeTab === 'payment' && renderPaymentTab()}
          {activeTab === 'subscription' && renderSubscriptionTab()}
          {activeTab === 'api' && renderApiTab()}
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
