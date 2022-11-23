import { Dispatch, SetStateAction } from 'react';

import { MenuIcon } from '../../../icons/index.js';
import './styles.css';

function MenuButton({
  show,
  setShow,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
}): JSX.Element {
  return (
    <>
      <button onClick={() => setShow(!show)}>
        <MenuIcon width={'24px'} height={'24px'} fill={'var(--text-white)'} />
      </button>
    </>
  );
}

export default MenuButton;
