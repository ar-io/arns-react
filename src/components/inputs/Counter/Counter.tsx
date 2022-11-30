import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import useLongPress from '../../../hooks/useLongPress/useLongPress';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import './styles.css';

function YearsCounter({
  maxValue,
  minValue,
  period = 'years',
}: {
  maxValue: number;
  minValue: number;
  period?: 'years' | 'days' | 'minutes';
}) {
  const [{leaseDuration}, dispatchRegisterState] = useRegistrationState()
  const [registration, setRegistration] = useState('');
  const {
    handleOnClick: incHandleOnClick,
    handleOnMouseDown: incHandleOnMouseDown,
    handleOnMouseUp: incHandleOnMouseUp,
    handleOnTouchEnd: incHandleOnTouchEnd,
    handleOnTouchStart: incHandleOnTouchStart,
  } = useLongPress(() => (leaseDuration < maxValue ? dispatchRegisterState({type:"setLeaseDuration", payload:leaseDuration+1}) : null));
  const {
    handleOnClick: decHandleOnClick,
    handleOnMouseDown: decHandleOnMouseDown,
    handleOnMouseUp: decHandleOnMouseUp,
    handleOnTouchEnd: decHandleOnTouchEnd,
    handleOnTouchStart: decHandleOnTouchStart,
  } = useLongPress(() => (leaseDuration > minValue ? dispatchRegisterState({type:"setLeaseDuration", payload:leaseDuration-1}) : null));

  useEffect(() => {
    changePeriod();
  }, [leaseDuration]);

  function changePeriod() {
    const date = new Date();
    switch (period) {
      case 'years':
        date.setFullYear(date.getFullYear() + leaseDuration);
        break;
      case 'days':
        date.setDate(date.getDate() + leaseDuration);
        break;
      case 'minutes':
        date.setHours(date.getHours() + leaseDuration);
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
      dispatchRegisterState({type:"setLeaseDuration", payload:minValue});
      return;
    }

    if (value > maxValue) {
      dispatchRegisterState({type:"setLeaseDuration", payload:maxValue});
      return;
    }

    dispatchRegisterState({type:"setLeaseDuration", payload:value});
    return;
  }

  return (
    <div className="yearsCounterContainer">
      <p className="text white bold">Registration Period ({period})</p>
      <div className="flex-row flex-center">
        <div className="yearsCounter">
          <button
            className="counterButton"
            disabled={leaseDuration == minValue}
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
            value={leaseDuration}
            pattern={'/^[1-9]{1,3}$/'}
            onFocus={(e) => e.target.select()}
            onChange={onChange}
          />
          <button
            className="counterButton"
            disabled={leaseDuration == maxValue}
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
