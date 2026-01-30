import { ArweaveSigner, TurboArNSSigner } from '@ar.io/sdk/web';
import { TokenType } from '@ardrive/turbo-sdk';
import Arweave from 'arweave';
import { JWKInterface } from 'arweave/node/lib/wallet';

import { ArNSWalletConnector, WALLET_TYPES } from '../../types';
import { ArweaveTransactionID } from '../arweave/ArweaveTransactionID';

const arweave = Arweave.init({});

export class JsonWalletConnector implements ArNSWalletConnector {
  tokenType: TokenType = 'arweave';
  private _jwk: JWKInterface;
  private _address: string | null = null;
  contractSigner: ArweaveSigner;
  turboSigner: TurboArNSSigner;

  constructor(jwk: JWKInterface) {
    this._jwk = jwk;
    this.contractSigner = new ArweaveSigner(jwk);
    this.turboSigner = jwk as unknown as TurboArNSSigner;
  }

  async connect(): Promise<void> {
    try {
      this._address = await arweave.wallets.jwkToAddress(this._jwk);
      localStorage.setItem('walletType', WALLET_TYPES.JSON);
    } catch {
      localStorage.removeItem('walletType');
      throw new Error('Failed to connect JSON wallet');
    }
  }

  async disconnect(): Promise<void> {
    localStorage.removeItem('walletType');
    this._address = null;
  }

  async getWalletAddress(): Promise<ArweaveTransactionID> {
    if (!this._address) {
      this._address = await arweave.wallets.jwkToAddress(this._jwk);
    }
    return new ArweaveTransactionID(this._address);
  }
}
