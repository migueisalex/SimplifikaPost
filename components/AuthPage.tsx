

import React, { useState } from 'react';

interface AuthPageProps {
  onLoginSuccess: () => void;
  onAdminLoginSuccess: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, onAdminLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [error, setError] = useState('');

  const handleAuthAction = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Admin check
    if (email === 'migueisalex@gmail.com' && password === '062301') {
      onAdminLoginSuccess();
      return;
    }

    if (!email || !password) {
      setError('Por favor, preencha e-mail e senha.');
      return;
    }
    
    // Simulating API call
    console.log(`Simulating ${isLogin ? 'Login' : 'Sign Up'} for ${email}`);
    
    if (isLogin) {
      // Simple validation for demo
      if (localStorage.getItem('social-user-email') === email) {
        onLoginSuccess();
      } else {
        setError('Usuário não encontrado. Por favor, cadastre-se.');
      }
    } else {
      // For sign up, show verification step
      setShowVerification(true);
    }
  };
  
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // For demo, any 6-digit code is fine
    if (verificationCode.length === 6 && /^\d+$/.test(verificationCode)) {
      console.log('Verification successful');
      localStorage.setItem('social-user-email', email); // "Create" user
      onLoginSuccess();
    } else {
      setError('Código de verificação inválido. Deve ter 6 dígitos.');
    }
  }

  const renderForm = () => (
    <form onSubmit={handleAuthAction}>
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
          {isLogin ? 'Entrar' : 'Cadastrar'}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          className="inline-block align-baseline font-bold text-sm text-brand-primary hover:text-brand-secondary"
        >
          {isLogin ? 'Criar uma conta' : 'Já tenho uma conta'}
        </button>
      </div>
    </form>
  );

  const renderVerification = () => (
      <form onSubmit={handleVerifyCode}>
        <p className="mb-4 text-center text-gray-600 dark:text-gray-300">Enviamos um código de verificação para <strong>{email}</strong>. Por favor, insira-o abaixo (use '123456' para testar).</p>
        <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="code">
                Código de Verificação
            </label>
            <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline focus:border-brand-primary"
                id="code"
                type="text"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
            />
        </div>
        {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
        <div className="flex items-center justify-center">
            <button
                className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-transform transform hover:scale-105"
                type="submit"
            >
                Verificar e Entrar
            </button>
        </div>
      </form>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-dark-bg">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-dark-card shadow-xl rounded-lg px-8 pt-6 pb-8 mb-4">
            <h1 className="text-3xl font-bold text-center mb-6 font-exo2 uppercase tracking-wider text-[#676465] dark:text-white">{showVerification ? 'Verificação de E-mail' : 'Simplifika Post'}</h1>
            {showVerification ? renderVerification() : renderForm()}
        </div>
        <p className="text-center text-gray-500 text-xs">
          &copy;2024 Simplifika Post. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;