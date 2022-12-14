import { initial } from 'lodash';
import { useEffect, useState } from 'react';

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
  const [{ leaseDuration }, dispatchRegisterState] = useRegistrationState();
  const [registration, setRegistration] = useState('');
  let initialCount = leaseDuration;
  const {
    handleOnClick: incHandleOnClick,
    handleOnMouseDown: incHandleOnMouseDown,
    handleOnMouseUp: incHandleOnMouseUp,
    handleOnTouchEnd: incHandleOnTouchEnd,
    handleOnTouchStart: incHandleOnTouchStart,
  } = useLongPress(() =>
    initialCount < maxValue
      ? updateRegisterState({ key: 'setLeaseDuration', value: initialCount++ })
      : null,
  );
  const {
    handleOnClick: decHandleOnClick,
    handleOnMouseDown: decHandleOnMouseDown,
    handleOnMouseUp: decHandleOnMouseUp,
    handleOnTouchEnd: decHandleOnTouchEnd,
    handleOnTouchStart: decHandleOnTouchStart,
  } = useLongPress(() =>
    initialCount > minValue
      ? updateRegisterState({ key: 'setLeaseDuration', value: --initialCount })
      : null,
  );

  useEffect(() => {
    changePeriod();
  }, [leaseDuration]);

  function updateRegisterState({ key, value }: { key: any; value: any }) {
    // timeout to prevent jitter
    setTimeout(
      () =>
        dispatchRegisterState({
          type: key,
          payload: value,
        }),
      50,
    );
  }

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
      dispatchRegisterState({ type: 'setLeaseDuration', payload: minValue });
      return;
    }

    if (value > maxValue) {
      dispatchRegisterState({ type: 'setLeaseDuration', payload: maxValue });
      return;
    }

    dispatchRegisterState({ type: 'setLeaseDuration', payload: value });
    return;
  }

  return (
    <div className="years-counter-container">
      <p className="text white bold">Registration Period ({period})</p>
      <div className="flex-row flex-center">
        <div className="years-counter">
          <button
            className="counter-button"
            disabled={leaseDuration == minValue}
            onClick={decHandleOnClick}
            onMouseDown={decHandleOnMouseDown}
            onMouseUp={decHandleOnMouseUp}
            onTouchStart={decHandleOnTouchStart}
            onTouchEnd={decHandleOnTouchEnd}
            onMouseLeave={decHandleOnTouchEnd}
          >
            -
          </button>
          <input
            className="counter-input text bold"
            type="number"
            value={leaseDuration}
            pattern={'/^[1-9]{1,3}$/'}
            onFocus={(e) => e.target.select()}
            onChange={onChange}
          />
          <button
            className="counter-button"
            disabled={leaseDuration == maxValue}
            onClick={incHandleOnClick}
            onMouseDown={incHandleOnMouseDown}
            onMouseUp={incHandleOnMouseUp}
            onTouchStart={incHandleOnTouchStart}
            onTouchEnd={incHandleOnTouchEnd}
            onMouseLeave={incHandleOnTouchEnd}
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
