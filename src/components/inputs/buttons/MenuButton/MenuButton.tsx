import { Dispatch, SetStateAction } from 'react';

import './styles.css';

function MenuButton({
  show,
  setShow,
  children,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  children?: JSX.Element;
}): JSX.Element {
  return (
    <>
      <button
        className={
          !show
            ? 'outline-button hover'
            : 'outline-button hover highlight-button'
        }
        onClick={() => setShow(!show)}
        style={{
          padding: '10px',
        }}
      >
        {children}
      </button>
    </>
  );
}

export default MenuButton;
