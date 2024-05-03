import { ANTState } from '@ar.io/sdk';

import {
  ANTContractDomainRecord,
  ANTContractJSON,
  ContractInteraction,
} from '../../types';
import {
  ATOMIC_FLAG,
  DEFAULT_ANT_CONTRACT_STATE,
  DEFAULT_TTL_SECONDS,
} from '../../utils/constants';
import { ArweaveTransactionID } from './ArweaveTransactionID';

/**
 * TODOS:
 * - create lastUpdated attribute to track when changes are written to smartweave
 * - add validations and checks on setters
 */
export class ANTContract {
  id?: ArweaveTransactionID | typeof ATOMIC_FLAG;
  contract: ANTContractJSON | ANTState;
  pendingInteractions: ContractInteraction[];

  constructor(
    state?: ANTContractJSON | ANTState,
    id?: ArweaveTransactionID | typeof ATOMIC_FLAG,
    pendingInteractions: ContractInteraction[] = [],
  ) {
    this.id = id;
    this.pendingInteractions = pendingInteractions;
    if (state) {
      this.contract = { ...state };
    } else {
      this.contract = { ...DEFAULT_ANT_CONTRACT_STATE };
    }
    this.pendingInteractions
      .sort(
        (a: ContractInteraction, b: ContractInteraction) =>
          +a.timestamp - +b.timestamp,
      )
      .forEach((interaction: ContractInteraction) =>
        this.handleInteraction(interaction),
      );
  }
  get owner() {
    return this.contract.owner;
  }
  set owner(id: string) {
    if (!id) {
      throw new Error('No ID provided');
    }
    const txId = new ArweaveTransactionID(id);
    this.contract.owner = txId.toString();
    this.contract.balances[id] = 1;
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
        // legacy support for contracts that have only one controller
        // eslint-disable-next-line
        // @ts-ignore
        this.contract.controller ?? this.contract.owner,
      ]
    );
  }

  set controllers(controllers: string[]) {
    this.contract.controllers = controllers;
  }

  // TODO: this should be refactored when we are ready to not support ants that do not comply with the new ANT spec
  get records(): { [x: string]: ANTContractDomainRecord } {
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
  set records(records: { [x: string]: ANTContractDomainRecord }) {
    for (const [domain, { transactionId, ttlSeconds }] of Object.entries(
      records,
    )) {
      this.contract.records[domain] = {
        transactionId: transactionId
          ? transactionId
          : this.getRecord(domain)?.transactionId ?? '',

        ttlSeconds: ttlSeconds
          ? ttlSeconds
          : this.getRecord(domain)?.ttlSeconds ?? DEFAULT_TTL_SECONDS,
      };
    }
  }

  getRecord(name: string): ANTContractDomainRecord | undefined {
    if (!this.contract.records[name]) return undefined;

    if (typeof this.contract.records[name] === 'string') {
      return {
        transactionId: this.contract.records[name] as unknown as string,
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
  get antId(): string | undefined {
    return this.antId?.toString();
  }

  isValid(): boolean {
    return this.contract && this.records && !!this.getRecord('@');
  }
  getOwnershipStatus(address?: ArweaveTransactionID): string | undefined {
    if (!address) return;
    if (this.owner === address.toString()) {
      return 'owner';
    }
    if (this.controllers.includes(address.toString())) {
      return 'controller';
    }
  }

  handleInteraction(interaction: ContractInteraction) {
    switch (interaction.payload.function) {
      case 'transfer':
        this.owner = interaction.payload.target.toString();
        break;
      case 'setController':
        this.addController(interaction.payload.controller.toString());
        break;
      case 'removeController':
        this.controllers = this.controllers.filter(
          (c: string) => c !== interaction.payload.controller.toString(),
        );
        break;
      case 'setRecord':
        this.records = {
          ...this.records,
          [interaction.payload.subDomain.toString()]: {
            transactionId: interaction.payload.transactionId.toString(),
            ttlSeconds: parseInt(interaction.payload.ttlSeconds.toString()),
          },
        };
        break;
      case 'removeRecord':
        delete this.records[interaction.payload.subDomain.toString()];
        break;
      case 'setName':
        this.name = interaction.payload.name.toString();
        break;
      case 'setTicker':
        this.ticker = interaction.payload.ticker.toString();
        break;
      default:
        throw new Error(
          `Invalid interaction function: ${interaction.payload.function}`,
        );
    }
  }
}
