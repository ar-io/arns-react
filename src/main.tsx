import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { ConfigProvider } from 'antd';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import './index.css';
import ArNSStateProvider from './state/contexts/ArNSState';
import GlobalStateProvider from './state/contexts/GlobalState';
import RegistrationStateProvider from './state/contexts/RegistrationState';
import TransactionStateProvider from './state/contexts/TransactionState';
import WalletStateProvider from './state/contexts/WalletState';
import { reducer, registrationReducer } from './state/reducers';
import { arnsReducer } from './state/reducers/ArNSReducer';
import { transactionReducer } from './state/reducers/TransactionReducer';
import { walletReducer } from './state/reducers/WalletReducer';
import { createIDBPersister, queryClient } from './utils/network';
// setup sentry
import './utils/sentry';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: createIDBPersister(),
      }}
    >
      <GlobalStateProvider reducer={reducer}>
        <WalletStateProvider reducer={walletReducer}>
          <ArNSStateProvider reducer={arnsReducer}>
            <TransactionStateProvider reducer={transactionReducer}>
              <RegistrationStateProvider reducer={registrationReducer}>
                <ConfigProvider
                  theme={{
                    // algorithm: theme.darkAlgorithm,
                    token: {
                      colorBgBase: 'var(--primary)',
                    },
                    components: {
                      Button: {
                        colorBgBase: 'var(--primary)',
                      },
                      Progress: {
                        colorText: 'var(--text-white)',
                      },
                    },
                  }}
                >
                  <App />
                </ConfigProvider>
              </RegistrationStateProvider>
            </TransactionStateProvider>
          </ArNSStateProvider>
        </WalletStateProvider>
      </GlobalStateProvider>
    </PersistQueryClientProvider>
  </React.StrictMode>,
);
