import { useIsMobile } from '../../../hooks/';
import { ValidationObject } from '../../../types';
import { CircleCheck, CircleXIcon } from '../../icons';

function ValidationList({
  validations,
  wrapperCustomStyle,
}: {
  validations: ValidationObject[];
  wrapperCustomStyle?: any;
}) {
  const isMobile = useIsMobile();
  return (
    <>
      {/* WIP: waiting on final design from lucas */}
      <div
        className={!isMobile ? 'flex flex-column' : 'flex flex-column left'}
        style={{ ...wrapperCustomStyle, zIndex: '1001' }}
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
            }}
          >
            <span
              className="flex"
              style={{
                gap: '15px',
                alignItems: 'center',
              }}
            >
              {validationItem.status ? (
                <CircleCheck
                  width={20}
                  height={20}
                  fill={'var(--success-green)'}
                />
              ) : (
                <CircleXIcon width={20} height={20} fill={'var(--error-red)'} />
              )}
              {validationItem.name}
            </span>
            {validationItem.error ? (
              <span
                className="flex faded center"
                style={{
                  gap: '15px',
                  alignItems: 'center',
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
    </>
  );
}

export default ValidationList;
