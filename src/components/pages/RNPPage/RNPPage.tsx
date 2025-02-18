import ReturnedNamesTable from '@src/components/data-display/tables/ReturnedNamesTable';
import { useReturnedNames } from '@src/hooks/useReturnedNames';
import { RefreshCwIcon } from 'lucide-react';

function RNPPage() {
  const {
    data: returnedNamesData,
    refetch,
    isLoading,
    isRefetching,
  } = useReturnedNames();
  return (
    <div className="page gap-4">
      <div className="flex justify-between text-white w-full">
        <h2 className="text-[2rem]">Recently Returned</h2>
        <button
          className="flex gap-2 items-center justify-center p-1 text-sm"
          onClick={() => refetch()}
        >
          <RefreshCwIcon className="size-4 " /> Refresh
        </button>
      </div>
      <ReturnedNamesTable
        returnedNames={returnedNamesData?.items}
        loading={isLoading || isRefetching}
      />
    </div>
  );
}

export default RNPPage;
