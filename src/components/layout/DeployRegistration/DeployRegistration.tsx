import { useEffect, useState } from 'react';

import logo from '../../../../assets/images/logo/looped-winston-white.gif';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import { RegistrationProgress } from '../../inputs/progress';

function DeployRegistration() {
  const [deployStage, setDeployStage] = useState(1);
  const [pickDomain, setPickDomain] = useState('success');
  const [createAnANT, setCreateAnANT] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [complete, setComplete] = useState('');

  return (
    <>
      <div className="flex-column center">
        <RegistrationProgress
          stages={{
            1: {
              title: 'Pick Domain',
              status: pickDomain,
            },
            2: {
              title: 'Create an ANT',
              status: createAnANT,
            },
            3: {
              title: 'Register Name',
              status: registerName,
            },
            4: {
              title: 'Complete',
              status: complete,
            },
          }}
          stage={deployStage}
        />
        <div className="flex-column center" style={{ gap: 0 }}>
          <img src={logo} alt="ar-io-logo" width={150} height={150} />
          <span className="text faded center">
            We are reserving your name. Please give us a few ~
          </span>
        </div>
      </div>
    </>
  );
}

export default DeployRegistration;
