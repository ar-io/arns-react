import { useIsMobile } from '../../../../hooks';
import { useWalletState } from '../../../../state/contexts/WalletState';
import { ROUTES } from '../../../../utils/routes';
import NavMenuCard from '../../../cards/NavMenuCard/NavMenuCard';
import ConnectButton from '../../../inputs/buttons/ConnectButton/ConnectButton';
import NavBarLink from '../NavBarLink/NavBarLink';
import './styles.css';

const NavGroup = () => {
  const isMobile = useIsMobile();
  const [{ wallet, walletAddress }] = useWalletState();

  return (
    <div
      className="flex-row flex-right flex-padding"
      style={{ width: 'fit-content' }}
    >
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
          {!wallet || !walletAddress ? <ConnectButton /> : <NavMenuCard />}
        </>
      ) : (
        <NavMenuCard />
      )}
    </div>
  );
};

export default NavGroup;
