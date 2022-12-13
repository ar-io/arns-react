import { useEffect, useRef, useState } from 'react';

import { useGlobalState } from '../../../state/contexts/GlobalState';
import { ROUTES } from '../../../utils/routes';
import { AccountIcon, MenuIcon } from '../../icons';
import ConnectButton from '../../inputs/buttons/ConnectButton/ConnectButton';
import MenuButton from '../../inputs/buttons/MenuButton/MenuButton';
import NavBarLink from '../../layout/Navbar/NavBarLink/NavBarLink';
import './styles.css';

function NavMenuCard() {
  const [{ walletAddress }] = useGlobalState();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuRef.current) {
      return;
    }
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef, showMenu]);

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
          {Object.entries(ROUTES).map(([key, route]) => {
            if (!route.index && (!route.protected || walletAddress))
              return (
                <NavBarLink path={route.path} linkText={route.text} key={key} />
              );
          })}
          {!walletAddress ? <ConnectButton /> : <></>}
        </div>
      ) : (
        <></>
      )}
    </>
  );
}

export default NavMenuCard;
