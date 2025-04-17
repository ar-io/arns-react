import { useCountdown } from '@src/hooks/useCountdown';

function Countdown({ endTimestamp }: { endTimestamp: number }) {
  const countdownString = useCountdown(endTimestamp);
  return <>{countdownString}</>;
}

export default Countdown;
