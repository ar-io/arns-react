import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import './index.css';
import GlobalStateProvider from './state/contexts/GlobalState';
import RegistrationStateProvider from './state/contexts/RegistrationState.js';
import { reducer, registrationReducer } from './state/reducers';
import setupSentry from './utils/sentry';

// Setup sentry monitoring
setupSentry();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <GlobalStateProvider reducer={reducer}>
      <RegistrationStateProvider reducer={registrationReducer}>
        <App />
      </RegistrationStateProvider>
    </GlobalStateProvider>
  </React.StrictMode>,
);
