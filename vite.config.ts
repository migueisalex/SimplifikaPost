import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Adiciona 'GEMINI_' como um prefixo válido para variáveis de ambiente
  // que serão expostas para o código do navegador.
  envPrefix: ['VITE_', 'GEMINI_'],
});
