import React, { useState, useEffect, useCallback } from 'react';
import SignUpFlow from './SignUpFlow';
import { Subscription, UserData, StaffMember } from '../types';
import VerificationCodeForm from './VerificationCodeForm';
import useLocalStorage from '../hooks/useLocalStorage';
import InfoModal from './InfoModal';

interface AuthPageProps {
  onLoginSuccess: (user: UserData, subscription: Subscription) => void;
  onAdminLoginSuccess: (email: string, role: 'admin' | 'financeiro') => void;
  onTestUserLogin: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, onAdminLoginSuccess, onTestUserLogin }) => {
  const [flowState, setFlowState] = useState<'login' | 'signup' | 'verify' | 'forgotPassword' | 'forgotPasswordSuccess'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [error, setError] = useState('');
  const [staffList, setStaffList] = useLocalStorage<StaffMember[]>('admin-staff-list', []);

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState({ title: '', content: '' });
  const [isInfoModalLoading, setIsInfoModalLoading] = useState(false);

  // Garante que o admin principal sempre exista.
  useEffect(() => {
    const adminExists = staffList.some(s => s.email === 'migueisalex@gmail.com');
    if (!adminExists) {
      const mainAdmin: StaffMember = { 
        id: 'staff-1', 
        email: 'migueisalex@gmail.com', 
        password: '062301', 
        role: 'admin', 
        accessLogs: [] 
      };
      setStaffList(prevList => [...prevList, mainAdmin]);
    }
  }, [staffList, setStaffList]);

  const handleOpenInfoModal = useCallback(async (file: string, title: string) => {
    setIsInfoModalLoading(true);
    setInfoModalContent({ title, content: '' });
    setIsInfoModalOpen(true);
    try {
      const response = await fetch(`/${file}`);
      const htmlContent = await response.text();
      setInfoModalContent({ title, content: htmlContent });
    } catch (error) {
      console.error('Failed to fetch info content:', error);
      setInfoModalContent({ title, content: '<p>Ocorreu um erro ao carregar o conteúdo. Tente novamente mais tarde.</p>' });
    } finally {
      setIsInfoModalLoading(false);
    }
  }, []);


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha e-mail e senha.');
      return;
    }

    // Admin/Financeiro check from localStorage
    const staffMember = staffList.find(s => s.email === email && s.password === password);
    if (staffMember) {
        onAdminLoginSuccess(staffMember.email, staffMember.role);
        return;
    }
    
    // Test user check
    if (email === 'teste@gmail.com' && password === '123456') {
      onTestUserLogin();
      return;
    }
    
    // Regular user check
    const storedUserRaw = localStorage.getItem('social-scheduler-user-data');
    if (storedUserRaw) {
        const userData: UserData = JSON.parse(storedUserRaw);
        // This is a simulation, in a real app, password would be hashed and checked on a server
        const storedSubscription: Subscription = JSON.parse(localStorage.getItem('social-scheduler-subscription') || 'null');
        if (userData.email === email) {
            onLoginSuccess(userData, storedSubscription);
            return;
        }
    }

    setError('Usuário ou senha inválidos. Se você é novo, por favor, cadastre-se.');
  };

  const handleRegistrationPending = (registeredEmail: string) => {
    setVerificationEmail(registeredEmail);
    setFlowState('verify');
  };

  const handleVerificationSuccess = (subscription: Subscription) => {
    const userData: UserData = JSON.parse(localStorage.getItem('social-scheduler-user-data') || '{}');
    onLoginSuccess(userData, subscription);
  }

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail) {
      setError("Por favor, insira seu e-mail.");
      return;
    }
    // Simulação
    alert(`Se uma conta com o e-mail ${recoveryEmail} existir, um link de recuperação foi enviado.`);
    setFlowState('forgotPasswordSuccess');
    setError('');
  };
  
  const renderLoginForm = () => (
    <form onSubmit={handleLogin}>
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="email">
          Email
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline focus:border-brand-primary"
          id="email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="mb-2">
        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="password">
          Senha
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-brand-primary"
          id="password"
          type="password"
          placeholder="******************"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="text-right mb-4">
        <button
          type="button"
          onClick={() => {
            setFlowState('forgotPassword');
            setError('');
            setRecoveryEmail(email);
          }}
          className="inline-block align-baseline font-bold text-xs text-brand-primary hover:text-brand-secondary"
        >
          Esqueci minha senha
        </button>
      </div>
       {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
      <div className="flex items-center justify-between">
        <button
          className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-transform transform hover:scale-105"
          type="submit"
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => {
            setFlowState('signup');
            setError('');
          }}
          className="inline-block align-baseline font-bold text-sm text-brand-primary hover:text-brand-secondary"
        >
          Criar uma conta
        </button>
      </div>
    </form>
  );
  
  const renderForgotPasswordForm = () => (
     <form onSubmit={handleForgotPasswordSubmit}>
      <h2 className="text-2xl font-bold text-center mb-2">Recuperar Senha</h2>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
        Insira seu e-mail para receber um link de recuperação.
      </p>
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="recovery-email">
          Email
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline focus:border-brand-primary"
          id="recovery-email"
          type="email"
          placeholder="seu@email.com"
          value={recoveryEmail}
          onChange={(e) => setRecoveryEmail(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
      <div className="flex items-center justify-between mt-6 pt-4 border-t dark:border-gray-700">
        <button
          type="button"
          onClick={() => {
            setFlowState('login');
            setError('');
          }}
          className="font-bold text-sm text-gray-600 dark:text-gray-300 hover:text-brand-primary"
        >
          Voltar para o Login
        </button>
        <button
          className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-transform transform hover:scale-105"
          type="submit"
        >
          Enviar Link
        </button>
      </div>
    </form>
  );

  const renderForgotPasswordSuccessMessage = () => (
    <div className="text-center">
        <h2 className="text-2xl font-bold text-center mb-2">Verifique seu Email</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
           Se uma conta com o e-mail fornecido existir, enviamos um link para redefinir sua senha.
        </p>
        <button
            onClick={() => setFlowState('login')}
            className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition-transform transform hover:scale-105"
        >
            Voltar para o Login
        </button>
    </div>
  );

  return (
    <>
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-dark-bg p-4">
        <div className="w-full max-w-lg">
            <div className="bg-white dark:bg-dark-card shadow-xl rounded-lg px-8 pt-6 pb-8 mb-4">
                <h1 className="text-3xl font-bold text-center mb-6 font-exo2 uppercase tracking-wider text-gray-700 dark:text-white">Simplifika Post</h1>
                {flowState === 'login' && renderLoginForm()}
                {flowState === 'signup' && (
                    <SignUpFlow 
                        onRegistrationPending={handleRegistrationPending} 
                        onBackToLogin={() => setFlowState('login')}
                        onOpenTermsModal={() => handleOpenInfoModal('terms.html', 'Termos de Uso e Política de Privacidade')}
                    />
                )}
                {flowState === 'verify' && (
                    <VerificationCodeForm
                        email={verificationEmail}
                        onVerificationSuccess={handleVerificationSuccess}
                    />
                )}
                {flowState === 'forgotPassword' && renderForgotPasswordForm()}
                {flowState === 'forgotPasswordSuccess' && renderForgotPasswordSuccessMessage()}
            </div>
            <p className="text-center text-gray-500 text-xs">
            &copy;2024 Simplifika Post. Todos os direitos reservados.
            </p>
        </div>
        </div>
         <InfoModal
            isOpen={isInfoModalOpen}
            onClose={() => setIsInfoModalOpen(false)}
            title={infoModalContent.title}
            isLoading={isInfoModalLoading}
        >
            <div dangerouslySetInnerHTML={{ __html: infoModalContent.content }} />
        </InfoModal>
    </>
  );
};

export default AuthPage;