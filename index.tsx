
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// 디버깅을 위한 전역 선언 (타입스크립트 무시)
declare global {
  interface Window {
    logToScreen: (msg: string, isError?: boolean) => void;
  }
}

try {
  window.logToScreen("React mounting sequence started...");
  
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    window.logToScreen("CRITICAL: Root element not found!", true);
    throw new Error("Could not find root element to mount to");
  }

  window.logToScreen("Creating React root...");
  const root = ReactDOM.createRoot(rootElement);
  
  window.logToScreen("Rendering App component...");
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  window.logToScreen("React render called successfully.");
} catch (err) {
  const errorMsg = err instanceof Error ? err.message : String(err);
  window.logToScreen("Mount Error: " + errorMsg, true);
  console.error(err);
}
