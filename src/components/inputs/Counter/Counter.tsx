import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import useLongPress from '../../../hooks/useLongPress/useLongPress';
import {
  MAX_LEASE_DURATION,
  MIN_LEASE_DURATION,
} from '../../../utils/constants';
import './styles.css';

function YearsCounter({
  setCount,
  count,
  period = 'years',
}: {
  setCount: Dispatch<SetStateAction<number>>;
  count: number;
  period?: 'years' | 'days' | 'minutes';
}) {
  const [registration, setRegistration] = useState('');
  const {
    handleOnClick: incHandleOnClick,
    handleOnMouseDown: incHandleOnMouseDown,
    handleOnMouseUp: incHandleOnMouseUp,
    handleOnTouchEnd: incHandleOnTouchEnd,
    handleOnTouchStart: incHandleOnTouchStart,
  } = useLongPress(() =>
    count < MAX_LEASE_DURATION ? setCount(++count) : null,
  );
  const {
    handleOnClick: decHandleOnClick,
    handleOnMouseDown: decHandleOnMouseDown,
    handleOnMouseUp: decHandleOnMouseUp,
    handleOnTouchEnd: decHandleOnTouchEnd,
    handleOnTouchStart: decHandleOnTouchStart,
  } = useLongPress(() =>
    count > MIN_LEASE_DURATION ? setCount(--count) : null,
  );

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

  return (
    <div className="yearsCounterContainer">
      <p className="text white bold">Registration Period ({period})</p>
      <div className="flex-row flex-center">
        <div className="yearsCounter">
          <button
            className="counterButton"
            disabled={count == MIN_LEASE_DURATION}
            onClick={decHandleOnClick}
            onMouseDown={decHandleOnMouseDown}
            onMouseUp={decHandleOnMouseUp}
            onTouchStart={decHandleOnTouchStart}
            onTouchEnd={decHandleOnTouchEnd}
          >
            -
          </button>
          <input
            className="counterInput text bold"
            type="number"
            value={count}
            pattern={'/^[1-9]{1,3}$/'}
            onFocus={(e) => e.target.select()}
            onChange={(e) =>
              setCount(Math.max(MIN_LEASE_DURATION, +e.target.value))
            }
          />
          <button
            className="counterButton"
            disabled={count == MAX_LEASE_DURATION}
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
