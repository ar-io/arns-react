import * as Popover from '@radix-ui/react-popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useState } from 'react';

interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  minDate?: Date;
  className?: string;
}

function DateTimePicker({
  value,
  onChange,
  placeholder = 'Select date and time',
  className = '',
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [timeValue, setTimeValue] = useState<string>(
    value ? format(value, 'HH:mm') : '12:00',
  );

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const [hours, minutes] = timeValue.split(':').map(Number);
      const newDateTime = new Date(date);
      newDateTime.setHours(hours, minutes, 0, 0);

      // Ensure minimum 1 hour from now
      const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
      if (newDateTime < oneHourFromNow) {
        // If selected time is less than 1 hour from now, set it to 1 hour from now
        const adjustedTime = new Date(oneHourFromNow);
        setTimeValue(format(adjustedTime, 'HH:mm'));
        onChange(adjustedTime);
      } else {
        onChange(newDateTime);
      }
    } else {
      onChange(undefined);
    }
  };

  const handleTimeChange = (time: string) => {
    setTimeValue(time);
    if (value) {
      const [hours, minutes] = time.split(':').map(Number);
      const newDateTime = new Date(value);
      newDateTime.setHours(hours, minutes, 0, 0);

      // Ensure minimum 1 hour from now
      const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
      if (newDateTime < oneHourFromNow) {
        // If selected time is less than 1 hour from now, set it to 1 hour from now
        const adjustedTime = new Date(oneHourFromNow);
        setTimeValue(format(adjustedTime, 'HH:mm'));
        onChange(adjustedTime);
      } else {
        onChange(newDateTime);
      }
    }
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    thirtyDaysFromNow.setHours(23, 59, 59, 999);

    return date < today || date > thirtyDaysFromNow;
  };

  const isTimeDisabled = (
    hours: number,
    minutes: number,
    selectedDate?: Date,
  ) => {
    if (!selectedDate) return false;

    const testDateTime = new Date(selectedDate);
    testDateTime.setHours(hours, minutes, 0, 0);

    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
    return testDateTime < oneHourFromNow;
  };

  // Simple calendar component
  const Calendar = ({
    selected,
    onSelect,
  }: { selected?: Date; onSelect: (date: Date | undefined) => void }) => {
    const [currentMonth, setCurrentMonth] = useState(selected || new Date());

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();

    const days = [];

    // Previous month days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push(
        <button
          key={`prev-${date.getDate()}`}
          type="button"
          className="w-8 h-8 text-xs text-grey hover:bg-gray-700 rounded disabled:cursor-not-allowed disabled:text-gray-600"
          onClick={() => onSelect(date)}
          disabled={isDateDisabled(date)}
        >
          {date.getDate()}
        </button>,
      );
    }

    // Current month days
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day);
      const isSelected =
        selected &&
        date.getDate() === selected.getDate() &&
        date.getMonth() === selected.getMonth() &&
        date.getFullYear() === selected.getFullYear();
      const isDisabled = isDateDisabled(date);

      days.push(
        <button
          key={day}
          type="button"
          className={`w-8 h-8 text-xs rounded transition-colors disabled:cursor-not-allowed ${
            isSelected
              ? 'bg-primary text-black'
              : isDisabled
                ? 'text-grey'
                : 'text-white hover:bg-dark-grey'
          }`}
          onClick={() => onSelect(date)}
          disabled={isDisabled}
        >
          {day}
        </button>,
      );
    }

    const navigateMonth = (direction: 'prev' | 'next') => {
      const newDate = new Date(currentMonth);
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      setCurrentMonth(newDate);
    };

    return (
      <div className="p-3">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            className="p-1 hover:bg-grey rounded text-white"
            onClick={() => navigateMonth('prev')}
          >
            ←
          </button>
          <h3 className="text-white font-medium">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <button
            type="button"
            className="p-1 hover:bg-grey rounded text-white"
            onClick={() => navigateMonth('next')}
          >
            →
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
            <div
              key={day}
              className="w-8 h-8 text-xs text-grey flex items-center justify-center"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">{days}</div>
      </div>
    );
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={`flex w-full items-center justify-between rounded border-2 border-dark-grey bg-transparent px-3 py-2 text-left transition-colors hover:border-gray-500 focus:border-primary focus:outline-none ${
            !value ? 'text-gray-400' : 'text-white'
          } ${className}`}
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            <span>
              {value ? (
                <>
                  {format(value, 'PPP')} at {format(value, 'HH:mm')}
                </>
              ) : (
                placeholder
              )}
            </span>
          </div>
          <Clock className="w-4 h-4" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="w-80 rounded-lg border border-dark-grey bg-metallic-grey shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          style={{ zIndex: 99999 }}
          sideOffset={8}
          align="start"
        >
          <Calendar selected={value} onSelect={handleDateSelect} />

          {/* Time Picker */}
          <div className="border-t border-dark-grey p-4">
            <label className="block text-sm text-white mb-2">Time</label>
            <div className="flex gap-2 items-center">
              {/* Hour Selector */}
              <div className="flex-1">
                <select
                  value={timeValue.split(':')[0]}
                  onChange={(e) => {
                    const minutes = timeValue.split(':')[1];
                    handleTimeChange(`${e.target.value}:${minutes}`);
                  }}
                  className="w-full rounded border border-dark-grey bg-metallic-grey px-3 py-2 text-white focus:border-primary focus:outline-none appearance-none cursor-pointer"
                >
                  {Array.from({ length: 24 }, (_, i) => {
                    const currentMinutes = parseInt(timeValue.split(':')[1]);
                    const isDisabled = isTimeDisabled(i, currentMinutes, value);
                    return (
                      <option
                        key={i}
                        value={i.toString().padStart(2, '0')}
                        disabled={isDisabled}
                        className={isDisabled ? 'text-grey' : ''}
                      >
                        {i.toString().padStart(2, '0')}
                      </option>
                    );
                  })}
                </select>
              </div>

              <span className="text-white">:</span>

              {/* Minute Selector */}
              <div className="flex-1">
                <select
                  value={timeValue.split(':')[1]}
                  onChange={(e) => {
                    const hours = timeValue.split(':')[0];
                    handleTimeChange(`${hours}:${e.target.value}`);
                  }}
                  className="w-full rounded border border-dark-grey bg-metallic-grey px-3 py-2 text-white focus:border-primary focus:outline-none appearance-none cursor-pointer"
                >
                  {Array.from({ length: 60 }, (_, i) => {
                    const currentHours = parseInt(timeValue.split(':')[0]);
                    const isDisabled = isTimeDisabled(currentHours, i, value);
                    return (
                      <option
                        key={i}
                        value={i.toString().padStart(2, '0')}
                        disabled={isDisabled}
                        className={isDisabled ? 'text-grey' : ''}
                      >
                        {i.toString().padStart(2, '0')}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 p-4 pt-0">
            <button
              type="button"
              className="flex-1 px-3 py-1 text-sm border border-white text-white rounded hover:bg-gray-700 transition-colors"
              onClick={() => {
                onChange(undefined);
                setIsOpen(false);
              }}
            >
              Clear
            </button>
            <button
              type="button"
              className="flex-1 px-3 py-1 text-sm bg-primary text-black rounded hover:bg-primary-dark transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Done
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export default DateTimePicker;
