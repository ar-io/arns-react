import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  useArweaveCompositeProvider,
  useIsMobile,
  useWalletAddress,
} from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { ArweaveTransactionID } from '../../../types';
import eventEmitter from '../../../utils/events';
import { ROUTES } from '../../../utils/routes';
import { LogoutIcon, MenuIcon } from '../../icons';
import ConnectButton from '../../inputs/buttons/ConnectButton/ConnectButton';
import CopyTextButton from '../../inputs/buttons/CopyTextButton/CopyTextButton';
import MenuButton from '../../inputs/buttons/MenuButton/MenuButton';
import { Loader, NavBarLink } from '../../layout';
import { WalletAddress } from '../../layout/WalletAddress/WalletAddress';
import './styles.css';

function NavMenuCard() {
  const arweaveDataProvider = useArweaveCompositeProvider();
  const [{ pdnsContractId }, dispatchGlobalState] = useGlobalState(); // eslint-disable-line
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [walletDetails, setWalletDetails] = useState<{
    IO: number | undefined | string;
    AR: number | undefined | string;
  }>({
    IO: undefined,
    AR: undefined,
  });
  const menuRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { wallet, walletAddress } = useWalletAddress();

  useEffect(() => {
    if (walletAddress) {
      resetWalletDetails();
      fetchWalletDetails(walletAddress);
    }

    if (!menuRef.current) {
      return;
    }
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef, showMenu, wallet, walletAddress]);

  function resetWalletDetails() {
    setWalletDetails({
      IO: undefined,
      AR: undefined,
    });
  }

  async function fetchWalletDetails(walletAddress: ArweaveTransactionID) {
    const ioBalance = await arweaveDataProvider.getContractBalanceForWallet(
      pdnsContractId,
      walletAddress,
    );
    const arBalance = await arweaveDataProvider.getArBalance(walletAddress);
    const [formattedBalance, formattedIOBalance] = [arBalance, ioBalance].map(
      (balance: string | number) =>
        Intl.NumberFormat('en-US', {
          notation: 'compact',
          maximumFractionDigits: 2,
          compactDisplay: 'short',
        }).format(+balance),
    );
    setWalletDetails({
      IO: formattedIOBalance,
      AR: formattedBalance,
    });
  }

  function handleClickOutside(e: any) {
    e.preventDefault();
    if (
      menuRef.current &&
      e.target !== menuRef.current &&
      !menuRef.current.contains(e.target)
    ) {
      // slight jitter in case menu button is pushed to close
      setTimeout(() => {
        setShowMenu(false);
      }, 100);
    }
  }

  async function logout() {
    try {
      await wallet?.disconnect();
      // reset state
      setShowMenu(false);
      dispatchGlobalState({
        type: 'setWallet',
        payload: undefined,
      });
    } catch (error: any) {
      eventEmitter.emit('error', error);
    } finally {
      navigate('/');
    }
  }

  return (
    <>
      <MenuButton
        setShow={setShowMenu}
        show={showMenu}
        className={walletAddress ? 'outline-button' : ''}
        style={
          walletAddress
            ? {
                borderRadius: 'var(--corner-radius',
                borderWidth: '2px',
                padding: '10px',
              }
            : {}
        }
      >
        {walletAddress ? (
          <WalletAddress />
        ) : (
          <MenuIcon width={'24px'} height={'24px'} fill={'var(--text-white)'} />
        )}
      </MenuButton>

      {showMenu ? (
        <div className="card menu" ref={menuRef}>
          {!walletAddress || !wallet ? (
            <>
              {Object.entries(ROUTES).map(([key, route]) => {
                if (!route.protected)
                  return (
                    // TODO: add menu icons
                    <NavBarLink
                      path={route.path}
                      linkText={route.text}
                      target={route.external ? '_blank' : '_self'}
                      key={key}
                      onClick={() => {
                        setShowMenu(false);
                      }}
                    />
                  );
              })}
              <Link
                to="/create"
                className="button text-medium bold white hover"
                style={{ padding: '0' }}
              >
                Create
              </Link>
              <ConnectButton />
            </>
          ) : (
            <>
              <CopyTextButton
                displayText={`${walletAddress
                  .toString()
                  .slice(0, isMobile ? 2 : 4)}...${walletAddress
                  .toString()
                  .slice(isMobile ? -2 : -4)}`}
                copyText={walletAddress.toString()}
                size={20}
                wrapperStyle={{
                  color: 'white',
                  fontWeight: 600,
                  fontFamily: 'Rubik-Bold',
                  width: '100%',
                  padding: 0,
                  fill: 'var(--text-white)',
                }}
                position="relative"
              />
              {isMobile ? (
                <>
                  {Object.entries(ROUTES).map(([key, route]) => {
                    if (!route.index && (!route.protected || walletAddress))
                      return (
                        <NavBarLink
                          path={route.path}
                          linkText={route.text}
                          target={route.external ? '_blank' : '_self'}
                          key={key}
                          onClick={() => {
                            setShowMenu(false);
                          }}
                        />
                      );
                  })}
                  <Link
                    to="/create"
                    className="button text-medium bold white hover"
                    style={{ padding: '0' }}
                  >
                    Create
                  </Link>
                </>
              ) : (
                Object.entries(ROUTES).map(([key, route]) => {
                  if (route.protected && walletAddress)
                    return (
                      <NavBarLink
                        path={route.path}
                        linkText={route.text}
                        key={key}
                        onClick={() => {
                          setShowMenu(false);
                        }}
                      >
                        <>
                          {route.icon ? (
                            route.icon({
                              height: 24,
                              width: 24,
                              fill: 'var(--text-white)',
                            })
                          ) : (
                            <></>
                          )}
                        </>
                      </NavBarLink>
                    );
                })
              )}
              {Object.entries(walletDetails).map(([key, value]) => {
                return (
                  <span
                    key={key}
                    className="flex-row flex-space-between navbar-link"
                  >
                    <span>{key} Balance</span>
                    {value ? (
                      <span className="grey">{value}</span>
                    ) : (
                      // TODO: add error icon with hover for error details
                      <Loader size={20} wrapperStyle={{ margin: '0px' }} />
                    )}
                  </span>
                );
              })}
              {
                <button
                  className="navbar-link hover flex-row flex-space-between"
                  onClick={() => logout()}
                  style={{
                    cursor: 'pointer',
                    padding: '0px',
                  }}
                >
                  <span className="flex">Log Out</span>
                  <LogoutIcon
                    style={{
                      height: '24px',
                      width: '24px',
                      fill: 'var(--text-bright-white)',
                    }}
                  />
                </button>
              }
            </>
          )}
        </div>
      ) : (
        <></>
      )}
    </>
  );
}

export default NavMenuCard;
