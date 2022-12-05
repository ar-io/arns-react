import { Dispatch, SetStateAction } from 'react';

import './styles.css';

function MenuButton({
  show,
  setShow,
  icon,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  icon: JSX.Element;
}): JSX.Element {
  return (
    <>
      <button
        className={!show ? 'roundButton' : 'roundButton whiteBackground'}
        onClick={() => setShow(!show)}
      >
        {icon}
      </button>
    </>
  );
}

export default MenuButton;
