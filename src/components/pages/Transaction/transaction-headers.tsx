import { ANT_INTERACTION_TYPES, ARNS_INTERACTION_TYPES } from '@src/types';

export function getTransactionHeader({
  workflowName,
}: {
  workflowName: ARNS_INTERACTION_TYPES | ANT_INTERACTION_TYPES;
} & Record<string, any>) {
  switch (workflowName) {
    case ARNS_INTERACTION_TYPES.INCREASE_UNDERNAMES:
    case ARNS_INTERACTION_TYPES.EXTEND_LEASE:
      return (
        <h1
          className="white flex"
          style={{ width: '100%', paddingBottom: '30px' }}
        >
          Review
        </h1>
      );
    case ARNS_INTERACTION_TYPES.BUY_RECORD:
      return `Review your Purchase`;
    default:
      return undefined;
  }
}
