import { Connector } from 'wagmi';

import {
  BASE_MAINNET_CHAIN_ID,
  BASE_TOKEN_CONFIG,
  BaseTokenType,
} from './constants';

/**
 * Returns the Base chain ID for token operations.
 * Always returns Base Mainnet since that's where the Turbo SDK
 * contracts and real tokens exist, regardless of payment service environment.
 */
export function getBaseChainId(): number {
  // Always use Base Mainnet for token operations
  // The Turbo SDK's Base token support only works on mainnet
  return BASE_MAINNET_CHAIN_ID;
}

/**
 * Checks if the wallet is connected to the correct Base network
 */
export function isOnBaseNetwork(currentChainId: number | undefined): boolean {
  if (!currentChainId) return false;
  const targetChainId = getBaseChainId();
  return currentChainId === targetChainId;
}

/**
 * Gets the Base Mainnet network configuration for adding to wallet
 */
export function getBaseNetworkParams(): {
  chainId: string;
  chainName: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  rpcUrls: string[];
  blockExplorerUrls: string[];
} {
  return {
    chainId: `0x${BASE_MAINNET_CHAIN_ID.toString(16)}`,
    chainName: 'Base',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.base.org'],
    blockExplorerUrls: ['https://basescan.org'],
  };
}

/**
 * Switches the wallet to Base Mainnet
 * @throws Error if switch fails
 */
export async function switchToBaseNetwork(connector: Connector): Promise<void> {
  const targetChainId = getBaseChainId();

  try {
    await connector.switchChain?.({ chainId: targetChainId });
  } catch (error: unknown) {
    const err = error as { code?: number; message?: string };

    // Error 4902 means the network doesn't exist in wallet - try to add it
    if (err.code === 4902) {
      try {
        const networkParams = getBaseNetworkParams();

        // Use (window as any).ethereum to add the chain
        if ((window as any).ethereum) {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networkParams],
          });
          return;
        }
      } catch {
        throw new Error(
          'Failed to add Base to your wallet. Please add it manually.',
        );
      }
    }

    // User rejected the switch
    if (
      err.message?.toLowerCase().includes('user rejected') ||
      err.message?.toLowerCase().includes('user denied')
    ) {
      throw new Error('Please switch to Base to continue.');
    }

    throw new Error(
      'Failed to switch to Base. Please switch manually in your wallet.',
    );
  }
}

/**
 * Formats a token amount for display
 */
export function formatBaseTokenAmount(
  amount: number,
  tokenType: BaseTokenType,
): string {
  const config = BASE_TOKEN_CONFIG[tokenType];
  // USDC and base-ario use 2 decimals, ETH uses 6
  const decimals =
    tokenType === 'base-usdc' || tokenType === 'base-ario' ? 2 : 6;
  return `${amount.toFixed(decimals)} ${config.symbol}`;
}

/**
 * Converts a token amount to its smallest unit (wei for ETH, 6 decimals for USDC)
 */
export function toBaseTokenSmallestUnit(
  amount: number,
  tokenType: BaseTokenType,
): bigint {
  const config = BASE_TOKEN_CONFIG[tokenType];
  return BigInt(Math.floor(amount * Math.pow(10, config.decimals)));
}

/**
 * Converts from smallest unit back to standard unit
 */
export function fromBaseTokenSmallestUnit(
  amount: bigint,
  tokenType: BaseTokenType,
): number {
  const config = BASE_TOKEN_CONFIG[tokenType];
  return Number(amount) / Math.pow(10, config.decimals);
}
