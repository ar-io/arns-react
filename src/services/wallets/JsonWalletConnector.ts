import { JWKInterface } from 'arweave/node/lib/wallet';
import { isString } from 'lodash';

import { ArweaveWalletConnector } from '../../types';

export class JsonWalletConnector implements ArweaveWalletConnector {
  private _walletFile;
  constructor(file: any) {
    this._walletFile = file;
  }

  async connect(): Promise<JWKInterface> {
    try {
      if (this._walletFile.type !== 'application/json') {
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
        reader.readAsText(this._walletFile);
      });

      if (!jsonWallet) {
        throw Error('Failed to load JSON wallet.');
      }
      return jsonWallet;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getWalletAddress(): Promise<string> {
    // TODO
    throw Error('Not implemented.');
  }
}
