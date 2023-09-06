import Countdown from 'antd/lib/statistic/Countdown';
import { startCase } from 'lodash';
import { ColumnType } from 'rc-table/lib/interface';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ArweaveID from '../../components/layout/ArweaveID/ArweaveID';
import { useGlobalState } from '../../state/contexts/GlobalState';
import {
  ArweaveTransactionID,
  AuctionMetadata,
  FullAuctionInfo,
  TRANSACTION_TYPES,
} from '../../types';
import { getNextPriceUpdate, handleTableSort } from '../../utils';
import { AVERAGE_BLOCK_TIME } from '../../utils/constants';
import eventEmitter from '../../utils/events';
import { useArweaveCompositeProvider } from '../useArweaveCompositeProvider/useArweaveCompositeProvider';

export function useAuctionsTable() {
  const [
    { pdnsSourceContract, blockHeight: blockHeight },
    dispatchGlobalState,
  ] = useGlobalState();
  const [sortAscending, setSortOrder] = useState(true);
  const [sortField, setSortField] =
    useState<keyof AuctionMetadata>('closingDate');
  const [rows, setRows] = useState<AuctionMetadata[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [percent, setPercentLoaded] = useState<number>(0);
  const arweaveDataProvider = useArweaveCompositeProvider();

  const navigate = useNavigate();

  useEffect(() => {
    if (!pdnsSourceContract?.auctions) {
      return;
    }
    fetchAuctionRows(Object.keys(pdnsSourceContract.auctions));
  }, [pdnsSourceContract, blockHeight]);

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

  function generateTableColumns(): ColumnType<AuctionMetadata>[] {
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
              handleTableSort<AuctionMetadata>({
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
              handleTableSort<AuctionMetadata>({
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
              handleTableSort<AuctionMetadata>({
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
              handleTableSort<AuctionMetadata>({
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
            onClick={() => setSortField('price')}
          >
            <span>Price</span>
          </button>
        ),
        dataIndex: 'price',
        key: 'price',
        width: 'fit-content',
        className: 'white assets-table-header',
        render: (val: number) => <span>{val.toLocaleString()} IO</span>,
        onHeaderCell: () => {
          return {
            onClick: () => {
              handleTableSort<AuctionMetadata>({
                key: 'price',
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
              handleTableSort<AuctionMetadata>({
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

  function handleAuctionData(
    auction: FullAuctionInfo,
  ): Omit<AuctionMetadata, 'name' | 'key'> | undefined {
    const {
      type,
      initiator,
      startHeight,
      auctionDuration,
      decayInterval,
      minimumAuctionBid,
    } = auction;

    if (!blockHeight) {
      throw new Error('Error fetching auction data. Please try again later.');
    }
    if (startHeight + auctionDuration < blockHeight) {
      // if auction is expired, do not show.
      return;
    }

    const expirationDateMilliseconds =
      Date.now() +
      (startHeight + auctionDuration - blockHeight) * AVERAGE_BLOCK_TIME; // approximate expiration date in milliseconds

    const nextPriceUpdate =
      Date.now() +
      getNextPriceUpdate({
        currentBlockHeight: blockHeight,
        startHeight,
        decayInterval,
      }) *
        AVERAGE_BLOCK_TIME;

    const data = {
      closingDate: expirationDateMilliseconds,
      initiator: new ArweaveTransactionID(initiator),
      type,
      nextPriceUpdate,
      price: Math.round(minimumAuctionBid),
    };

    return data;
  }

  async function fetchAuctionRows(domains: string[]): Promise<void> {
    setIsLoading(true);

    const fetchedRows: AuctionMetadata[] = [];

    for (const name of domains) {
      try {
        if (!blockHeight) {
          throw new Error(
            'Error fetching auction data. Please try again later.',
          );
        }
        // will throw on non-ticked expired auctions, catch and continue
        const auction = await arweaveDataProvider
          .getFullAuctionInfo(name, blockHeight)
          .catch((e) => console.error(e));
        if (!auction) {
          continue;
        }
        const auctionData = handleAuctionData(auction);
        if (!auctionData) {
          continue;
        }
        const rowData = {
          ...auctionData,
          name: name,
          key: name,
        };
        // sort by confirmation count (ASC) by default
        fetchedRows.sort((a, b) => a.closingDate - b.closingDate);
        fetchedRows.push(rowData);
      } catch (error) {
        eventEmitter.emit('error', error);
      } finally {
        setPercentLoaded(
          ((Object.keys(domains).indexOf(name) + 1) /
            Object.keys(domains).length) *
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
