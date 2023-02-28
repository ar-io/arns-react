import {
  ANTContractState,
  ArweaveDataProvider,
  ArweaveTransactionID,
  SmartweaveDataProvider,
} from '../../types';

export const DEFAULT_ANT_CONTRACT_STATE: ANTContractState = {
  balances: {},
  evolve: undefined,
  name: '',
  ticker: '',
  owner: '',
  controllers: [],
  records: {
    '@': {
      transactionId: '',
      ttlSeconds: 1800,
      maxSubdomains: 100,
    },
  },
};

export class CompositeAntContractState {
  private _provider: SmartweaveDataProvider & ArweaveDataProvider;
  contract?: AntContractState;
  antId?: string;

  constructor(
    contract: AntContractState,
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
      const txid = await this._provider.writeTransaction(
        new ArweaveTransactionID(this.antId),
        payload,
      );
      if (!txid) {
        throw new Error(`Failed to transfer ANT token`);
      }
      return txid;
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
      const txid = await this._provider.writeTransaction(
        new ArweaveTransactionID(this.antId),
        payload,
      );
      if (!txid) {
        throw new Error('Failed to add controller to contract');
      }
      return txid;
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
      const txid = await this._provider.writeTransaction(
        new ArweaveTransactionID(this.antId),
        payload,
      );
      if (!txid) {
        throw new Error('Failed to write target ID to contract');
      }
      return txid;
    } catch (error) {
      console.error(error);
      return;
    }
  }
  /**
   *
   * @param name - undername to update
   * @param targetId - target of the new or edited undername
   * @param maxSubdomains - tier based. Uses prexisting count if exists, else uses supplied.
   * @returns
   */
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
      const txid = await this._provider.writeTransaction(
        new ArweaveTransactionID(this.antId),
        payload,
      );
      if (!txid) {
        throw new Error('Failed to write undername change to ANT');
      }
      return txid;
    } catch (error) {
      console.error(error);
      return;
    }
  }
  /** removeUndername
   * @param name {string} name - undername to remove from ANT state
   * @returns void - Function alters instance state and returns void.
   */
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
      const txid = await this._provider.writeTransaction(
        new ArweaveTransactionID(this.antId),
        payload,
      );
      if (!txid) {
        throw new Error('Failed to remove undername from contract');
      }
      return txid;
    } catch (error) {
      console.error(error);
      return;
    }
  }
}

export class AntContractState {
  id?: ArweaveTransactionID;
  contract: ANTContractState;
  // todo: add last updated - lastUpdated: Map<keyof AntContract, number> = new Map();

  constructor(state?: ANTContractState, id?: ArweaveTransactionID) {
    this.id = id;
    if (state) {
      this.contract = state;
    } else {
      this.contract = DEFAULT_ANT_CONTRACT_STATE;
    }
  }
  get owner() {
    return this.contract.owner;
  }
  set owner(id: string) {
    this.contract.owner = id;
  }
  get name() {
    return this.contract.name;
  }
  set name(name: string) {
    this.contract.name = name;
  }
  get ticker() {
    return this.contract.ticker;
  }
  set ticker(ticker: string) {
    this.contract.ticker = ticker;
  }
  get balances() {
    return this.contract.balances;
  }
  set balances(balances: { [x: string]: number }) {
    this.contract.balances = balances;
  }
  get controllers() {
    return this.contract.controllers;
  }
  set controllers(controllers: string[]) {
    // any validations we want to do on the controller
    this.contract.controllers = controllers;
  }
  get evolve() {
    return this.contract.evolve;
  }
  set evolve(evolve: boolean | undefined) {
    this.contract.evolve = evolve;
  }
  get state() {
    return this.contract;
  }
  get antId(): string | undefined {
    return this.antId?.toString();
  }
}
