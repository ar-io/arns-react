import { WarpFactory, defaultCacheOptions } from 'warp-contracts';

import {
  ArweaveTransactionId,
  ArweaveTransactionProvider,
  ArweaveWalletConnector,
  SmartweaveContractSource,
} from '../../types';

export class WarpContractProvider implements ArweaveTransactionProvider {
  wallet: ArweaveWalletConnector;
  contractId: ArweaveTransactionId;
  warp: any;
  contract: any;
  constructor(
    arweaveWallet: ArweaveWalletConnector,
    contractId: ArweaveTransactionId,
  ) {
    // wallet to connect to contract, contractId for contract to connect to
    /**
     * example use: const antContract = new WarpTransactionProvider(wallet,id)
     * const antState = antContract.getState()
     */
    this.wallet = arweaveWallet;
    this.contractId = contractId;
    this.warp = WarpFactory.forMainnet(
      {
        ...defaultCacheOptions,
        inMemory: true,
      },
      true,
    );
    this.contract = this.warp.contract(this.contractId).connect(this.wallet);
  }
  createTransaction(): Promise<string> {}
  verifyTransaction(): Promise<boolean> {}
  async getState() {
    const { cachedValue } = await this.contract.readState();

    return cachedValue;
  }
}
