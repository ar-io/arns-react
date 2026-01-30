import { Popover } from '@src/components/ui/Popover';

type PopupProps = {
  trigger?: string;
  title?: string;
  align?: 'right' | 'left';
  popupMenuOptions: PopupMenuOption[];
  children?: JSX.Element;
};

export type PopupMenuOption = {
  title: string;
  onClick: () => any;
};

export const Popup: React.FunctionComponent<PopupProps> = ({
  align = 'right',
  popupMenuOptions,
  title,
  children,
}: PopupProps) => {
  const popupContents = (
    <div
      className={`flex-column flex ${
        align === 'right' ? 'flex-right' : 'flex-left'
      }`}
      style={{ gap: '10px' }}
    >
      {title ? <div className="popup-title">{title}</div> : null}
      {popupMenuOptions.map((option) => (
        <button
          key={option.title}
          className="button popup-option text-center justify-center items-center hover"
          onClick={option.onClick}
          style={{ textAlign: align }}
        >
          {option.title}
        </button>
      ))}
    </div>
  );

  return (
    <Popover
      content={popupContents}
      side="bottom"
      align="end"
      contentClassName="p-3"
    >
      {children}
    </Popover>
  );
};
export default Popup;
