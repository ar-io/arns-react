import {
  ANTContractDomainRecord,
  ANTContractJSON,
  ArweaveTransactionID,
} from '../../types';
import {
  DEFAULT_ANT_CONTRACT_STATE,
  DEFAULT_MAX_UNDERNAMES,
  DEFAULT_TTL_SECONDS,
} from '../../utils/constants';

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
      this.contract = { ...state };
    } else {
      this.contract = { ...DEFAULT_ANT_CONTRACT_STATE };
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

  // TODO: this should be refactored when we are ready to not support ants that do not comply with the new ANT spec
  get records(): { [x: string]: ANTContractDomainRecord } {
    return Object.keys(this.contract.records).reduce(
      (records, r) => ({
        ...records,
        [r]: this.getRecord(r),
      }),
      {},
    );
  }
  set records(records: { [x: string]: ANTContractDomainRecord }) {
    for (const [
      domain,
      { transactionId, maxUndernames, ttlSeconds },
    ] of Object.entries(records)) {
      this.contract.records[domain] = {
        transactionId: transactionId
          ? transactionId.toString()
          : this.getRecord(domain).transactionId.toString(),
        maxUndernames: maxUndernames
          ? maxUndernames
          : this.getRecord(domain).maxUndernames,
        ttlSeconds: ttlSeconds
          ? ttlSeconds
          : this.getRecord(domain).maxUndernames,
      };
    }
  }

  getRecord(name: string): ANTContractDomainRecord {
    if (typeof this.contract.records[name] == 'string') {
      return {
        ttlSeconds: DEFAULT_TTL_SECONDS,
        transactionId: (this.contract.records[name] as string) ?? '',
        maxUndernames: DEFAULT_MAX_UNDERNAMES,
      };
    }
    return this.contract.records[name] as ANTContractDomainRecord;
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
