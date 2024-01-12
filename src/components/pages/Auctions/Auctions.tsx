import { Table } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';

import { useAuctionsTable, useIsMobile } from '../../../hooks';
import { getCustomPaginationButtons } from '../../../utils';
import { RefreshIcon } from '../../icons';
import BlockHeightCounter from '../../layout/BlockHeightCounter/BlockHeightCounter';
import PageLoader from '../../layout/progress/PageLoader/PageLoader';
import './styles.css';

function Auctions() {
  const { rows, columns, isLoading, percent, refresh } = useAuctionsTable();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  return (
    <div className="page">
      <PageLoader
        loading={isLoading}
        message={`Loading auctions table... ${percent}%`}
      />
      <div className="flex flex-column center" style={{ gap: '15px' }}>
        <div
          className="flex"
          style={{ justifyContent: 'space-between', width: '100%' }}
        >
          <div className="flex flex-column" style={{ gap: '5px' }}>
            <span
              className="flex white bold"
              style={{ fontSize: isMobile ? '20px' : '36px' }}
            >
              Live Auctions
            </span>
            <span className="flex white" style={{ fontSize: '16px' }}>
              <BlockHeightCounter
                prefixText={
                  <span style={{ color: 'var(--accent)' }}>
                    Next price update:
                  </span>
                }
              />
            </span>
          </div>

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
          prefixCls="auctions-table"
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
          locale={{
            emptyText: (
              <div
                className="flex flex-column center"
                style={{ padding: '100px', boxSizing: 'border-box' }}
              >
                <span className="white bold" style={{ fontSize: '16px' }}>
                  There are currently no live auctions.
                </span>
                <span
                  className={'grey'}
                  style={{ fontSize: '13px', maxWidth: '400px' }}
                >
                  You can start an auction by searching for a name between one
                  and eleven characters long.
                </span>
                <div className="flex flex-row center" style={{ gap: '16px' }}>
                  <Link
                    to="/"
                    className="button-primary center hover"
                    style={{
                      gap: '8px',
                      minWidth: '105px',
                      height: '22px',
                      padding: '10px 16px',
                      boxSizing: 'content-box',
                      fontSize: '14px',
                      flexWrap: 'nowrap',
                      color: 'var(--text-black)',
                    }}
                  >
                    Search for a Name
                  </Link>
                </div>
              </div>
            ),
          }}
        />
      </div>
    </div>
  );
}

export default Auctions;
