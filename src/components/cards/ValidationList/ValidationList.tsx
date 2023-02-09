import { ValidationObject } from '../../../types';
import { CircleCheck, CircleXIcon } from '../../icons';

function ValidationList({ validations }: { validations: ValidationObject[] }) {
  return (
    <>
      {/* WIP: waiting on final design from lucas */}
      <div
        className="flex flex-column card flex-start"
        style={{
          padding: '1em',
          justifyContent: 'flex-start',
          height: 'fit-content',
          width: 'fit-content',
          minHeight: '0',
          minWidth: '0',
          gap: '1em',
        }}
      >
        {validations?.map((validationItem: ValidationObject) => (
          <span className="flex flex-row text flex-left white bold">
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
