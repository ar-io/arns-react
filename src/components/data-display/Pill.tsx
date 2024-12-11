import { XIcon } from 'lucide-react';
import { ReactNode } from 'react';

export function Pill({
  children = <></>,
  className,
  closeIcon = (
    <XIcon
      className="bg-error rounded-full text-black"
      height={'12px'}
      width={'12px'}
    />
  ),
  closeButtonClass,
  onClose,
}: {
  children: ReactNode;
  className?: string;
  closeIcon?: ReactNode;
  closeButtonClass?: string;
  onClose?: () => void;
}) {
  return (
    <div
      className={
        (className ?? '') +
        ` flex flex-row rounded-full bg-grey-gradient py-[2px] items-center justify-center px-[10px] max-w-fit h-fit shadow backdrop-blur-[3.19px]`
      }
      style={{ gap: '0px' }}
    >
      {children}
      <button
        onClick={onClose}
        className={(closeButtonClass ?? '') + ` flex flex-row w-fit h-fit pl-2`}
      >
        {closeIcon}
      </button>
    </div>
  );
}
