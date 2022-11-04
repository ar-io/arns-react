import type { ArNSContractState } from '../types';

export type GlobalState = {
  arnsSourceContract: ArNSContractState;
  gateway: string;
  connectedWallet: string;
  errors: Array<Error>;
};
