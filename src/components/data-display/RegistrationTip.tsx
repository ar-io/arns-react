import { Tooltip } from '@src/components/data-display';
import { CiWarning } from 'react-icons/ci';

import { CircleCheck, CircleXIcon } from '../icons';

function RegistrationTip({ domain }: { domain?: any }) {
  type Status = 'Registered' | 'Grace Period' | 'Not Registered';
  function getStatus(domain?: any): { message: Status; icon: JSX.Element } {
    const isRegistered = domain !== undefined;
    const inGracePeriod = domain?.endTimestamp < Date.now();
    switch (true) {
      case isRegistered && !inGracePeriod:
        return {
          message: 'Registered',
          icon: <CircleCheck width={'18px'} fill={'var(--success-green)'} />,
        };
      case inGracePeriod:
        return {
          message: 'Grace Period',
          icon: <CiWarning size={'18px'} color="var(--accent)" />,
        };
      default:
        return {
          message: 'Not Registered',
          icon: <CircleXIcon width={'18px'} fill={'var(--error-red)'} />,
        };
    }
  }

  return <Tooltip {...getStatus(domain)} />;
}

export default RegistrationTip;
