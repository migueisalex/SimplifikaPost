import React, { useState } from 'react';
import { UserData, PaymentData, Subscription, PackageTier } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import LoadingSpinner from './LoadingSpinner';

interface SignUpFlowProps {
  onSignUpSuccess: (subscription: Subscription) => void;
  onBackToLogin: () => void;
}

// Fix: Added package tier 0 to satisfy the 'PackageTier' type.
const packageDetails: Record<PackageTier, { name: string; features: string[] }> = {
    0: { name: 'Plano Tester', features: ['Instagram', 'Facebook'] },
    1: { name: 'Pacote 1', features: ['Instagram', 'Facebook'] },
    2: { name: 'Pacote 2', features: ['Instagram', 'Facebook', 'TikTok'] },
    3: { name: 'Pacote 3', features: ['Instagram', 'Facebook', 'TikTok', 'YouTube'] },
};
const brazilianStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const SignUpFlow: React.FC<SignUpFlowProps> = ({ onSignUpSuccess, onBackToLogin }) => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  
  // Data states
  const [accountData, setAccountData] = useState({ email: '', password: '', confirmPassword: '' });
  const [subscriptionData, setSubscriptionData] = useState<Subscription>({ package: 1, hasAiAddon: false });
  const [userData, setUserData] = useLocalStorage<UserData>('social-scheduler-user-data', { fullName: '', email: '', birthDate: '' });
  const [paymentData, setPaymentData] = useLocalStorage<PaymentData>('social-scheduler-payment-data', { cpf: '', cep: '', address: '', number: '', complement: '', district: '', city: '', state: '', cardNumber: '' });
  const [, setSubscription] = useLocalStorage<Subscription | null>('social-scheduler-subscription', null);

  // CEP states
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [cepError, setCepError] = useState('');

  const handleNextStep = () => {
    setError('');
    if (step === 1) {
      if (!accountData.email || !accountData.password) {
        setError('Email e senha são obrigatórios.');
        return;
      }
      if (accountData.password !== accountData.confirmPassword) {
        setError('As senhas não coincidem.');
        return;
      }
      if (accountData.password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.');
        return;
      }
    }
    setStep(s => s + 1);
  };
  
  const handleFinalSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // Basic validation
      if (!userData.fullName || !paymentData.cpf || !paymentData.cep || !paymentData.address || !paymentData.number || !paymentData.city || !paymentData.state) {
          setError("Por favor, preencha todos os campos de pagamento obrigatórios.");
          return;
      }
      // Save all data
      localStorage.setItem('social-user-email', accountData.email);
      setUserData(prev => ({ ...prev, email: accountData.email }));
      setSubscription(subscriptionData);
      
      // Simulate successful signup and login, passing subscription data up
      onSignUpSuccess(subscriptionData);
  }

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
        <h2 className="text-2xl font-bold text-center mb-1">Crie sua Conta</h2>
        <p className="text-center text-gray-500 mb-6">Comece sua jornada de produtividade.</p>
        <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Email</label>
            <input type="email" value={accountData.email} onChange={e => setAccountData({...accountData, email: e.target.value})} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
        </div>
        <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Senha</label>
            <input type="password" value={accountData.password} onChange={e => setAccountData({...accountData, password: e.target.value})} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
        </div>
        <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Confirmar Senha</label>
            <input type="password" value={accountData.confirmPassword} onChange={e => setAccountData({...accountData, confirmPassword: e.target.value})} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
        </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <h2 className="text-2xl font-bold text-center mb-1">Escolha seu Pacote</h2>
      <p className="text-center text-gray-500 mb-6">Selecione o plano que melhor se adapta a você.</p>
      <div className="space-y-4 mb-6">
        {Object.entries(packageDetails)
          // Fix: Filtered out the Tester plan (tier 0) so it's not a selectable option for new users.
          .filter(([tier]) => Number(tier) > 0)
          .map(([tier, details]) => (
            <label key={tier} className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${subscriptionData.package == Number(tier) ? 'border-brand-primary bg-brand-light dark:bg-brand-primary/10' : 'border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-500'}`}>
                <input type="radio" name="package" value={tier} checked={subscriptionData.package == Number(tier)} onChange={() => setSubscriptionData(prev => ({...prev, package: Number(tier) as PackageTier}))} className="h-5 w-5 text-brand-primary focus:ring-brand-secondary border-gray-300 mt-0.5" />
                <div className="ml-4 text-sm">
                    <span className="font-bold text-lg text-gray-900 dark:text-gray-100">{details.name}</span>
                    <p className="text-gray-600 dark:text-gray-400">Postagens para: {details.features.join(', ')}</p>
                </div>
            </label>
        ))}
      </div>
      <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700">
        <input type="checkbox" checked={subscriptionData.hasAiAddon} onChange={e => setSubscriptionData(prev => ({...prev, hasAiAddon: e.target.checked}))} className="h-5 w-5 text-brand-primary focus:ring-brand-secondary border-gray-300 mt-0.5" />
        <div className="ml-4 text-sm">
            <span className="font-bold text-lg text-blue-900 dark:text-blue-200">Por mais R$9,90 inclua criação de imagens por IA</span>
            <p className="text-blue-700 dark:text-blue-300">São 60 criações permitidas por mês.</p>
        </div>
      </label>
    </div>
  );
  
  const renderStep3 = () => (
    <form onSubmit={handleFinalSubmit}>
      <h2 className="text-2xl font-bold text-center mb-1">Informações de Pagamento</h2>
      <p className="text-center text-gray-500 mb-6">Estamos quase lá! Preencha seus dados.</p>
      <div className="space-y-4">
        <input type="text" placeholder="Nome Completo" value={userData.fullName} onChange={e => setUserData({...userData, fullName: e.target.value})} className="w-full p-2 border rounded" required/>
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
         <input type="text" placeholder="Número do Cartão (simulação)" onChange={e => setPaymentData({...paymentData, cardNumber: e.target.value})} className="w-full p-2 border rounded" required/>
      </div>
    </form>
  );

  return (
    <>
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      
      {error && <p className="text-red-500 text-xs italic mt-4">{error}</p>}

      <div className="flex items-center justify-between mt-6 pt-4 border-t dark:border-gray-700">
        {step > 1 ? (
          <button onClick={() => setStep(s => s-1)} className="font-bold text-sm text-gray-600 dark:text-gray-300 hover:text-brand-primary">Voltar</button>
        ) : (
          <button onClick={onBackToLogin} className="font-bold text-sm text-gray-600 dark:text-gray-300 hover:text-brand-primary">Já tenho uma conta</button>
        )}
        
        {step < 3 ? (
          <button onClick={handleNextStep} className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-6 rounded">Próximo</button>
        ) : (
          <button onClick={handleFinalSubmit} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded">Finalizar Cadastro</button>
        )}
      </div>
    </>
  );
};

export default SignUpFlow;