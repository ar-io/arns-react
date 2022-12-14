import logo from '../../../../assets/images/logo/looped-winston-white.gif';
import { RegistrationProgress } from '../../inputs/progress';

function DeployRegistration() {
  return (
    <>
      <div className="flex-column center">
        <RegistrationProgress
          stages={{
            1: {
              title: 'Pick Domain',
              status: '',
            },
            2: {
              title: 'Create an ANT',
              status: '',
            },
            3: {
              title: 'Register Name',
              status: '',
            },
            4: {
              title: 'Complete',
              status: '',
            },
          }}
          stage={1}
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
