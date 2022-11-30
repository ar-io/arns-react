import useIsMobile from '../../../../hooks/useIsMobile/useIsMobile';
import { useGlobalState } from '../../../../state/contexts/GlobalState';
import { ROUTES } from '../../../../utils/routes';
import NavMenuCard from '../../../cards/NavMenuCard/NavMenuCard';
import { AccountIcon } from '../../../icons';
import ConnectButton from '../../../inputs/buttons/ConnectButton/ConnectButton';
import NavBarLink from '../NavBarLink/NavBarLink';
import './styles.css';

const NavGroup = () => {
  const isMobile = useIsMobile();
  const [{ walletAddress }] = useGlobalState();

  // TODO: show mobile menu on click
  return (
    <div className="flex-row flex-right flex-padding">
      {!isMobile ? (
        <>
          {Object.entries(ROUTES).map(([key, value]) => {
            if (!value.index && (!value.protected || walletAddress))
              return (
                <NavBarLink path={value.path} linkText={value.text} key={key} />
              );
          })}
          {!walletAddress ? (
            <ConnectButton />
          ) : (
            <AccountIcon
              width={'24px'}
              height={'24px'}
              fill={'var(--text-white)'}
            />
          )}
        </>
      ) : (
        <NavMenuCard />
      )}
    </div>
  );
};

export default NavGroup;
