import { PaginationProps, Table } from 'antd';
import { useState } from 'react';

import { useArweaveCompositeProvider, useAuctionsTable } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import eventEmitter from '../../../utils/events';
import { ChevronLeftIcon, ChevronRightIcon, RefreshIcon } from '../../icons';
import { Loader } from '../../layout';

function Auctions() {
  const [, dispatchGlobalState] = useGlobalState();
  const { rows, columns, isLoading, percent } = useAuctionsTable();
  const arweaveDataProvider = useArweaveCompositeProvider();
  const [currentPage, setCurrentPage] = useState<number>(1);

  if (isLoading) {
    return (
      <Loader size={80} message={`Loading auctions table... %${percent}`} />
    );
  }

  async function refresh() {
    try {
      const height = await arweaveDataProvider
        .getCurrentBlockHeight()
        .catch((e) => console.debug(e));
      if (!height) {
        throw new Error(
          'Error refreshing auctions table. Please try again later.',
        );
      }
      dispatchGlobalState({
        type: 'setBlockHeight',
        payload: height,
      });
    } catch (error) {
      eventEmitter.emit('error', error);
    }
  }

  const customPaginationButtons: PaginationProps['itemRender'] = (
    page,
    type,
    originalElement,
  ) => {
    if (type === 'prev') {
      return (
        <span className="flex flex-center">
          <ChevronLeftIcon
            width={'24px'}
            height={'24px'}
            fill="var(--text-grey)"
          />
        </span>
      );
    }
    if (type === 'next') {
      return (
        <span className="flex flex-center">
          <ChevronRightIcon
            width={'24px'}
            height={'24px'}
            fill="var(--text-grey)"
          />
        </span>
      );
    }
    if (type === 'page') {
      return (
        <span
          className="flex flex-row hover center"
          style={{
            color: currentPage == page ? 'white' : 'var(--text-grey)',
            width: '32px',
            borderRadius: 'var(--corner-radius)',
            backgroundColor:
              currentPage == page ? 'var(--text-faded)' : 'var(--bg-color)',
          }}
        >
          {page}
        </span>
      );
    }
    return originalElement;
  };

  return (
    <div className="page" style={{ paddingTop: '100px' }}>
      <div className="flex flex-column center">
        <div
          className="flex"
          style={{ justifyContent: 'space-between', width: '100%' }}
        >
          <span className="white bold" style={{ fontSize: '36px' }}>
            Live Auctions
          </span>
          <button
            className="flex button center white pointer hover"
            style={{ fontSize: '16px', gap: '10px' }}
            onClick={() => refresh()}
          >
            <RefreshIcon width={'24px'} height={'24px'} fill={'white'} />{' '}
            Refresh
          </button>
        </div>
        <Table
          dataSource={rows}
          columns={columns}
          pagination={{
            position: ['bottomCenter'],
            rootClassName: 'table-pagination',
            itemRender: customPaginationButtons,
            onChange(page) {
              setCurrentPage(page);
            },
            showPrevNextJumpers: true,
            showSizeChanger: false,
            current: currentPage,
          }}
        />
      </div>
    </div>
  );
}

export default Auctions;
