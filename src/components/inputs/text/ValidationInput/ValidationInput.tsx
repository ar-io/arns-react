import { Tooltip } from 'antd';
import {
  ChangeEvent,
  InputHTMLAttributes,
  forwardRef,
  useEffect,
  useState,
} from 'react';

import { ValidationObject } from '../../../../types';
import ValidationList from '../../../cards/ValidationList/ValidationList';
import { AlertTriangleIcon, CircleCheck, CircleXIcon } from '../../../icons';
import { Loader } from '../../../layout';

interface ValidationInputProps extends InputHTMLAttributes<HTMLInputElement> {
  customPattern?: RegExp;
  catchInvalidInput?: boolean;
  wrapperClassName?: string;
  wrapperCustomStyle?: any;
  showValidationChecklist?: boolean;
  showValidationsDefault?: boolean;
  showValidationOutline?: boolean;
  showValidationErrors?: boolean;
  showValidationIcon?: boolean;
  placeholder?: string;
  maxCharLength?: number | ((length: string) => boolean);
  inputId?: string;
  inputClassName?: string;
  inputCustomStyle?: any;
  validationListStyle?: any;
  disabled?: boolean; // disables input
  value: string | number;
  setValue: (text: string) => void;
  validityCallback?: (validity: boolean) => void;
  validationPredicates?: {
    [x: string]: {
      fn: (value: any) => Promise<any>;
      required?: boolean;
    };
  };
  onClick?: () => void;
  inputType?: string;
  minNumber?: number;
  maxNumber?: number;
  onPressEnter?: () => void;
  customValidationIcons?: { error?: JSX.Element; success?: JSX.Element };
}

const ValidationInput = forwardRef<HTMLInputElement, ValidationInputProps>(
  (
    {
      customPattern,
      catchInvalidInput = false,
      wrapperClassName = '',
      wrapperCustomStyle,
      validationListStyle,
      showValidationChecklist = false,
      showValidationsDefault = false,
      showValidationOutline = false,
      showValidationIcon = false,
      showValidationErrors = false,
      inputClassName = '',
      inputId = '',
      inputCustomStyle,
      placeholder = '',
      disabled = false,
      maxCharLength,
      value,
      setValue,
      validityCallback,
      validationPredicates,
      onClick = () => ({}),
      inputType = 'text',
      minNumber,
      maxNumber,
      onPressEnter,
      customValidationIcons,
    },
    ref,
  ) => {
    const [validationResults, setValidationResults] =
      useState<ValidationObject[]>();

    const [validating, setValidating] = useState(false);
    const [valid, setValid] = useState<undefined | boolean>(undefined);
    const [warning, setWarning] = useState(false);
    const [openTooltip, setOpenTooltip] = useState(false);

    useEffect(() => {
      validationExecutor(value?.toString() ?? '');
    }, [disabled, value]);

    async function validationExecutor(
      e: ChangeEvent<HTMLInputElement> | string,
    ) {
      let newValue = '';

      if (typeof e === 'object') {
        e.preventDefault();
        newValue = e.target.value;
      } else if (typeof e === 'string') {
        newValue = e;
      }

      if (!newValue.length) {
        setValid(undefined);
        setValidationResults([]);
        setValue(newValue);
        return;
      }

      // if maxLength is a callback function, we need to pass the value to it and check if it returns true
      if (maxCharLength) {
        switch (typeof maxCharLength) {
          case 'number':
            if (newValue.trim().length > maxCharLength) {
              return;
            }
            break;
          case 'function':
            if (!maxCharLength(newValue.trim())) {
              return;
            }
            break;
        }
      }
      if (customPattern && catchInvalidInput) {
        if (!customPattern.test(newValue)) {
          return;
        }
      }
      if (!validationPredicates) return;

      setValidating(true);
      setValue(newValue);

      const validations = Object.values(validationPredicates).map((predicate) =>
        predicate.fn(newValue),
      );

      const results = await Promise.allSettled(validations);

      const validationResults: ValidationObject[] = results.map(
        (
          result: PromiseFulfilledResult<any> | PromiseRejectedResult,
          index,
        ) => {
          return {
            name: Object.keys(validationPredicates)[index],
            status: result.status !== 'rejected',
            error:
              result.status === 'rejected' && showValidationErrors
                ? result?.reason
                : undefined,
          };
        },
      );

      setValidationResults(validationResults);
      const validity = validationResults.every((value, index) => {
        if (
          validationPredicates[Object.keys(validationPredicates)[index]]
            .required === false
        ) {
          setWarning(true);
          return true;
        }
        return value.status === true;
      });
      setValid(validity);
      if (validityCallback) {
        validityCallback(validity);
      }
      setValidating(false);
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
              data-testid={inputId}
              spellCheck={false}
              ref={ref}
              onKeyDown={(e) =>
                e.key === 'Enter' && onPressEnter ? onPressEnter() : null
              }
              enterKeyHint={inputType === 'search' ? inputType : 'enter'}
              id={inputId}
              type={inputType}
              min={inputType === 'number' ? minNumber : undefined}
              max={inputType === 'number' ? maxNumber : undefined}
              className={inputClassName}
              placeholder={placeholder}
              value={value}
              onChange={(e) => validationExecutor(e)}
              disabled={disabled}
              style={
                showValidationOutline &&
                valid !== undefined &&
                value &&
                !disabled
                  ? {
                      ...inputCustomStyle,
                      border: warning
                        ? '1px solid var(--accent)'
                        : valid === true
                        ? '1px solid var(--success-green)'
                        : '1px solid var(--error-red)',
                    }
                  : { ...inputCustomStyle }
              }
              pattern={customPattern?.source}
            />
            <div
              className="flex center"
              style={{
                position: 'absolute',
                right: '10px',
                top: '0px',
                bottom: '0px',
                display: 'flex',
              }}
              onFocus={() => {
                return;
              }}
              onMouseOver={() => setOpenTooltip(true)}
              onMouseLeave={() => setOpenTooltip(false)}
            >
              <Tooltip
                open={
                  showValidationChecklist &&
                  openTooltip &&
                  validationResults!.length > 0
                }
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
                  validating ? (
                    <Loader
                      size={20}
                      color="var(--text-grey)"
                      wrapperStyle={{
                        top: 0,
                        bottom: 0,
                        left: -40,
                        position: 'absolute',
                      }}
                    />
                  ) : warning ? (
                    <AlertTriangleIcon
                      width={20}
                      height={20}
                      fill={'var(--accent)'}
                    />
                  ) : valid === true ? (
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
          {(showValidationChecklist && validationResults) ||
          showValidationsDefault ? (
            <ValidationList
              validations={validationResults ?? []}
              wrapperCustomStyle={{ ...validationListStyle }}
              customErrorIcon={customValidationIcons?.error}
              customSuccessIcon={customValidationIcons?.success}
            />
          ) : (
            <></>
          )}
        </div>
      </>
    );
  },
);

ValidationInput.displayName = 'ValidationInput';

export default ValidationInput;
