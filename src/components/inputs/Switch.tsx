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
      'relative h-[1.5625rem] w-[2.625rem] cursor-default rounded-full bg-blackA6 shadow-[0_0.125rem_0.625rem] shadow-blackA4 outline-none focus:shadow-[0_0_0_0.125rem] focus:shadow-black data-[state=checked]:bg-black'
    }
  >
    <RadixSwitch.Thumb
      className={
        className?.thumb ??
        'block size-[1.3125rem] translate-x-0.03125rem rounded-full bg-white shadow-[0_0.125rem_0.125rem] shadow-blackA4 transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[1.1875rem]'
      }
    />
  </RadixSwitch.Root>
);

export default Switch;
