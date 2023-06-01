import { Link, useLocation } from 'react-router-dom';

import { useIsMobile, useWalletAddress } from '../../../../hooks';
import { ROUTES } from '../../../../utils/routes';
import NavMenuCard from '../../../cards/NavMenuCard/NavMenuCard';
import ConnectButton from '../../../inputs/buttons/ConnectButton/ConnectButton';
import NavBarLink from '../NavBarLink/NavBarLink';
import './styles.css';

const NavGroup = () => {
  const isMobile = useIsMobile();
  const { wallet, walletAddress } = useWalletAddress();
  const location = useLocation();

  return (
    <div className="flex-row flex-right flex-padding">
      {!isMobile ? (
        <>
          {Object.entries(ROUTES).map(([key, value]) => {
            if (!value.index && !value.protected)
              return (
                <NavBarLink
                  path={value.path}
                  linkText={value.text}
                  target={value.external ? '_blank' : '_self'}
                  key={key}
                />
              );
          })}

          <Link
            to="auctions"
            state={{ from: location.pathname }}
            className="button text-medium bold white hover"
          >
            Live Auctions
          </Link>
          {!wallet || !walletAddress ? <ConnectButton /> : <NavMenuCard />}
        </>
      ) : (
        <NavMenuCard />
      )}
    </div>
  );
};

export default NavGroup;
