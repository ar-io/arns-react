import Countdown from 'antd/lib/statistic/Countdown';
import { startCase } from 'lodash';
import { ColumnType } from 'rc-table/lib/interface';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ArweaveID from '../../components/layout/ArweaveID/ArweaveID';
import { useGlobalState } from '../../state/contexts/GlobalState';
import {
  ArweaveTransactionID,
  Auction,
  AuctionTableData,
  TRANSACTION_TYPES,
} from '../../types';
import { getNextPriceChangeTimestamp, handleTableSort } from '../../utils';
import { AVERAGE_BLOCK_TIME } from '../../utils/constants';
import eventEmitter from '../../utils/events';
import { useArweaveCompositeProvider } from '../useArweaveCompositeProvider/useArweaveCompositeProvider';

export function useAuctionsTable() {
  const [{ blockHeight }, dispatchGlobalState] = useGlobalState();
  const [sortAscending, setSortOrder] = useState(true);
  const [sortField, setSortField] =
    useState<keyof AuctionTableData>('closingDate');
  const [rows, setRows] = useState<AuctionTableData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [percent, setPercentLoaded] = useState<number>(0);
  const arweaveDataProvider = useArweaveCompositeProvider();

  const navigate = useNavigate();

  useEffect(() => {
    fetchAuctionRows();
  }, [blockHeight]);

  async function updateBlockHeight(): Promise<void> {
    try {
      const newBlockHeight = await arweaveDataProvider.getCurrentBlockHeight();
      if (blockHeight === newBlockHeight) {
        return;
      }
      dispatchGlobalState({
        type: 'setBlockHeight',
        payload: newBlockHeight,
      });
    } catch (error) {
      eventEmitter.emit('error', error);
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
        width: '250px',
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
            onClick={() => setSortField('minimumBid')}
          >
            <span>Price</span>
          </button>
        ),
        dataIndex: 'minimumBid',
        key: 'minimumBid',
        width: 'fit-content',
        className: 'white assets-table-header',
        render: (val: number) => <span>{val.toLocaleString()} IO</span>,
        onHeaderCell: () => {
          return {
            onClick: () => {
              handleTableSort<AuctionTableData>({
                key: 'minimumBid',
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
            onClick={() => setSortField('nextPriceUpdate')}
          >
            <span>Next price adj.</span>
          </button>
        ),
        dataIndex: 'nextPriceUpdate',
        key: 'nextPriceUpdate',
        width: 'fit-content',
        className: 'white assets-table-header',
        render: (val: number) => (
          <span
            className="white flex flex-row"
            style={{ gap: '0px', height: 'fit-content' }}
          >
            <Countdown
              value={+val}
              valueStyle={{
                fontSize: '15px',
                color: 'var(--text-white)',
              }}
              format="m"
              onFinish={() => updateBlockHeight()}
            />
            &nbsp;min.
          </span>
        ),
        onHeaderCell: () => {
          return {
            onClick: () => {
              handleTableSort<AuctionTableData>({
                key: 'nextPriceUpdate',
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
        title: '',
        className: 'assets-table-header',
        render: (row) => (
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
              }}
              onClick={() => {
                navigate(`/auctions/${row.name}`, { state: 'auctions' });
              }}
            >
              View Auction
            </button>
            <button
              className="accent-button hover"
              style={{ fontSize: '13px', padding: '8px' }}
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
  }): AuctionTableData | undefined {
    const {
      name,
      type,
      initiator,
      startHeight,
      settings,
      isActive,
      minimumBid,
      prices,
    } = auction;

    if (!isActive) {
      // if auction is expired, do not show.
      return;
    }

    const expirationDateMilliseconds =
      Date.now() +
      (startHeight + settings.auctionDuration - blockHeight) *
        AVERAGE_BLOCK_TIME; // approximate expiration date in milliseconds

    const nextPriceUpdateTimestamp = getNextPriceChangeTimestamp({
      currentBlockHeight: blockHeight,
      prices,
    });

    const data = {
      name,
      key: `${name}-${type}`,
      type,
      initiator,
      isActive,
      closingDate: expirationDateMilliseconds,
      nextPriceUpdate: nextPriceUpdateTimestamp,
      minimumBid: Math.round(minimumBid),
    };

    return data;
  }

  async function fetchAuctionRows(): Promise<void> {
    setIsLoading(true);

    const fetchedRows: AuctionTableData[] = [];
    const domainsInAuction = await arweaveDataProvider.getDomainsInAuction();

    // TODO: do this concurrently
    for (const domain of domainsInAuction) {
      try {
        // TODO: update global state
        const blockHeight = await arweaveDataProvider.getCurrentBlockHeight();
        const auction = await arweaveDataProvider.getAuction({ domain });
        const rowData = generateAuctionTableData({ blockHeight, auction });
        if (!rowData) {
          continue;
        }
        // sort by confirmation count (ASC) by default
        fetchedRows.push(rowData);
        fetchedRows.sort((a, b) => a.closingDate - b.closingDate);
      } catch (error) {
        eventEmitter.emit('error', error);
      } finally {
        setPercentLoaded(
          ((Object.keys(domainsInAuction).indexOf(domain) + 1) /
            Object.keys(domainsInAuction).length) *
            100,
        );
      }
    }
    setRows(fetchedRows);
    setIsLoading(false);
  }

  return {
    isLoading,
    percent,
    columns: generateTableColumns(),
    rows,
    sortField,
    sortAscending,
  };
}
