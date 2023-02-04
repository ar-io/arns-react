import { useEffect } from 'react';

import { ArweaveTransactionID } from '../../../../types';
import {
  ARNS_TX_ID_ENTRY_REGEX,
  ARNS_TX_ID_REGEX,
} from '../../../../utils/constants';

const validityObject = {
  'Is a transaction ID': {
    result: undefined, // success, error, warning, loading (validating), undefined (grey icon)
    error: '', // error messages from validation function - tooltip to view error
  },
  'Has approved contract source code': {
    result: undefined,
    error: '',
  },
  'Has 50 confirmations': {
    result: undefined,
    error: '',
  },
  'Is owned by user': {
    result: undefined,
    error: '',
  },
};

function ArweaveTransactionIdInput({
  className,
  disabled,
  value,
  setValue,
  setValidation,
  setIsValid,
  customStyle,
  placeholder,
}: {
  className?: string;
  disabled?: boolean;
  value: string;
  setValue: (text: string) => void;
  setValidation: (validation: any) => void;
  setIsValid: (validity: boolean) => void;
  customStyle?: any;
  placeholder?: string;
}) {
  useEffect(() => {
    setValidation([
      // set default validations on load
      {
        'Is a transaction ID': {
          result: undefined,
          error: '',
        },
      },
    ]);
  }, []);

  function handleChange(id: string) {
    if (!id) {
      setIsValid(false);
      setValue('');
      return setValidation([
        {
          'Is a transaction ID': {
            result: undefined,
            error: '',
          },
        },
      ]);
    }
    setValidation([
      {
        'Is a transaction ID': {
          result: 'loading',
          error: '',
        },
      },
    ]);

    try {
      if (!ARNS_TX_ID_ENTRY_REGEX.test(id)) {
        throw Error('Invalid character entry');
      }
      setValue(id);
      const txid = new ArweaveTransactionID(id);
      setValue(txid.toString());
      setValidation([
        // default validations
        {
          'Is a transaction ID': {
            result: 'success',
            error: '',
          },
        },
      ]);
      setIsValid(true);
    } catch (error) {
      setIsValid(false);
      setValidation([
        // default validations
        {
          'Is a transaction ID': {
            result: 'error',
            error: error,
          },
        },
      ]);
    }

    return;
  }

  return (
    <>
      <input
        type="text"
        className={className ? className : ''}
        maxLength={43}
        pattern={ARNS_TX_ID_REGEX.source}
        placeholder={placeholder ? placeholder : ''}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled ? disabled : false}
        style={customStyle ? { ...customStyle } : {}}
      />
    </>
  );
}

export default ArweaveTransactionIdInput;
