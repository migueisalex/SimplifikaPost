import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Define a variável de ambiente para ser acessível no código do cliente.
  // O Vite substituirá 'process.env.GEMINI_API_KEY' pelo valor real durante o build.
  define: {
    'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY)
  }
});