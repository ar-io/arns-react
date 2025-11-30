import { TokenType } from '@ardrive/turbo-sdk';
import { useQuery } from '@tanstack/react-query';

// CoinGecko IDs for supported tokens
const COINGECKO_IDS: Partial<Record<TokenType, string>> = {
  arweave: 'arweave',
  ario: 'ar-io-network',
  ethereum: 'ethereum',
  'base-eth': 'ethereum', // Base ETH is still ETH
  pol: 'polygon-ecosystem-token',
  usdc: 'usd-coin',
  'base-usdc': 'usd-coin',
  'polygon-usdc': 'usd-coin',
};

interface CoinGeckoResponse {
  [key: string]: {
    usd: number;
  };
}

/**
 * Hook to get USD price for a crypto token
 */
export function useCryptoPrice(tokenType: TokenType | undefined) {
  const coinGeckoId = tokenType ? COINGECKO_IDS[tokenType] : undefined;

  return useQuery({
    queryKey: ['crypto-price-usd', coinGeckoId],
    queryFn: async (): Promise<number | null> => {
      if (!coinGeckoId) return null;

      // USDC is always ~$1
      if (
        tokenType === 'usdc' ||
        tokenType === 'base-usdc' ||
        tokenType === 'polygon-usdc'
      ) {
        return 1;
      }

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoId}&vs_currencies=usd`,
      );

      if (!response.ok) {
        console.error(`CoinGecko API error: ${response.status}`);
        return null;
      }

      const data: CoinGeckoResponse = await response.json();
      const price = data[coinGeckoId]?.usd;

      if (typeof price !== 'number') {
        return null;
      }

      return price;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!coinGeckoId,
    retry: 1,
  });
}
