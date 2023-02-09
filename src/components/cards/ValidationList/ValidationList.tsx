import { useIsMobile } from '../../../hooks/';
import { ValidationObject } from '../../../types';
import { CircleCheck, CircleXIcon } from '../../icons';

function ValidationList({ validations }: { validations: ValidationObject[] }) {
  const isMobile = useIsMobile();
  return (
    <>
      {/* WIP: waiting on final design from lucas */}
      <div
        className={!isMobile ? 'flex flex-column' : 'flex flex-column center'}
        style={{
          gap: isMobile ? '0.5em' : '1em',
          position: !isMobile ? 'absolute' : 'unset',
          left: !isMobile ? '103%' : 'unset',
          paddingTop: !isMobile ? '7%' : 'unset',
        }}
      >
        {validations?.map((validationItem: ValidationObject, index: number) => (
          <span
            key={index}
            className="flex flex-left text white"
            style={{ gap: '2px', alignItems: 'center' }}
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
        ))}
      </div>
    </>
  );
}

export default ValidationList;
