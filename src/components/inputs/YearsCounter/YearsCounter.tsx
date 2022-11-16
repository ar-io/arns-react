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
  const [years, setYears] = useState('year');
  const [registration, setRegistration] = useState('');

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
  function changeYear() {
    const date = new Date();
    if (count > 1) {
      setYears(`years`);
    } else {
      setYears(`year`);
    }
    const newYear = date.getFullYear() + count;
    setRegistration(
      `${date.toLocaleString('default', {
        month: 'long',
      })} ${date.getDate()}, ${newYear}`,
    );
  }
  return (
    <div className="yearsCounterContainer">
      <p className="text white bold">Registration Period</p>
      <div className="flex-row flex-center">
        <div className="yearsCounter">
          <button
            className="counterButton"
            disabled={count == MIN_LEASE_DURATION}
            onClick={() => subtractYearsCount()}
          >
            -
          </button>
          <p className="text bold">{`${count} ${years}`}</p>
          <button
            className="counterButton"
            disabled={count == MAX_LEASE_DURATION}
            onClick={() => addYearsCount()}
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
