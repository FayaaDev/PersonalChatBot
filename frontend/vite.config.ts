import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/components/ChatWidget/index.ts', import.meta.url)),
      name: 'PersonalSiteChatWidget',
      fileName: 'personal-site-chat-widget',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
    },
  },
});
