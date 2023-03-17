import { useEffect, useState } from 'react';

import { ValidationObject } from '../../../../types';
import ValidationList from '../../../cards/ValidationList/ValidationList';

function ValidationInput({
  wrapperClassName = '',
  wrapperCustomStyle,
  validationListStyle,
  showValidationChecklist,
  inputClassName = '',
  inputId = '',
  inputCustomStyle,
  placeholder = '',
  disabled = false,
  maxLength,
  value,
  setValue,
  setIsValid,
  validationPredicates,
  onClick,
}: {
  wrapperClassName?: string;
  wrapperCustomStyle?: any;
  showValidationChecklist?: boolean;
  placeholder?: string;
  maxLength?: number;
  inputId?: string;
  inputClassName?: string;
  inputCustomStyle?: any;
  validationListStyle?: any;
  disabled?: boolean; // disables input
  value: string | number | undefined;
  setValue: (text: string) => void;
  setIsValid?: (validity: boolean) => void;
  validationPredicates: { [x: string]: (value: string) => Promise<any> };
  onClick?: () => void;
}) {
  const [validationResults, setValidationResults] =
    useState<ValidationObject[]>();

  useEffect(() => {
    const inputEle = document.getElementById(inputId);
    inputEle?.focus();
  }, [disabled]);

  async function validationExecutor(id: string) {
    setValue(id);

    const validations = Object.values(validationPredicates).map((predicate) =>
      predicate(id),
    );

    const results = await Promise.allSettled(validations);

    const validationResults: ValidationObject[] = results.map(
      (result: PromiseFulfilledResult<any> | PromiseRejectedResult, index) => {
        return {
          name: Object.keys(validationPredicates)[index],
          status: result.status !== 'rejected',
          error: result.status === 'rejected' ? result?.reason : undefined,
        };
      },
    );

    setValidationResults(validationResults);
    if (setIsValid) {
      setIsValid(validationResults.every((value) => value.status === true));
    }
  }

  return (
    <>
      {/* eslint-disable-next-line */}
      <div
        className={wrapperClassName}
        style={{ ...wrapperCustomStyle }}
        onClick={onClick ? () => onClick() : undefined}
      >
        <input
          id={inputId}
          type="text"
          className={inputClassName}
          maxLength={maxLength}
          placeholder={placeholder}
          value={value}
          onChange={(e) => validationExecutor(e.target.value)}
          disabled={disabled}
          style={{ ...inputCustomStyle }}
        />

        {showValidationChecklist && validationResults ? (
          <ValidationList
            validations={validationResults}
            wrapperCustomStyle={{ ...validationListStyle }}
          />
        ) : (
          <></>
        )}
      </div>
    </>
  );
}

export default ValidationInput;
