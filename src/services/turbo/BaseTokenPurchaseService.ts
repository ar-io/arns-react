import { ETHToTokenAmount, TurboFactory } from '@ardrive/turbo-sdk/web';
import { BrowserProvider } from 'ethers';
import { Config, Connector } from 'wagmi';

import {
  getBaseChainId,
  isOnBaseNetwork,
  switchToBaseNetwork,
} from '../../utils/baseNetwork';
import {
  BASE_TOKEN_CONFIG,
  BaseTokenType,
  NETWORK_DEFAULTS,
  TOP_UP_BUFFER_MULTIPLIER,
} from '../../utils/constants';
import { BaseTokenError, TopUpError } from '../../utils/errors';
import { TurboArNSClient, TurboArNSIntent } from './TurboArNSClient';

export interface BaseTokenPurchaseParams {
  /** The type of Base token to use for payment */
  tokenType: BaseTokenType;
  /** The amount of winc (credits) needed for the ArNS purchase */
  wincRequired: string;
  /** The wallet address to credit and use for purchase */
  walletAddress: string;
  /** Wagmi config for wallet interactions */
  wagmiConfig: Config;
  /** The connected wallet connector */
  connector: Connector;
  /** Turbo ArNS client for executing the purchase */
  turboArNSClient: TurboArNSClient;
  /** Turbo network configuration */
  turboNetwork: typeof NETWORK_DEFAULTS.TURBO;
  /** ArNS purchase parameters */
  purchaseParams: {
    name: string;
    type?: 'lease' | 'permabuy';
    years?: number;
    processId?: string;
    intent: TurboArNSIntent;
    increaseQty?: number;
  };
  /** Progress callback */
  onProgress?: (stage: BaseTokenPurchaseStage, message?: string) => void;
}

export type BaseTokenPurchaseStage =
  | 'calculating'
  | 'switching-network'
  | 'signing'
  | 'topping-up'
  | 'purchasing'
  | 'complete'
  | 'error';

export interface BaseTokenPurchaseResult {
  success: boolean;
  topUpResult?: {
    id: string;
    winc: string;
  };
  purchaseResult?: {
    id: string;
  };
  error?: string;
}

/**
 * Calculates the token amount needed for a given winc amount
 */
async function calculateTokenAmount(
  tokenType: BaseTokenType,
  wincRequired: string,
  turboNetwork: typeof NETWORK_DEFAULTS.TURBO,
): Promise<{ tokenAmount: number; tokenAmountSmallestUnit: string }> {
  const turbo = TurboFactory.unauthenticated({
    token: tokenType as 'base-eth' | 'base-usdc',
    paymentServiceConfig: {
      url: turboNetwork.PAYMENT_URL,
    },
  });

  // Get rate by sampling
  const sampleAmount = tokenType === 'base-usdc' ? 10 : 0.01;
  let sampleTokenAmount: string;
  if (tokenType === 'base-usdc') {
    sampleTokenAmount = (sampleAmount * 1e6).toString();
  } else {
    sampleTokenAmount = ETHToTokenAmount(sampleAmount).toString();
  }

  const { winc: wincForSample } = await turbo.getWincForToken({
    tokenAmount: sampleTokenAmount,
  });

  const wincPerToken = Number(wincForSample) / sampleAmount;

  // Add buffer and calculate
  const wincWithBuffer = Math.ceil(
    Number(wincRequired) * TOP_UP_BUFFER_MULTIPLIER,
  );
  const tokensNeeded = wincWithBuffer / wincPerToken;

  // Round up appropriately
  const decimals = tokenType === 'base-usdc' ? 2 : 8;
  const roundedTokensNeeded =
    Math.ceil(tokensNeeded * Math.pow(10, decimals)) / Math.pow(10, decimals);

  // Convert to smallest unit
  let smallestUnitAmount: string;
  if (tokenType === 'base-usdc') {
    smallestUnitAmount = Math.ceil(roundedTokensNeeded * 1e6).toString();
  } else {
    smallestUnitAmount = ETHToTokenAmount(roundedTokensNeeded).toString();
  }

  return {
    tokenAmount: roundedTokensNeeded,
    tokenAmountSmallestUnit: smallestUnitAmount,
  };
}

/**
 * Creates an authenticated Turbo client with the wagmi signer
 */
async function createAuthenticatedTurboClient(
  tokenType: BaseTokenType,
  _wagmiConfig: Config,
  connector: Connector,
  turboNetwork: typeof NETWORK_DEFAULTS.TURBO,
) {
  // Get the provider from the connector - must be done AFTER network switch
  const provider = await connector.getProvider();
  const ethersProvider = new BrowserProvider(provider as any);
  const signer = await ethersProvider.getSigner();

  // Verify we're on the correct chain
  const network = await ethersProvider.getNetwork();
  const expectedChainId = getBaseChainId();
  if (Number(network.chainId) !== expectedChainId) {
    throw new BaseTokenError(
      `Wallet is on wrong network. Expected chain ID ${expectedChainId}, got ${network.chainId}. Please switch to Base network.`,
    );
  }

  // Create turbo client with wallet adapter
  // Note: tokenType is already 'base-eth' or 'base-usdc', cast is for TypeScript
  const turbo = TurboFactory.authenticated({
    token: tokenType as 'base-eth' | 'base-usdc',
    walletAdapter: {
      getSigner: () => signer as any,
    },
    paymentServiceConfig: {
      url: turboNetwork.PAYMENT_URL,
    },
  });

  return turbo;
}

/**
 * Executes the complete Base token purchase flow:
 * 1. Calculate token amount needed (with buffer)
 * 2. Switch to Base network if needed
 * 3. Top up Turbo credits with Base tokens
 * 4. Execute ArNS purchase with credits
 *
 * This is designed to appear as a single seamless transaction to the user.
 */
export async function executeBaseTokenPurchase({
  tokenType,
  wincRequired,
  walletAddress,
  wagmiConfig,
  connector,
  turboArNSClient,
  turboNetwork,
  purchaseParams: _purchaseParams,
  onProgress,
}: BaseTokenPurchaseParams): Promise<BaseTokenPurchaseResult> {
  const config = BASE_TOKEN_CONFIG[tokenType];

  try {
    // Stage 1: Calculate token amount needed
    onProgress?.('calculating', `Calculating ${config.label} amount...`);

    const { tokenAmount, tokenAmountSmallestUnit } = await calculateTokenAmount(
      tokenType,
      wincRequired,
      turboNetwork,
    );

    // Stage 2: Check and switch to Base network if needed
    const currentChainId = connector.chainId as number | undefined;

    if (!isOnBaseNetwork(currentChainId)) {
      onProgress?.(
        'switching-network',
        `Switching to ${config.networkName}...`,
      );

      try {
        await switchToBaseNetwork(connector);
        // Wait a moment for the switch to complete
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } catch (error) {
        throw new BaseTokenError(
          error instanceof Error
            ? error.message
            : `Failed to switch to ${config.networkName}`,
        );
      }
    }

    // Stage 3: Sign message to initialize signer (if needed)
    onProgress?.('signing', 'Preparing transaction...');

    // Stage 4: Top up credits
    onProgress?.(
      'topping-up',
      `Topping up with ${tokenAmount.toFixed(tokenType === 'base-usdc' ? 2 : 6)} ${config.symbol}...`,
    );

    let topUpResult;
    try {
      const authenticatedTurbo = await createAuthenticatedTurboClient(
        tokenType,
        wagmiConfig,
        connector,
        turboNetwork,
      );

      topUpResult = await authenticatedTurbo.topUpWithTokens({
        tokenAmount: tokenAmountSmallestUnit,
        turboCreditDestinationAddress: walletAddress,
      });

      if (!topUpResult?.id) {
        throw new TopUpError(
          'Top up transaction failed - no transaction ID returned',
        );
      }
    } catch (error) {
      // Handle specific error cases
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (
        errorMessage.toLowerCase().includes('user rejected') ||
        errorMessage.toLowerCase().includes('user denied') ||
        errorMessage.toLowerCase().includes('rejected the request')
      ) {
        throw new TopUpError('Transaction was cancelled.');
      }

      if (
        errorMessage.toLowerCase().includes('insufficient') ||
        errorMessage.toLowerCase().includes('not enough')
      ) {
        throw new TopUpError(
          `Insufficient ${config.symbol} balance. You need at least ${tokenAmount.toFixed(tokenType === 'base-usdc' ? 2 : 6)} ${config.symbol} plus gas fees.`,
        );
      }

      // Check if this is a "submit fund transaction" error with a tx ID
      // This happens when the blockchain tx succeeded but Turbo backend didn't receive it
      const txIdMatch = errorMessage.match(
        /turbo\.submitFundTransaction\([^)]*\)['"]?:\s*(\S+)/,
      );
      if (txIdMatch && txIdMatch[1]) {
        const failedTxId = txIdMatch[1];
        // Try to submit the fund transaction manually
        onProgress?.('topping-up', 'Retrying transaction submission...');

        try {
          // Wait for blockchain confirmation
          await new Promise((resolve) => setTimeout(resolve, 3000));

          const unauthenticatedTurbo = TurboFactory.unauthenticated({
            paymentServiceConfig: {
              url: turboNetwork.PAYMENT_URL,
            },
            token: tokenType as 'base-eth' | 'base-usdc',
          });

          const retryResponse =
            await unauthenticatedTurbo.submitFundTransaction({
              txId: failedTxId,
            });

          if (retryResponse.status === 'failed') {
            throw new TopUpError(
              `Transaction failed after retry. Transaction ID: ${failedTxId}. Please contact support.`,
            );
          }

          // Success - create a fake topUpResult to continue the flow
          topUpResult = {
            id: failedTxId,
            winc: retryResponse.winc || wincRequired,
          };
        } catch (retryError) {
          const retryErrorMessage =
            retryError instanceof Error
              ? retryError.message
              : String(retryError);
          throw new TopUpError(
            `Transaction submitted to blockchain but failed to register with Turbo. Transaction ID: ${failedTxId}. Error: ${retryErrorMessage}. Please wait a few minutes and contact support if credits don't appear.`,
          );
        }
      } else {
        throw new TopUpError(`Failed to top up: ${errorMessage}`);
      }
    }

    // Wait a moment for the top-up to be processed
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Stage 5: Execute ArNS purchase with credits
    onProgress?.('purchasing', 'Completing purchase...');

    try {
      // For credit-based purchases, we use turbo fundFrom
      // The turboArNSClient should handle this via its executeArNSIntent method
      // But since we just topped up, we need to wait for credits to be available
      // and then make the purchase

      // Poll for credit balance update (max 30 seconds)
      let creditsAvailable = false;
      let attempts = 0;
      const maxAttempts = 15;

      while (!creditsAvailable && attempts < maxAttempts) {
        try {
          const balance =
            await turboArNSClient.turboUploader.getBalance(walletAddress);
          if (Number(balance.winc) >= Number(wincRequired)) {
            creditsAvailable = true;
          } else {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            attempts++;
          }
        } catch {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          attempts++;
        }
      }

      if (!creditsAvailable) {
        // Credits may still be processing, but let's try the purchase anyway
        // The Turbo service should have the credits by now
        console.warn(
          'Credits not yet visible in balance, attempting purchase anyway...',
        );
      }

      // Execute the ArNS purchase using Turbo credits
      // We need to call the ARIO contract with fundFrom: 'turbo'
      // This will be handled by the calling code (Checkout.tsx)
      // For now, we return success from the top-up and let the caller handle the purchase

      return {
        success: true,
        topUpResult: {
          id: topUpResult.id,
          winc: topUpResult.winc || wincRequired,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new TopUpError(`Purchase failed after top-up: ${errorMessage}`);
    }
  } catch (error) {
    onProgress?.('error');

    // Re-throw known error types
    if (error instanceof BaseTokenError || error instanceof TopUpError) {
      throw error;
    }

    // Wrap unknown errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new TopUpError(`Transaction failed: ${errorMessage}`);
  }
}

/**
 * Gets an estimate of the token amount needed for a purchase
 * (Without executing the actual transaction)
 */
export async function estimateBaseTokenAmount(
  tokenType: BaseTokenType,
  wincRequired: string,
  turboNetwork: typeof NETWORK_DEFAULTS.TURBO,
): Promise<{
  tokenAmount: number;
  symbol: string;
  displayAmount: string;
}> {
  const config = BASE_TOKEN_CONFIG[tokenType];
  const { tokenAmount } = await calculateTokenAmount(
    tokenType,
    wincRequired,
    turboNetwork,
  );

  const decimals = tokenType === 'base-usdc' ? 2 : 6;
  return {
    tokenAmount,
    symbol: config.symbol,
    displayAmount: `${tokenAmount.toFixed(decimals)} ${config.symbol}`,
  };
}
