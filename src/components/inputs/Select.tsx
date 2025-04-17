import * as Select from '@radix-ui/react-select';
import classnames from 'classnames';
import { ChevronDownIcon } from 'lucide-react';
import { ScrollArea } from 'radix-ui';
import React, { ReactNode } from 'react';

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Select.Item>
>(
  (
    {
      children,
      className,

      ...props
    },
    forwardedRef,
  ) => {
    return (
      <Select.Item className={className} {...props} ref={forwardedRef}>
        <Select.ItemText>{children}</Select.ItemText>
      </Select.Item>
    );
  },
);

SelectItem.displayName = 'SelectItem';

type SelectOption = {
  label: ReactNode;
  value: any;
  className?: string;
};

type SelectDropdownProps = {
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  triggerIcon?: React.ReactNode;
  checkIcon?: React.ReactNode;
  value?: string;
  onChange?: (value: string) => void;
  position?: Select.SelectContentProps['position'];
  side?: Select.SelectContentProps['side'];
  className?: {
    trigger?: string;
    icon?: string;
    content?: string;
    viewport?: string;
    item?: string;
    group?: string;
  };
  renderValue?: (v: any) => ReactNode;
  onOpenChange?: (v: boolean) => void;
};

export const SelectDropdown = ({
  options,
  placeholder = 'Select an option...',
  label = 'Options',
  triggerIcon = <ChevronDownIcon />,
  position,
  side,
  value,
  onChange,
  onOpenChange,
  className = {},
  renderValue,
}: SelectDropdownProps) => {
  return (
    <Select.Root
      value={value}
      onValueChange={onChange}
      onOpenChange={onOpenChange}
    >
      <Select.Trigger
        className={
          className.trigger ??
          'inline-flex h-[35px] items-center justify-center gap-[5px] rounded bg-background px-[15px] text-[13px] leading-none text-white shadow-[0_2px_10px] shadow-black/10 outline-none hover:bg-mauve3 focus:shadow-[0_0_0_2px] focus:shadow-black data-[placeholder]:text-white'
        }
        aria-label={label}
      >
        {value ? (
          renderValue?.(
            <Select.Value aria-label={value}>
              {options?.find((o) => o.value === value)?.label}
            </Select.Value>,
          ) ?? <Select.Value aria-label={value}>{placeholder}</Select.Value>
        ) : (
          <Select.Value aria-label={value}>
            {options?.find((o) => o.value === value)?.label}
          </Select.Value>
        )}
        <Select.Icon className={className.icon ?? 'text-white'}>
          {triggerIcon}
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          side={side}
          position={position}
          className={
            className.content ??
            'overflow-hidden rounded-md bg-white shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]'
          }
        >
          <ScrollArea.Root className="size-full" type="auto">
            <Select.Viewport className={className.viewport ?? ''} asChild>
              <ScrollArea.Viewport className="size-full">
                <Select.Group className={className?.group}>
                  {options.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className={classnames(
                        className.item ??
                          'relative flex h-[25px] select-none items-center rounded-[3px] pl-[25px] pr-[35px] text-[13px] leading-none text-violet11 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 data-[disabled]:text-mauve8 data-[highlighted]:text-violet1 data-[highlighted]:outline-none',
                        option.className,
                      )}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </Select.Group>
              </ScrollArea.Viewport>
            </Select.Viewport>
          </ScrollArea.Root>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};
