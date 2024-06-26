//import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
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
//import { createIDBPersister, queryClient } from './utils/network';
// setup sentry
import './utils/sentry';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {/* TODO: re-implement persisted caching */}
    {/* <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: createIDBPersister(),
      }}
    > */}
    <QueryClientProvider client={new QueryClient()}>
      <GlobalStateProvider reducer={reducer}>
        <WalletStateProvider reducer={walletReducer}>
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
    {/* </PersistQueryClientProvider> */}
  </React.StrictMode>,
);
