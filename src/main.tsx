import { ConfigProvider, theme } from 'antd';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import './index.css';
import GlobalStateProvider from './state/contexts/GlobalState';
import RegistrationStateProvider from './state/contexts/RegistrationState';
import TransactionStateProvider from './state/contexts/TransactionState';
import WalletStateProvider from './state/contexts/WalletState';
import { reducer, registrationReducer } from './state/reducers';
import { transactionReducer } from './state/reducers/TransactionReducer';
import { walletReducer } from './state/reducers/WalletReducer';
// setup sentry
import './utils/sentry';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
      }}
    >
      <GlobalStateProvider reducer={reducer}>
        <WalletStateProvider reducer={walletReducer}>
          <TransactionStateProvider reducer={transactionReducer}>
            <RegistrationStateProvider reducer={registrationReducer}>
              <App />
            </RegistrationStateProvider>
          </TransactionStateProvider>
        </WalletStateProvider>
      </GlobalStateProvider>
    </ConfigProvider>
  </React.StrictMode>,
);
