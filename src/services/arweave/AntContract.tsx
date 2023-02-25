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
  /**
      ​ * AntContractProvider
      ​ * @param walletAddress - @type {ArweaveTransactionID} - connected wallet address
      ​ * @param provider -  @type {ArweaveCompositeDataProvider}
      ​ * @param antId - @type {ArweaveTransactionID | undefined} - 
       * ANT ID to use for loading a pre-existing ANT's contract state. If left undefined, default new ANT state is loaded
      ​ */
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

  getCurrentState() {
    return this.state;
  }

  setOwner(id: ArweaveTransactionID) {
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
      return;
    } catch (error) {
      console.error(error);
      return;
    }
  }

  setController(id: ArweaveTransactionID, update?: boolean) {
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
      return;
    } catch (error) {
      console.error(error);
      return;
    }
  }
  setTargetId(id: ArweaveTransactionID) {
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
      return;
    } catch (error) {
      console.error(error);
      return;
    }
  }

  setUndername({
    // allows user to set an undername with just default values, or edited values
    name,
    targetId = '',
    maxSubdomains = 100,
    ttl = 1800,
  }: {
    name: string;
    targetId: ArweaveTransactionID | string;
    maxSubdomains: number;
    ttl: number;
  }) {
    try {
      if (!this.state) {
        throw new Error(
          `Cannot set state items when state is not loaded. Current state: ${this.state}`,
        );
      }
      if (!targetId) {
        throw new Error(`type of id <${targetId}> is not a valid id.`);
      }
      this.state.records = {
        ...this.state.records,
        [name]: {
          ttlSeconds: ttl,
          maxSubdomains: maxSubdomains,
          transactionId: targetId.toString(),
        },
      };
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
  removeUndername(name: string) {
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
