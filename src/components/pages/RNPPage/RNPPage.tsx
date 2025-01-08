import { useReturnedNames } from '@src/hooks/useReturnedNames';
import { RefreshCwIcon } from 'lucide-react';

export function RNPPage() {
  const { refetch } = useReturnedNames();
  return (
    <div className="page">
      <div>
        <h2>Recently Returned</h2>
        <button
          className="flex gap-2 items-center justify-center p-1"
          onClick={() => refetch()}
        >
          <RefreshCwIcon /> Refresh
        </button>
      </div>
    </div>
  );
}
