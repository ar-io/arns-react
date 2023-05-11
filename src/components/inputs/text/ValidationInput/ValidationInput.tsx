import { Tooltip } from 'antd';
import { useEffect, useState } from 'react';

import { ValidationObject } from '../../../../types';
import ValidationList from '../../../cards/ValidationList/ValidationList';
import { CircleCheck, CircleXIcon } from '../../../icons';

function ValidationInput({
  wrapperClassName = '',
  wrapperCustomStyle,
  validationListStyle,
  showValidationChecklist = false,
  showValidationOutline = false,
  showValidationIcon = false,
  inputClassName = '',
  inputId = '',
  inputCustomStyle,
  placeholder = '',
  disabled = false,
  maxLength,
  value,
  setValue,
  validityCallback,
  validationPredicates,
  onClick = () => ({}),
  inputType = 'text',
  minNumber,
  maxNumber,
}: {
  wrapperClassName?: string;
  wrapperCustomStyle?: any;
  showValidationChecklist?: boolean;
  showValidationOutline?: boolean;
  showValidationIcon?: boolean;
  placeholder?: string;
  maxLength?: number;
  inputId?: string;
  inputClassName?: string;
  inputCustomStyle?: any;
  validationListStyle?: any;
  disabled?: boolean; // disables input
  value: string | number | undefined;
  setValue: (text: string) => void;
  validityCallback?: (validity: boolean) => void;
  validationPredicates: {
    [x: string]: {
      fn: (value: string) => Promise<any>;
      required?: boolean;
      message?: string;
    };
  };
  onClick?: () => void;
  inputType?: string;
  minNumber?: number;
  maxNumber?: number;
}) {
  const [validationResults, setValidationResults] =
    useState<ValidationObject[]>();

  const [valid, setValid] = useState<undefined | boolean>(undefined);
  const [openTooltip, setOpenTooltip] = useState(false);

  useEffect(() => {
    const inputEle = document.getElementById(inputId);
    inputEle?.focus();
    if (value) {
      validationExecutor(value.toString());
    }
  }, [disabled]);

  async function validationExecutor(newValue: string) {
    setValue(newValue);

    const validations = Object.values(validationPredicates).map((predicate) =>
      predicate.fn(newValue),
    );

    const results = await Promise.allSettled(validations);

    const validationResults: ValidationObject[] = results.map(
      (result: PromiseFulfilledResult<any> | PromiseRejectedResult, index) => {
        return {
          name: Object.keys(validationPredicates)[index],
          message:
            validationPredicates[Object.keys(validationPredicates)[index]]
              .message,
          status: result.status !== 'rejected',
          error: result.status === 'rejected' ? result?.reason : undefined,
        };
      },
    );

    setValidationResults(validationResults);
    const validity = validationResults.every((value, index) => {
      if (
        validationPredicates[Object.keys(validationPredicates)[index]]
          .required === false
      ) {
        console.log(
          validationPredicates[Object.keys(validationPredicates)[index]],
        );
        return true;
      }
      return value.status === true;
    });
    setValid(validity);
    if (validityCallback) {
      validityCallback(validity);
    }
  }

  return (
    <>
      {/* eslint-disable-next-line */}
      <div
        id={'validation-input'}
        className={wrapperClassName}
        style={{ ...wrapperCustomStyle }}
        onClick={onClick ? () => onClick() : undefined}
      >
        <div className="flex" style={{ width: '100%', position: 'relative' }}>
          <input
            id={inputId}
            type={inputType}
            min={inputType === 'number' ? minNumber : undefined}
            max={inputType === 'number' ? maxNumber : undefined}
            className={inputClassName}
            maxLength={maxLength}
            placeholder={placeholder}
            value={value}
            onChange={(e) => validationExecutor(e.target.value)}
            disabled={disabled}
            style={
              showValidationOutline && valid !== undefined && value && !disabled
                ? {
                    ...inputCustomStyle,
                    border:
                      valid === true
                        ? '2px solid var(--success-green)'
                        : '2px solid var(--error-red)',
                  }
                : { ...inputCustomStyle }
            }
          />
          <div
            style={{
              position: 'absolute',
              right: '10px',
              top: '25%',
            }}
            onFocus={() => {
              return;
            }}
            onMouseOver={() => setOpenTooltip(true)}
            onMouseLeave={() => setOpenTooltip(false)}
          >
            <Tooltip
              open={openTooltip && validationResults!.length > 0}
              placement="right"
              autoAdjustOverflow={true}
              title={
                <ValidationList
                  validations={validationResults ?? []}
                  wrapperCustomStyle={{ gap: '1em' }}
                />
              }
            >
              {validationResults &&
              showValidationIcon &&
              valid !== undefined &&
              value ? (
                valid === true ? (
                  <CircleCheck
                    width={20}
                    height={20}
                    fill={'var(--success-green)'}
                  />
                ) : (
                  <CircleXIcon
                    width={20}
                    height={20}
                    fill={'var(--error-red)'}
                  />
                )
              ) : (
                <></>
              )}
            </Tooltip>
          </div>
        </div>
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
