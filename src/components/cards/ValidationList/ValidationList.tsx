import { useIsMobile } from '../../../hooks/';
import { ValidationObject } from '../../../types';
import { CircleCheck, CircleXIcon } from '../../icons';

function ValidationList({
  validations,
  wrapperCustomStyle,
  customErrorIcon,
  customSuccessIcon,
}: {
  validations: ValidationObject[];
  wrapperCustomStyle?: any;
  customErrorIcon?: JSX.Element;
  customSuccessIcon?: JSX.Element;
}) {
  const isMobile = useIsMobile();
  return (
    <div
      className={!isMobile ? 'flex flex-column' : 'flex flex-column left'}
      style={{ fontSize: '12px', ...wrapperCustomStyle, zIndex: '1001' }}
    >
      {validations?.map((validationItem: ValidationObject, index: number) => (
        <span
          key={index}
          className="flex flex-column flex-left text white"
          style={{
            gap: '0px',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            width: 'fit-content',
            color: 'inherit',
            fontSize: 'inherit',
          }}
        >
          <span
            className="flex"
            style={{
              gap: '12px',
              alignItems: 'center',
              color: 'inherit',
              fontSize: 'inherit',
            }}
          >
            {validationItem.status
              ? customSuccessIcon ?? (
                  <CircleCheck
                    width={20}
                    height={20}
                    fill={'var(--success-green)'}
                  />
                )
              : customErrorIcon ?? (
                  <CircleXIcon
                    width={20}
                    height={20}
                    fill={'var(--error-red)'}
                  />
                )}
            {validationItem.name}
          </span>
          {validationItem.error ? (
            <span
              className="flex faded center"
              style={{
                gap: '15px',
                alignItems: 'center',
                fontSize: 'inherit',
              }}
            >
              {validationItem.error.toString()}
            </span>
          ) : (
            <></>
          )}
        </span>
      ))}
    </div>
  );
}

export default ValidationList;
