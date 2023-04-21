import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import './index.css';
import GlobalStateProvider from './state/contexts/GlobalState';
import RegistrationStateProvider from './state/contexts/RegistrationState';
import TransactionStateProvider from './state/contexts/TransactionState';
import { reducer, registrationReducer } from './state/reducers';
import { transactionReducer } from './state/reducers/TransactionReducer';
// setup sentry
import './utils/sentry';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <GlobalStateProvider reducer={reducer}>
      <TransactionStateProvider reducer={transactionReducer}>
        <RegistrationStateProvider reducer={registrationReducer}>
          <App />
        </RegistrationStateProvider>
      </TransactionStateProvider>
    </GlobalStateProvider>
  </React.StrictMode>,
);
