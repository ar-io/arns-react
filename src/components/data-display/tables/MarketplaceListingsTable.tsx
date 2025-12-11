import { AoArNSNameDataWithName, Order } from '@ar.io/sdk';
import { mARIOToTokenAmount } from '@ardrive/turbo-sdk';
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
} from '@src/utils';
import { formatARIOWithCommas } from '@src/utils/common/common';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { Tooltip } from 'antd';
import { ExternalLink, ShoppingCart, StoreIcon } from 'lucide-react';
import { ReactNode, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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

function MarketplaceListingsTable() {
  const [{ arioTicker }] = useGlobalState();
  const { data: arIoPrice } = useArIoPrice();
  const [filter, setFilter] = useState('');
  const { data: arnsRecords } = useArNSRecords();

  // Fetch marketplace orders
  const {
    data: ordersData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useMarketplaceOrders({
    limit: 100,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Transform orders data into table format
  const tableData = useMemo(() => {
    if (!ordersData?.items) return [];

    if (!arnsRecords) return [];

    const antToNameMap = arnsRecords.reduce(
      (acc: Record<string, string>, record: AoArNSNameDataWithName) => {
        acc[record.processId] = record.name;
        return acc;
      },
      {} as Record<string, string>,
    );

    return ordersData.items.map((order: Order): MarketplaceListing => {
      const priceInARIO = mARIOToTokenAmount(order.price ?? 0); // Convert from mARIO to ARIO
      const priceUSD = arIoPrice
        ? Number(priceInARIO.valueOf()) * arIoPrice
        : undefined;

      return {
        id: order.id,
        name: antToNameMap[order.dominantToken] || null,
        antId: order.dominantToken,
        seller: order.creator,
        price: Number(priceInARIO.valueOf()),
        priceUSD,
        listedAt: order.dateCreated,
        expiresAt: order.expirationTime || null,
        type: order.orderType,
        action: (
          <div className="flex items-center gap-2">
            <Link
              to={`/marketplace/names/${antToNameMap[order.dominantToken]}`}
              className="flex items-center gap-1 px-3 py-1 bg-primary text-black rounded text-sm hover:bg-primary-light transition-colors"
            >
              <StoreIcon className="w-4 h-4" />
              View
            </Link>
            <Tooltip title="View on ArNS">
              <a
                href={`https://${antToNameMap[order.dominantToken]}.ar-io.dev`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-1 border border-grey rounded text-sm hover:bg-dark-grey transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </Tooltip>
          </div>
        ),
      };
    });
  }, [ordersData, arIoPrice]);

  // Filter data based on search
  const filteredData = useMemo(
    () => filterTableData(filter, tableData),
    [filter, tableData],
  );

  // Define table columns
  const columns = useMemo<ColumnDef<MarketplaceListing>[]>(
    () => [
      columnHelper.display({
        id: 'name',
        header: 'Name',
        cell: ({ row }) => {
          const name = row.original.name;
          const decodedName = name ? decodeDomainToASCII(name) : '';

          return (
            <div className="flex items-center gap-2">
              <Link
                to={`/marketplace/listing/${name}`}
                className="text-primary hover:text-primary-light transition-colors font-medium"
              >
                {formatForMaxCharCount(decodedName, 30)}
              </Link>
              {name !== decodedName && (
                <Tooltip title={`Original: ${name}`}>
                  <span className="text-xs text-grey">IDN</span>
                </Tooltip>
              )}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'type',
        header: 'Type',
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
      columnHelper.display({
        id: 'price',
        header: 'Price',
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
      columnHelper.display({
        id: 'seller',
        header: 'Seller',
        cell: ({ row }) => {
          const seller = row.original.seller;

          return (
            <ArweaveID
              id={new ArweaveTransactionID(seller) as AoAddress}
              type={ArweaveIdTypes.ADDRESS}
              shouldLink
              characterCount={8}
            />
          );
        },
      }),
      columnHelper.display({
        id: 'antId',
        header: 'ANT Process',
        cell: ({ row }) => {
          const antId = row.original.antId;

          return (
            <ArweaveID
              id={new ArweaveTransactionID(antId) as AoAddress}
              type={ArweaveIdTypes.TRANSACTION}
              shouldLink
              characterCount={8}
            />
          );
        },
      }),
      columnHelper.display({
        id: 'listedAt',
        header: 'Listed',
        cell: ({ row }) => {
          const listedAt = row.original.listedAt;

          if (!listedAt) return <span className="text-grey">Unknown</span>;

          try {
            const date = new Date(listedAt);
            return (
              <Tooltip title={formatVerboseDate(date.getTime())}>
                <span className="text-sm">{date.toLocaleDateString()}</span>
              </Tooltip>
            );
          } catch {
            return <span className="text-grey">Invalid date</span>;
          }
        },
      }),
      columnHelper.display({
        id: 'action',
        header: 'Actions',
        cell: ({ row }) => row.original.action,
      }),
    ],
    [arioTicker],
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="text-red-400 mb-4">
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
    <div className="flex w-full flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-white">Active Listings</h2>
          {!isLoading && (
            <span className="text-sm text-grey">
              {filteredData.length} listing
              {filteredData.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading || isFetching}
          className="flex items-center gap-2 px-3 py-1 border border-grey rounded text-sm hover:bg-dark-grey transition-colors disabled:opacity-50 text-white fill-white"
        >
          <RefreshIcon
            className={`w-4 h-4 ${isLoading || isFetching ? 'animate-spin' : ''}`}
          />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader size={32} />
          <span className="ml-3 text-grey">Loading listings...</span>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search listings by name, seller, ANT ID, or type..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-2 border border-grey rounded bg-transparent text-white placeholder-grey focus:border-primary outline-none"
            />
          </div>
          <div className="border border-dark-grey rounded">
            <TableView
              columns={columns}
              data={filteredData}
              isLoading={false}
              defaultSortingState={{ id: 'listedAt', desc: true }}
              noDataFoundText="No marketplace listings found"
            />
          </div>
        </>
      )}
    </div>
  );
}

export default MarketplaceListingsTable;
