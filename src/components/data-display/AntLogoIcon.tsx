import { useGlobalState } from '@src/state';
import { CSSProperties, useEffect, useRef, useState } from 'react';
import { ReactNode } from 'react-markdown';

import { HamburgerOutlineIcon } from '../icons';

export function AntLogoIcon({
  id,
  className,
  style,
  icon = (
    <HamburgerOutlineIcon
      width={'20px'}
      height={'20px'}
      fill="var(--text-white)"
    />
  ),
}: {
  id?: string;
  className?: string;
  icon?: ReactNode;
  style?: CSSProperties;
}) {
  const [{ gateway }] = useGlobalState();
  const [validImage, setValidImage] = useState(true);
  const logoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!logoRef.current || !id) return;

    const img = logoRef.current;
    setValidImage(true);

    const handleError = () => setValidImage(false);

    img.addEventListener('error', handleError);

    return () => {
      img.removeEventListener('error', handleError);
    };
  }, [logoRef, id]);

  if (!id) return <>{icon}</>;

  return (
    <>
      <img
        ref={logoRef}
        className={className ?? 'w-[30px] rounded-full'}
        src={`https://${gateway}/${id}`}
        alt="ant-logo"
        style={{ display: validImage ? 'block' : 'none', ...(style ?? {}) }}
      />
      {!validImage && icon}
    </>
  );
}
