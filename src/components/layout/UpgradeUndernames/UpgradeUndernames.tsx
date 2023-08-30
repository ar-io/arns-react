import { useLocation, useNavigation } from 'react-router-dom';

function UpgradeUndernames() {
  const location = useLocation();
  const navigation = useNavigation();
  console.log(location);
  console.log(navigation);

  return <></>;
}

export default UpgradeUndernames;
