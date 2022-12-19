import { useEffect, useRef, useState } from 'react';

import { useIsMobile, useWalletAddress } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { ArweaveWalletConnector } from '../../../types';
import { ROUTES } from '../../../utils/routes';
import { AccountIcon, CopyIcon, MenuIcon } from '../../icons';
import ConnectButton from '../../inputs/buttons/ConnectButton/ConnectButton';
import MenuButton from '../../inputs/buttons/MenuButton/MenuButton';
import NavBarLink from '../../layout/Navbar/NavBarLink/NavBarLink';
import './styles.css';

function NavMenuCard() {
  const [{ wallet }, dispatchGlobalState] = useGlobalState();
  const [showMenu, setShowMenu] = useState(false);
  const [walletDetails, setWalletDetails] = useState({});
  const [walletCopied, setWalletCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const walletAddress = useWalletAddress();
  useEffect(() => {
    if (!menuRef.current) {
      return;
    }
    document.addEventListener('mousedown', handleClickOutside);

    if (wallet) {
      fetchWalletDetails(wallet);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef, showMenu, wallet]);

  async function fetchWalletDetails(wallet: ArweaveWalletConnector) {
    const arBalance = await wallet.getWalletBalanceAR();
    const formattedBalance = Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 2,
      compactDisplay: 'short',
    }).format(+arBalance);
    setWalletDetails({
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
      dispatchGlobalState({
        type: 'setWallet',
        payload: undefined,
      });
    } catch (error: any) {
      console.error(error);
    }
  }

  return (
    <>
      <MenuButton
        setShow={setShowMenu}
        show={showMenu}
        icon={
          walletAddress ? (
            <AccountIcon
              width={'24px'}
              height={'24px'}
              fill={showMenu ? 'var(--text-black)' : 'var(--text-white)'}
            />
          ) : (
            <MenuIcon
              width={'24px'}
              height={'24px'}
              fill={showMenu ? 'var(--text-black)' : 'var(--text-white)'}
            />
          )
        }
      />
      {showMenu ? (
        <div className="card menu" ref={menuRef}>
          {isMobile ? (
            Object.entries(ROUTES).map(([key, route]) => {
              if (!route.index && (!route.protected || walletAddress))
                return (
                  <NavBarLink
                    path={route.path}
                    linkText={route.text}
                    key={key}
                  />
                );
            })
          ) : (
            <></>
          )}
          {!walletAddress || !wallet ? (
            <ConnectButton />
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
              {Object.entries(walletDetails).map(([key, value]) => {
                return (
                  <span
                    key={key}
                    className="flex-row flex-space-between navbar-link hover"
                  >
                    <span>{key}</span>
                    <span className="faded">{value as string}</span>
                  </span>
                );
              })}
              {
                <button
                  className="navbar-link hover"
                  onClick={logout}
                  style={{
                    cursor: 'pointer',
                    padding: '0px',
                  }}
                >
                  Log Out
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
