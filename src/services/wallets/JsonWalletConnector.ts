import { isJWK } from '@src/utils';
import Arweave from 'arweave';
import { ApiConfig } from 'arweave/node/lib/api';
import { JWKInterface } from 'arweave/node/lib/wallet';
import { isString } from 'lodash';
import { CustomSignature, Transaction } from 'warp-contracts';

import { ArweaveWalletConnector } from '../../types';
import { ArweaveTransactionID } from '../arweave/ArweaveTransactionID';

// This class is currently ONLY used in tests but satisfies the ArweaveWalletConnector interface. If used in production, much security work needs to be done.
export class JsonWalletConnector implements ArweaveWalletConnector {
  private _walletFile;
  private _wallet?: JWKInterface;
  arweave: Arweave;
  signer: CustomSignature;

  constructor(file: File | JWKInterface, arweave: Arweave) {
    this.arweave = arweave;
    this._walletFile = file;
    this.signer = {
      signer: async (transaction: Transaction) => {
        this.arweave.transactions.sign(transaction, this._wallet!);
      },
      type: 'arweave',
    };
  }

  async connect(): Promise<void> {
    if (isJWK(this._walletFile) && this._walletFile instanceof File) {
      this._wallet = this._walletFile;
      this.signer.signer.bind(this);
      return;
    }
    if (
      (this._walletFile instanceof File &&
        this._walletFile.type !== 'application/json') ||
      !(this._walletFile instanceof File)
    ) {
      throw Error('Invalid wallet file, must be a json file');
    }
    const jsonWallet: JWKInterface = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (!e.target?.result) {
          throw Error('Cannot read keyfile');
        }
        const str = e.target.result;
        if (!isString(str)) {
          return;
        }
        const json = JSON.parse(str);
        // resolve when it's done
        resolve(json);
      };
      // start the read
      reader.readAsText(this._walletFile as File);
    });

    if (!jsonWallet) {
      throw Error('Failed to load JSON wallet.');
    }
    // TODO: we need encryption
    this._wallet = jsonWallet;
    this.signer.signer.bind(this);
  }

  async disconnect(): Promise<void> {
    this._wallet = undefined;
    this.signer.signer.bind(this);
  }

  async getWalletAddress(): Promise<ArweaveTransactionID> {
    const address = await this.arweave.wallets.jwkToAddress(
      this._walletFile as JWKInterface,
    );
    return new ArweaveTransactionID(address);
  }
  async getGatewayConfig(): Promise<ApiConfig> {
    return this.arweave.getConfig() as ApiConfig;
  }
}
