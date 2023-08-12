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
  AuctionMetadata,
  TRANSACTION_TYPES,
} from '../../types';
import { calculateMinimumAuctionBid, getNextPriceUpdate } from '../../utils';
import eventEmitter from '../../utils/events';
import { useArweaveCompositeProvider } from '../useArweaveCompositeProvider/useArweaveCompositeProvider';

export function useAuctionsTable() {
  const [{ pdnsSourceContract, blockHieght }, dispatchGlobalState] =
    useGlobalState();
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
    fetchUndernameRows(pdnsSourceContract.auctions);
  }, [pdnsSourceContract, blockHieght]);

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
              rows.sort((a: AuctionMetadata, b: AuctionMetadata) =>
                // by default we sort by name
                !sortAscending
                  ? a.name.localeCompare(b.name)
                  : b.name.localeCompare(a.name),
              );
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
              rows.sort((a: any, b: any) =>
                sortAscending
                  ? a.closingDate - b.closingDate
                  : b.closingDate - a.closingDate,
              );
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
              rows.sort((a: any, b: any) =>
                sortAscending
                  ? a.initiator.toString().localeCompare(b.initiator.toString())
                  : b.initiator
                      .toString()
                      .localeCompare(a.initiator.toString()),
              );
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
              rows.sort((a: any, b: any) =>
                sortAscending
                  ? a.type.localeCompare(b.type)
                  : b.type.localeCompare(a.type),
              );
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
              rows.sort((a: any, b: any) =>
                sortAscending ? a.price - b.price : b.price - a.price,
              );
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
              onFinish={() => {
                arweaveDataProvider.getCurrentBlockHeight().then((block) =>
                  block !== blockHieght
                    ? dispatchGlobalState({
                        type: 'setBlockHieght',
                        payload: block,
                      })
                    : null,
                );
              }}
            />
            &nbsp;min.
          </span>
        ),
        onHeaderCell: () => {
          return {
            onClick: () => {
              rows.sort((a: any, b: any) =>
                sortAscending
                  ? a.nextPriceUpdate - b.nextPriceUpdate
                  : b.nextPriceUpdate - a.nextPriceUpdate,
              );
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
                alert('Setup registration page to enable this button');
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
    auction: Auction,
  ): Omit<AuctionMetadata, 'name' | 'key'> | undefined {
    const {
      auctionSettingsId,
      type,
      initiator,
      startHeight,
      startPrice,
      floorPrice,
    } = auction;
    const settings = pdnsSourceContract.settings.auctions?.history.find(
      (settings) => settings.id === auctionSettingsId,
    );
    if (!settings || !blockHieght) {
      console.debug('auction settings or blockheight not found', {
        settings,
        blockHieght,
      });
      return;
    }
    const expirationDateMilliseconds =
      Date.now() +
      (startHeight + settings.auctionDuration - blockHieght) * 120_000; // approximate expiration date in milliseconds
    const nextPriceUpdate =
      Date.now() +
      getNextPriceUpdate({
        currentBlockHeight: blockHieght,
        startHeight,
        decayInterval: settings.decayInterval,
      }) *
        120_000;

    const data = {
      closingDate: expirationDateMilliseconds,
      initiator: new ArweaveTransactionID(initiator),
      type,
      nextPriceUpdate,
      price: Math.round(
        calculateMinimumAuctionBid({
          startHeight,
          initialPrice: startPrice,
          floorPrice,
          currentBlockHeight: blockHieght,
          decayInterval: settings.decayInterval,
          decayRate: settings.decayRate,
        }),
      ),
    };

    return data;
  }

  async function fetchUndernameRows(auctions: { [x: string]: any }) {
    setIsLoading(true);
    const fetchedRows: AuctionMetadata[] = [];

    const undernames = Object.entries(auctions);
    for (const [name, record] of undernames) {
      try {
        const auctionData = handleAuctionData(record);
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
          ((Object.keys(auctions).indexOf(name) + 1) /
            Object.keys(auctions).length) *
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