import React from 'react';

interface FooterProps {
  onLinkClick: (file: string, title: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onLinkClick }) => {
  return (
    <footer className="w-full bg-white dark:bg-dark-card shadow-inner mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <div className="flex justify-center items-center gap-4">
          <button 
            onClick={() => onLinkClick('terms.html', 'Termos de Uso e Política de Privacidade')} 
            className="hover:text-brand-primary hover:underline"
          >
            Termos de Uso
          </button>
          <span className="select-none">|</span>
          <button 
            onClick={() => onLinkClick('faq.html', 'Perguntas Frequentes (FAQ)')} 
            className="hover:text-brand-primary hover:underline"
          >
            FAQ
          </button>
          <span className="select-none">|</span>
          <button 
            onClick={() => onLinkClick('help.html', 'Central de Ajuda')} 
            className="hover:text-brand-primary hover:underline"
          >
            Ajuda
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-400">&copy;2024 Simplifika Post. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
