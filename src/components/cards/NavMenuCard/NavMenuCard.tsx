import { useEffect, useRef, useState } from 'react';

import { useIsMobile } from '../../../hooks/index.js';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { ArweaveWalletConnector } from '../../../types.js';
import { ROUTES } from '../../../utils/routes';
import { AccountIcon, MenuIcon } from '../../icons';
import ConnectButton from '../../inputs/buttons/ConnectButton/ConnectButton';
import MenuButton from '../../inputs/buttons/MenuButton/MenuButton';
import NavBarLink from '../../layout/Navbar/NavBarLink/NavBarLink';
import './styles.css';

function NavMenuCard() {
  const [{ walletAddress, wallet }, dispatchGlobalState] = useGlobalState();
  const [showMenu, setShowMenu] = useState(false);
  const [walletDetails, setWalletDetails] = useState({});
  const menuRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  useEffect(() => {
    if (!menuRef.current) {
      return;
    }
    document.addEventListener('mousedown', handleClickOutside);

    if (wallet) {
      fetchWalletDetails(wallet!);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef, showMenu, wallet]);

  async function fetchWalletDetails(wallet: ArweaveWalletConnector) {
    const arBalance = await wallet.getWalletBalanceAR();
    console.log('AR balance', arBalance);
    setWalletDetails({
      AR: arBalance,
    });
  }

  function handleClickOutside(e: any) {
    e.preventDefault();
    if (
      menuRef.current &&
      e.target !== menuRef.current &&
      menuRef.current.contains(e.target)
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
      dispatchGlobalState({
        type: 'setWalletAddress',
        payload: undefined,
      });
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
              <span className="navbar-link">{`${walletAddress.slice(
                0,
                3,
              )}...${walletAddress.slice(-3)}`}</span>
              {Object.entries(walletDetails).map(([key, value]) => {
                return (
                  <span
                    className="navbar-link"
                    key={key}
                  >{`${key}: ${value}`}</span>
                );
              })}
              {
                <button
                  className="navbar-link"
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
