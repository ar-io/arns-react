import {
  ArweaveDataProvider,
  ArweaveTransactionID,
  SmartweaveDataProvider,
} from '../../types';
import { ANTContract } from './AntContract';

export class ANTInteractionProvider implements ANTInteractionProvider {
  private _provider: SmartweaveDataProvider & ArweaveDataProvider;
  contract?: ANTContract;
  antId?: string;

  constructor(
    contract: ANTContract,
    provider: SmartweaveDataProvider & ArweaveDataProvider,
  ) {
    (this.contract = contract), (this.antId = contract.antId);
    this._provider = provider;
  }

  async setOwner(id: ArweaveTransactionID) {
    try {
      if (!this.antId) {
        throw new Error(
          `Cannot set state items when id is not loaded. Current id: ${this.antId}`,
        );
      }
      if (!id) {
        throw new Error(`type of id <${id}> is not a  valid id.`);
      }

      const payload = {
        function: 'transfer',
        target: id.toString(),
      };
      const txId = await this._provider.writeTransaction(
        new ArweaveTransactionID(this.antId),
        payload,
      );
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
      if (typeof this.antId !== 'string') {
        throw new Error('No Contract id Defined');
      }

      const payload = {
        function: 'setController',
        target: id.toString(),
      };
      const txId = await this._provider.writeTransaction(
        new ArweaveTransactionID(this.antId),
        payload,
      );
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
      if (typeof this.antId !== 'string') {
        throw new Error('No Contract id Defined');
      }
      if (!id) {
        throw new Error(`type of id <${id}> is not a valid id.`);
      }

      const payload = {
        function: 'setRecord',
        transactionId: id.toString(),
        subDomain: '@',
      };
      const txId = await this._provider.writeTransaction(
        new ArweaveTransactionID(this.antId),
        payload,
      );
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
      if (typeof this.antId !== 'string') {
        throw new Error('No Contract id Defined');
      }
      if (!this.contract) {
        throw new Error('No Contract is Defined');
      }
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
      const txId = await this._provider.writeTransaction(
        new ArweaveTransactionID(this.antId),
        payload,
      );
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
      if (typeof this.antId !== 'string') {
        throw new Error('No Contract id Defined');
      }
      if (!name) {
        throw new Error(`type of id <${name}> is not a valid id.`);
      }

      const payload = {
        function: 'setRecord',
        subDomain: name,
      };
      const txId = await this._provider.writeTransaction(
        new ArweaveTransactionID(this.antId),
        payload,
      );
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
