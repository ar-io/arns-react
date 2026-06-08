import { mARIOToken } from '@ar.io/sdk/web';
import { RefreshAlertIcon } from '@src/components/icons';
import { useArIoPrice } from '@src/hooks/useArIOPrice';
import { useArNSDomainPriceList } from '@src/hooks/useArNSDomainPriceList';
import { useGlobalState } from '@src/state';
import { formatARIO } from '@src/utils';

function DomainPiceList({ domain }: { domain: string }) {
  const [{ arioTicker }] = useGlobalState();
  const {
    data: priceList,
    isLoading: isLoadingPriceList,
    refetch: refetchPriceList,
    isRefetching: isRefetchingPriceList,
  } = useArNSDomainPriceList(domain);
  const { data: arIoPrice } = useArIoPrice();

  if (isLoadingPriceList || isRefetchingPriceList) {
    return (
      <span className="text-white align-center animate-pulse">
        Loading prices...
      </span>
    );
  }
  const leaseArio = priceList
    ? new mARIOToken(priceList.lease).toARIO().valueOf()
    : 0;
  return (
    <>
      {priceList && priceList.lease > 0 ? (
        <span className="text-white align-center">
          {arIoPrice !== undefined && (
            <>Starting at ${(leaseArio * arIoPrice).toFixed(2)} USD, or </>
          )}
          {formatARIO(leaseArio)} {arioTicker}
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
