import { Table } from 'antd';
import { useState } from 'react';

import { useArweaveCompositeProvider, useAuctionsTable } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { getCustomPaginationButtons } from '../../../utils';
import eventEmitter from '../../../utils/events';
import { RefreshIcon } from '../../icons';
import PageLoader from '../../layout/progress/PageLoader/PageLoader';

function Auctions() {
  const [, dispatchGlobalState] = useGlobalState();
  const { rows, columns, isLoading, percent } = useAuctionsTable();
  const arweaveDataProvider = useArweaveCompositeProvider();
  const [currentPage, setCurrentPage] = useState<number>(1);

  if (isLoading) {
    return (
      <PageLoader
        loading={isLoading}
        message={`Loading auctions table... ${percent}%`}
      />
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
            <RefreshIcon width={'24px'} height={'24px'} fill={'white'} />
            Refresh
          </button>
        </div>
        <Table
          dataSource={rows}
          columns={columns}
          pagination={{
            position: ['bottomCenter'],
            rootClassName: 'table-pagination',
            itemRender: (page, type, originalElement) =>
              getCustomPaginationButtons({
                page,
                type,
                originalElement,
                currentPage,
              }),
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
