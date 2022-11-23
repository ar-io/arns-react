import { useEffect, useRef, useState } from 'react';

import { useStateValue } from '../../../state/state';
import { ROUTES } from '../../../utils/routes';
import ConnectButton from '../../inputs/buttons/ConnectButton/ConnectButton';
import MenuButton from '../../inputs/buttons/MenuButton/MenuButton';
import NavBarLink from '../../layout/Navbar/NavBarLink/NavBarLink';
import './styles.css';

function NavMenuCard() {
  const [{ walletAddress }] = useStateValue();
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
      <MenuButton setShow={setShowMenu} show={showMenu} />
      {showMenu ? (
        <div className="card" ref={menuRef}>
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
