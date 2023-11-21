import { Table } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { useAuctionsTable, useIsMobile } from '../../../hooks';
import { getCustomPaginationButtons } from '../../../utils';
import { RefreshIcon } from '../../icons';
import BlockHeightCounter from '../../layout/BlockHeightCounter/BlockHeightCounter';
import PageLoader from '../../layout/progress/PageLoader/PageLoader';

function Auctions() {
  const { rows, columns, isLoading, percent, refresh } = useAuctionsTable();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <PageLoader
        loading={isLoading}
        message={`Loading auctions table... ${percent}%`}
      />
    );
  }

  return (
    <div className="page">
      <div className="flex flex-column center">
        <div
          className="flex"
          style={{ justifyContent: 'space-between', width: '100%' }}
        >
          <span
            className="white bold"
            style={{ fontSize: isMobile ? '20px' : '36px' }}
          >
            Live Auctions
          </span>
          <span className="flex flex-right white">
            <BlockHeightCounter />
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
          onRow={(row) => ({
            onClick: () =>
              isMobile
                ? navigate(`/auctions/${row.name}`, { state: 'auctions' })
                : null,
          })}
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
