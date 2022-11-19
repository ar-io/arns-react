import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import {
  MAX_LEASE_DURATION,
  MIN_LEASE_DURATION,
} from '../../../utils/constants';
import './styles.css';

function YearsCounter({
  setCount,
  count,
}: {
  setCount: Dispatch<SetStateAction<number>>;
  count: number;
}) {
  const [registration, setRegistration] = useState('');
  const [adding, setAdding] = useState(false);
  const [subtracting, setSubtracting] = useState(false);
  const [timer, setTimer] = useState(500);


  useEffect(() => {
    changeYear();

    if (!adding && !subtracting) {
      setTimer(500);
    }
    if (adding) {
      const addTimer = setTimeout(() => addYearsCount(), timer);
      if (timer > 60 && timer < 500) {
        addTimer;
        setTimer(timer - 40);
      }
      if (timer === 500) {
        setTimer(timer - 40);
        addYearsCount();
      }
    }
    if (subtracting) {
      const subTimer = setTimeout(() => subtractYearsCount(), timer);
      if (timer > 60 && timer < 500) {
        subTimer;
        setTimer(timer - 40);
      }
      if (timer === 500) {
        setTimer(timer - 40);
        subtractYearsCount();
      }
    }
  }, [subtracting, adding, count]);

  function subtractYearsCount() {
    if (count > 1 && count > MIN_LEASE_DURATION) {
      setCount(count - 1);
    }
  }
  function addYearsCount() {
    if (count < MAX_LEASE_DURATION) {
      setCount(count + 1);
    }
  }

  function updateYearsCount(e: any) {
    const numberOnlyRegex = new RegExp('[0-9]$');

    if (!numberOnlyRegex.test(e.target.value)) {
      return;
    } else {
      if (e.target.value < MIN_LEASE_DURATION) {
        return setCount(MIN_LEASE_DURATION);
      }
      if (e.target.value > MAX_LEASE_DURATION) {
        return setCount(MAX_LEASE_DURATION);
      }
      return setCount(new Number(e.target.value).valueOf());
    }
  }

  function changeYear() {
    const date = new Date();
    const newYear = date.getFullYear() + count;
    setRegistration(
      `${date.toLocaleString('default', {
        month: 'long',
      })} ${date.getDate()}, ${newYear}`,
    );
  }
  return (
    <div className="yearsCounterContainer">
      <p className="text white bold">Registration Period (years)</p>
      <div className="flex-row flex-center">
        <div className="yearsCounter">
          <button
            className="counterButton"
            onMouseDown={() => setSubtracting(true)}
            onMouseUp={() => setSubtracting(false)}
            onMouseLeave={() => setSubtracting(false)}
          >
            -
          </button>
          <input
            className="counterInput text bold"
            type="text"
            value={count}
            onChange={(e) => updateYearsCount(e)}
          />
          <button
            className="counterButton"
            onMouseDown={() => setAdding(true)}
            onMouseUp={() => setAdding(false)}
            onMouseLeave={() => setAdding(false)}
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
