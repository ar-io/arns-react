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
  ARIOToTokenAmount,
  ARToTokenAmount,
  CurrencyMap,
  ETHToTokenAmount,
  POLToTokenAmount,
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
  // `signer` and `ao` are vestigial after the de-AO refactor — the Stripe-
  // funded ArNS purchase flow (`executeArNSIntent`) is currently AO-coupled
  // and gated behind a tooltip in the UI. Phase 9 keeps the field for
  // back-compat; Solana support requires the Turbo payment service update.
  signer?: ContractSigner;
  walletAddress?: string;
  stripe: Stripe;
  ao?: AoClient;
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

  /**
   * Stripe-funded direct ArNS purchase ("buy a name with a credit card").
   *
   * **Currently disabled on the Solana-only build.**
   *
   * The Turbo payment service still settles ArNS purchases by emitting an
   * AO message (`Buy-Name`/`Extend-Lease`/`Increase-Undername-Limit`) on
   * the AO ARIO process. Until the service learns to relay those intents
   * to the Solana ARIO programs, this flow can't complete on Solana — the
   * payment would clear but no on-chain mutation would happen, leaving
   * the user with neither funds nor a name.
   *
   * The UI gates this behind a tooltip on the credit-card payment option
   * (see `TransactionDetails`/`PaymentDetails`), and the dispatcher
   * (`dispatchArIOInteraction`) throws if `fundFrom === 'fiat'` is reached
   * on Solana. The class method is preserved as documentation + a hook
   * for re-enabling once the service ships Solana support.
   */
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
    // Suppress unused-destructure warnings.
    void paymentMethodId;
    void email;
    void intentParams;
    throw new Error(
      'Credit-card payments for ArNS purchases are temporarily unavailable on Solana. ' +
        'The Turbo payment service still settles via AO and needs Solana support before this flow can be re-enabled.',
    );
    /* Original AO-coupled implementation preserved for reference once the
     * Turbo payment service ships Solana support. Re-enable by deleting the
     * throw above and uncommenting:
     *
     * const intent = await this.getArNSPaymentIntent(intentParams);
     * if (!intent.paymentSession.client_secret) {
     *   throw new Error('No client secret found on payment intent');
     * }
     * const result = await this.stripe.confirmCardPayment(
     *   intent.paymentSession.client_secret,
     *   { payment_method: paymentMethodId, receipt_email: email },
     * );
     * if (result.error) throw new Error(result.error.message);
     *
     * // poll getIntentStatus until success/failed, then:
     * // const messageResult = await this.ao.result({ process: this.arioProcessId, message: messageId });
     * // return { id: messageId, result: messageResult };
     */
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

    if (response.status === 404) {
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
      case 'ario':
        return ARIOToTokenAmount(amount);
      case 'ethereum':
      case 'base-eth':
        return ETHToTokenAmount(amount);
      case 'pol':
        return POLToTokenAmount(amount);
      case 'usdc':
      case 'base-usdc':
      case 'polygon-usdc':
      case 'base-ario':
        // USDC and Base ARIO use 6 decimals
        return (amount * 1e6).toString();
      default:
        return undefined;
    }
  }

  public wincToCredits(winc: number) {
    return winc / 1_000_000_000_000;
  }
}
