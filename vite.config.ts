
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // 현재 작업 디렉토리에서 환경 변수를 로드합니다.
  // Fix: Use type assertion for process to access cwd() which avoids the 'Property cwd does not exist on type Process' error.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // Vercel 배포 환경에서는 process.env.API_KEY를, 
  // 로컬 개발 환경에서는 .env 파일의 API_KEY를 우선적으로 사용합니다.
  const apiKey = env.API_KEY || (process as any).env.API_KEY || '';

  return {
    plugins: [react()],
    define: {
      // 클라이언트 측에서 process.env.API_KEY로 접근할 수 있게 주입합니다.
      'process.env.API_KEY': JSON.stringify(apiKey),
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: {
          main: './index.html',
        },
        external: [
          '@google/genai'
        ],
        output: {
          globals: {
            '@google/genai': 'GoogleGenAI'
          }
        }
      },
    },
    server: {
      port: 3000,
    },
  };
});
