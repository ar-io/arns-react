import { useState } from 'react';

import { VALIDATION_INPUT_TYPES, ValidationObject } from '../../../../types';
import {
  ARNS_TX_ID_REGEX,
  VALIDATION_INPUT_PRESETS,
  VALIDATION_OBJECT,
} from '../../../../utils/constants';
import ValidationList from '../../../cards/ValidationList/ValidationList';

function ValidationInput({
  wrapperClassName,
  wrapperCustomStyle,
  showValidationChecklist,
  inputClassName,
  inputCustomStyle,
  placeholder,
  disabled,
  value,
  setValue,
  setIsValid,
  validationPredicate,
}: {
  wrapperClassName?: string;
  wrapperCustomStyle?: any;
  showValidationChecklist?: boolean;
  placeholder?: string;

  inputClassName?: string;
  inputCustomStyle?: any;
  disabled?: boolean; // disables input
  value: string;
  setValue: (text: string) => void;
  setIsValid: (validity: boolean) => void;
  validationPredicate: ((id: string) => Promise<ValidationObject>)[]; // todo validation object array
}) {
  const [validationResults, setValdidationResults] =
    useState<ValidationObject[]>();
  async function validationExecutor(id: string) {
    const validationResults = await Promise.all(
      validationPredicate.map((predicate) => predicate(id)),
    );
    console.log(validationResults);
    setValdidationResults(validationResults);
    setValue(id);
    setIsValid(validationResults.every((value) => value.status == true));
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
          maxLength={43}
          pattern={ARNS_TX_ID_REGEX.source}
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
