import logo from '../../../../assets/images/logo/looped-winston-white.gif';

function DeployTransaction() {
  return (
    <div className="card">
      {/**TODO add dependsOn to proceeding stages to check if previous stages were met */}
      {/* status is implied per stage, can predicate this */}

      <img src={logo} alt="ar-io-logo" width={150} height={150} />

      {/* TODO : add random fun fact selector */}
    </div>
  );
}

export default DeployTransaction;
