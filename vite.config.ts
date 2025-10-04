import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // ✅ Ajoute cette ligne pour corriger la page blanche sur Render
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
