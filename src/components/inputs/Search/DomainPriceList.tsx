import { mIOToken } from '@ar.io/sdk';
import { RefreshAlertIcon } from '@src/components/icons';
import { useArNSDomainPriceList } from '@src/hooks/useArNSDomainPriceList';
import { useGlobalState } from '@src/state';
import { formatIO } from '@src/utils';

function DomainPiceList({ domain }: { domain: string }) {
  const [{ ioTicker }] = useGlobalState();
  const {
    data: priceList,
    isLoading: isLoadingPriceList,
    refetch: refetchPriceList,
    isRefetching: isRefetchingPriceList,
  } = useArNSDomainPriceList(domain);

  if (isLoadingPriceList || isRefetchingPriceList) {
    return (
      <span className="text-sm text-white align-center animate-pulse">
        Loading prices...
      </span>
    );
  }
  return (
    <>
      {priceList && priceList.lease > 0 ? (
        <span className="text-sm text-white align-center">
          Lease from {formatIO(new mIOToken(priceList.lease).toIO().valueOf())}{' '}
          {ioTicker} for one year, or permabuy for{' '}
          {formatIO(new mIOToken(priceList.buy).toIO().valueOf())} {ioTicker}
        </span>
      ) : (
        domain.length &&
        priceList &&
        priceList.lease <= 0 && (
          <span
            className="flex flex-row max-w-fit justify-center items-center text-sm text-error align-center"
            style={{ gap: '4px' }}
          >
            Unable to fetch price for domain.{' '}
            <button onClick={() => refetchPriceList()}>
              <RefreshAlertIcon
                width={'18px'}
                height="18px"
                className="fill-white animate-pulse"
              />
            </button>
          </span>
        )
      )}
    </>
  );
}

export default DomainPiceList;
