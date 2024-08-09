import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { WagmiProvider } from 'wagmi';
import { mainnet } from 'wagmi/chains';

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
import { WALLETCONNECT_PROJECT_ID } from './utils/constants';
import { queryClient } from './utils/network';
// setup sentry
import './utils/sentry';

// setup RainbowKit
const config = getDefaultConfig({
  appName: 'ArNS App',
  projectId: WALLETCONNECT_PROJECT_ID!,
  chains: [mainnet],
  ssr: false, // If your dApp uses server side rendering (SSR)
});

console.log('WalletConnect project ID: ', WALLETCONNECT_PROJECT_ID);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider
        client={queryClient}
        // persistOptions={{
        //   persister: createIDBPersister(),
        // }}
      >
        <RainbowKitProvider>
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
                          Input: {
                            addonBg: 'var(--card-bg)',
                            colorBgContainer: 'var(--bg-color)',
                            activeBg: 'var(--bg-color)',
                            hoverBg: 'var(--bg-color)',
                            colorText: 'var(--text-white)',
                            colorTextPlaceholder: 'var(--text-grey)',
                            activeBorderColor: 'var(--primary)',
                            hoverBorderColor: 'var(--bg-color)',
                            colorIcon: 'var(--text-grey)',
                            colorPrimary: 'var(--primary)',
                            borderRadius: 3,
                            lineWidth: 0.5,
                            lineWidthFocus: 1,
                            lineWidthBold: 0,
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
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);
