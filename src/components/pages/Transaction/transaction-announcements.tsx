import { CheckCircleFilled } from '@ant-design/icons';
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
        <span className="white center">
          <CheckCircleFilled
            style={{ fontSize: 18, color: 'var(--success-green)' }}
          />
          &nbsp; Undernames Increased
        </span>
      );
    }
    case ARNS_INTERACTION_TYPES.EXTEND_LEASE: {
      return (
        <span className="white center">
          <CheckCircleFilled
            style={{ fontSize: 18, color: 'var(--success-green)' }}
          />
          &nbsp; Your lease has been extended
        </span>
      );
    }
    case ARNS_INTERACTION_TYPES.BUY_RECORD: {
      return (
        <span
          className="flex white center"
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
      return <span className="flex white center">Transaction Success</span>;
    }
  }
};
