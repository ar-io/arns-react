import { ArconnectSigner, mARIOToken } from '@ar.io/sdk/web';
import {
  ARIOToTokenAmount,
  ARToTokenAmount,
  ETHToTokenAmount,
  POLToTokenAmount,
  TokenType,
  TurboFactory,
} from '@ardrive/turbo-sdk/web';
import { useArIOLiquidBalance } from '@src/hooks/useArIOBalance';
import { useCryptoPrice } from '@src/hooks/useCryptoPrice';
import {
  formatNameAffordability,
  useNameAffordability,
} from '@src/hooks/useNameAffordability';
import { useTurboArNSClient } from '@src/hooks/useTurboArNSClient';
import useUploadCostGib from '@src/hooks/useUploadCostGib';
import { useGlobalState, useWalletState } from '@src/state';
import { WALLET_TYPES } from '@src/types';
import { formatARIOWithCommas } from '@src/utils/common/common';
import {
  BASE_MAINNET_CHAIN_ID,
  BASE_USDC_CONTRACT,
  ETH_MAINNET_CHAIN_ID,
  ETH_USDC_CONTRACT,
  POLYGON_MAINNET_CHAIN_ID,
  POLYGON_USDC_CONTRACT,
  TOKEN_DISPLAY_INFO,
  currencyLabels,
} from '@src/utils/constants';
import { AlertCircle, RefreshCw, Wallet } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAccount, useBalance, useWalletClient } from 'wagmi';

// Fallback value for winc per GiB when upload cost data is unavailable
const WINC_PER_GIB_FALLBACK = 1e12;

export interface CryptoTopupQuote {
  tokenAmount: number;
  tokenType: TokenType;
  credits: number;
  gigabytes: number;
  winc: string;
}

interface CryptoConfirmationProps {
  cryptoAmount: number;
  tokenType: TokenType;
  onBack: () => void;
  onComplete: () => void;
  onManualPayment: (quote: CryptoTopupQuote) => void;
}

function CryptoConfirmation({
  cryptoAmount,
  tokenType,
  onBack,
  onComplete,
  onManualPayment,
}: CryptoConfirmationProps) {
  const [{ wallet, balances }] = useWalletState();
  const walletType = window.localStorage.getItem('walletType');
  const [{ turboNetwork }] = useGlobalState();
  const turbo = useTurboArNSClient();
  const { data: uploadCostGib } = useUploadCostGib();
  const { data: walletClient } = useWalletClient();
  const { address: ethAddress } = useAccount();

  // Get token USD price for name affordability calculation
  const { data: tokenUsdPrice } = useCryptoPrice(tokenType);
  const usdValue = tokenUsdPrice ? cryptoAmount * tokenUsdPrice : undefined;
  const nameAffordability = useNameAffordability(usdValue);
  const nameAffordabilityText = formatNameAffordability(nameAffordability);

  // ARIO balance (for both Arweave and ETH wallets paying with ARIO)
  const { data: arioLiquidBalance } = useArIOLiquidBalance();

  // ETH L1 native balance
  const { data: ethBalance } = useBalance({
    address: ethAddress,
    chainId: ETH_MAINNET_CHAIN_ID,
  });

  // ETH L1 USDC balance
  const { data: ethUsdcBalance } = useBalance({
    address: ethAddress,
    chainId: ETH_MAINNET_CHAIN_ID,
    token: ETH_USDC_CONTRACT,
  });

  // Base ETH balance
  const { data: baseEthBalance } = useBalance({
    address: ethAddress,
    chainId: BASE_MAINNET_CHAIN_ID,
  });

  // Base USDC balance
  const { data: baseUsdcBalance } = useBalance({
    address: ethAddress,
    chainId: BASE_MAINNET_CHAIN_ID,
    token: BASE_USDC_CONTRACT,
  });

  // Polygon POL balance
  const { data: polBalance } = useBalance({
    address: ethAddress,
    chainId: POLYGON_MAINNET_CHAIN_ID,
  });

  // Polygon USDC balance
  const { data: polygonUsdcBalance } = useBalance({
    address: ethAddress,
    chainId: POLYGON_MAINNET_CHAIN_ID,
    token: POLYGON_USDC_CONTRACT,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string>();
  const [quote, setQuote] = useState<CryptoTopupQuote | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(true);
  const [failedTxId, setFailedTxId] = useState<string>();
  const [isRetrying, setIsRetrying] = useState(false);

  // Get the current balance for the selected token
  const currentTokenBalance = useMemo((): {
    value: number;
    formatted: string;
    symbol: string;
  } | null => {
    switch (tokenType) {
      case 'arweave':
        return balances?.ar !== undefined
          ? {
              value: balances.ar,
              formatted: balances.ar.toFixed(6),
              symbol: 'AR',
            }
          : null;
      case 'ario':
        return arioLiquidBalance !== undefined
          ? {
              value: new mARIOToken(arioLiquidBalance).toARIO().valueOf(),
              formatted: formatARIOWithCommas(
                new mARIOToken(arioLiquidBalance).toARIO().valueOf(),
              ),
              symbol: 'ARIO',
            }
          : null;
      case 'ethereum':
        return ethBalance
          ? {
              value: Number(ethBalance.formatted),
              formatted: Number(ethBalance.formatted).toFixed(6),
              symbol: 'ETH',
            }
          : null;
      case 'base-eth':
        return baseEthBalance
          ? {
              value: Number(baseEthBalance.formatted),
              formatted: Number(baseEthBalance.formatted).toFixed(6),
              symbol: 'ETH',
            }
          : null;
      case 'usdc':
        return ethUsdcBalance
          ? {
              value: Number(ethUsdcBalance.formatted),
              formatted: Number(ethUsdcBalance.formatted).toFixed(2),
              symbol: 'USDC',
            }
          : null;
      case 'base-usdc':
        return baseUsdcBalance
          ? {
              value: Number(baseUsdcBalance.formatted),
              formatted: Number(baseUsdcBalance.formatted).toFixed(2),
              symbol: 'USDC',
            }
          : null;
      case 'pol':
        return polBalance
          ? {
              value: Number(polBalance.formatted),
              formatted: Number(polBalance.formatted).toFixed(6),
              symbol: 'POL',
            }
          : null;
      case 'polygon-usdc':
        return polygonUsdcBalance
          ? {
              value: Number(polygonUsdcBalance.formatted),
              formatted: Number(polygonUsdcBalance.formatted).toFixed(2),
              symbol: 'USDC',
            }
          : null;
      default:
        return null;
    }
  }, [
    tokenType,
    balances,
    arioLiquidBalance,
    ethBalance,
    baseEthBalance,
    ethUsdcBalance,
    baseUsdcBalance,
    polBalance,
    polygonUsdcBalance,
  ]);

  // Calculate the after balance
  const afterTokenBalance = useMemo(() => {
    if (!currentTokenBalance) return null;
    const afterValue = currentTokenBalance.value - cryptoAmount;
    const isUsdc = ['usdc', 'base-usdc', 'polygon-usdc'].includes(tokenType);
    return {
      value: afterValue,
      formatted:
        afterValue >= 0
          ? isUsdc
            ? afterValue.toFixed(2)
            : afterValue.toFixed(6)
          : 'Insufficient',
      symbol: currentTokenBalance.symbol,
      isInsufficient: afterValue < 0,
    };
  }, [currentTokenBalance, cryptoAmount, tokenType]);

  // Fetch quote for the crypto amount
  useEffect(() => {
    async function fetchQuote() {
      if (!turbo || cryptoAmount <= 0) {
        setIsLoadingQuote(false);
        setQuote(null);
        return;
      }

      // Clear stale state before starting fetch
      setIsLoadingQuote(true);
      setQuote(null);
      setPaymentError(undefined);

      try {
        // Convert to atomic units before calling getWincForToken
        const atomicAmount = turbo.getAmountByTokenType(
          cryptoAmount,
          tokenType,
        );
        if (!atomicAmount) {
          setQuote(null);
          setPaymentError('Unsupported token type.');
          setIsLoadingQuote(false);
          return;
        }

        const wincResult = await turbo.getWincForToken(
          +atomicAmount,
          tokenType,
        );
        const wincForGiB = uploadCostGib
          ? Number(uploadCostGib[0].winc)
          : WINC_PER_GIB_FALLBACK;
        const credits = turbo.wincToCredits(+wincResult.winc);
        const gigabytes = +wincResult.winc / wincForGiB;

        setQuote({
          tokenAmount: cryptoAmount,
          tokenType,
          credits,
          gigabytes,
          winc: wincResult.winc,
        });
        setPaymentError(undefined);
      } catch (e) {
        console.error('Failed to fetch quote:', e);
        setQuote(null);
        setPaymentError('Failed to fetch current rates. Please try again.');
      } finally {
        setIsLoadingQuote(false);
      }
    }

    fetchQuote();
  }, [cryptoAmount, tokenType, turbo, uploadCostGib]);

  // Determine if we can pay directly based on wallet type and token
  const canPayDirectly = useMemo(() => {
    if (!walletType) return false;

    // Arweave wallets can pay with AR and ARIO
    if (
      walletType === WALLET_TYPES.WANDER ||
      walletType === WALLET_TYPES.ARWEAVE_APP ||
      walletType === WALLET_TYPES.BEACON
    ) {
      return tokenType === 'arweave' || tokenType === 'ario';
    }

    // ETH wallets can pay with ETH-based tokens via direct payment
    // ETH wallets can also pay with ARIO (AO-based token) using the InjectedEthereumSigner
    if (walletType === WALLET_TYPES.ETHEREUM) {
      return [
        'ario',
        'ethereum',
        'base-eth',
        'pol',
        'usdc',
        'base-usdc',
        'polygon-usdc',
      ].includes(tokenType);
    }

    return false;
  }, [walletType, tokenType]);

  const handlePayment = useCallback(async () => {
    if (!quote || !wallet) return;

    setIsProcessing(true);
    setPaymentError(undefined);

    try {
      if (canPayDirectly) {
        // Direct payment via Turbo SDK
        if (
          (walletType === WALLET_TYPES.WANDER ||
            walletType === WALLET_TYPES.ARWEAVE_APP ||
            walletType === WALLET_TYPES.BEACON) &&
          window.arweaveWallet &&
          (tokenType === 'arweave' || tokenType === 'ario')
        ) {
          const signer = new ArconnectSigner(window.arweaveWallet);
          const turboClient = TurboFactory.authenticated({
            signer,
            token: tokenType,
            paymentServiceConfig: {
              url: turboNetwork.PAYMENT_URL,
            },
          });

          let tokenAmount;
          if (tokenType === 'arweave') {
            tokenAmount = ARToTokenAmount(cryptoAmount);
          } else {
            tokenAmount = ARIOToTokenAmount(cryptoAmount);
          }

          await turboClient.topUpWithTokens({
            tokenAmount,
          });

          onComplete();
        } else if (walletType === WALLET_TYPES.ETHEREUM) {
          // ARIO payments for ETH wallets use the InjectedEthereumSigner (AO-based token)
          if (tokenType === 'ario') {
            if (!wallet?.turboSigner) {
              setPaymentError(
                'Wallet signer not available. Please reconnect your wallet and try again.',
              );
              setIsProcessing(false);
              return;
            }

            const turboSigner = wallet.turboSigner as any;
            // Ensure public key is set (required for AO data item signing)
            if (!turboSigner.publicKey && turboSigner.setPublicKey) {
              await turboSigner.setPublicKey();
            }

            const turboClient = TurboFactory.authenticated({
              signer: turboSigner,
              token: 'ario',
              paymentServiceConfig: {
                url: turboNetwork.PAYMENT_URL,
              },
            });

            const tokenAmount = ARIOToTokenAmount(cryptoAmount);
            await turboClient.topUpWithTokens({
              tokenAmount,
            });

            onComplete();
            return;
          }

          // Other ETH-based token payments
          // ETH wallet payment - validate wallet is available
          if (!walletClient || !ethAddress) {
            setPaymentError(
              'Ethereum wallet not available. Please reconnect your wallet and try again.',
            );
            setIsProcessing(false);
            return;
          }

          // Validate window.ethereum is available for BrowserProvider
          if (!window.ethereum) {
            setPaymentError(
              'No Ethereum provider found. Please ensure your wallet extension is installed and active.',
            );
            setIsProcessing(false);
            return;
          }

          const { BrowserProvider } = await import('ethers');
          // Use window.ethereum as EIP-1193 provider - most reliable for browser wallets
          let provider = new BrowserProvider(window.ethereum);
          let signer = await provider.getSigner(ethAddress);

          // Determine expected chain ID based on token type
          const expectedChainId =
            tokenType === 'ethereum' || tokenType === 'usdc'
              ? ETH_MAINNET_CHAIN_ID
              : tokenType === 'base-eth' || tokenType === 'base-usdc'
                ? BASE_MAINNET_CHAIN_ID
                : tokenType === 'pol' || tokenType === 'polygon-usdc'
                  ? POLYGON_MAINNET_CHAIN_ID
                  : ETH_MAINNET_CHAIN_ID;

          // Get network name for error messages
          const getNetworkName = (chainId: number) => {
            switch (chainId) {
              case ETH_MAINNET_CHAIN_ID:
                return 'Ethereum Mainnet';
              case BASE_MAINNET_CHAIN_ID:
                return 'Base';
              case POLYGON_MAINNET_CHAIN_ID:
                return 'Polygon';
              default:
                return 'the required network';
            }
          };

          // Network validation and auto-switching
          const network = await provider.getNetwork();
          if (Number(network.chainId) !== expectedChainId) {
            try {
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${expectedChainId.toString(16)}` }],
              });
              // Wait for switch to complete
              await new Promise((resolve) => setTimeout(resolve, 1000));
              // Re-create provider and signer after switch
              provider = new BrowserProvider(window.ethereum);
              signer = await provider.getSigner(ethAddress);
            } catch (switchError: any) {
              // Error 4902 means the network doesn't exist - try to add it
              if (switchError.code === 4902) {
                const networkConfigs: Record<number, any> = {
                  [BASE_MAINNET_CHAIN_ID]: {
                    chainId: `0x${BASE_MAINNET_CHAIN_ID.toString(16)}`,
                    chainName: 'Base',
                    nativeCurrency: {
                      name: 'Ether',
                      symbol: 'ETH',
                      decimals: 18,
                    },
                    rpcUrls: ['https://mainnet.base.org'],
                    blockExplorerUrls: ['https://basescan.org'],
                  },
                  [POLYGON_MAINNET_CHAIN_ID]: {
                    chainId: `0x${POLYGON_MAINNET_CHAIN_ID.toString(16)}`,
                    chainName: 'Polygon Mainnet',
                    nativeCurrency: {
                      name: 'POL',
                      symbol: 'POL',
                      decimals: 18,
                    },
                    rpcUrls: ['https://polygon-rpc.com'],
                    blockExplorerUrls: ['https://polygonscan.com'],
                  },
                };

                const networkConfig = networkConfigs[expectedChainId];
                if (networkConfig) {
                  try {
                    await window.ethereum.request({
                      method: 'wallet_addEthereumChain',
                      params: [networkConfig],
                    });
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    provider = new BrowserProvider(window.ethereum);
                    signer = await provider.getSigner(ethAddress);
                  } catch {
                    throw new Error(
                      `Failed to add ${getNetworkName(expectedChainId)} to your wallet. Please add it manually.`,
                    );
                  }
                } else {
                  throw new Error(
                    `Please switch to ${getNetworkName(expectedChainId)} in your wallet.`,
                  );
                }
              } else {
                throw new Error(
                  `Please switch to ${getNetworkName(expectedChainId)} in your wallet to complete this payment.`,
                );
              }
            }
          }

          const turboClient = TurboFactory.authenticated({
            token: tokenType as any,
            walletAdapter: {
              getSigner: () => signer as any,
            },
            paymentServiceConfig: {
              url: turboNetwork.PAYMENT_URL,
            },
          });

          let tokenAmount;
          if (tokenType === 'pol') {
            tokenAmount = POLToTokenAmount(cryptoAmount);
          } else if (
            tokenType === 'usdc' ||
            tokenType === 'base-usdc' ||
            tokenType === 'polygon-usdc'
          ) {
            // USDC uses 6 decimals - use Math.round to avoid floating-point errors
            tokenAmount = Math.round(cryptoAmount * 1e6).toString();
          } else {
            // ETH L1 or Base ETH
            tokenAmount = ETHToTokenAmount(cryptoAmount);
          }

          await turboClient.topUpWithTokens({
            tokenAmount,
          });

          onComplete();
        } else {
          // canPayDirectly is true but no matching wallet type - should not happen
          setPaymentError(
            'Unable to process payment with current wallet. Please try manual payment.',
          );
          setIsProcessing(false);
          return;
        }
      } else {
        // Manual payment flow
        onManualPayment(quote);
      }
    } catch (error) {
      console.error('Payment error:', error);

      // Safely resolve token label with fallback for error messages
      const tokenLabel = currencyLabels[tokenType] ?? tokenType ?? 'token';

      if (error instanceof Error) {
        if (
          error.message.includes('insufficient funds') ||
          (error as any).code === 'INSUFFICIENT_FUNDS'
        ) {
          setPaymentError(
            `Insufficient ${tokenLabel} balance. You need enough to cover both the payment amount and gas fees.`,
          );
        } else if (
          error.message.includes('user rejected') ||
          error.message.includes('denied')
        ) {
          setPaymentError(
            'Transaction was cancelled. Please try again if you want to proceed.',
          );
        } else if (
          error.message.includes('network') ||
          error.message.includes('connection')
        ) {
          setPaymentError(
            'Network connection issue. Please check your connection and try again.',
          );
        } else {
          // Try to extract transaction ID from error message for retry
          // Pattern: turbo.submitFundTransaction(id)': 0x...
          const txIdMatch = error.message.match(
            /turbo\.submitFundTransaction\([^)]*\)['"]?:\s*(\S+)/,
          );
          if (txIdMatch && txIdMatch[1]) {
            setFailedTxId(txIdMatch[1]);
          } else {
            setFailedTxId(undefined);
          }
          setPaymentError(`Payment failed: ${error.message}`);
        }
      } else {
        setPaymentError('Payment failed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  }, [
    quote,
    wallet,
    walletType,
    walletClient,
    ethAddress,
    canPayDirectly,
    tokenType,
    cryptoAmount,
    turboNetwork.PAYMENT_URL,
    onComplete,
    onManualPayment,
  ]);

  // Retry failed transaction using submitFundTransaction
  const retryTransaction = useCallback(async () => {
    if (!failedTxId) return;

    setIsRetrying(true);
    setPaymentError('⏳ Waiting for blockchain confirmation (3 seconds)...');

    // Wait for the transaction to be confirmed on-chain
    await new Promise((resolve) => setTimeout(resolve, 3000));

    setPaymentError('🔄 Submitting transaction to Turbo...');

    try {
      // Use unauthenticated client for submitFundTransaction
      const turboClient = TurboFactory.unauthenticated({
        paymentServiceConfig: {
          url: turboNetwork.PAYMENT_URL,
        },
        token: tokenType as any,
      });

      console.log('Retrying submitFundTransaction with txId:', failedTxId);
      const response = await turboClient.submitFundTransaction({
        txId: failedTxId,
      });
      console.log('Retry response:', response);

      if (response.status === 'failed') {
        setPaymentError(
          'Transaction retry failed. The blockchain transaction may not be confirmed yet. Please wait a minute and try again, or contact support if the issue persists.',
        );
        setIsRetrying(false);
      } else {
        setFailedTxId(undefined);
        setPaymentError(undefined);
        onComplete();
      }
    } catch (e: unknown) {
      console.error('Retry error:', e);
      const errorMessage = e instanceof Error ? e.message : String(e);

      if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        setPaymentError(
          `Transaction not found yet. The blockchain transaction (${failedTxId}) needs to be confirmed before Turbo can process it. Please wait 1-2 minutes and try again.`,
        );
      } else {
        setPaymentError(`Retry failed: ${errorMessage}`);
      }
      setIsRetrying(false);
    }
  }, [failedTxId, turboNetwork.PAYMENT_URL, tokenType, onComplete]);

  const formatStorage = (gigabytes: number): string => {
    if (gigabytes >= 1) {
      return `${gigabytes.toFixed(2)} GiB`;
    } else if (gigabytes >= 0.001) {
      const mebibytes = gigabytes * 1024;
      return `${mebibytes.toFixed(2)} MiB`;
    } else if (gigabytes > 0) {
      const kibibytes = gigabytes * 1024 * 1024;
      return `${kibibytes.toFixed(0)} KiB`;
    }
    return '0 GiB';
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-col gap-4 py-3 px-6">
        {isLoadingQuote ? (
          <div className="flex flex-col items-center justify-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin text-grey mb-4" />
            <p className="text-grey">Fetching current rates...</p>
          </div>
        ) : quote ? (
          <>
            {/* Credits You'll Receive - Hero Section */}
            <div className="text-center py-4">
              <div className="text-sm text-grey mb-1">You&apos;ll Receive</div>
              <div className="text-4xl font-bold text-primary">
                {quote.credits.toFixed(4)}
              </div>
              <div className="text-sm text-grey">Credits</div>
              {(quote.gigabytes > 0 || nameAffordabilityText) && (
                <div className="flex flex-col text-xs text-grey mt-2 gap-0.5">
                  {quote.gigabytes > 0 && (
                    <span>≈ {formatStorage(quote.gigabytes)} storage</span>
                  )}
                  {nameAffordabilityText && (
                    <span>≈ {nameAffordabilityText}</span>
                  )}
                </div>
              )}
            </div>

            {/* Payment Details */}
            <div className="bg-dark-grey rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-grey">You Pay:</span>
                <span className="text-white font-medium">
                  {quote.tokenAmount} {currencyLabels[tokenType] || tokenType}
                  {tokenUsdPrice && (
                    <span className="text-grey font-normal">
                      {' '}
                      (~$
                      {(quote.tokenAmount * tokenUsdPrice).toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        },
                      )}
                      )
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-grey">Network:</span>
                <span className="text-white">
                  {TOKEN_DISPLAY_INFO[tokenType]?.network || 'Unknown'}
                </span>
              </div>

              {/* Wallet Balance */}
              {currentTokenBalance && (
                <>
                  <div className="border-t border-grey/20 pt-3 mt-3" />
                  <div className="flex justify-between text-sm">
                    <span className="text-grey">Wallet Balance:</span>
                    <span className="text-white">
                      {currentTokenBalance.formatted}{' '}
                      {currentTokenBalance.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-grey">After Payment:</span>
                    <span
                      className={
                        afterTokenBalance?.isInsufficient
                          ? 'text-error font-medium'
                          : 'text-white'
                      }
                    >
                      {afterTokenBalance?.formatted} {afterTokenBalance?.symbol}
                    </span>
                  </div>
                  {afterTokenBalance?.isInsufficient && (
                    <div className="text-xs text-error mt-1">
                      Insufficient balance. You need at least {cryptoAmount}{' '}
                      {currentTokenBalance.symbol} plus gas fees.
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Error Message */}
            {paymentError && (
              <div className="bg-error/10 border border-error/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-error text-sm break-words">
                      {paymentError}
                    </div>
                    {failedTxId && (
                      <button
                        onClick={retryTransaction}
                        disabled={isRetrying}
                        className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-error text-white rounded-lg font-medium hover:bg-error/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <RefreshCw
                          className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`}
                        />
                        {isRetrying ? 'Retrying...' : 'Retry Transaction'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="w-8 h-8 text-error mb-4" />
            <p className="text-error">Failed to generate quote</p>
            <button
              onClick={onBack}
              className="text-grey hover:text-white mt-2 text-sm"
            >
              Go Back
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 w-full border-t border-dark-grey py-3 mt-4 px-6">
        <p className="text-xs text-grey text-center">
          By continuing, you agree to our{' '}
          <a
            href="https://ar.io/legal/terms-of-service-and-privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-link hover:underline"
          >
            Terms &amp; Conditions
          </a>
        </p>
        <div className="flex gap-2 w-full justify-between">
          <button
            onClick={onBack}
            disabled={isProcessing}
            className="text-grey hover:text-white text-sm disabled:opacity-50"
          >
            Back
          </button>

          <button
            disabled={
              !quote ||
              isProcessing ||
              isLoadingQuote ||
              afterTokenBalance?.isInsufficient
            }
            className="text-black border border-dark-grey bg-primary px-4 py-2 rounded disabled:opacity-50 flex items-center gap-2"
            onClick={handlePayment}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4" />
                {canPayDirectly ? 'Pay Now' : 'Continue'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CryptoConfirmation;
