import { ContractSigner } from '@ar.io/sdk/web';
import {
  ARToTokenAmount,
  ETHToTokenAmount,
  TokenType,
  TurboFactory,
} from '@ardrive/turbo-sdk';
import { isArweaveTransactionID, isEthAddress } from '@src/utils';
import { NETWORK_DEFAULTS } from '@src/utils/constants';
import { PaymentIntent } from '@stripe/stripe-js';

export interface TurboArNSClientConfig {
  uploadUrl?: string;
  paymentUrl?: string;
  gatewayUrl?: string;
  walletsUrl?: string;
  signer: ContractSigner;
  walletAddress: string;
}

export class TurboArNSClient {
  public readonly turboUploader;
  public readonly uploadUrl;
  public readonly paymentUrl;
  public readonly gatewayUrl;
  public readonly walletsUrl;
  private signer;
  public readonly walletAddress;
  constructor({
    uploadUrl = NETWORK_DEFAULTS.TURBO.UPLOAD_URL,
    paymentUrl = NETWORK_DEFAULTS.TURBO.PAYMENT_URL,
    gatewayUrl = NETWORK_DEFAULTS.TURBO.GATEWAY_URL,
    walletsUrl = NETWORK_DEFAULTS.TURBO.WALLETS_URL,
    signer,
    walletAddress,
  }: TurboArNSClientConfig) {
    this.uploadUrl = uploadUrl;
    this.paymentUrl = paymentUrl;
    this.gatewayUrl = gatewayUrl;
    this.walletsUrl = walletsUrl;
    this.signer = signer;
    this.walletAddress = walletAddress;

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
        : isEthAddress(this.walletAddress)
        ? 'ethereum'
        : undefined,
    });
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
