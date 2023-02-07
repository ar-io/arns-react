import { useState } from 'react';

import { ValidationObject } from '../../../../types';
import ValidationList from '../../../cards/ValidationList/ValidationList';

function ValidationInput({
  wrapperClassName,
  wrapperCustomStyle,
  showValidationChecklist,
  inputClassName,
  inputCustomStyle,
  placeholder,
  disabled,
  maxLength,
  value,
  setValue,
  setIsValid,
  validationPredicate,
}: {
  wrapperClassName?: string;
  wrapperCustomStyle?: any;
  showValidationChecklist?: boolean;
  placeholder?: string;
  maxLength?: number;

  inputClassName?: string;
  inputCustomStyle?: any;
  disabled?: boolean; // disables input
  value: string;
  setValue: (text: string) => void;
  setIsValid: (validity: boolean) => void;
  validationPredicate: ((id: string) => Promise<ValidationObject>)[];
}) {
  const [validationResults, setValdidationResults] =
    useState<ValidationObject[]>();

  async function validationExecutor(id: string) {
    setValue(id);
    const validationResult: Promise<ValidationObject>[] = [];
    validationPredicate.forEach((predicate) => {
      validationResult.push(predicate(id));
    });
    const results = await Promise.all(validationResult);
    setValdidationResults(results);
    setIsValid(results.every((value) => value.status == true));
  }

  return (
    <>
      <div
        className={wrapperClassName ? wrapperClassName : ''}
        style={wrapperCustomStyle ? { ...wrapperCustomStyle } : {}}
      >
        <input
          type="text"
          className={inputClassName}
          maxLength={maxLength ? maxLength : undefined}
          placeholder={placeholder ? placeholder : ''}
          value={value}
          onChange={(e) => validationExecutor(e.target.value)}
          disabled={disabled ? disabled : false}
          style={inputCustomStyle ? { ...inputCustomStyle } : {}}
        />

        {showValidationChecklist && validationResults ? (
          <ValidationList validations={validationResults} />
        ) : (
          <></>
        )}
      </div>
    </>
  );
}

export default ValidationInput;
