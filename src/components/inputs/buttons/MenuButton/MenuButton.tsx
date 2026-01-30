import React, { forwardRef } from 'react';

import './styles.css';

interface MenuButtonProps {
  show: boolean;
  setShow?: (show: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
  children?: JSX.Element;
  onClick?: (e: React.MouseEvent) => void;
}

const MenuButton = forwardRef<HTMLButtonElement, MenuButtonProps>(
  ({ show, setShow, className, style, children, onClick, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={
          show ? `hover highlight-button ${className}` : `hover ${className}`
        }
        onClick={(e) => {
          onClick?.(e);
          setShow?.(!show);
        }}
        style={style}
        {...props}
      >
        {children}
      </button>
    );
  }
);

MenuButton.displayName = 'MenuButton';

export default MenuButton;
