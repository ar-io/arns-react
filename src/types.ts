import React from 'react';

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
  buttonAction: any; // fn to run on search button click
  searchBarState: string; // "search" "error" "success"
  searchState: string; // value of the text input
  onChangeHandler: any; // function to change state of input
  placeholderText: string; //placeholder text of the input
  headerText: any; // display text or component above search
  footerText: any; // display text or component below search
};
