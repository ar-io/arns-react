import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import useLongPress from '../../../hooks/useLongPress/useLongPress';
import './styles.css';

function YearsCounter({
  setCount,
  count,
  maxValue,
  minValue,
  period = 'years',
}: {
  setCount: Dispatch<SetStateAction<number>>;
  count: number;
  maxValue: number;
  minValue: number;
  period?: 'years' | 'days' | 'minutes';
}) {
  const [registration, setRegistration] = useState('');
  const {
    handleOnClick: incHandleOnClick,
    handleOnMouseDown: incHandleOnMouseDown,
    handleOnMouseUp: incHandleOnMouseUp,
    handleOnTouchEnd: incHandleOnTouchEnd,
    handleOnTouchStart: incHandleOnTouchStart,
  } = useLongPress(() => (count < maxValue ? setCount(++count) : null));
  const {
    handleOnClick: decHandleOnClick,
    handleOnMouseDown: decHandleOnMouseDown,
    handleOnMouseUp: decHandleOnMouseUp,
    handleOnTouchEnd: decHandleOnTouchEnd,
    handleOnTouchStart: decHandleOnTouchStart,
  } = useLongPress(() => (count > minValue ? setCount(--count) : null));

  useEffect(() => {
    changePeriod();
  }, [count]);

  function changePeriod() {
    const date = new Date();
    switch (period) {
      case 'years':
        date.setFullYear(date.getFullYear() + count);
        break;
      case 'days':
        date.setDate(date.getDate() + count);
        break;
      case 'minutes':
        date.setHours(date.getHours() + count);
        break;
      default:
        break;
    }
    setRegistration(
      `${date.toLocaleString('default', {
        month: 'long',
      })} ${date.getDate()}, ${date.getFullYear()}`,
    );
  }

  function onChange(e: any) {
    const value = +e.target.value;
    if (value < minValue) {
      setCount(minValue);
      return;
    }

    if (value > maxValue) {
      setCount(maxValue);
      return;
    }

    setCount(value);
    return;
  }

  return (
    <div className="counter-container">
      <p className="text white bold">Registration Period ({period})</p>
      <div className="flex-row flex-center">
        <div className="counter">
          <button
            className="counter-button"
            disabled={count == minValue}
            onClick={decHandleOnClick}
            onMouseDown={decHandleOnMouseDown}
            onMouseUp={decHandleOnMouseUp}
            onTouchStart={decHandleOnTouchStart}
            onTouchEnd={decHandleOnTouchEnd}
          >
            -
          </button>
          <input
            className="counter-input text bold"
            type="number"
            value={count}
            pattern={'/^[1-9]{1,3}$/'}
            onFocus={(e) => e.target.select()}
            onChange={onChange}
          />
          <button
            className="counter-button"
            disabled={count == maxValue}
            onClick={incHandleOnClick}
            onMouseDown={incHandleOnMouseDown}
            onMouseUp={incHandleOnMouseUp}
            onTouchStart={incHandleOnTouchStart}
            onTouchEnd={incHandleOnTouchEnd}
          >
            +
          </button>
        </div>
      </div>
      <p className="text white bold">{`Lease end date: ${registration}`}</p>
    </div>
  );
}
export default YearsCounter;
