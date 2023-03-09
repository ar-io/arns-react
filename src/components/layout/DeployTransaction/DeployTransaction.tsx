import logo from '../../../../assets/images/logo/looped-winston-white.gif';
import { useIsMobile } from '../../../hooks';

function DeployTransaction() {
  const isMobile = useIsMobile();
  return (
    <>
      <div className="flex-column center">
        <div
          className="flex flex-column card center"
          style={{
            width: isMobile ? '90%' : '50%',
          }}
        >
          {/**TODO add dependsOn to proceeding stages to check if previous stages were met */}
          {/* status is implied per stage, can predicate this */}

          <div className="flex-column center" style={{ gap: 0 }}>
            <img src={logo} alt="ar-io-logo" width={150} height={150} />
            <span className="flex flex-column center" style={{ gap: '10px' }}>
              <span className="text-small bold faded center">
                Did you know:
              </span>
              {/* TODO : replace with random fun fact selector */}
              <span className="text-small faded center">
                Sam Williams has never been able to get his hands on a Dragon
                Turtle, despite his best efforts?
              </span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default DeployTransaction;
