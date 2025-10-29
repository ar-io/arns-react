import type {
  FetchActiveListingsResult,
  FetchCompletedListingsResult,
} from '@blockydevs/arns-marketplace-data';
import type { Domain } from '@blockydevs/arns-marketplace-ui';
import { useAntsMetadata } from '@src/hooks/listings/useAntsMetadata';
import { getCurrentListingArioPrice } from '@src/utils/marketplace';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const usePrepareListings = (
  queryData:
    | FetchActiveListingsResult
    | FetchCompletedListingsResult
    | undefined,
) => {
  const navigate = useNavigate();
  const queryAntsMetadata = useAntsMetadata();

  const preparedItems = (queryData?.items ?? [])
    .filter((item) => !!queryAntsMetadata.data[item.antProcessId])
    .map((item): Domain & { antId: string } => {
      const currentPrice = getCurrentListingArioPrice(item);
      const antMeta = queryAntsMetadata.data[item.antProcessId];
      const isCompleted = 'endedAt' in item;

      return {
        antId: item.antProcessId,
        name: antMeta.name,
        ownershipType: antMeta.ownershipType,
        price: {
          type: item.type === 'english' ? 'bid' : 'buyout',
          symbol: 'ARIO',
          value: Number(currentPrice),
        },
        type: {
          value: item.type,
        },
        action: () => {
          navigate(`/listings/${item.orderId}`);
        },
        ...(isCompleted && {
          createdAt: item.createdAt,
          endDate: item.endedAt,
        }),
        ...(!isCompleted && {
          endDate: item.expiresAt ?? undefined,
        }),
      };
    });

  const hasMissingMetadata = queryData?.items.some(
    (item) => !queryAntsMetadata.data[item.antProcessId],
  );

  useEffect(() => {
    if (!hasMissingMetadata) return;
    queryAntsMetadata.refetch();
  }, [hasMissingMetadata, queryAntsMetadata]);

  return preparedItems;
};
