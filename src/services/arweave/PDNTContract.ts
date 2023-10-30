import {
  ArweaveTransactionID,
  PDNTContractDomainRecord,
  PDNTContractJSON,
  TransactionCache,
} from '../../types';
import {
  ATOMIC_FLAG,
  DEFAULT_MAX_UNDERNAMES,
  DEFAULT_PDNT_CONTRACT_STATE,
  DEFAULT_TTL_SECONDS,
} from '../../utils/constants';
import { ContractInteractionCache } from '../caches/ContractInteractionCache';
import { LocalStorageCache } from '../caches/LocalStorageCache';

/**
 * TODOS:
 * - create lastUpdated attribute to track when changes are written to smartweave
 * - add validations and checks on setters
 */
export class PDNTContract {
  id?: ArweaveTransactionID | typeof ATOMIC_FLAG;
  contract: PDNTContractJSON;
  cache: TransactionCache;

  constructor(
    state?: PDNTContractJSON,
    id?: ArweaveTransactionID | typeof ATOMIC_FLAG,
  ) {
    this.id = id;
    this.cache = new ContractInteractionCache(new LocalStorageCache());
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

  get controllers() {
    return (
      this.contract.controllers ?? [
        this.contract.controller ?? this.contract.owner,
      ]
    );
  }

  // TODO: this should be refactored when we are ready to not support pdnts that do not comply with the new PDNT spec
  get records(): { [x: string]: PDNTContractDomainRecord } {
    if (!this.contract?.records) {
      return {};
    }
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
          ? transactionId
          : this.getRecord(domain)?.transactionId ?? '',
        maxUndernames: maxUndernames
          ? maxUndernames
          : this.getRecord(domain)?.maxUndernames ?? DEFAULT_MAX_UNDERNAMES,
        ttlSeconds: ttlSeconds
          ? ttlSeconds
          : this.getRecord(domain)?.ttlSeconds ?? DEFAULT_TTL_SECONDS,
      };
    }
  }

  getRecord(name: string): PDNTContractDomainRecord | undefined {
    if (!this.contract.records[name]) return undefined;

    if (typeof this.contract.records[name] === 'string') {
      return {
        transactionId: this.contract.records[name] as unknown as string,
        maxUndernames: DEFAULT_MAX_UNDERNAMES,
        ttlSeconds: DEFAULT_TTL_SECONDS,
      };
    }

    return this.contract.records[name];
  }

  get balances() {
    return this.contract.balances;
  }
  set balances(balances: { [x: string]: number }) {
    this.contract.balances = balances;
  }

  addController(controller: string) {
    try {
      if (!controller) {
        throw new Error('No ID provided');
      }
      const txId = new ArweaveTransactionID(controller);
      this.contract.controllers = [
        ...this.contract.controllers,
        txId.toString(),
      ];
      this.contract.balances[controller] = 1;
    } catch (error) {
      // TODO: should we log this error or emit?
      console.error(error);
    }
  }

  get state() {
    return this.contract;
  }
  get pdntId(): string | undefined {
    return this.pdntId?.toString();
  }

  isValid(): boolean {
    return this.contract && this.records && !!this.getRecord('@');
  }
}
