import { InfoIcon } from '../../icons';

function WarningCard({
  showIcon = true,
  customIcon,
  text,
}: {
  text: JSX.Element | string;
  customIcon?: JSX.Element;
  showIcon?: boolean;
}) {
  return (
    <div
      className="warning-container flex flex-row"
      style={{
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        boxSizing: 'border-box',
        fontSize: 'inherit',
        gap: '10px',
      }}
    >
      {showIcon || customIcon ? (
        <span
          style={{
            height: '100%',
            display: 'flex',
            lineHeight: '150%',
          }}
        >
          {customIcon ? (
            customIcon
          ) : (
            <InfoIcon width={'24px'} height={'24px'} fill={'var(--accent)'} />
          )}
        </span>
      ) : (
        <></>
      )}
      <span>{text}</span>
    </div>
  );
}

export default WarningCard;
