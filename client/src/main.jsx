import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

if (!googleClientId) {
  console.warn(
    '[CEST] VITE_GOOGLE_CLIENT_ID is not set. Google Sign-In will be hidden. ' +
    'Add it to client/.env to enable it.'
  );
}

const app = (
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  googleClientId ? (
    <GoogleOAuthProvider clientId={googleClientId}>
      {app}
    </GoogleOAuthProvider>
  ) : (
    app
  )
);
