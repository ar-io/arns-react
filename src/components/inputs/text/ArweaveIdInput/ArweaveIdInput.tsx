import { CSSProperties, useState } from 'react';

import { useArweaveCompositeProvider } from '../../../../hooks';
import {
  ArweaveTransactionID,
  VALIDATION_INPUT_TYPES,
} from '../../../../types';
import { isArweaveTransactionID } from '../../../../utils';
import ValidationInput from '../ValidationInput/ValidationInput';

function ArweaveIdInput({
  arweaveIdCallback,
  isValidCallback,
  placeholder,
  wrapperStyle,
  inputStyle,
  beforeElement,
  afterElement,
  id = 'arweave-id-input',
}: {
  arweaveIdCallback: (arweaveId: ArweaveTransactionID) => void;
  isValidCallback?: (isValid: boolean) => void;
  placeholder?: string;
  wrapperStyle?: CSSProperties;
  inputStyle?: CSSProperties;
  beforeElement?: JSX.Element;
  afterElement?: JSX.Element;
  id?: string;
}) {
  const arweaveDataProvider = useArweaveCompositeProvider();
  const [text, setText] = useState('');

  function handleChange(value: string) {
    setText(value);
    if (isArweaveTransactionID(value)) {
      arweaveIdCallback(new ArweaveTransactionID(value));
    }
  }

  return (
    <div className="name-token-input-wrapper" style={wrapperStyle}>
      {beforeElement}
      <ValidationInput
        inputId={id}
        value={text}
        setValue={(v: string) => handleChange(v)}
        wrapperCustomStyle={{
          width: '100%',
          hieght: '45px',
          borderRadius: '0px',
          backgroundColor: 'var(--card-bg)',
          boxSizing: 'border-box',
        }}
        inputClassName={`white name-token-input`}
        inputCustomStyle={inputStyle}
        validityCallback={(valid: boolean) =>
          isValidCallback ? isValidCallback(valid) : null
        }
        maxLength={43}
        placeholder={placeholder ?? 'Arweave Transaction ID'}
        validationPredicates={{
          [VALIDATION_INPUT_TYPES.ARWEAVE_ID]: {
            fn: (id: string) => arweaveDataProvider.validateArweaveId(id),
          },
        }}
        showValidationChecklist={false}
        showValidationIcon={true}
      />
      {afterElement}
    </div>
  );
}

export default ArweaveIdInput;
