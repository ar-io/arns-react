import { useWalletState } from '@src/state/contexts/WalletState';
import { ARIO_DISCORD_LINK } from '@src/utils/constants';
import { Spin, Table } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import { useWalletANTs, useWalletDomains } from '../../../hooks';
import { ManageTable } from '../../../types';
import { MANAGE_TABLE_NAMES } from '../../../types';
import { getCustomPaginationButtons } from '../../../utils';
import { CodeSandboxIcon, NotebookIcon, RefreshIcon } from '../../icons';
import { Loader } from '../../layout/index';
import './styles.css';

function Manage() {
  const navigate = useNavigate();
  const { path } = useParams();
  const location = useLocation();

  const [{ walletAddress }] = useWalletState();

  const [percent, setPercentLoaded] = useState<number | undefined>();
  const {
    isLoading: antTableLoading,
    percent: percentANTsLoaded,
    columns: antColumns,
    rows: antRows,
    sortAscending: antSortAscending,
    sortField: antSortField,
    refresh: refreshANTs,
  } = useWalletANTs();
  const {
    isLoading: domainTableLoading,
    percent: percentDomainsLoaded,
    columns: domainColumns,
    rows: domainRows,
    sortAscending: domainSortAscending,
    sortField: domainSortField,
    refresh: refreshDomains,
  } = useWalletDomains();

  const [tableLoading, setTableLoading] = useState(true);
  const [tablePage, setTablePage] = useState<number>(1);

  useEffect(() => {
    if (!path) {
      navigate('names');
      return;
    }
    setTablePage(1);
  }, [path]);

  useEffect(() => {
    if (path === 'ants') {
      setPercentLoaded(percentANTsLoaded);
    } else {
      setPercentLoaded(percentDomainsLoaded);
    }
    setTableLoading(domainTableLoading || antTableLoading);
  }, [
    path,
    domainSortAscending,
    domainSortField,
    domainTableLoading,
    domainRows,
    percentDomainsLoaded,
    antSortAscending,
    antSortField,
    antRows,
    antTableLoading,
    percentANTsLoaded,
  ]);

  useEffect(() => {
    if (percent === 100) {
      setPercentLoaded(undefined);
    }
  }, [percent]);

  function updatePage(page: number) {
    setTablePage(page);
  }

  return (
    <div className="page">
      <div className="flex-column" style={{ gap: '10px' }}>
        <div className="flex flex-start">
          <h1
            className="flex white"
            style={{
              width: 'fit-content',
              whiteSpace: 'nowrap',
            }}
          >
            Manage Assets
          </h1>
        </div>
        <div
          id="manage-table-wrapper"
          style={{
            position: 'relative',
            border: tableLoading ? '1px solid var(--text-faded)' : '',
            borderRadius: 'var(--corner-radius)',
            height: '100%',
            minHeight: '400px',
          }}
        >
          <div
            id="manage-table-toolbar"
            style={{ border: tableLoading ? 'none' : '' }}
          >
            <div className="table-selector-group">
              {Object.keys(MANAGE_TABLE_NAMES).map(
                (t: string, index: number) => (
                  <button
                    key={index}
                    className="table-selector text bold center"
                    onClick={() => {
                      navigate(`/manage/${t}${location.search.toString()}`);
                    }}
                    style={
                      path === t
                        ? {
                            color: 'var(--text-white)',
                            fill: 'var(--text-white)',
                            borderColor: 'var(--text-white)',
                          }
                        : {
                            borderColor: 'transparent',
                          }
                    }
                  >
                    {t === 'names' ? (
                      <NotebookIcon width="16px" height="16px" />
                    ) : (
                      <CodeSandboxIcon width="16px" height="16px" />
                    )}
                    {MANAGE_TABLE_NAMES[t as ManageTable]}
                    <div
                      className="table-selector-indicator"
                      style={
                        path === t
                          ? {
                              color: 'var(--text-white)',
                              fill: 'var(--text-white)',
                              borderColor: 'var(--text-white)',
                              backgroundColor: 'var(--text-white)',
                            }
                          : {
                              color: 'var(--text-grey)',
                              fill: 'var(--text-grey)',
                              borderColor: 'transparent',
                            }
                      }
                    ></div>
                  </button>
                ),
              )}
            </div>
            <button
              disabled={tableLoading}
              className={'button center pointer'}
              onClick={() =>
                path === 'ants'
                  ? refreshANTs()
                  : refreshDomains(walletAddress?.toString())
              }
              style={{
                position: 'absolute',
                right: '20px',
                top: '0px',
                bottom: '0px',
              }}
            >
              {tableLoading ? (
                <Loader size={20} color="var(--accent)" />
              ) : (
                <RefreshIcon height={16} width={16} fill="var(--text-grey)" />
              )}
            </button>
          </div>

          <Table
            prefixCls="manage-table"
            scroll={antRows.length ? { x: true } : {}}
            columns={path === 'ants' ? antColumns : domainColumns}
            dataSource={(path === 'ants' ? antRows : domainRows) as any}
            pagination={{
              position: ['bottomCenter'],
              rootClassName: 'table-pagination',
              itemRender: (page, type, originalElement) =>
                getCustomPaginationButtons({
                  page,
                  type,
                  originalElement,
                  currentPage: tablePage,
                }),
              onChange: updatePage,
              showPrevNextJumpers: true,
              showSizeChanger: false,
              current: tablePage,
            }}
            locale={{
              emptyText: (
                <div
                  className="flex flex-column center"
                  style={{ padding: '100px', boxSizing: 'border-box' }}
                >
                  {path === 'ants' ? (
                    <>
                      <span className="white bold" style={{ fontSize: '16px' }}>
                        No Name Tokens Found
                      </span>
                      <span
                        className={'grey'}
                        style={{ fontSize: '13px', maxWidth: '400px' }}
                      >
                        Arweave Name Tokens (ANTs) provide ownership and control
                        of ArNS names. With ANTs you can easily manage,
                        transfer, and adjust your domains, as well as create
                        undernames.
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="white bold" style={{ fontSize: '16px' }}>
                        No Registered Names Found
                      </span>
                      <span
                        className={'grey'}
                        style={{ fontSize: '13px', maxWidth: '400px' }}
                      >
                        Arweave Names are friendly names for data on the Arweave
                        blockchain. They serve to improve finding, sharing, and
                        access to data, resistant to takedowns or losses.
                      </span>
                    </>
                  )}
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
    </div>
  );
}

export default Manage;
