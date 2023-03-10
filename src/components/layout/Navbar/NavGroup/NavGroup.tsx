import { useIsMobile, useWalletAddress } from '../../../../hooks';
import { useGlobalState } from '../../../../state/contexts/GlobalState';
import { ROUTES } from '../../../../utils/routes';
import NavMenuCard from '../../../cards/NavMenuCard/NavMenuCard';
import ConnectButton from '../../../inputs/buttons/ConnectButton/ConnectButton';
import NavBarLink from '../NavBarLink/NavBarLink';
import './styles.css';

const NavGroup = () => {
  const isMobile = useIsMobile();
  const { wallet, walletAddress } = useWalletAddress();

  const [{}, dispatchGlobalState] = useGlobalState(); // eslint-disable-line

  return (
    <div className="flex-row flex-right flex-padding">
      {!isMobile ? (
        <>
          {Object.entries(ROUTES).map(([key, value]) => {
            if (!value.index && !value.protected)
              return (
                <NavBarLink path={value.path} linkText={value.text} key={key} />
              );
          })}

          <button
            className="button text-medium bold white"
            onClick={
              walletAddress
                ? () =>
                    dispatchGlobalState({
                      type: 'setShowCreateAnt',
                      payload: true,
                    })
                : () => {
                    dispatchGlobalState({
                      type: 'setShowCreateAnt',
                      payload: true,
                    });
                    dispatchGlobalState({
                      type: 'setShowConnectWallet',
                      payload: true,
                    });
                  }
            }
          >
            Create
          </button>
          {!wallet || !walletAddress ? (
            <ConnectButton />
          ) : (
            <>
              <NavMenuCard />
            </>
          )}
        </>
      ) : (
        <NavMenuCard />
      )}
    </div>
  );
};

export default NavGroup;
