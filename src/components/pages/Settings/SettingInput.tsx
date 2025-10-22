import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { isArweaveTransactionID } from '@src/utils';
import { Input } from 'antd';
import { RotateCcw } from 'lucide-react';
import { ReactNode } from 'react';

export interface SettingInputProps {
  label: string;
  value: string;
  placeholder: string;
  isValid: boolean;
  errorMessage?: string;
  displayValue?: ReactNode;
  onChange: (value: string) => void;
  onSet: () => void;
  onReset: () => void;
  onPressEnter?: (value: string) => void;
  disabled?: boolean;
  additionalContent?: ReactNode;
}

const CSS_CLASSES = {
  label:
    'flex flex-row flex-1 w-full bg-background rounded-md px-4 py-1 border border-primary-thin text-md text-light-grey',
  input: 'bg-foreground justify-center items-center outline-none',
  container:
    'flex flex-col gap-2 border border-primary-thin p-2 rounded-md bg-metallic-grey',
  setButton:
    'text-grey border-[0.5px] border-dark-grey rounded hover:border-white hover:text-white transition-all h-full flex w-fit py-1 px-3 rounded-sm text-xs font-semibold',
  resetButton: 'py-1 px-3 text-grey hover:text-white transition-all',
  error: 'text-color-error',
};

export function SettingInput({
  label,
  value,
  placeholder,
  isValid,
  errorMessage = 'Invalid value',
  displayValue,
  onChange,
  onSet,
  onReset,
  onPressEnter,
  disabled = false,
  additionalContent,
}: SettingInputProps) {
  return (
    <div className={CSS_CLASSES.container}>
      <div
        className="flex flex-row justify-between items-center"
        style={{ gap: '4px' }}
      >
        <div className={CSS_CLASSES.label}>
          <span className="flex-none">{label}: </span>
          {displayValue || <span className="text-grey pl-2">{value}</span>}
        </div>
        {additionalContent}
      </div>

      <Input
        className={CSS_CLASSES.input}
        prefixCls="settings-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value.trim())}
        onClear={() => onChange('')}
        onPressEnter={(e) => onPressEnter?.(e.currentTarget.value.trim())}
        variant="outlined"
        status={isValid ? '' : 'error'}
        addonAfter={
          <div className="flex flex-row" style={{ gap: '4px' }}>
            <button
              disabled={!isValid || disabled}
              className={CSS_CLASSES.setButton}
              onClick={onSet}
            >
              Set
            </button>
            <button className={CSS_CLASSES.resetButton} onClick={onReset}>
              <RotateCcw width={'16px'} />
            </button>
          </div>
        }
      />
      {!isValid && (
        <span className={CSS_CLASSES.error} style={{ marginBottom: '10px' }}>
          {errorMessage}
        </span>
      )}
    </div>
  );
}

export function TransactionIdSettingInput({
  label,
  value,
  placeholder,
  isValid,
  onChange,
  onSet,
  onReset,
  onPressEnter,
  disabled = false,
}: Omit<SettingInputProps, 'displayValue'>) {
  const displayValue =
    value && isArweaveTransactionID(value) ? (
      <ArweaveID
        id={new ArweaveTransactionID(value)}
        shouldLink
        type={ArweaveIdTypes.CONTRACT}
      />
    ) : (
      'N/A'
    );

  return (
    <SettingInput
      label={label}
      value={value}
      placeholder={placeholder}
      isValid={isValid}
      errorMessage="Invalid address"
      displayValue={displayValue}
      onChange={onChange}
      onSet={onSet}
      onReset={onReset}
      onPressEnter={onPressEnter}
      disabled={disabled}
    />
  );
}
