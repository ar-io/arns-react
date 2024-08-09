import { QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import './index.css';
import {
  ArNSStateProvider,
  GlobalStateProvider,
  ModalStateProvider,
  RegistrationStateProvider,
  TransactionStateProvider,
  WalletStateProvider,
  arnsReducer,
  modalReducer,
  reducer,
  registrationReducer,
  transactionReducer,
  walletReducer,
} from './state';
import { queryClient } from './utils/network';
// setup sentry
import './utils/sentry';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider
      client={queryClient}
      // persistOptions={{
      //   persister: createIDBPersister(),
      // }}
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
                  <ModalStateProvider reducer={modalReducer}>
                    <App />
                  </ModalStateProvider>
                </ConfigProvider>
              </RegistrationStateProvider>
            </TransactionStateProvider>
          </ArNSStateProvider>
        </WalletStateProvider>
      </GlobalStateProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
