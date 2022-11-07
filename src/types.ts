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
  buttonAction: (props: string) => Boolean | undefined;
  placeholderText: string;
  headerElement: JSX.Element;
  footerText: string;
};

export type SearchBarHeaderProps = {
  isValid : Boolean | undefined;
  name: string;
}
