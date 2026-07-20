import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const usesProjectPages = env.VITE_SITE_URL?.includes('ristohajdukovic.github.io/minoconsult');

  return {
    plugins: [react()],
    base: usesProjectPages ? '/minoconsult/' : '/',
  };
});
