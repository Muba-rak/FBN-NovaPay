import React from 'react';
import ReactDOM from 'react-dom/client';
import { Providers } from './app/providers';
import { App } from './app/App';
import './index.css';
import { enableMocking } from './mocks/browser';

async function bootstrap() {
  // Initialize MSW Mock Service Worker in browser
  await enableMocking();

  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Root element not found');

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Providers>
        <App />
      </Providers>
    </React.StrictMode>
  );
}

bootstrap();
