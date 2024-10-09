import { motion } from 'framer-motion';
import { useState } from 'react';

function Toggle({
  leftLabel,
  rightLabel,
  check,
  className,
  inputClassName,
}: {
  leftLabel: string;
  rightLabel: string;
  check: (b: boolean) => void;
  className?: string;
  inputClassName?: string;
}) {
  const [checked, setChecked] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(e.target.checked);
    check(e.target.checked);
  };

  const longLabel =
    leftLabel.length > rightLabel.length ? leftLabel : rightLabel;

  return (
    // eslint-disable-next-line jsx-a11y/label-has-associated-control
    <label className={`flex items-center ${className}`}>
      <input
        id="toggle"
        type="checkbox"
        className={`sr-only ${inputClassName}`}
        onChange={handleChange}
        checked={checked}
      />
      <div className="flex items-center cursor-pointer">
        <div
          className={`relative h-8 bg-primary-thin rounded-sm flex items-center justify-between p-1 px-2`}
          style={{
            width: longLabel.length * 2 * 11.5,
          }}
        >
          <span
            className={`z-10 pl-2 transition-all ${
              !checked ? 'text-black' : 'text-primary'
            }`}
          >
            {leftLabel}
          </span>
          <motion.div
            className={`absolute h-6 bg-primary rounded-sm`}
            layout
            initial={false}
            animate={{
              x: checked ? '100%' : '0%',
              width: longLabel.length * 10.5,
            }} // Adjust motion based on the state
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
          <span
            className={`z-10 pr-2 transition-all ${
              checked ? 'text-black' : 'text-primary'
            }`}
          >
            {rightLabel}
          </span>
        </div>
      </div>
    </label>
  );
}

export default Toggle;
