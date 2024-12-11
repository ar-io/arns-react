import { ANT_INTERACTION_TYPES, ARNS_INTERACTION_TYPES } from '@src/types';

export function getTransactionDescription({
  workflowName,
  ...params
}: {
  workflowName: ARNS_INTERACTION_TYPES | ANT_INTERACTION_TYPES;
} & Record<string, any>) {
  switch (workflowName) {
    case ARNS_INTERACTION_TYPES.INCREASE_UNDERNAMES:
      return `Increasing your undernames is paid in ${params.arioTicker} tokens.`;
    case ARNS_INTERACTION_TYPES.EXTEND_LEASE:
    case ARNS_INTERACTION_TYPES.BUY_RECORD:
      return `This includes a registration fee (paid in ${params.arioTicker} tokens).`;
    default:
      return undefined;
  }
}
