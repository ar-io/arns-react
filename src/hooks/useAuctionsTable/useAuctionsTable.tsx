import { ColumnType } from 'antd/es/table';
import { startCase } from 'lodash';
import * as _ from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ArweaveID from '../../components/layout/ArweaveID/ArweaveID';
import { ArweaveTransactionID } from '../../services/arweave/ArweaveTransactionID';
import { useGlobalState } from '../../state/contexts/GlobalState';
import { useWalletState } from '../../state/contexts/WalletState';
import { Auction, AuctionTableData, TRANSACTION_TYPES } from '../../types';
import { getPriceByBlockHeight, handleTableSort } from '../../utils';
import {
  ARNS_REGISTRY_ADDRESS,
  AVERAGE_BLOCK_TIME_MS,
} from '../../utils/constants';
import eventEmitter from '../../utils/events';
import { useIsMobile } from '../useIsMobile/useIsMobile';

export function useAuctionsTable() {
  const [
    { blockHeight, arweaveDataProvider, ioTicker, lastBlockUpdateTimestamp },
    dispatchGlobalState,
  ] = useGlobalState();
  const [{ walletAddress }] = useWalletState();
  const [sortAscending, setSortOrder] = useState(true);
  const [sortField, setSortField] =
    useState<keyof AuctionTableData>('closingDate');
  const [auctionData, setAuctionData] = useState<Auction[]>([]);
  const [rows, setRows] = useState<AuctionTableData[]>([]);
  const itemCount = useRef<number>(0);
  const itemsLoaded = useRef<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [percent, setPercentLoaded] = useState<number>(0);

  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    load();
  }, [walletAddress]);

  useEffect(() => {
    if (blockHeight && lastBlockUpdateTimestamp) {
      buildAuctionRows(auctionData, blockHeight);
    }
  }, [auctionData, blockHeight, lastBlockUpdateTimestamp]);

  async function load() {
    try {
      setIsLoading(true);
      if (!blockHeight) {
        const currentBlockHeight =
          await arweaveDataProvider.getCurrentBlockHeight();
        dispatchGlobalState({
          type: 'setBlockHeight',
          payload: currentBlockHeight,
        });
      }
      const auctions = await fetchAuctions();
      setAuctionData(auctions);
    } catch (error) {
      eventEmitter.emit('error', error);
    } finally {
      setIsLoading(false);
    }
  }

  function generateTableColumns(): ColumnType<AuctionTableData>[] {
    return [
      {
        title: (
          <button
            className="flex-row pointer grey"
            style={{ gap: '0.5em' }}
            onClick={() => setSortField('name')}
          >
            <span>Name</span>
          </button>
        ),
        dataIndex: 'name',
        key: 'name',
        align: 'left',
        width: isMobile ? '130px' : '20%',
        className: 'white assets-table-header',
        ellipsis: true,
        onHeaderCell: () => {
          return {
            onClick: () => {
              handleTableSort<AuctionTableData>({
                key: 'name',
                isAsc: sortAscending,
                rows,
              });
              // forces update of rows
              setRows([...rows]);
              setSortOrder(!sortAscending);
            },
          };
        },
      },
      {
        responsive: ['md'],
        title: (
          <button
            className="flex-row pointer grey"
            style={{ gap: '0.5em' }}
            onClick={() => setSortField('closingDate')}
          >
            <span>Closing Date</span>
          </button>
        ),
        dataIndex: 'closingDate',
        key: 'closingDate',
        width: 'fit-content',
        className: 'white assets-table-header',
        render: (val: number) => Intl.DateTimeFormat('en-US').format(val),

        onHeaderCell: () => {
          return {
            onClick: () => {
              handleTableSort<AuctionTableData>({
                key: 'closingDate',
                isAsc: sortAscending,
                rows,
              });
              // forces update of rows
              setRows([...rows]);
              setSortOrder(!sortAscending);
            },
          };
        },
      },
      {
        responsive: ['lg'],
        title: (
          <button
            className="flex-row pointer grey"
            style={{ gap: '0.5em' }}
            onClick={() => setSortField('initiator')}
          >
            <span>Initiated By</span>
          </button>
        ),
        dataIndex: 'initiator',
        key: 'initiator',
        width: 'fit-content',
        className: 'white assets-table-header',
        render: (val: ArweaveTransactionID) => (
          <span
            className="flex"
            style={{ alignItems: 'center', height: '100%' }}
          >
            <ArweaveID id={val} shouldLink characterCount={12} />
          </span>
        ),
        onHeaderCell: () => {
          return {
            onClick: () => {
              handleTableSort<AuctionTableData>({
                key: 'initiator',
                isAsc: sortAscending,
                rows,
              });
              // forces update of rows
              setRows([...rows]);
              setSortOrder(!sortAscending);
            },
          };
        },
      },
      {
        title: (
          <button
            className="flex-row pointer grey"
            style={{ gap: '0.5em' }}
            onClick={() => setSortField('type')}
          >
            <span>Auction Type</span>
          </button>
        ),
        dataIndex: 'type',
        key: 'type',
        width: 'fit-content',
        className: 'white assets-table-header',
        render: (val: string) =>
          startCase(val === TRANSACTION_TYPES.BUY ? 'buy' : val),
        onHeaderCell: () => {
          return {
            onClick: () => {
              handleTableSort<AuctionTableData>({
                key: 'type',
                isAsc: sortAscending,
                rows,
              });
              // forces update of rows
              setRows([...rows]);
              setSortOrder(!sortAscending);
            },
          };
        },
      },
      {
        title: (
          <button
            className="flex-row pointer grey"
            style={{ gap: '0.5em' }}
            onClick={() => setSortField('currentPrice')}
          >
            <span>Price</span>
          </button>
        ),
        dataIndex: 'currentPrice',
        key: 'currentPrice',
        width: 'fit-content',
        className: 'white assets-table-header',
        render: (val: number) => (
          <span style={{ whiteSpace: 'nowrap' }}>
            {val.toLocaleString()} {ioTicker}
          </span>
        ),
        onHeaderCell: () => {
          return {
            onClick: () => {
              handleTableSort<AuctionTableData>({
                key: 'currentPrice',
                isAsc: sortAscending,
                rows,
              });
              // forces update of rows
              setRows([...rows]);
              setSortOrder(!sortAscending);
            },
          };
        },
      },
      {
        responsive: ['sm'],
        title: '',
        className: 'assets-table-header',
        render: (row: AuctionTableData) => (
          <div
            className="flex flex-row"
            style={{
              gap: '1em',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <button
              className="outline-button hover center"
              style={{
                fontSize: '13px',
                padding: '8px',
                borderColor: 'var(--text-faded)',
                color: 'var(--text-grey)',
                minWidth: isMobile ? 'fit-content' : '',
              }}
              onClick={() => {
                navigate(`/auctions/${row.name}`, { state: 'auctions' });
              }}
            >
              {isMobile ? 'View' : 'View Auction'}
            </button>
            <button
              className="accent-button hover"
              style={{
                fontSize: '13px',
                padding: '8px',
                display: isMobile ? 'none' : 'flex',
              }}
              onClick={() => {
                navigate(`/register/${row.name}`);
              }}
            >
              Buy
            </button>
          </div>
        ),
        align: 'right',
        width: 'fit-content',
      },
    ];
  }

  // TODO: move to util outside this class so it is easy to test
  function generateAuctionTableData({
    blockHeight,
    auction,
  }: {
    blockHeight: number;
    auction: Auction;
  }): AuctionTableData {
    const { name, type, initiator, startHeight, settings, isActive, prices } =
      auction;

    const expirationDateMilliseconds =
      Date.now() +
      (startHeight + settings.auctionDuration - blockHeight) *
        AVERAGE_BLOCK_TIME_MS; // approximate expiration date in milliseconds

    const data = {
      name,
      key: `${name}-${type}`,
      type,
      initiator,
      isActive,
      closingDate: expirationDateMilliseconds,
      // allows us to not query for new prices and use previous net call to find the new price
      currentPrice: Math.round(getPriceByBlockHeight(prices, blockHeight)),
    };

    return data;
  }

  async function fetchAuctions(): Promise<Auction[]> {
    itemCount.current = 0;
    const domainsInAuction = await arweaveDataProvider
      .getDomainsInAuction({
        address: walletAddress,
        contractTxId: ARNS_REGISTRY_ADDRESS,
      })
      .catch((e) => console.debug(e));
    if (!domainsInAuction) {
      return [];
    }
    itemCount.current = domainsInAuction.length;
    itemsLoaded.current = 0;
    const fetchedAuctions: (Auction | undefined)[] = await Promise.all(
      domainsInAuction.map((domain) => {
        return arweaveDataProvider
          .getAuction({
            domain,
          })
          .catch((e) => {
            console.debug(e);
            return undefined;
          })
          .finally(() => {
            itemCount.current++;
            setPercentLoaded(
              Math.round((itemsLoaded.current / itemCount.current) * 100),
            );
          });
      }),
    );

    return _.compact(fetchedAuctions);
  }

  function buildAuctionRows(data: Auction[], blockHeight: number) {
    const fetchedRows: AuctionTableData[] = [];

    data.forEach((auction) => {
      if (!auction.isActive) {
        return;
      }
      const rowData = generateAuctionTableData({
        blockHeight,
        auction,
      });
      // sort by confirmation count (ASC) by default
      fetchedRows.push(rowData);
      fetchedRows.sort((a, b) => a.closingDate - b.closingDate);
    });

    setRows(fetchedRows);
  }

  return {
    isLoading,
    percent,
    columns: generateTableColumns(),
    rows,
    sortField,
    sortAscending,
    refresh: load,
  };
}
