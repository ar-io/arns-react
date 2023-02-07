import { useEffect, useState } from 'react';

import { ValidationObject } from '../../../types';
import { AlertCircle, CircleCheck } from '../../icons';
import { Tooltip } from '../../layout';

function ValidationList({ validations }: { validations: ValidationObject[] }) {
  const [validationChecklist, setValidationChecklist] =
    useState<Array<JSX.Element | undefined>>();

  useEffect(() => {
    if (validations) {
      updateValidationList(validations);
    }
  }, [validations]);

  function updateValidationList(validations: ValidationObject[]) {
    const newElements = validations.map(
      (validationItem: ValidationObject, index: number) => {
        console.log(validationItem.status);

        switch (validationItem.status) {
          case true: {
            return (
              <>
                <Tooltip key={index} message={'Success!'}>
                  <span className="flex flex-row text flex-left white bold">
                    <CircleCheck
                      width={20}
                      height={20}
                      fill={'var(--success-green)'}
                    />
                    {validationItem.name}
                    <AlertCircle
                      width={'16px'}
                      height={'16px'}
                      fill={'var(--text-white)'}
                    />
                  </span>
                </Tooltip>
              </>
            );
          }

          case false: {
            return (
              <>
                <Tooltip key={index} message={validationItem.error}>
                  <span className="flex flex-row text flex-left white bold">
                    <AlertCircle
                      width={20}
                      height={20}
                      fill={'var(--error-red)'}
                    />
                    {validationItem.name}
                    <AlertCircle
                      width={'16px'}
                      height={'16px'}
                      fill={'var(--text-white)'}
                    />
                  </span>
                </Tooltip>
              </>
            );
          }
          default:
            return (
              <>
                <Tooltip key={index} message={validationItem.status}>
                  <span className="flex flex-row text flex-left white bold">
                    <AlertCircle
                      width={20}
                      height={20}
                      fill={'var(--text-faded)'}
                    />
                    Invalid Status Code
                    <AlertCircle
                      width={'16px'}
                      height={'16px'}
                      fill={'var(--text-white)'}
                    />
                  </span>
                </Tooltip>
              </>
            );
        }
      },
    );
    return setValidationChecklist(newElements);
  }

  return (
    <>
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
        {validationChecklist}
      </div>
    </>
  );
}

export default ValidationList;
