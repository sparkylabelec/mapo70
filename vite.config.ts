
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {
      ...process.env,
      API_KEY: process.env.API_KEY
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
      },
      // index.html의 importmap을 통해 라이브러리를 로드하므로 
      // 빌드 시 Rollup이 이 패키지들을 해석(resolve)하려 하지 않도록 외부(external)로 설정합니다.
      external: [
        '@google/genai'
      ],
      output: {
        // external로 설정된 모듈을 브라우저의 importmap이 처리할 수 있도록 
        // 포맷을 유지합니다.
        globals: {
          '@google/genai': 'GoogleGenAI'
        }
      }
    },
  },
  server: {
    port: 3000,
  },
});
