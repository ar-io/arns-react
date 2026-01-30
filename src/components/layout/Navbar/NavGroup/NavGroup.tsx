import { useArNSState } from '@src/state';
import { Tooltip } from '@src/components/ui/Tooltip';
import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useIsMobile } from '../../../../hooks';
import { useWalletState } from '../../../../state/contexts/WalletState';
import { ROUTES } from '../../../../utils/routes';
import NavMenuCard from '../../../cards/NavMenuCard/NavMenuCard';
import ConnectButton from '../../../inputs/buttons/ConnectButton/ConnectButton';
import NotificationMenu from '../NotificationMenu/NotificationMenu';
import './styles.css';

function NavGroup() {
  const isMobile = useIsMobile();
  const [{ wallet, walletAddress }] = useWalletState();
  const [{ ants }] = useArNSState();
  const [links, setLinks] = useState<ReactNode[]>([]);
  const location = useLocation();

  useEffect(() => {
    const newLinks = Object.entries(ROUTES).map(([key, value]) => {
      if (!value.index && !value.protected && key !== 'settings')
        return (
          <Tooltip
            key={key}
            content={value.text}
            side="bottom"
          >
            <Link 
              to={value.path} 
              target={value.external ? '_blank' : '_self'}
              className="text-muted p-2 hover:text-white rounded hover:bg-white/20 transition-colors"
            >
              {value.icon && <value.icon className="size-4" />}
            </Link>
          </Tooltip>
        );
    });
    setLinks(newLinks);
  }, [ants, location.pathname]);

  return (
    <div className="flex-right flex size-fit gap-4 items-center">
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
