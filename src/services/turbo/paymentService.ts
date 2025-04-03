import {
  ARToTokenAmount,
  ETHToTokenAmount,
  TokenType,
  TurboWincForFiatResponse,
  TwoDecimalCurrency,
} from '@ardrive/turbo-sdk/web';
import {
  PAYMENT_SERVICE_FQDN,
  STRIPE_PUBLISHABLE_KEY,
} from '@src/utils/constants';
import { PaymentIntent, loadStripe } from '@stripe/stripe-js';

export const STRIPE_PROMISE = loadStripe(STRIPE_PUBLISHABLE_KEY);
export const getPaymentIntent = async (
  address: string,
  amount: number,
  token: TokenType,
  promoCode?: string,
) => {
  const url = `https://${PAYMENT_SERVICE_FQDN}/v1/top-up/payment-intent/${address}/usd/${amount}`;

  const queryStringValues = {
    token,
    ...(promoCode && { promoCode }),
  };

  const queryString = `?${new URLSearchParams(queryStringValues).toString()}`;

  const res = await fetch(url.concat(queryString));

  if (res.status !== 200) {
    console.error(res);
    throw new Error('Error connecting to server. Please try again later.');
  }
  return res.json() as Promise<{
    topUpQuote: { quotedPaymentAmount: number };
    paymentSession: PaymentIntent;
  }>;
};

export const getWincForFiat = async ({
  amount,
  promoCode,
  destinationAddress,
}: {
  amount: TwoDecimalCurrency;
  promoCode?: string;
  destinationAddress?: string;
}): Promise<TurboWincForFiatResponse> => {
  const url = `https://${PAYMENT_SERVICE_FQDN}/v1/price/usd/${amount.amount}`;
  const queryString =
    promoCode && destinationAddress
      ? `?${new URLSearchParams({ promoCode, destinationAddress }).toString()}`
      : '';
  const response = await fetch(url.concat(queryString));

  if (response.status == 404) {
    return {
      winc: '0',
      adjustments: [],
      fees: [],
      actualPaymentAmount: 0,
      quotedPaymentAmount: 0,
    };
  }

  return response.json();
};

export const wincToCredits = (winc: number) => {
  return winc / 1_000_000_000_000;
};

export const getAmountByTokenType = (amount: number, token?: TokenType) => {
  switch (token) {
    case 'arweave':
      return ARToTokenAmount(amount);
    case 'ethereum':
      return ETHToTokenAmount(amount);
    default:
      return undefined;
  }
};

export const getExplorerUrl = (txid: string, token: string) => {
  switch (token) {
    case 'arweave':
      return `https://viewblock.io/arweave/tx/${txid}`;
    case 'ethereum':
      return `https://etherscan.io/tx/${txid}`;
    default:
      return undefined;
  }
};
