import {
  ArweaveTransactionID,
  SmartweaveContractInteractionProvider,
} from '../../types';
import { PDNTContract } from './PDNTContract';

export class PDNTInteractionProvider implements PDNTInteractionProvider {
  private _provider: SmartweaveContractInteractionProvider;
  contract: PDNTContract;
  pdntId: ArweaveTransactionID;

  constructor(
    contract: PDNTContract,
    provider: SmartweaveContractInteractionProvider,
  ) {
    if (!contract.id) {
      throw Error(
        'Not allowed to use PDNTInteractionProvider without a valid PDNT ID.',
      );
    }
    this.contract = contract;
    this.pdntId = contract.id;
    this._provider = provider;
  }

  async setOwner(id: ArweaveTransactionID) {
    try {
      if (!id) {
        throw new Error(`type of id <${id}> is not a  valid id.`);
      }

      const payload = {
        function: 'transfer',
        target: id.toString(),
      };
      const txId = await this._provider.writeTransaction(this.pdntId, payload);
      if (!txId) {
        throw new Error(`Failed to transfer PDNT token`);
      }
      return txId;
    } catch (error) {
      console.error(error);
      return;
    }
  }

  async setController(id: ArweaveTransactionID) {
    try {
      const payload = {
        function: 'setController',
        target: id.toString(),
      };
      const txId = await this._provider.writeTransaction(this.pdntId, payload);
      if (!txId) {
        throw new Error('Failed to add controller to contract');
      }
      return txId;
    } catch (error) {
      console.debug(error);
      throw error;
    }
  }
  async setTargetId(id: ArweaveTransactionID) {
    try {
      if (!id) {
        throw new Error(`type of id <${id}> is not a valid id.`);
      }

      const payload = {
        function: 'setRecord',
        transactionId: id.toString(),
        subDomain: '@',
      };
      const txId = await this._provider.writeTransaction(this.pdntId, payload);
      if (!txId) {
        throw new Error('Failed to write target ID to contract');
      }
      return txId;
    } catch (error) {
      console.debug(error);
      throw error;
    }
  }

  async setUndername({
    // allows user to set an undername with just default values, or edited values
    name,
    targetId,
    maxSubdomains,
    ttl,
  }: {
    name: string;
    targetId: ArweaveTransactionID | string;
    maxSubdomains?: number;
    ttl?: number;
  }) {
    try {
      if (!targetId) {
        throw new Error(`type of id <${typeof targetId}> is not a valid id.`);
      }

      const payload = {
        function: 'setRecord',
        subDomain: name,
        target: targetId.toString(),
        ttlSeconds: ttl ? ttl : this.contract.getRecord(name).ttlSeconds,
        maxSubdomains: maxSubdomains
          ? maxSubdomains
          : this.contract.getRecord(name).maxUndernames,
      };
      const txId = await this._provider.writeTransaction(this.pdntId, payload);
      if (!txId) {
        throw new Error('Failed to write undername change to PDNT');
      }
      return txId;
    } catch (error) {
      console.debug(error);
      throw error;
    }
  }

  async removeUndername(name: string) {
    try {
      if (!name) {
        throw new Error(`type of id <${name}> is not a valid id.`);
      }

      const payload = {
        function: 'setRecord',
        subDomain: name,
      };
      const txId = await this._provider.writeTransaction(this.pdntId, payload);
      if (!txId) {
        throw new Error('Failed to remove undername from contract');
      }
      return txId;
    } catch (error) {
      console.debug(error);
      throw error;
    }
  }
}
