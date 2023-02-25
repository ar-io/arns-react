import {
  ANTContractState,
  ArweaveDataProvider,
  ArweaveTransactionID,
  SmartweaveDataProvider,
} from '../../types';

export class AntContractProvider {
  private _provider: SmartweaveDataProvider & ArweaveDataProvider;
  state?: ANTContractState = undefined;
  antId;
  walletAddress: ArweaveTransactionID;
  newAntState: ANTContractState;

  constructor(
    walletAddress: ArweaveTransactionID,
    provider: SmartweaveDataProvider & ArweaveDataProvider,
    antId?: ArweaveTransactionID,
  ) {
    this.walletAddress = walletAddress;
    this.antId = antId;
    this._provider = provider;
    this.newAntState = {
      balances: {
        [this.walletAddress.toString()]: 1,
      },
      evolve: undefined,
      name: '',
      ticker: '',
      owner: this.walletAddress.toString(),
      controllers: [this.walletAddress.toString()],
      records: {
        '@': {
          transactionId: '',
          ttlSeconds: 0,
          maxSubdomains: 100,
        },
      },
    };
    this.loadState(antId);
  }

  getCurrentState() {
    return this.state;
  }

  /**
   * loadState
   * @param contractId @type {ArweaveTransactionID | undefined} -
   * ANT contract id to load, if undefined default new ANT state is loaded.
   * @param overwrite @type {boolean | undefined} -
   * if true allows instance state to be overwritten with a new ANT contract state.
   * Does not affect the antId state of the instance. Usefull for cloning or bootstrapping a pre-existing ANT.
   * @returns void
   */
  async loadState(contractId?: ArweaveTransactionID, overwrite?: boolean) {
    try {
      if (this.state && !overwrite) {
        throw new Error(
          `Could not overwrite state: Enable overwrite to load a new state while a current state is loaded.
                     Current ANT:  ${{
                       id: this.antId?.toString(),
                       name: this.state.name,
                     }}`,
        );
      }

      if (!contractId) {
        this.state = this.newAntState;
        return;
      }
      const state: ANTContractState = await this._provider.getContractState(
        contractId,
      );
      if (!state) {
        throw Error(`Could not fetch state for ${contractId.toString()}`);
      }
      return (this.state = state);
    } catch (error) {
      console.error(error);
      if (!this.state) {
        console.log(
          'unable to load provided antId: loading default new ANT state.',
        );
        this.state = this.newAntState;
      }

      return;
    }
  }

  async setOwner(id: ArweaveTransactionID, update?: boolean) {
    try {
      if (!this.state) {
        throw new Error(
          `Cannot set state items when state is not loaded. Current state: ${this.state}`,
        );
      }
      if (!id) {
        throw new Error(`type of id <${id}> is not a  valid id.`);
      }
      this.state.owner = id.toString();
      this.state.balances = { ...this.state.balances, [id.toString()]: 1 };
      if (update === true && this.antId) {
        const payload = {
          function: 'transfer',
          target: id.toString(),
        };
        const txid = await this._provider.writeTransaction(this.antId, payload);
        if (!txid) {
          throw new Error(`Failed to transfer ANT token`);
        }
        return txid;
      }
      return;
    } catch (error) {
      console.error(error);
      return;
    }
  }

  async setController(id: ArweaveTransactionID, update?: boolean) {
    try {
      if (!this.state) {
        throw new Error(
          `Cannot set state items when state is not loaded. Current state: ${this.state}`,
        );
      }
      if (!id) {
        throw new Error(`type of id <${id}> is not a valid id.`);
      }
      this.state.controllers = [...this.state.controllers, id.toString()];
      if (update === true && this.antId) {
        const payload = {
          function: 'setController',
          target: id.toString(),
        };
        const txid = await this._provider.writeTransaction(this.antId, payload);
        if (!txid) {
          throw new Error('Failed to add controller to contract');
        }
        return txid;
      }
      return;
    } catch (error) {
      console.error(error);
      return;
    }
  }
  async setTargetId(id: ArweaveTransactionID, update?: boolean) {
    try {
      if (!this.state) {
        throw new Error(
          `Cannot set state items when state is not loaded. Current state: ${this.state}`,
        );
      }
      if (!id) {
        throw new Error(`type of id <${id}> is not a valid id.`);
      }
      this.state.records['@'].transactionId = id.toString();
      if (update === true && this.antId) {
        const payload = {
          function: 'setRecord',
          transactionId: id.toString(),
          subDomain: '@',
        };
        const txid = await this._provider.writeTransaction(this.antId, payload);
        if (!txid) {
          throw new Error('Failed to write target ID to contract');
        }
        return txid;
      }
      return;
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
    update,
  }: {
    name: string;
    targetId: ArweaveTransactionID | string;
    maxSubdomains?: number;
    ttl?: number;
    update?: boolean;
  }) {
    try {
      if (!this.state) {
        throw new Error(
          `Cannot set state items when state is not loaded. Current state: ${this.state}`,
        );
      }
      if (!targetId) {
        throw new Error(`type of id <${typeof targetId}> is not a valid id.`);
      }
      this.state.records = {
        ...this.state.records,
        [name]: {
          ttlSeconds: ttl
            ? ttl
            : this.state.records[name].ttlSeconds
            ? this.state.records[name].ttlSeconds
            : 1800,
          maxSubdomains: maxSubdomains
            ? maxSubdomains
            : this.state.records[name].maxSubdomains
            ? this.state.records[name].maxSubdomains
            : 100,
          transactionId: targetId.toString(),
        },
      };
      if (update === true && this.antId) {
        const payload = {
          function: 'setRecord',
          subDomain: name,
          target: targetId.toString(),
          ttlSeconds: ttl
            ? ttl
            : this.state.records[name].ttlSeconds
            ? this.state.records[name].ttlSeconds
            : 1800,
          maxSubdomains: maxSubdomains
            ? maxSubdomains
            : this.state.records[name].maxSubdomains
            ? this.state.records[name].maxSubdomains
            : 100,
        };
        const txid = await this._provider.writeTransaction(this.antId, payload);
        if (!txid) {
          throw new Error('Failed to write undername to contract');
        }
        return txid;
      }
      return;
    } catch (error) {
      console.error(error);
      return;
    }
  }
  /** removeUndername
   * @param name {string} name - undername to remove from ANT state
   * @returns void - Function alters instance state and returns void.
   */
  async removeUndername(name: string, update?: boolean) {
    try {
      if (!this.state) {
        throw new Error(
          `Cannot set state items when state is not loaded. Current state: ${this.state}`,
        );
      }
      if (!name) {
        throw new Error(`type of id <${name}> is not a valid id.`);
      }
      delete this.state?.records[name];
      if (update === true && this.antId) {
        const payload = {
          function: 'setRecord',
          subDomain: name,
        };
        const txid = await this._provider.writeTransaction(this.antId, payload);
        if (!txid) {
          throw new Error('Failed to remove undername from contract');
        }
        return txid;
      }
      return;
    } catch (error) {
      console.error(error);
      return;
    }
  }

  async update() {
    return;
    // for batch interaction function, could generate a diff of state keys, then write an interaction for each addition.
    // so check if new owner !== old owner, if not equal, write a newOwner interaction. If an undername was added write that... etc
    // this would enable the user to batch edit a bunch of keys in the contract, then save the contract state, and the app
    // would write all the interactions automatically. UI could have an Undo and Reset function to return to previous states
  }
}
