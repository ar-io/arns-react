import { AoArNSNameDataWithName, Order, mARIOToken } from '@ar.io/sdk';
import { RefreshIcon } from '@src/components/icons';
import { Loader } from '@src/components/layout';
import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import { useArIoPrice } from '@src/hooks/useArIOPrice';
import { useArNSRecords } from '@src/hooks/useArNSRecords';
import { useMarketplaceOrders } from '@src/hooks/useMarketplaceOrders';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { useGlobalState } from '@src/state';
import { AoAddress } from '@src/types';
import {
  decodeDomainToASCII,
  formatForMaxCharCount,
  formatVerboseDate,
  isArweaveTransactionID,
  isEthAddress,
  lowerCaseDomain,
} from '@src/utils';
import { formatARIOWithCommas } from '@src/utils/common/common';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { BookSearch, ExternalLink, EyeIcon } from 'lucide-react';
import React, { ReactNode, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import Tooltip from '@src/components/Tooltips/Tooltip';
import ARIOLoadingSpinner from '@src/components/indicators/ARIOLoadingSpinner';
import PageLoader from '@src/components/layout/progress/PageLoader/PageLoader';
import TableView from './TableView';

type MarketplaceListing = {
  id: string;
  name: string | null;
  antId: string;
  seller: string;
  price: number;
  priceUSD?: number;
  listedAt: number;
  expiresAt: number | null;
  type: string;
  action: ReactNode;
} & Record<string, any>;

const columnHelper = createColumnHelper<MarketplaceListing>();

function filterTableData(
  filter: string,
  data: MarketplaceListing[],
): MarketplaceListing[] {
  if (!filter) return data;

  return data.filter((listing) => {
    const searchableFields = [
      listing.name,
      listing.seller,
      listing.antId,
      listing.price?.toString(),
      listing.type,
    ];

    return searchableFields.some((field) =>
      field?.toString()?.toLowerCase()?.includes(filter.toLowerCase()),
    );
  });
}

interface MarketplaceListingsTableProps {
  filter?: string;
  refreshTrigger?: number;
}

function MarketplaceListingsTable({
  filter: externalFilter = '',
  refreshTrigger,
}: MarketplaceListingsTableProps = {}) {
  const [{ arioTicker, gateway }] = useGlobalState();
  const { data: arIoPrice } = useArIoPrice();
  const [internalFilter] = useState('');
  const filter = externalFilter !== undefined ? externalFilter : internalFilter;
  const { data: arnsRecords } = useArNSRecords();

  // Fetch marketplace orders
  const {
    data: ordersData,
    isLoading,
    error,
    refetch,
    isFetching,
    isRefetching,
    isPending,
  } = useMarketplaceOrders({
    limit: 100,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Trigger refetch when refreshTrigger changes
  React.useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      refetch();
    }
  }, [refreshTrigger, refetch]);

  const loadingTableData = useMemo(() => {
    return isLoading || isFetching || isRefetching || isPending;
  }, [isLoading, isFetching, isRefetching, isPending]);

  const antToNameMap = useMemo(() => {
    if (!arnsRecords) return {};
    return arnsRecords.reduce(
      (acc: Record<string, string>, record: AoArNSNameDataWithName) => {
        acc[record.processId] = record.name;
        return acc;
      },
      {} as Record<string, string>,
    );
  }, [arnsRecords]);

  // Transform orders data into table format
  const tableData = useMemo(() => {
    if (!ordersData?.items) return [];

    if (!arnsRecords) return [];

    return ordersData.items
      .map((order: Order): MarketplaceListing | undefined => {
        const rawPrice = Number(order.price ?? 0);
        const safePrice =
          Number.isNaN(rawPrice) || !Number.isFinite(rawPrice) ? 0 : rawPrice;
        const priceInARIO = new mARIOToken(safePrice).toARIO().valueOf(); // Convert from mARIO to ARIO
        const priceUSD = arIoPrice ? priceInARIO * arIoPrice : undefined;

        const name = antToNameMap[order.dominantToken] || null;

        // If no name related to the order, skip it - not a valid listing in our system
        if (name === null) return undefined;

        return {
          id: order.id,
          name,
          antId: order.dominantToken,
          seller: order.creator,
          price: priceInARIO,
          priceUSD,
          listedAt: order.dateCreated,
          expiresAt: order.expirationTime || null,
          type: order.orderType,
          action: (
            <div className="flex items-center justify-end pr-4 gap-2">
              <Tooltip
                message="View listing details"
                icon={
                  <Link to={`/marketplace/names/${name}`}>
                    <BookSearch className="w-4 h-4 text-primary hover:text-white" />
                  </Link>
                }
              />

              <Tooltip
                message="View name details"
                icon={
                  <Link to={`/manage/names/${name}`}>
                    <EyeIcon className="w-4 h-4 text-grey hover:text-white" />
                  </Link>
                }
              />
            </div>
          ),
        };
      })
      .filter(
        (listing): listing is MarketplaceListing => listing !== undefined,
      );
  }, [ordersData, arIoPrice, antToNameMap]);

  // Filter data based on search
  const filteredData = useMemo(
    () => filterTableData(filter, tableData),
    [filter, tableData],
  );

  // Define table columns
  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Name',
        sortingFn: (rowA, rowB) => {
          const nameA = rowA.original.name?.toLowerCase() ?? '';
          const nameB = rowB.original.name?.toLowerCase() ?? '';
          return nameA.localeCompare(nameB);
        },
        cell: ({ row }) => {
          const name = row.original.name;
          const decodedName = name ? decodeDomainToASCII(name) : '';

          return (
            <a
              href={`https://${lowerCaseDomain(decodedName)}.${gateway}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex px-2 py-1 rounded text-sm whitespace-nowrap text-link items-start cursor-pointer gap-2"
            >
              {formatForMaxCharCount(decodedName, 30)}{' '}
              <ExternalLink className="w-4 h-4 text-grey" />
            </a>
          );
        },
      }),
      columnHelper.accessor('type', {
        header: 'Type',
        sortingFn: (rowA, rowB) => {
          const typeA = rowA.original.type?.toLowerCase() ?? '';
          const typeB = rowB.original.type?.toLowerCase() ?? '';
          return typeA.localeCompare(typeB);
        },
        cell: ({ row }) => {
          const type = row.original.type;

          // Format the type for display
          const formatType = (type: string) => {
            switch (type?.toLowerCase()) {
              case 'fixed':
                return 'Fixed Price';
              case 'dutch':
                return 'Dutch Auction';
              case 'english':
                return 'English Auction';
              default:
                return type || 'Fixed Price';
            }
          };

          return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {formatType(type)}
            </span>
          );
        },
      }),
      columnHelper.accessor('price', {
        header: 'Price',
        sortingFn: (rowA, rowB) => {
          const priceA = rowA.original.price ?? 0;
          const priceB = rowB.original.price ?? 0;
          return priceA - priceB;
        },
        cell: ({ row }) => {
          const price = row.original.price;
          const priceUSD = row.original.priceUSD;

          return (
            <div className="flex flex-col">
              <span className="font-medium">
                {formatARIOWithCommas(price)} {arioTicker}
              </span>
              {priceUSD && (
                <span className="text-xs text-grey">
                  ≈ $
                  {priceUSD.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  USD
                </span>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor('seller', {
        header: 'Seller',
        sortingFn: (rowA, rowB) => {
          const sellerA = rowA.original.seller?.toLowerCase() ?? '';
          const sellerB = rowB.original.seller?.toLowerCase() ?? '';
          return sellerA.localeCompare(sellerB);
        },
        cell: ({ row }) => {
          const seller = row.original.seller;

          if (!seller) return 'N/A';

          return (
            <ArweaveID
              id={
                isEthAddress(seller) ? seller : new ArweaveTransactionID(seller)
              }
              type={ArweaveIdTypes.ADDRESS}
              shouldLink={isArweaveTransactionID(seller)}
              characterCount={8}
            />
          );
        },
      }),
      columnHelper.accessor('antId', {
        header: 'ANT Process',
        sortingFn: (rowA, rowB) => {
          const antIdA = rowA.original.antId?.toLowerCase() ?? '';
          const antIdB = rowB.original.antId?.toLowerCase() ?? '';
          return antIdA.localeCompare(antIdB);
        },
        cell: ({ row }) => {
          const antId = row.original.antId;

          if (!antId || !isArweaveTransactionID(antId)) return 'N/A';

          return (
            <ArweaveID
              id={new ArweaveTransactionID(antId)}
              type={ArweaveIdTypes.TRANSACTION}
              shouldLink
              characterCount={8}
            />
          );
        },
      }),
      columnHelper.accessor('listedAt', {
        header: 'Listed',
        sortingFn: (rowA, rowB) => {
          const listedAtA = rowA.original.listedAt ?? 0;
          const listedAtB = rowB.original.listedAt ?? 0;
          return listedAtA - listedAtB;
        },
        cell: ({ row }) => {
          const listedAt = row.original.listedAt;

          if (!listedAt) return <span className="text-grey">Unknown</span>;

          try {
            const date = new Date(listedAt);
            return (
              <Tooltip
                message={formatVerboseDate(date.getTime())}
                icon={
                  <span className="text-sm">{date.toLocaleDateString()}</span>
                }
              />
            );
          } catch {
            return <span className="text-grey">Invalid date</span>;
          }
        },
      }),
      columnHelper.accessor('expiresAt', {
        header: 'Expires At',
        sortingFn: (rowA, rowB) => {
          // Handle null values - null (never expires) should sort to the end
          const expiresAtA = rowA.original.expiresAt;
          const expiresAtB = rowB.original.expiresAt;
          if (expiresAtA === null && expiresAtB === null) return 0;
          if (expiresAtA === null) return 1;
          if (expiresAtB === null) return -1;
          return expiresAtA - expiresAtB;
        },
        cell: ({ row }) => {
          const expiresAt = row.original.expiresAt;

          if (!expiresAt) return <span className="text-grey">Never</span>;

          try {
            const date = new Date(expiresAt);
            const now = new Date();
            const isExpired = date < now;
            const isExpiringSoon =
              date.getTime() - now.getTime() < 24 * 60 * 60 * 1000; // Less than 24 hours

            return (
              <Tooltip
                message={formatVerboseDate(date.getTime())}
                icon={
                  <span
                    className={`text-sm ${
                      isExpired
                        ? 'text-error'
                        : isExpiringSoon
                          ? 'text-warning'
                          : 'text-white'
                    }`}
                  >
                    {isExpired ? 'Expired' : date.toLocaleDateString()}
                  </span>
                }
              />
            );
          } catch {
            return <span className="text-grey">Invalid date</span>;
          }
        },
      }),
      columnHelper.display({
        id: 'action',
        header: '',
        cell: ({ row }) => row.original.action,
      }),
    ],
    [arioTicker, gateway],
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="text-error mb-4">
          Failed to load marketplace listings
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded hover:bg-primary-light transition-colors"
        >
          <RefreshIcon className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <TableView
        columns={columns as ColumnDef<MarketplaceListing>[]}
        data={loadingTableData ? [] : filteredData}
        isLoading={false}
        defaultSortingState={{ id: 'listedAt', desc: true }}
        noDataFoundText={
          loadingTableData ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <ARIOLoadingSpinner />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="text-grey mb-4">
                No marketplace listings found
              </div>
              <button
                onClick={() => refetch()}
                className="flex items-center gap-2 px-4 py-2 border-white text-white rounded transition-colors"
              >
                <RefreshIcon className="w-4 h-4 fill-white" />
                Retry
              </button>
            </div>
          )
        }
      />
    </div>
  );
}

export default MarketplaceListingsTable;
