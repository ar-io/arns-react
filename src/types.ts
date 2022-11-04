import React from 'react';


export type GlobalState = {
  arnsSourceContract: ArNSContractState;
  gateway:string;
  connectedWallet: string;
  errors:Array<Error>;
}
export type ArNSContractState = {
  records: Map<string, ArweaveTransactionId>;
};

// TODO: match this to a regex
export type ArweaveTransactionId = string;

export interface SmartweaveContractSource {
  getContractState(
    contractId: ArweaveTransactionId,
  ): Promise<ArNSContractState | undefined>;
}

export type SearchBarProps = {
  buttonAction: () => void;
  placeholderText: string;
  headerText: string;
  footerText: string;
};
