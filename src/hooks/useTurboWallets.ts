import { TokenType } from '@ardrive/turbo-sdk/web';
import { NETWORK_DEFAULTS } from '@src/utils/constants';
import { useQuery } from '@tanstack/react-query';

export type TurboWallets = Record<TokenType, string>;

const useTurboWallets = () => {
  const res = useQuery({
    queryKey: ['turboWallets'],
    queryFn: () => {
      return fetch(NETWORK_DEFAULTS.TURBO.WALLETS_URL).then((res) => {
        return res.json().then((info) => {
          return info?.addresses as TurboWallets;
        });
      });
    },
  });

  return res;
};

export default useTurboWallets;
