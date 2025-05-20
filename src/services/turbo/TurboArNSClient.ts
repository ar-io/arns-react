import {
  ARIO_MAINNET_PROCESS_ID,
  ARIO_TESTNET_PROCESS_ID,
  AoClient,
  AoMessageResult,
  ContractSigner,
  Intent,
  MessageResult,
} from '@ar.io/sdk/web';
import {
  ARToTokenAmount,
  CurrencyMap,
  ETHToTokenAmount,
  TokenType,
  TurboFactory,
  TurboWincForFiatResponse,
  TwoDecimalCurrency,
} from '@ardrive/turbo-sdk';
import { connect } from '@permaweb/aoconnect';
import {
  isArweaveTransactionID,
  isEthAddress,
  lowerCaseDomain,
  sleep,
} from '@src/utils';
import { NETWORK_DEFAULTS, devPaymentServiceFqdn } from '@src/utils/constants';
import { PaymentIntent, Stripe } from '@stripe/stripe-js';

export type PaymentInformation = {
  paymentMethodId: string;
  email?: string;
};

export type TurboArNSIntent = Omit<Intent, 'Primary-Name-Request'>;

export interface TurboArNSClientConfig {
  uploadUrl?: string;
  paymentUrl?: string;
  gatewayUrl?: string;
  walletsUrl?: string;
  signer?: ContractSigner;
  walletAddress?: string;
  stripe: Stripe;
  ao: AoClient;
}

export type TurboArNSInteractionParams = {
  name: string;
  type?: 'lease' | 'permabuy';
  years?: number;
  intent: TurboArNSIntent;
  increaseQty?: number;
  processId?: string;
};

export type TurboArNSPaymentIntentResponse<
  GenericQuoteParams extends TurboArNSInteractionParams | unknown,
> = {
  purchaseQuote: {
    intent: TurboArNSIntent;
    nonce: string;
    usdArRate: string;
    usdArioRate: string;
    mARIOQty: number;
    wincQty: string;
    owner: string;
    quoteCreationDate: string;
    quoteExpirationDate: string;
    paymentAmount: number;
    quotedPaymentAmount: number;
    currencyType: CurrencyMap['type'];
    paymentProvider: 'stripe';
    excessWincAmount: number;
  } & GenericQuoteParams;
  paymentSession: PaymentIntent;
  adjustments: Array<any>;
  fees: Array<any>;
};

export type TurboArNSIntentPriceResponse = {
  mARIO: string;
  winc: string;
  fiatEstimate: {
    paymentAmount: number;
    quotedPaymentAmount: string;
    adjustments: Array<any>;
    fees: Array<any>;
  };
};

export type TurboArNSIntentStatusResponse<
  GenericIntentParams extends TurboArNSInteractionParams | unknown,
> = {
  status: 'pending' | 'success' | 'failed';
  intent: TurboArNSIntent;
  nonce: string;
  createdData: string;
  paymentAmount: number;
  currencyType: CurrencyMap['type'];
  paymentProvider: 'stripe';
  quoteCreationDate: string;
  quoteExpirationDate: string;
  quotedPaymentAmount: number;
  usdArRate: string;
  useArioRate: string;
  wincQty: string;
  mARIOQty: number;
  owner: string;
  messageId?: string;
} & GenericIntentParams;

export type TurboArNSIntentPriceParams = {
  address?: string;
  name: string;
  intent: TurboArNSIntent;
  increaseQty?: number;
  type?: 'lease' | 'permabuy';
  years?: number;
  currency?: CurrencyMap['type'];
  promoCode?: string;
};

export class TurboArNSClient {
  public readonly turboUploader;
  public readonly uploadUrl;
  public readonly paymentUrl;
  public readonly gatewayUrl;
  public readonly walletsUrl;
  private signer;
  public readonly walletAddress;
  public readonly stripe;

  public readonly ao;
  public readonly arioProcessId: string;
  constructor({
    uploadUrl = NETWORK_DEFAULTS.TURBO.UPLOAD_URL,
    paymentUrl = NETWORK_DEFAULTS.TURBO.PAYMENT_URL,
    gatewayUrl = NETWORK_DEFAULTS.TURBO.GATEWAY_URL,
    walletsUrl = NETWORK_DEFAULTS.TURBO.WALLETS_URL,
    signer,
    walletAddress,
    stripe,
    ao = connect(NETWORK_DEFAULTS.AO.ARIO),
  }: TurboArNSClientConfig) {
    this.uploadUrl = uploadUrl;
    this.paymentUrl = paymentUrl;
    this.gatewayUrl = gatewayUrl;
    this.walletsUrl = walletsUrl;
    this.signer = signer;
    this.walletAddress = walletAddress;
    this.stripe = stripe;
    this.ao = ao;
    this.turboUploader = TurboFactory.unauthenticated({
      paymentServiceConfig: {
        url: this.paymentUrl,
      },
      uploadServiceConfig: {
        url: this.uploadUrl,
      },
      gatewayUrl: this.gatewayUrl,
      token: isArweaveTransactionID(this.walletAddress)
        ? 'arweave'
        : isEthAddress(this.walletAddress ?? '')
        ? 'ethereum'
        : undefined,
    });
    this.arioProcessId =
      this.paymentUrl === devPaymentServiceFqdn
        ? ARIO_TESTNET_PROCESS_ID
        : ARIO_MAINNET_PROCESS_ID;
  }

  // TODO: add to turbo-sdk
  public async getTopupPaymentIntent({
    address,
    amount,
    token,
    promoCode,
  }: {
    address: string;
    amount: number;
    token: TokenType;
    promoCode?: string;
  }): Promise<{
    topUpQuote: { quotedPaymentAmount: number };
    paymentSession: PaymentIntent;
  }> {
    const url = `${this.paymentUrl}/v1/top-up/payment-intent/${address}/usd/${amount}`;

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
    return res.json();
  }

  public async getArNSPaymentIntent({
    address,
    name,
    intent,
    increaseQty,
    type,
    years,
    processId,
    promoCode,
    currency = 'usd',
  }: {
    address?: string;
    name: string;
    intent: TurboArNSIntent;
    increaseQty?: number;
    type?: 'lease' | 'permabuy';
    years?: number;
    processId?: string;
    promoCode?: string;
    currency?: CurrencyMap['type'];
  }): Promise<TurboArNSPaymentIntentResponse<TurboArNSInteractionParams>> {
    const queryStringValues = Object.fromEntries(
      Object.entries({
        increaseQty,
        type,
        years,
        currency,
        promoCode,
        processId,
      })
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, value!.toString()]),
    );
    const url = `${
      this.paymentUrl
    }/v1/arns/quote/payment-intent/${address}/${currency}/${intent}/${lowerCaseDomain(
      name,
    )}?${new URLSearchParams(queryStringValues).toString()}`;

    const res = await fetch(url, {
      method: 'GET',
    });

    if (res.status !== 200) {
      console.error(res);
      throw new Error(`Error getting payment intent: ${res.statusText}`);
    }
    return res.json();
  }

  public async getPriceForArNSIntent({
    address,
    name,
    intent,
    increaseQty,
    type,
    years,
    currency = 'usd',
    promoCode,
  }: TurboArNSIntentPriceParams): Promise<TurboArNSIntentPriceResponse> {
    const queryStringValues = Object.fromEntries(
      Object.entries({
        increaseQty,
        type,
        years,
        currency,
        promoCode,
        userAddress: address,
      })
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, value!.toString()]),
    );
    const url = `${this.paymentUrl}/v1/arns/price/${intent}/${lowerCaseDomain(
      name,
    )}?${new URLSearchParams(queryStringValues).toString()}`;

    const res = await fetch(url, {
      method: 'GET',
    });

    if (res.status !== 200) {
      console.error(res);
      throw new Error(`Error getting ArNS intent price: ${res.statusText}`);
    }
    return res.json();
  }

  public async getIntentStatus(
    nonce: string,
  ): Promise<TurboArNSIntentStatusResponse<TurboArNSInteractionParams>> {
    const url = `${this.paymentUrl}/v1/arns/purchase/${nonce}`;
    const res = await fetch(url, {
      method: 'GET',
    });
    return res.json();
  }

  public async executeArNSIntent({
    paymentMethodId,
    email,
    ...intentParams
  }: TurboArNSIntentPriceParams & {
    processId?: string;
    paymentMethodId: string;
    email?: string;
    address: string;
  }): Promise<AoMessageResult<MessageResult>> {
    const intent = await this.getArNSPaymentIntent(intentParams);
    if (!intent.paymentSession.client_secret) {
      throw new Error('No client secret found on payment intent');
    }
    const result = await this.stripe.confirmCardPayment(
      intent.paymentSession.client_secret,
      {
        payment_method: paymentMethodId,
        receipt_email: email,
      },
    );
    if (result.error) {
      throw new Error(result.error.message);
    }

    const maxTries = 10;
    let tries = 0;
    let isComplete = false;
    let messageId: string | undefined;
    while (!isComplete && tries <= maxTries) {
      const res = await this.getIntentStatus(intent.purchaseQuote.nonce);
      switch (res.status) {
        case 'success':
          isComplete = true;

          messageId = res.messageId;

          break;
        case 'failed':
          throw new Error('Turbo ArNS Interaction failed on payment service.');
        case 'pending':
          if (tries >= maxTries) {
            throw new Error(
              'Turbo ArNS Interaction exceeded max tries on payment service.',
            );
          }
          await sleep(1000 * tries);

          tries++;
          break;
        default:
          throw new Error('Unknown status from payment service.');
      }
    }
    if (!messageId) {
      throw new Error('No message ID found on payment service.');
    }
    const messageResult = await this.ao.result({
      process: this.arioProcessId,
      message: messageId,
    });
    return {
      id: messageId,
      result: messageResult,
    };
  }

  public async getWincForToken(
    amount: number,
    tokenType: TokenType = 'arweave',
  ) {
    const turbo = TurboFactory.unauthenticated({
      paymentServiceConfig: {
        url: this.paymentUrl,
      },
      uploadServiceConfig: {
        url: this.uploadUrl,
      },
      token: tokenType,
    });

    return turbo.getWincForToken({ tokenAmount: amount });
  }

  public async getWincForFiat({
    amount,
    promoCode,
    destinationAddress,
  }: {
    amount: TwoDecimalCurrency;
    promoCode?: string;
    destinationAddress?: string;
  }): Promise<TurboWincForFiatResponse> {
    const url = `${this.paymentUrl}/v1/price/usd/${amount.amount}`;
    const queryString =
      promoCode && destinationAddress
        ? `?${new URLSearchParams({
            promoCode,
            destinationAddress,
          }).toString()}`
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
  }

  public getAmountByTokenType(amount: number, tokenType: TokenType) {
    switch (tokenType) {
      case 'arweave':
        return ARToTokenAmount(amount);
      case 'ethereum':
        return ETHToTokenAmount(amount);
      default:
        return undefined;
    }
  }

  public wincToCredits(winc: number) {
    return winc / 1_000_000_000_000;
  }
}
