import Arweave from 'arweave';
import Ar from 'arweave/node/ar';
import { JWKInterface } from 'arweave/node/lib/wallet';
import { isString } from 'lodash';

import { ArweaveWalletConnector } from '../../types';
import { deployedAntQuery } from '../../utils/constants';
import { arweave } from '../arweave/arweave';

// A lot to do here, r.e. security, we will likely move to a different approach.
export class JsonWalletConnector implements ArweaveWalletConnector {
  private _walletFile;
  private _wallet?: JWKInterface;
  private _arweave: Arweave;
  private _ar: Ar = new Ar();
  private _address?: string;

  constructor(file: any) {
    this._walletFile = file;
    this._arweave = arweave;
  }

  async connect(): Promise<void> {
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
      // TODO: we need encryption
      this._wallet = jsonWallet;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this._wallet = undefined;
    this._walletFile = undefined;
  }

  async getWalletAddress(): Promise<string> {
    throw Error('Not implemented!');
  }

  async getWalletBalanceAR(): Promise<string> {
    throw Error('Not implemented!');
  }
  async getWalletANTs(
    approvedSourceCodeTransactions: string[],
    cursor?: string,
  ): Promise<{ ids: string[]; cursor?: string }> {
    const address = await this.getWalletAddress();
    const fetchedANTids: Set<string> = new Set();
    let newCursor: string | undefined = undefined;

    // get contracts deployed by user, filtering with src-codes to only get ANT contracts
    const deployedResponse = await this._arweave.api.post(
      '/graphql',
      deployedAntQuery(address, approvedSourceCodeTransactions, cursor),
    );
    if (deployedResponse.data.data?.transactions?.edges?.length) {
      deployedResponse.data.data.transactions.edges
        .map((e: any) => ({
          id: e.node.id,
          cursor: e.cursor,
        }))
        .forEach((ant: { id: string; cursor: string }) => {
          fetchedANTids.add(ant.id);
          if (ant.cursor) {
            newCursor = ant.cursor;
          }
        });
    }
    return {
      ids: [...fetchedANTids],
      cursor: newCursor,
    };
  }
}
