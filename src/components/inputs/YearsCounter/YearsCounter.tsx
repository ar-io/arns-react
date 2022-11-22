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

  useEffect(() => {
    changeYear();
  }, [count]);

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
            onClick={() => subtractYearsCount()}
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
            onClick={() => addYearsCount()}
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
