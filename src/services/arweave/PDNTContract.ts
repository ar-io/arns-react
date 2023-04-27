import {
  ArweaveTransactionID,
  PDNTContractDomainRecord,
  PDNTContractJSON,
} from '../../types';
import {
  DEFAULT_MAX_UNDERNAMES,
  DEFAULT_PDNT_CONTRACT_STATE,
  DEFAULT_TTL_SECONDS,
} from '../../utils/constants';

/**
 * TODOS:
 * - create lastUpdated attribute to track when changes are written to smartweave
 * - add validations and checks on setters
 * - include additional attributes like evolve to getters/setters
 */
export class PDNTContract {
  id?: ArweaveTransactionID;
  contract: PDNTContractJSON;
  // todo: add last updated - lastUpdated: Map<keyof PDNTContract, number> = new Map();

  constructor(state?: PDNTContractJSON, id?: ArweaveTransactionID) {
    this.id = id;
    if (state) {
      this.contract = { ...state };
    } else {
      this.contract = { ...DEFAULT_PDNT_CONTRACT_STATE };
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

  // TODO: this should be refactored when we are ready to not support pdnts that do not comply with the new PDNT spec
  get records(): { [x: string]: PDNTContractDomainRecord } {
    return Object.keys(this.contract.records).reduce(
      (records, r) => ({
        ...records,
        [r]: this.getRecord(r),
      }),
      {},
    );
  }
  set records(records: { [x: string]: PDNTContractDomainRecord }) {
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

  getRecord(name: string): PDNTContractDomainRecord {
    if (typeof this.contract.records[name] == 'string') {
      return {
        ttlSeconds: DEFAULT_TTL_SECONDS,
        transactionId: (this.contract.records[name] as string) ?? '',
        maxUndernames: DEFAULT_MAX_UNDERNAMES,
      };
    }
    return this.contract.records[name] as PDNTContractDomainRecord;
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
  get pdntId(): string | undefined {
    return this.pdntId?.toString();
  }
}
