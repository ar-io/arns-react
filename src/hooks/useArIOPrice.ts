import { useQuery } from '@tanstack/react-query';

interface CoinGeckoResponse {
  'ar-io-network': {
    usd: number;
  };
}

export function useArIoPrice() {
  return useQuery({
    queryKey: ['ario-price-usd'],
    queryFn: async (): Promise<number> => {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ar-io-network&vs_currencies=usd',
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data: CoinGeckoResponse = await response.json();
      const price = data['ar-io-network']?.usd;

      if (typeof price !== 'number') {
        throw new Error('Invalid price data from CoinGecko');
      }

      return price;
    },
    staleTime: 1000 * 60 * 60 * 4, // 4 hours
  });
}
