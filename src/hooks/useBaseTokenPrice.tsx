import { ETHToTokenAmount, TurboFactory } from '@ardrive/turbo-sdk/web';
import { useQuery } from '@tanstack/react-query';

import { useGlobalState } from '../state/contexts/GlobalState';
import {
  BASE_TOKEN_CONFIG,
  BaseTokenType,
  TOP_UP_BUFFER_MULTIPLIER,
} from '../utils/constants';

export interface BaseTokenPriceResult {
  /** The amount of tokens needed (in standard units, e.g., 0.001 ETH) */
  tokenAmount: number;
  /** The amount of tokens needed in smallest unit (wei for ETH, 6 decimals for USDC) */
  tokenAmountSmallestUnit: string;
  /** The amount of winc that will be received */
  wincWillReceive: string;
  /** Whether the buffer is included in the calculation */
  includesBuffer: boolean;
  /** The token symbol */
  symbol: string;
  /** Formatted display string */
  displayAmount: string;
}

/**
 * Hook to calculate how many Base tokens are needed for a given amount of winc (credits)
 *
 * @param tokenType - The type of Base token ('base-eth' or 'base-usdc')
 * @param wincNeeded - The amount of winc needed for the purchase
 * @param includeBuffer - Whether to include the 2% buffer (default: true)
 */
export function useBaseTokenPrice(
  tokenType: BaseTokenType | undefined,
  wincNeeded: string | undefined,
  includeBuffer: boolean = true,
) {
  const [{ turboNetwork }] = useGlobalState();

  return useQuery<BaseTokenPriceResult | null>({
    queryKey: [
      'base-token-price',
      tokenType,
      wincNeeded,
      includeBuffer,
      turboNetwork.PAYMENT_URL,
    ],
    queryFn: async () => {
      if (!tokenType || !wincNeeded || wincNeeded === '0') {
        return null;
      }

      const config = BASE_TOKEN_CONFIG[tokenType];

      // Create an unauthenticated turbo client to get pricing
      const turbo = TurboFactory.unauthenticated({
        token: tokenType,
        paymentServiceConfig: {
          url: turboNetwork.PAYMENT_URL,
        },
      });

      // We need to reverse-calculate: given winc needed, how many tokens?
      // First, get the rate by checking how much winc we get for a sample amount
      const sampleAmount = tokenType === 'base-usdc' ? 10 : 0.01; // 10 USDC or 0.01 ETH

      let sampleTokenAmount: string;
      if (tokenType === 'base-usdc') {
        // USDC uses 6 decimals
        sampleTokenAmount = (sampleAmount * 1e6).toString();
      } else {
        // ETH uses 18 decimals via helper function
        sampleTokenAmount = ETHToTokenAmount(sampleAmount).toString();
      }

      const { winc: wincForSample } = await turbo.getWincForToken({
        tokenAmount: sampleTokenAmount,
      });

      // Calculate the rate: winc per token (in standard units)
      const wincPerToken = Number(wincForSample) / sampleAmount;

      // Calculate winc needed with buffer if requested
      const wincWithBuffer = includeBuffer
        ? Math.ceil(Number(wincNeeded) * TOP_UP_BUFFER_MULTIPLIER)
        : Number(wincNeeded);

      // Calculate tokens needed
      const tokensNeeded = wincWithBuffer / wincPerToken;

      // Round up to ensure we have enough
      // For ETH: round to 8 decimal places, for USDC: round to 2 decimal places
      const decimals = tokenType === 'base-usdc' ? 2 : 8;
      const roundedTokensNeeded =
        Math.ceil(tokensNeeded * Math.pow(10, decimals)) /
        Math.pow(10, decimals);

      // Convert to smallest unit
      let smallestUnitAmount: string;
      if (tokenType === 'base-usdc') {
        smallestUnitAmount = Math.ceil(roundedTokensNeeded * 1e6).toString();
      } else {
        smallestUnitAmount = ETHToTokenAmount(roundedTokensNeeded).toString();
      }

      // Format display amount
      const displayDecimals = tokenType === 'base-usdc' ? 2 : 6;
      const displayAmount = `${roundedTokensNeeded.toFixed(displayDecimals)} ${config.symbol}`;

      return {
        tokenAmount: roundedTokensNeeded,
        tokenAmountSmallestUnit: smallestUnitAmount,
        wincWillReceive: Math.floor(
          roundedTokensNeeded * wincPerToken,
        ).toString(),
        includesBuffer: includeBuffer,
        symbol: config.symbol,
        displayAmount,
      };
    },
    staleTime: 30_000, // 30 seconds - prices change frequently
    enabled: !!tokenType && !!wincNeeded && wincNeeded !== '0',
    retry: 2,
  });
}

/**
 * Hook to get the current winc rate for a specific Base token type
 * Useful for displaying "1 ETH = X credits" type information
 */
export function useBaseTokenRate(tokenType: BaseTokenType | undefined) {
  const [{ turboNetwork }] = useGlobalState();

  return useQuery({
    queryKey: ['base-token-rate', tokenType, turboNetwork.PAYMENT_URL],
    queryFn: async () => {
      if (!tokenType) {
        return null;
      }

      const turbo = TurboFactory.unauthenticated({
        token: tokenType,
        paymentServiceConfig: {
          url: turboNetwork.PAYMENT_URL,
        },
      });

      // Get rate for 1 unit of the token
      const amount = tokenType === 'base-usdc' ? 1 : 1; // 1 USDC or 1 ETH
      let tokenAmount: string;
      if (tokenType === 'base-usdc') {
        tokenAmount = (amount * 1e6).toString();
      } else {
        tokenAmount = ETHToTokenAmount(amount).toString();
      }

      const { winc } = await turbo.getWincForToken({ tokenAmount });

      // Convert winc to credits (1 credit = 1e12 winc)
      const creditsPerToken = Number(winc) / 1e12;

      return {
        tokenType,
        wincPerToken: winc,
        creditsPerToken,
        displayRate: `1 ${BASE_TOKEN_CONFIG[tokenType].symbol} ≈ ${creditsPerToken.toFixed(4)} Credits`,
      };
    },
    staleTime: 60_000, // 1 minute
    enabled: !!tokenType,
    retry: 2,
  });
}
