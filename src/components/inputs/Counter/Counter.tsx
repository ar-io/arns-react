import { useEffect, useState } from 'react';

import { useLongPress } from '../../../hooks';
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
  // TODO make this component generic; pass in count and setCount
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
      ? updateRegisterState({ key: 'setLeaseDuration', value: ++initialCount })
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

  return (
    <div className="years-counter-container">
      <span className="text-medium white center" style={{ fontSize: 16 }}>
        Registration Period (between 1-5 years)
      </span>
      <div className="flex-column flex-center">
        <div className="years-counter">
          <button
            className="counter-button hover"
            disabled={leaseDuration == minValue}
            onClick={decHandleOnClick}
            onMouseDown={decHandleOnMouseDown}
            onMouseUp={decHandleOnMouseUp}
            onTouchStart={decHandleOnTouchStart}
            onTouchEnd={decHandleOnTouchEnd}
            onMouseLeave={decHandleOnTouchEnd}
          >
            <span
              style={{ height: '2px', background: 'white', width: '18px' }}
            ></span>
          </button>
          <div
            className="flex flex-column flex-center"
            style={{ width: 'fit-content', gap: 20, paddingBottom: '10px' }}
          >
            <span
              className="text-large white center"
              style={{ fontWeight: 500 }}
            >{`${leaseDuration} year${leaseDuration > 1 ? 's' : ''}`}</span>
            <span
              className="text grey center"
              style={{ fontSize: '14px' }}
            >{`Until ${registration}`}</span>
          </div>
          <button
            className="counter-button hover"
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
    </div>
  );
}
export default YearsCounter;
