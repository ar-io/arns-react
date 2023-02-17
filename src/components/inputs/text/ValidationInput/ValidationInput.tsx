import { useState } from 'react';

import { ValidationObject } from '../../../../types';
import ValidationList from '../../../cards/ValidationList/ValidationList';

function ValidationInput({
  wrapperClassName,
  wrapperCustomStyle,
  validationListStyle,
  showValidationChecklist,
  inputClassName,
  inputCustomStyle,
  placeholder,
  disabled,
  maxLength,
  value,
  setValue,
  setIsValid,
  validationPredicates,
}: {
  wrapperClassName?: string;
  wrapperCustomStyle?: any;
  showValidationChecklist?: boolean;
  placeholder?: string;
  maxLength?: number;

  inputClassName?: string;
  inputCustomStyle?: any;
  validationListStyle?: any;
  disabled?: boolean; // disables input
  value: string;
  setValue: (text: string) => void;
  setIsValid: (validity: boolean) => void;
  validationPredicates: { [x: string]: (value: string) => Promise<any> };
}) {
  const [validationResults, setValidationResults] =
    useState<ValidationObject[]>();

  async function validationExecutor(id: string) {
    setValue(id);

    const validations = Object.values(validationPredicates).map((predicate) =>
      predicate(id),
    );

    const results = await Promise.allSettled(validations);

    console.log(results);

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
    setIsValid(validationResults.every((value) => value.status === true));
  }

  return (
    <>
      <div
        className={wrapperClassName ? wrapperClassName : ''}
        style={{ ...wrapperCustomStyle }}
      >
        <input
          type="text"
          className={inputClassName}
          maxLength={maxLength ? maxLength : undefined}
          placeholder={placeholder ? placeholder : ''}
          value={value}
          onChange={(e) => validationExecutor(e.target.value)}
          disabled={disabled ? disabled : false}
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
