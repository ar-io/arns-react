import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { WagmiProvider } from 'wagmi';
import { base, mainnet, polygon } from 'wagmi/chains';

import App from './App';
import { ThemeProvider } from './components/ThemeProvider';
import { ToastProvider } from './components/ui/Toast';
import { TooltipProvider } from './components/ui/Tooltip';
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

// Wagmi setup with Rainbow Kit
const config = getDefaultConfig({
  appName: 'ArNS Registry',
  projectId: WALLETCONNECT_PROJECT_ID,
  chains: [mainnet, base, polygon],
  ssr: false,
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
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
                      <ModalStateProvider reducer={modalReducer}>
                        <ToastProvider>
                          <TooltipProvider delayDuration={200}>
                            <App />
                          </TooltipProvider>
                        </ToastProvider>
                      </ModalStateProvider>
                    </RegistrationStateProvider>
                  </TransactionStateProvider>
                </ArNSStateProvider>
              </WalletStateProvider>
            </GlobalStateProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
