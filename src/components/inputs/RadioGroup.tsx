import * as RadixRadioGroup from '@radix-ui/react-radio-group';
import { ReactNode, useState } from 'react';

function RadioGroup({
  items,
  className,
  defaultValue = '',
  groupLabel,
  indicatorClass,
  onChange,
}: {
  items?: { label?: ReactNode; value?: any; className?: string }[];
  className?: string;
  defaultValue?: any;
  groupLabel?: string;
  indicatorClass?: string;
  onChange?: (val: any) => void;
}) {
  const [value, setValue] = useState(defaultValue);

  function handleValueChange(v: any) {
    setValue(v);
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
