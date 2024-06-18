import { ANT_INTERACTION_TYPES, ARNS_INTERACTION_TYPES } from '@src/types';

export function getTransactionDescription({
  workflowName,
  ...params
}: {
  workflowName: ARNS_INTERACTION_TYPES | ANT_INTERACTION_TYPES;
} & Record<string, any>) {
  switch (workflowName) {
    case ARNS_INTERACTION_TYPES.INCREASE_UNDERNAMES:
      return `Increasing your undernameLimit is paid in ${params.ioTicker} tokens, and an Arweave network fee paid in AR tokens.`;
    case ARNS_INTERACTION_TYPES.EXTEND_LEASE:
    case ARNS_INTERACTION_TYPES.BUY_RECORD:
      return `This includes a registration fee (paid in ${params.ioTicker} tokens) and the Arweave network fee (paid in AR tokens).`;
    default:
      return undefined;
  }
}
