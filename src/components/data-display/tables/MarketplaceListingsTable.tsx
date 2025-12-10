import { ExternalLinkIcon, RefreshIcon } from '@src/components/icons';
import { Loader } from '@src/components/layout';
import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import { useArIoPrice } from '@src/hooks/useArIOPrice';
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
import { ExternalLink, ShoppingCart } from 'lucide-react';
import { ReactNode, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import TableView from './TableView';

type MarketplaceListing = {
  id: string;
  name: string;
  antId: string;
  seller: string;
  price: number;
  priceUSD?: number;
  listedAt: string;
  expiresAt?: string;
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

    return ordersData.items.map((order: any): MarketplaceListing => {
      const priceInARIO = Number(order.price || 0) / 1000000; // Convert from mARIO to ARIO
      const priceUSD = arIoPrice ? priceInARIO * arIoPrice : undefined;

      return {
        id: order.id || order.antId,
        name: order.name || 'Unknown',
        antId: order.antId,
        seller: order.seller || order.owner,
        price: priceInARIO,
        priceUSD,
        listedAt: order.createdAt || order.listedAt,
        expiresAt: order.expiresAt,
        action: (
          <div className="flex items-center gap-2">
            <Link
              to={`/marketplace/listing/${order.name || order.antId}`}
              className="flex items-center gap-1 px-3 py-1 bg-primary text-black rounded text-sm hover:bg-primary-light transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              View
            </Link>
            <Tooltip title="View on ArNS">
              <a
                href={`https://${order.name}.ar-io.dev`}
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
          const decodedName = decodeDomainToASCII(name);

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
              placeholder="Search listings by name, seller, or ANT ID..."
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
