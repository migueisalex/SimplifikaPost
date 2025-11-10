import React, { useState } from 'react';
import SignUpFlow from './SignUpFlow';
import { Subscription } from '../types';

interface AuthPageProps {
  onLoginSuccess: (subscription?: Subscription) => void;
  onAdminLoginSuccess: () => void;
  onTestUserLogin: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, onAdminLoginSuccess, onTestUserLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Admin check
    if (email === 'migueisalex@gmail.com' && password === '062301') {
      onAdminLoginSuccess();
      return;
    }
    
    // Test user check
    if (email === 'teste@gmail.com' && password === '123456') {
      onTestUserLogin();
      return;
    }

    if (!email || !password) {
      setError('Por favor, preencha e-mail e senha.');
      return;
    }
    
    // Simulating API call for login
    if (localStorage.getItem('social-user-email') === email) {
        onLoginSuccess();
    } else {
        setError('Usuário ou senha inválidos. Se você é novo, por favor, cadastre-se.');
    }
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
      <div className="mb-6">
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
            setIsLogin(false);
            setError('');
          }}
          className="inline-block align-baseline font-bold text-sm text-brand-primary hover:text-brand-secondary"
        >
          Criar uma conta
        </button>
      </div>
    </form>
  );
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-dark-bg p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white dark:bg-dark-card shadow-xl rounded-lg px-8 pt-6 pb-8 mb-4">
            {isLogin ? (
                <>
                    <h1 className="text-3xl font-bold text-center mb-6 font-exo2 uppercase tracking-wider text-gray-700 dark:text-white">Simplifika Post</h1>
                    {renderLoginForm()}
                </>
            ) : (
                <SignUpFlow 
                    onSignUpSuccess={(subscription) => onLoginSuccess(subscription)} 
                    onBackToLogin={() => setIsLogin(true)}
                />
            )}
        </div>
        <p className="text-center text-gray-500 text-xs">
          &copy;2024 Simplifika Post. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
