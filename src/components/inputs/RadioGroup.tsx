import * as RadixRadioGroup from '@radix-ui/react-radio-group';
import { ReactNode } from 'react';

function RadioGroup({
  items,
  className,
  defaultValue = '',
  groupLabel,
  indicatorClass,
  onChange,
  value,
}: {
  items?: { label?: ReactNode; value?: any; className?: string }[];
  className?: string;
  defaultValue?: any;
  groupLabel?: string;
  indicatorClass?: string;
  onChange?: (val: any) => void;
  value?: any;
}) {
  function handleValueChange(v: any) {
    onChange?.(v);
  }
  return (
    <form>
      <RadixRadioGroup.Root
        onValueChange={handleValueChange}
        value={value}
        className={className}
        defaultValue={defaultValue}
        aria-label={groupLabel}
      >
        {items?.map((item, index) => {
          return (
            <div key={index} className={'flex items-center'}>
              <RadixRadioGroup.Item
                className={item.className}
                value={item.value}
                id={'r' + index}
              >
                <RadixRadioGroup.Indicator className={indicatorClass} />
              </RadixRadioGroup.Item>

              {item.label}
            </div>
          );
        })}
      </RadixRadioGroup.Root>
    </form>
  );
}

export default RadioGroup;
