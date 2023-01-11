import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useIsMobile, useWalletAddress } from '../../../hooks';
import { defaultDataProvider } from '../../../services/arweave/';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { ArweaveWalletConnector } from '../../../types';
import { ROUTES } from '../../../utils/routes';
import { CopyIcon, LogoutIcon, MenuIcon } from '../../icons';
import ConnectButton from '../../inputs/buttons/ConnectButton/ConnectButton';
import MenuButton from '../../inputs/buttons/MenuButton/MenuButton';
import { Loader, NavBarLink } from '../../layout';
import { WalletAddress } from '../../layout/WalletAddress/WalletAddress';
import './styles.css';

function NavMenuCard() {
  const [{ arnsContractId, arweave }, dispatchGlobalState] = useGlobalState(); // eslint-disable-line
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [walletDetails, setWalletDetails] = useState<{
    IO: number | undefined | string;
    AR: number | undefined | string;
  }>({
    IO: undefined,
    AR: undefined,
  });
  const [walletCopied, setWalletCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { wallet, walletAddress } = useWalletAddress();

  useEffect(() => {
    if (wallet) {
      resetWalletDetails();
      fetchWalletDetails(wallet);
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
      AR: undefined,
      IO: undefined,
    });
  }

  async function fetchWalletDetails(wallet: ArweaveWalletConnector) {
    const dataProvider = defaultDataProvider(arweave);
    const ioBalance = await dataProvider.getContractBalanceForWallet(
      arnsContractId,
      await wallet.getWalletAddress(),
    );
    const arBalance = await wallet.getWalletBalanceAR();
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
        setWalletCopied(false);
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
      navigate('/');
    } catch (error: any) {
      console.error(error);
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
                      key={key}
                      onClick={() => {
                        setShowMenu(false);
                      }}
                    />
                  );
              })}
              <ConnectButton />
            </>
          ) : (
            <>
              <div className="flex-row flex-space-between">
                <span className="navbar-link hover">{`${walletAddress.slice(
                  0,
                  6,
                )}...${walletAddress.slice(-6)}`}</span>
                {!walletCopied ? (
                  <CopyIcon
                    style={{
                      height: '24px',
                      width: '24px',
                      fill: 'white',
                      cursor: 'pointer',
                    }}
                    onClick={async () => {
                      await navigator.clipboard.writeText(walletAddress);
                      setWalletCopied(true);
                      setTimeout(() => {
                        setWalletCopied(false);
                      }, 2000);
                    }}
                  />
                ) : (
                  <span style={{ color: 'white' }}>&#10004;</span>
                )}
              </div>
              {isMobile
                ? Object.entries(ROUTES).map(([key, route]) => {
                    if (!route.index && (!route.protected || walletAddress))
                      return (
                        <NavBarLink
                          path={route.path}
                          linkText={route.text}
                          key={key}
                          onClick={() => {
                            setShowMenu(false);
                          }}
                        />
                      );
                  })
                : Object.entries(ROUTES).map(([key, route]) => {
                    if (route.protected && walletAddress)
                      return (
                        // TODO: add menu icons
                        <NavBarLink
                          path={route.path}
                          linkText={route.text}
                          key={key}
                          onClick={() => {
                            setShowMenu(false);
                          }}
                        />
                      );
                  })}
              {Object.entries(walletDetails).map(([key, value]) => {
                return (
                  <span
                    key={key}
                    className="flex-row flex-space-between navbar-link hover"
                  >
                    <span>{key} Balance</span>
                    {value ? (
                      <span className="faded">{value}</span>
                    ) : (
                      // TODO: add error icon with hover for error details
                      <Loader size={20} />
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
