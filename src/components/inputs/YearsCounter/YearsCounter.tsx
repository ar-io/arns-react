import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import {
  MAX_LEASE_DURATION,
  MIN_LEASE_DURATION,
} from '../../../../types/constants';
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
    } else {
      return;
    }
  }
  function addYearsCount() {
    if (count < MAX_LEASE_DURATION) {
      setCount(count + 1);
    } else {
      return;
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
      <div className="yearsCounter">
        <button className="counterButton" onClick={() => subtractYearsCount()}>
          -
        </button>
        <p className="text bold">{`${count} ${years}`}</p>
        <button className="counterButton" onClick={() => addYearsCount()}>
          +
        </button>
      </div>
      <p className="text white bold">{`Lease end date: ${registration}`}</p>
    </div>
  );
}
export default YearsCounter;
