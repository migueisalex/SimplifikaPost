import React, { useState } from 'react';
import { Subscription } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface VerificationCodeFormProps {
  email: string;
  onVerificationSuccess: (subscription: Subscription) => void;
}

const VerificationCodeForm: React.FC<VerificationCodeFormProps> = ({ email, onVerificationSuccess }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulação de verificação
    setTimeout(() => {
      if (code === '123456') { // Código de teste
        const storedSubscription = JSON.parse(localStorage.getItem('social-scheduler-subscription') || 'null');
        if (storedSubscription) {
          onVerificationSuccess(storedSubscription);
        } else {
          setError('Ocorreu um erro ao encontrar os dados da sua assinatura.');
        }
      } else {
        setError('Código de verificação inválido.');
      }
      setIsLoading(false);
    }, 1000);
  };
  
  const handleResendCode = () => {
      setIsResending(true);
      setError('');
      // Simulação de reenvio
      setTimeout(() => {
          alert(`Um novo código foi enviado para ${email}. (Código de teste: 123456)`);
          setIsResending(false);
      }, 1500);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-2">Verifique seu Email</h2>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
        Enviamos um código de 6 dígitos para <strong>{email}</strong>.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="code">
            Código de Verificação
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline focus:border-brand-primary text-center tracking-[0.5em]"
            id="code"
            type="text"
            placeholder="______"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            required
          />
        </div>
        {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
        <div className="flex items-center justify-between">
          <button
            className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-transform transform hover:scale-105 disabled:opacity-50"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? <LoadingSpinner className="w-5 h-5"/> : 'Verificar e Entrar'}
          </button>
          <button
            type="button"
            onClick={handleResendCode}
            disabled={isResending}
            className="inline-block align-baseline font-bold text-sm text-brand-primary hover:text-brand-secondary disabled:opacity-50 disabled:cursor-wait"
          >
            {isResending ? 'Reenviando...' : 'Reenviar código'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VerificationCodeForm;