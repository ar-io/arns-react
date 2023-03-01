import { ArweaveTransactionID, SmartweaveDataProvider } from '../../types';
import { ANTContract } from './AntContract';

export class ANTInteractionProvider implements ANTInteractionProvider {
  private _provider: SmartweaveDataProvider;
  contract: ANTContract;
  antId: ArweaveTransactionID;

  constructor(contract: ANTContract, provider: SmartweaveDataProvider) {
    if (!contract.id) {
      throw Error(
        'Not allowed to use ANTInteractionProvider without a valid ANT ID.',
      );
    }
    this.contract = contract;
    this.antId = contract.id;
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
      const txId = await this._provider.writeTransaction(this.antId, payload);
      if (!txId) {
        throw new Error(`Failed to transfer ANT token`);
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
      const txId = await this._provider.writeTransaction(this.antId, payload);
      if (!txId) {
        throw new Error('Failed to add controller to contract');
      }
      return txId;
    } catch (error) {
      console.error(error);
      return;
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
      const txId = await this._provider.writeTransaction(this.antId, payload);
      if (!txId) {
        throw new Error('Failed to write target ID to contract');
      }
      return txId;
    } catch (error) {
      console.error(error);
      return;
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
        ttlSeconds: ttl
          ? ttl
          : this.contract.state.records[name].ttlSeconds
          ? this.contract.state.records[name].ttlSeconds
          : 1800,
        maxSubdomains: maxSubdomains
          ? maxSubdomains
          : this.contract.state.records[name].maxSubdomains
          ? this.contract.state.records[name].maxSubdomains
          : 100,
      };
      const txId = await this._provider.writeTransaction(this.antId, payload);
      if (!txId) {
        throw new Error('Failed to write undername change to ANT');
      }
      return txId;
    } catch (error) {
      console.error(error);
      return;
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
      const txId = await this._provider.writeTransaction(this.antId, payload);
      if (!txId) {
        throw new Error('Failed to remove undername from contract');
      }
      return txId;
    } catch (error) {
      console.error(error);
      return;
    }
  }
}
