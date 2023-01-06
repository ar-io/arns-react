import { Dispatch, SetStateAction } from 'react';

import './styles.css';

function MenuButton({
  show,
  setShow,
  style,
  children,
}: {
  show: boolean;
  style: any;
  setShow: Dispatch<SetStateAction<boolean>>;
  children: JSX.Element;
}): JSX.Element {
  return (
    <>
      <button
        className="outline-button hover"
        style={
          show
            ? {
                borderWidth: '2px',
                ...style,
              }
            : style
        }
        onClick={() => setShow(!show)}
      >
        {children}
      </button>
    </>
  );
}

export default MenuButton;
