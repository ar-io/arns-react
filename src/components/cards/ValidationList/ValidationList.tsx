import { ValidationObject } from '../../../types';
import { CircleCheck, CircleXIcon } from '../../icons';

function ValidationList({ validations }: { validations: ValidationObject[] }) {
  return (
    <>
      {/* WIP: waiting on final design from lucas */}
      <div
        className="flex flex-row"
        style={{
          height: 'fit-content',
          width: 'fit-content',
          minHeight: '0',
          minWidth: '0',
          gap: '1em',
        }}
      >
        {validations?.map((validationItem: ValidationObject, index: number) => (
          <span key={index} className="flex center text white bold">
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
