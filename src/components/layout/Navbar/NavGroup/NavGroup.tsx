import { useArNSState } from '@src/state';
import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useIsMobile } from '../../../../hooks';
import { useWalletState } from '../../../../state/contexts/WalletState';
import { ROUTES } from '../../../../utils/routes';
import NavMenuCard from '../../../cards/NavMenuCard/NavMenuCard';
import ConnectButton from '../../../inputs/buttons/ConnectButton/ConnectButton';
import NavBarLink from '../NavBarLink/NavBarLink';
import NotificationMenu from '../NotificationMenu/NotificationMenu';
import './styles.css';

function NavGroup() {
  const isMobile = useIsMobile();
  const [{ wallet, walletAddress }] = useWalletState();
  const [{ ants }] = useArNSState();
  const [links, setLinks] = useState<ReactNode[]>([]);
  const location = useLocation();

  useEffect(() => {
    function getActivityDot(routeName: string): boolean | undefined {
      switch (routeName) {
        // return true to display activity dot on a link
        //example:
        // case 'manage': return true;
        default:
          return undefined;
      }
    }

    const newLinks = Object.entries(ROUTES).map(([key, value]) => {
      if (!value.index && !value.protected && key !== 'settings')
        return (
          <NavBarLink
            key={key}
            path={value.path}
            linkText={value.text}
            activityDot={getActivityDot(key)}
            target={value.external ? '_blank' : '_self'}
          />
        );
    });
    setLinks(newLinks);
  }, [ants, location.pathname]);

  return (
    <div
      className="flex-right flex-padding flex-row"
      style={{ width: 'fit-content' }}
    >
      {!isMobile ? (
        <>
          {' '}
          <NotificationMenu />
          {links}
          {!wallet || !walletAddress ? <ConnectButton /> : <NavMenuCard />}
        </>
      ) : (
        <NavMenuCard />
      )}
    </div>
  );
}

export default NavGroup;
