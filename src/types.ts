import React from 'react';

export type ArNSContractState = {
  records: { [x: string]: ArweaveTransactionId };
};

// TODO: match this to a regex
export type ArweaveTransactionId = string;

export interface SmartweaveContractSource {
  getContractState(
    contractId: ArweaveTransactionId,
  ): Promise<ArNSContractState | undefined>;
}

export type SearchBarProps = {
  buttonAction: (props: string) => void;
  placeholderText: string;
  headerElement: JSX.Element;
  footerText: string;
  availability: string;
};
