import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
    <QueryClientProvider client={new QueryClient()}>
      <GlobalStateProvider reducer={reducer}>
        <WalletStateProvider reducer={walletReducer}>
          <TransactionStateProvider reducer={transactionReducer}>
            <RegistrationStateProvider reducer={registrationReducer}>
              <ConfigProvider
                theme={{
                  algorithm: theme.darkAlgorithm,
                  token: {
                    colorBgBase: 'var(--primary)',
                  },
                  components: {
                    Button: {
                      colorBgBase: 'var(--primary)',
                    },
                  },
                }}
              >
                <App />
              </ConfigProvider>
            </RegistrationStateProvider>
          </TransactionStateProvider>
        </WalletStateProvider>
      </GlobalStateProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
