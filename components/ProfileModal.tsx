import React, { useState } from 'react';
import { UserData, PaymentData } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface ProfileModalProps {
  initialUserData: UserData;
  initialPaymentData: PaymentData;
  onSave: (userData: UserData, paymentData: PaymentData) => void;
  onClose: () => void;
  isAdmin?: boolean;
}

const brazilianStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const ProfileModal: React.FC<ProfileModalProps> = ({ initialUserData, initialPaymentData, onSave, onClose, isAdmin = false }) => {
  const [activeTab, setActiveTab] = useState<'data' | 'payment'>('data');
  const [formData, setFormData] = useState<UserData>(initialUserData);
  const [paymentFormData, setPaymentFormData] = useState<PaymentData>(initialPaymentData);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [isEditing, setIsEditing] = useState(!isAdmin); // Start in edit mode for users, view mode for admin

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
    onSave(formData, paymentFormData);
    onClose();
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
      <div className="space-y-4">
        <div>
            <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 dark:text-gray-300">CPF</label>
            <input type="text" name="cpf" id="cpf" value={paymentFormData.cpf} onChange={handlePaymentChange} disabled={!isEditing} className="mt-1 block w-full md:w-1/2 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed" placeholder="000.000.000-00"/>
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
                    disabled={!isEditing}
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
            <input type="text" name="address" id="address" value={paymentFormData.address} onChange={handlePaymentChange} disabled={!isEditing} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed" placeholder="Rua, Av, etc."/>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
           <div>
              <label htmlFor="number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número</label>
              <input type="text" name="number" id="number" value={paymentFormData.number} onChange={handlePaymentChange} disabled={!isEditing} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="complement" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Complemento <span className="text-gray-400">(Opcional)</span></label>
              <input type="text" name="complement" id="complement" value={paymentFormData.complement} onChange={handlePaymentChange} disabled={!isEditing} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed" placeholder="Apto, Bloco, etc."/>
            </div>
        </div>
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="district" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bairro</label>
              <input type="text" name="district" id="district" value={paymentFormData.district} onChange={handlePaymentChange} disabled={!isEditing} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed"/>
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cidade</label>
              <input type="text" name="city" id="city" value={paymentFormData.city} onChange={handlePaymentChange} disabled={!isEditing} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed"/>
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
              <select id="state" name="state" value={paymentFormData.state} onChange={handlePaymentChange} disabled={!isEditing} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:bg-gray-100 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed">
                <option value="">Selecione...</option>
                {brazilianStates.map(state => <option key={state} value={state}>{state}</option>)}
              </select>
            </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b dark:border-dark-border flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Área do Usuário</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-border transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="flex border-b dark:border-dark-border">
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
        </div>

        <div className="flex-grow p-6 overflow-y-auto">
          {activeTab === 'data' ? renderDataTab() : renderPaymentTab()}
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

        {isEditing && <div className="bg-gray-100 dark:bg-gray-900/50 px-4 py-3 flex justify-end gap-4 rounded-b-lg border-t dark:border-dark-border">
          <button onClick={onClose} className="py-2 px-4 bg-gray-200 dark:bg-dark-border text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
            {isAdmin ? 'Cancelar' : 'Fechar'}
          </button>
          <button onClick={handleSave} className="py-2 px-6 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary shadow-md transition">
            Salvar Alterações
          </button>
        </div>}

      </div>
    </div>
  );
};

export default ProfileModal;