// 1. Mandatory Polyfills for older iPads & Safari (must be first)
import './polyfills';

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

// Register PWA Service Worker for downloadable web app capabilities
if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('Synapse PWA Service Worker registered:', reg.scope);
      })
      .catch((err) => {
        console.log('Synapse PWA Service Worker note:', err);
      });
  });
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
