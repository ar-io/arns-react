import * as RadixSwitch from '@radix-ui/react-switch';
import React from 'react';

const Switch = ({
  checked,
  onChange,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: {
    root?: string;
    thumb?: string;
  };
}) => (
  <RadixSwitch.Root
    onCheckedChange={onChange}
    checked={checked}
    className={
      className?.root ??
      'relative h-[25px] w-[42px] cursor-default rounded-full bg-blackA6 shadow-[0_2px_10px] shadow-blackA4 outline-none focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-black'
    }
  >
    <RadixSwitch.Thumb
      className={
        className?.thumb ??
        'block size-[21px] translate-x-0.5 rounded-full bg-white shadow-[0_2px_2px] shadow-blackA4 transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[19px]'
      }
    />
  </RadixSwitch.Root>
);

export default Switch;
