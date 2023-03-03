import {
  ANTContractDomainRecord,
  ANTContractJSON,
  ANTContractRecordMapping,
  ArweaveTransactionID,
} from '../../types';
import { DEFAULT_ANT_CONTRACT_STATE } from '../../utils/constants';
import { isArweaveTransactionID } from '../../utils/searchUtils';

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
    try {
      if (!id) {
        throw new Error('No ID provided');
      }
      const txId = new ArweaveTransactionID(id);
      this.contract.owner = txId.toString();
      this.contract.balances[id] = 1;
    } catch (error) {
      console.log(error);
    }
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
  get records() {
    return this.contract.records;
  }
  set records(records: { [x: string]: ANTContractDomainRecord }) {
    //records example: {'@': {transactionId:"7waR8v4STuwPnTck1zFVkQqJh5K9q9Zik4Y5-5dV7nk"}} - can leave the other properties undefined, will autoset
    for (const [
      domain,
      { transactionId, maxSubdomains, ttlSeconds },
    ] of Object.entries(records)) {
      this.contract.records[domain] = {
        transactionId: transactionId
          ? transactionId.toString()
          : this.contract.records[domain].transactionId
          ? this.contract.records[domain].transactionId?.toString()
          : '',
        maxSubdomains: maxSubdomains
          ? maxSubdomains
          : this.contract.records[domain].maxSubdomains
          ? this.contract.records[domain].maxSubdomains
          : 100,
        ttlSeconds: ttlSeconds
          ? ttlSeconds
          : this.contract.records[domain].ttlSeconds
          ? this.contract.records[domain].ttlSeconds
          : 1800,
      };
    }
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
    try {
      if (!controller) {
        throw new Error('No ID provided');
      }
      const txId = new ArweaveTransactionID(controller);
      this.contract.controller = txId.toString();
      this.contract.balances[controller] = 1;
    } catch (error) {
      console.log(error);
    }
  }

  get state() {
    return this.contract;
  }
  get antId(): string | undefined {
    return this.antId?.toString();
  }
}
