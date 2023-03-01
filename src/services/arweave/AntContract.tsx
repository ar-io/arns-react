import { ANTContractJSON, ArweaveTransactionID } from '../../types';
import { DEFAULT_ANT_CONTRACT_STATE } from '../../utils/constants';

/**
 * TODOS:
 * - create lastUpdated attribute to track when changes are written to smartweave
 * - add validations and checks on setters
 * - include additional attributes like evolve to getters/setters
 */
export class ANTContract {
  id?: ArweaveTransactionID;
  contract: ANTContractJSON;
  // todo: add last updated - lastUpdated: Map<keyof AntContract, number> = new Map();

  constructor(state?: ANTContractJSON, id?: ArweaveTransactionID) {
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
  get controller() {
    return this.contract.controller;
  }
  set controller(controller: string) {
    // any validations we want to do on the controller
    this.contract.controller = controller;
  }

  get state() {
    return this.contract;
  }
  get antId(): string | undefined {
    return this.antId?.toString();
  }
}
