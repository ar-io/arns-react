import { ContractSigner } from '@ar.io/sdk/web';
import { TurboFactory } from '@ardrive/turbo-sdk';
import { isArweaveTransactionID, isEthAddress } from '@src/utils';
import { NETWORK_DEFAULTS } from '@src/utils/constants';

export interface TurboArNSClientConfig {
  uploadUrl?: string;
  paymentUrl?: string;
  gatewayUrl?: string;
  signer: ContractSigner;
  walletAddress: string;
}

export class TurboArNSClient {
  public readonly turboUploader;
  public readonly uploadUrl;
  public readonly paymentUrl;
  public readonly gatewayUrl;
  private signer;
  public readonly walletAddress;
  constructor({
    uploadUrl = NETWORK_DEFAULTS.TURBO.UPLOAD_URL,
    paymentUrl = NETWORK_DEFAULTS.TURBO.PAYMENT_URL,
    gatewayUrl = NETWORK_DEFAULTS.TURBO.GATEWAY_URL,
    signer,
    walletAddress,
  }: TurboArNSClientConfig) {
    this.uploadUrl = uploadUrl;
    this.paymentUrl = paymentUrl;
    this.gatewayUrl = gatewayUrl;
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
}
