import { Dispatch, SetStateAction } from 'react';

import './styles.css';

function MenuButton({
  show,
  setShow,
  className,
  style,
  children,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  className?: string;
  style?: any;
  children?: JSX.Element;
}): JSX.Element {
  return (
    <>
      <button
        className={
          show ? `hover highlight-button ${className}` : `hover ${className}`
        }
        onClick={() => setShow(!show)}
        style={style}
      >
        {children}
      </button>
    </>
  );
}

export default MenuButton;
