import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useEffect, useState } from 'react';

dayjs.extend(duration);

/**
 * Hook that creates a countdown string from a given end timestamp
 * @param endTimestamp - Timestamp in milliseconds for when the countdown should end
 * @returns A formatted duration string or null when loading/expired
 */
export function useCountdown(endTimestamp: number) {
  const [countdownString, setCountdownString] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = dayjs();
      const end = dayjs(endTimestamp);
      const diff = end.diff(now);

      if (diff <= 0) {
        setCountdownString(null);
        clearInterval(interval);
        return;
      }

      const duration = dayjs.duration(diff);
      const years = duration.years();
      const months = duration.months();
      const weeks = Math.floor(duration.days() / 7);
      const days = duration.days() % 7;
      const hours = duration.hours();
      const minutes = duration.minutes();
      const seconds = duration.seconds();

      // Format based on the largest unit present
      if (years > 0) {
        setCountdownString(`${years}y ${months}m`);
      } else if (months > 0) {
        setCountdownString(`${months}m ${weeks}w`);
      } else if (weeks > 0) {
        setCountdownString(`${weeks}w ${days}d`);
      } else if (days > 0) {
        setCountdownString(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setCountdownString(
          `${hours}:${minutes < 10 ? `0${minutes}` : minutes}`,
        );
      } else {
        setCountdownString(
          `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`,
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTimestamp]);

  return countdownString;
}
