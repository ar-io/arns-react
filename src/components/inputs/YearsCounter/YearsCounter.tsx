import { useEffect, useState } from 'react';

import './styles.css';

function YearsCounter({ setCount, count }: { setCount: any; count: number }) {
  const [years, setYears] = useState('year');
  const [registration, setRegistration] = useState('');

  useEffect(() => {
    changeYear();
  }, [count]);

  function subCount() {
    if (count > 1) {
      setCount(count - 1);
    } else {
      return;
    }
  }
  function addCount() {
    setCount(count + 1);
  }
  function changeYear() {
    let date = new Date();
    if (count > 1) {
      setYears(`years`);
    } else {
      setYears(`year`);
    }
    const newYear = date.getFullYear() + count;
    setRegistration(
      `${date.toLocaleString('default', {
        month: 'long',
      })} ${date.getDay()}, ${newYear}`,
    );
  }
  return (
    <div className="yearsCounterContainer">
      <p className="text white bold">Registration Period</p>
      <div className="yearsCounter">
        <button className="counterButton" onClick={() => subCount()}>
          -
        </button>
        <p className="text bold">{`${count} ${years}`}</p>
        <button className="counterButton" onClick={() => addCount()}>
          +
        </button>
      </div>
      <p className="text white bold">{`Lease end date: ${registration}`}</p>
    </div>
  );
}
export default YearsCounter;
