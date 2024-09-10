import { Tooltip } from 'antd';

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
  trigger = 'hover',
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
          className="button popup-option center hover"
          onClick={option.onClick}
          style={{ textAlign: align }}
        >
          {option.title}
        </button>
      ))}
    </div>
  );

  return (
    <Tooltip
      open={undefined}
      placement="bottomRight"
      color="var(--card-bg)"
      autoAdjustOverflow
      arrow={false}
      overlayInnerStyle={{
        width: 'fit-content',
        border: '1px solid var(--text-faded)',
        padding: '9px 12px',
      }}
      overlayStyle={{ width: 'fit-content' }}
      trigger={trigger as any}
      title={popupContents}
    >
      {children}
    </Tooltip>
  );
};
export default Popup;
