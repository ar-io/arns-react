import { useState } from 'react';

import { VALIDATION_INPUT_TYPES } from '../../../../types';
import {
  AlertCircle,
  AlertOctagonIcon,
  AlertTriangleIcon,
  CircleCheck,
} from '../../../icons';
import { Loader } from '../../../layout';
import { Tooltip } from '../../../layout/Tooltip/Tooltip';
import ArweaveTransactionIdInput from '../ArweavetransactionIdInput/ArweavetransactionIdInput';

function ValidationInput({
  inputType,
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
  setErrors,
}: {
  wrapperClassName?: string;
  wrapperCustomStyle?: any;
  inputType: VALIDATION_INPUT_TYPES;
  showValidationChecklist?: boolean;
  placeholder?: string;

  inputClassName?: string;
  inputCustomStyle?: any;
  disabled?: boolean; // disables input
  value: string;
  setValue: (text: string) => void;
  setIsValid: (validity: boolean) => void;
  setErrors?: (errors: Error[]) => void;
}) {
  const [validationChecklist, setValidationChecklist] = useState([<></>]);

  function updateValidationList(validations: any) {
    const newElements = validations.map(
      (
        validationItem: { [x: string]: { result: string; error: any } },
        index: number,
      ) => {
        const title = Object.keys(validationItem);
        const results = Object.values(validationItem);
        switch (results[0].result) {
          case 'success': {
            return (
              <>
                <Tooltip key={index} message={'Success!'}>
                  <span className="flex flex-row text flex-left white bold">
                    <CircleCheck
                      width={20}
                      height={20}
                      fill={'var(--success-green)'}
                    />
                    {title}
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

          case 'error': {
            return (
              <>
                <Tooltip key={index} message={results[0].error.message}>
                  <span className="flex flex-row text flex-left white bold">
                    <AlertCircle
                      width={20}
                      height={20}
                      fill={'var(--error-red)'}
                    />
                    {Object.keys(validationItem)}
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

          case 'warning': {
            return (
              <>
                <Tooltip key={index} message={results[0].error.message}>
                  <span className="flex flex-row text flex-left white bold">
                    <AlertTriangleIcon
                      width={20}
                      height={20}
                      fill={'var(--accent)'}
                    />
                    {Object.keys(validationItem)}
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

          case 'loading': {
            return (
              <>
                <Tooltip key={index} message={'Validating...'}>
                  <span className="flex flex-row text flex-left white bold">
                    <Loader size={15} />
                    {Object.keys(validationItem)}
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

          case undefined: {
            return (
              <>
                <Tooltip key={index} message={'Awaiting Validation...'}>
                  <span
                    className="flex flex-row text flex-left white bold"
                    style={{ width: '100%' }}
                  >
                    <AlertOctagonIcon
                      width={'20px'}
                      height={'20px'}
                      fill={'var(--text-faded)'}
                    />
                    {Object.keys(validationItem)}
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
            return;
        }
      },
    );
    return setValidationChecklist(newElements);
  }

  return (
    <>
      <div
        className={wrapperClassName ? wrapperClassName : ''}
        style={wrapperCustomStyle ? { ...wrapperCustomStyle } : {}}
      >
        {inputType === VALIDATION_INPUT_TYPES.ARWEAVE_ID ? (
          <ArweaveTransactionIdInput
            className={inputClassName}
            customStyle={inputCustomStyle}
            value={value}
            setValue={setValue}
            disabled={disabled}
            setValidation={(e: any) => updateValidationList(e)}
            placeholder={placeholder ? placeholder : ''}
            setIsValid={setIsValid}
          />
        ) : (
          <></>
        )}

        {/* {inputType === VALIDATION_INPUT_TYPES.ARWEAVE_ADDRESS ? <ArweaveAddressInput /> :<></>}

            {inputType === VALIDATION_INPUT_TYPES.ARNS_NAME ? <ArnsNameInput /> : <></>}

            {inputType === VALIDATION_INPUT_TYPES.UNDERNAME ? <UndernameInput /> : <></>}

            {inputType === VALIDATION_INPUT_TYPES.ANT_CONTRACT_ID ? <AntContractIdInput /> : <></>} */}

        {showValidationChecklist ? (
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
        ) : (
          <></>
        )}
      </div>
    </>
  );
}

export default ValidationInput;
