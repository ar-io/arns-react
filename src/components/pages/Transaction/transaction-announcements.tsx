import { CheckCircle } from 'lucide-react';
import { ANT_INTERACTION_TYPES, ARNS_INTERACTION_TYPES } from '@src/types';
import { decodeDomainToASCII } from '@src/utils';

export const getTransactionCompleteAnnouncement = ({
  interactionType,
  ...params
}: {
  interactionType: ARNS_INTERACTION_TYPES | ANT_INTERACTION_TYPES;
} & Record<string, any>) => {
  switch (interactionType) {
    case ARNS_INTERACTION_TYPES.INCREASE_UNDERNAMES: {
      return (
        <span className="text-foreground text-center justify-center items-center">
          <CheckCircle className="text-success" size={18} />
          &nbsp; Undernames Increased
        </span>
      );
    }
    case ARNS_INTERACTION_TYPES.EXTEND_LEASE: {
      return (
        <span className="text-foreground text-center justify-center items-center">
          <CheckCircle className="text-success" size={18} />
          &nbsp; Your lease has been extended
        </span>
      );
    }
    case ARNS_INTERACTION_TYPES.BUY_RECORD: {
      return (
        <span
          className="flex text-foreground text-center justify-center items-center"
          style={{ gap: '8px', width: '100%', padding: '0px 24px' }}
        >
          <span>
            <CheckCircleFilled
              style={{ fontSize: 18, color: 'var(--success-green)' }}
            />
          </span>
          &nbsp;
          <b>{decodeDomainToASCII(params?.name)}</b> is yours!
        </span>
      );
    }
    default: {
      return <span className="flex text-foreground text-center justify-center items-center">Transaction Success</span>;
    }
  }
};
