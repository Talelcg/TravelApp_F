// ✅ Correct way for React 18+
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { GoogleOAuthProvider } from '@react-oauth/google';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
        <App />
      </GoogleOAuthProvider>
    </React.StrictMode>
  );
}
