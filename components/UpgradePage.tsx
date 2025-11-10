import React, { useState, useEffect } from 'react';
import { UserData, PaymentData, Subscription, PackageTier } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import LoadingSpinner from './LoadingSpinner';

interface UpgradePageProps {
  onUpgradeSuccess: (newSubscription: Subscription) => void;
}

const packageDetails: Record<PackageTier, { name: string; price: string; features: string[], description?: string }> = {
    0: { name: 'Freemium', price: 'Grátis', features: ['Instagram', 'Facebook'], description: '5 posts/mês, 20 IAs de texto/mês, 2 IAs de imagem/mês.' },
    1: { name: 'Pacote 1', price: 'R$ 29,90/mês', features: ['Instagram', 'Facebook', 'Posts Ilimitados'] },
    2: { name: 'Pacote 2', price: 'R$ 39,90/mês', features: ['Tudo do Pacote 1', '+ TikTok'] },
    3: { name: 'Pacote 3', price: 'R$ 99,00/mês', features: ['Tudo do Pacote 2', '+ YouTube'] },
    4: { name: 'Pacote Pro', price: 'R$ 89,90/mês', features: ['Todos os recursos', 'Gerações de IA ilimitadas'], description: 'Requer sua própria chave de API do Google Gemini.' },
};

const brazilianStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const UpgradePage: React.FC<UpgradePageProps> = ({ onUpgradeSuccess }) => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  
  // Data states from localStorage
  const [userData, setUserData] = useLocalStorage<UserData>('social-scheduler-user-data', { fullName: '', email: '', birthDate: '' });
  const [paymentData, setPaymentData] = useLocalStorage<PaymentData>('social-scheduler-payment-data', { cpf: '', cep: '', address: '', number: '', complement: '', district: '', city: '', state: '', cardNumber: '' });
  const [subscription, setSubscription] = useLocalStorage<Subscription | null>('social-scheduler-subscription', null);
  
  // Local state for the upgrade process
  const [newSubscriptionData, setNewSubscriptionData] = useState<Subscription>(subscription || { package: 1, hasAiAddon: false });

  // CEP states
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [cepError, setCepError] = useState('');

  useEffect(() => {
    // If user is coming from Freemium, clear the default name to prompt for a real one.
    if (userData.fullName === 'Usuário Freemium') {
      setUserData(prev => ({ ...prev, fullName: '' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNextStep = () => {
    setError('');
    setStep(s => s + 1);
  };
  
  const handleFinalSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // Basic validation including the full name
      if (!userData.fullName || !paymentData.cpf || !paymentData.cep || !paymentData.address || !paymentData.number || !paymentData.city || !paymentData.state) {
          setError("Por favor, preencha todos os campos de pagamento obrigatórios.");
          return;
      }
      // Save the new subscription
      setSubscription(newSubscriptionData);
      
      // Simulate success and call the callback
      alert("Plano alterado com sucesso!");
      onUpgradeSuccess(newSubscriptionData);
  }

    const handleDowngradeToFreemium = () => {
      const freemiumSubscription: Subscription = { package: 0, hasAiAddon: false };
      setSubscription(freemiumSubscription);
      alert("Plano alterado para Freemium com sucesso!");
      onUpgradeSuccess(freemiumSubscription);
  };

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length !== 8) {
      setCepError(cep.length > 0 ? 'CEP inválido.' : '');
      return;
    }
    
    setCepError('');
    setIsCepLoading(true);
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (data.erro) {
        setCepError('CEP não encontrado.');
      } else {
        setPaymentData(prev => ({ ...prev, address: data.logradouro, district: data.bairro, city: data.localidade, state: data.uf }));
      }
    } catch (error) {
      setCepError('Erro ao buscar CEP.');
    } finally {
      setIsCepLoading(false);
    }
  };

  const renderStep1 = () => (
    <div>
      <h2 className="text-2xl font-bold text-center mb-1">Alterar seu Pacote</h2>
      <p className="text-center text-gray-500 mb-6">Selecione o novo plano que melhor se adapta a você.</p>
      <div className="space-y-4 mb-6">
        {Object.entries(packageDetails).map(([tier, details]) => (
            <label key={tier} className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${newSubscriptionData.package == Number(tier) ? 'border-brand-primary bg-brand-light dark:bg-brand-primary/10' : 'border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-500'}`}>
                <input type="radio" name="package" value={tier} checked={newSubscriptionData.package == Number(tier)} onChange={() => setNewSubscriptionData(prev => ({...prev, package: Number(tier) as PackageTier, hasAiAddon: Number(tier) === 0 ? false : prev.hasAiAddon }))} className="h-5 w-5 text-brand-primary focus:ring-brand-secondary border-gray-300 mt-0.5" />
                <div className="ml-4 text-sm flex-grow">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-lg text-gray-900 dark:text-gray-100">{details.name}</span>
                      <span className="font-extrabold text-brand-secondary">{details.price}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">Recursos: {details.features.join(', ')}</p>
                    {details.description && <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-semibold">{details.description}</p>}
                </div>
            </label>
        ))}
      </div>
      <label className={`flex items-start p-4 border-2 rounded-lg transition-all bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700 ${newSubscriptionData.package === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
        <input type="checkbox" checked={newSubscriptionData.hasAiAddon} onChange={e => setNewSubscriptionData(prev => ({...prev, hasAiAddon: e.target.checked}))} disabled={newSubscriptionData.package === 0} className="h-5 w-5 text-brand-primary focus:ring-brand-secondary border-gray-300 mt-0.5" />
        <div className="ml-4 text-sm">
            <span className="font-bold text-lg text-blue-900 dark:text-blue-200">Por mais R$19,90 inclua criação de imagens por IA</span>
            <p className="text-blue-700 dark:text-blue-300">São 120 criações permitidas por mês.</p>
        </div>
      </label>
    </div>
  );
  
  const renderStep2 = () => (
    <form onSubmit={handleFinalSubmit}>
      <h2 className="text-2xl font-bold text-center mb-1">Confirmar Pagamento</h2>
      <p className="text-center text-gray-500 mb-6">Confirme seus dados para alterar o plano.</p>
      <div className="space-y-4">
        <input type="text" placeholder="Nome Completo" value={userData.fullName} onChange={e => setUserData({ ...userData, fullName: e.target.value })} className="w-full p-2 border rounded" required/>
        <input type="text" placeholder="CPF" value={paymentData.cpf} onChange={e => setPaymentData({...paymentData, cpf: e.target.value})} className="w-full p-2 border rounded" required/>
        <div className="relative">
            <input type="text" placeholder="CEP" value={paymentData.cep} onChange={e => setPaymentData({...paymentData, cep: e.target.value})} onBlur={handleCepBlur} className="w-full p-2 border rounded" required/>
            {isCepLoading && <div className="absolute right-2 top-2"><LoadingSpinner className="w-5 h-5"/></div>}
            {cepError && <p className="text-red-500 text-xs mt-1">{cepError}</p>}
        </div>
        <input type="text" placeholder="Endereço" value={paymentData.address} onChange={e => setPaymentData({...paymentData, address: e.target.value})} className="w-full p-2 border rounded" required/>
        <div className="grid grid-cols-3 gap-2">
            <input type="text" placeholder="Número" value={paymentData.number} onChange={e => setPaymentData({...paymentData, number: e.target.value})} className="p-2 border rounded" required/>
            <input type="text" placeholder="Complemento (Opcional)" value={paymentData.complement} onChange={e => setPaymentData({...paymentData, complement: e.target.value})} className="col-span-2 p-2 border rounded" />
        </div>
         <div className="grid grid-cols-3 gap-2">
            <input type="text" placeholder="Bairro" value={paymentData.district} onChange={e => setPaymentData({...paymentData, district: e.target.value})} className="p-2 border rounded" required/>
            <input type="text" placeholder="Cidade" value={paymentData.city} onChange={e => setPaymentData({...paymentData, city: e.target.value})} className="p-2 border rounded" required/>
            <select value={paymentData.state} onChange={e => setPaymentData({...paymentData, state: e.target.value})} className="p-2 border rounded" required>
                <option value="">Estado</option>
                {brazilianStates.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
         </div>
         <input type="text" placeholder="Número do Cartão (simulação)" value={paymentData.cardNumber || ''} onChange={e => setPaymentData({...paymentData, cardNumber: e.target.value})} className="w-full p-2 border rounded" required/>
      </div>
    </form>
  );

  const isFreemiumSelected = step === 1 && newSubscriptionData.package === 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-dark-bg p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white dark:bg-dark-card shadow-xl rounded-lg px-8 pt-6 pb-8 mb-4">
            {step === 1 ? renderStep1() : renderStep2()}
      
            {error && <p className="text-red-500 text-xs italic mt-4">{error}</p>}

            <div className="flex items-center justify-between mt-6 pt-4 border-t dark:border-gray-700">
                {step > 1 ? (
                <button onClick={() => setStep(s => s-1)} className="font-bold text-sm text-gray-600 dark:text-gray-300 hover:text-brand-primary">Voltar</button>
                ) : (
                <button onClick={() => onUpgradeSuccess(subscription!)} className="font-bold text-sm text-gray-600 dark:text-gray-300 hover:text-brand-primary">Cancelar</button>
                )}
                
                {isFreemiumSelected ? (
                    <button onClick={handleDowngradeToFreemium} className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-6 rounded">Confirmar Alteração</button>
                ) : step < 2 ? (
                    <button onClick={handleNextStep} className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-6 rounded">Próximo</button>
                ) : (
                    <button onClick={handleFinalSubmit} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded">Salvar Alterações</button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePage;