import { XIcon } from 'lucide-react';
import { ReactNode } from 'react';

export function Pill({
  children = <></>,
  className,
  closeIcon = (
    <XIcon
      className="bg-error rounded-full text-black"
      height={'0.75rem'}
      width={'0.75rem'}
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
        ` flex flex-row rounded-full bg-grey-gradient py-[0.125rem] items-center justify-center px-[0.625rem] max-w-fit h-fit shadow backdrop-blur-[0.199375rem]`
      }
      style={{ gap: '0rem' }}
    >
      {children}
      {onClose && (
        <button
          onClick={onClose}
          className={
            (closeButtonClass ?? '') +
            ` flex flex-row w-fit h-fit pl-[0.425rem]`
          }
        >
          {closeIcon}
        </button>
      )}
    </div>
  );
}
