import { Tooltip } from '@src/components/data-display';
import { Loader } from '@src/components/layout';
import { useArNSState, useModalState, useWalletState } from '@src/state';
import { Progress, Table } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import { useWalletANTs, useWalletDomains } from '../../../hooks';
import { ManageTable } from '../../../types';
import { MANAGE_TABLE_NAMES } from '../../../types';
import {
  doAntsRequireUpdate,
  getCustomPaginationButtons,
} from '../../../utils';
import { CodeSandboxIcon, NotebookIcon, RefreshIcon } from '../../icons';
import './styles.css';

function Manage() {
  const navigate = useNavigate();
  const { path } = useParams();
  const location = useLocation();
  const {
    columns: antColumns,
    rows: antRows,
    refresh: refreshANTs,
  } = useWalletANTs();
  const {
    columns: domainColumns,
    rows: domainRows,
    refresh: refreshDomains,
  } = useWalletDomains();
  const [{ percentLoaded: percent, loading: tableLoading, ants, luaSourceTx }] =
    useArNSState();
  const [{ walletAddress }] = useWalletState();
  const [, dispatchModalState] = useModalState();

  const [tablePage, setTablePage] = useState<number>(1);

  useEffect(() => {
    if (!path) {
      navigate('names');
      return;
    }
    setTablePage(1);
  }, [path]);

  function updatePage(page: number) {
    setTablePage(page);
  }

  return (
    <div className="page" style={{ overflow: 'auto' }}>
      <div className="flex-column" style={{ gap: '10px' }}>
        <div className="flex flex-start">
          <h1
            className="flex white text-2xl"
            style={{
              width: 'fit-content',
              whiteSpace: 'nowrap',
              marginTop: '0px',
            }}
          >
            Manage Assets
          </h1>
        </div>
        <div
          id="manage-table-wrapper"
          style={{
            position: 'relative',
            border: 'none',
            borderRadius: 'var(--corner-radius)',
            height: '100%',
            minHeight: '400px',
          }}
        >
          <div id="manage-table-toolbar">
            <div className="table-selector-group">
              {Object.keys(MANAGE_TABLE_NAMES).map(
                (t: string, index: number) => (
                  <button
                    key={index}
                    className="table-selector text bold"
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
            {tableLoading && percent > 0 && percent < 100 ? (
              <div
                className="flex flex-row center"
                style={{
                  padding: '20px 100px',
                }}
              >
                <Progress
                  type={'line'}
                  percent={percent}
                  strokeColor={{
                    '0%': '#F7C3A1',
                    '100%': '#DF9BE8',
                  }}
                  trailColor="var(--text-faded)"
                  format={(p) => `${p}%`}
                  strokeWidth={10}
                />
              </div>
            ) : (
              <div className="flex max-w-fit flex-row pr-10">
                {doAntsRequireUpdate({ ants, luaSourceTx }) && (
                  <Tooltip
                    message={'Your ANTs require an update'}
                    icon={
                      <button
                        onClick={() =>
                          dispatchModalState({
                            type: 'setModalOpen',
                            payload: { showUpgradeAntModal: true },
                          })
                        }
                        className="h-fit animate-pulse rounded-[4px] bg-primary-thin px-4 py-1 text-sm text-primary transition-all hover:bg-primary hover:text-black"
                      >
                        Upgrade ANTs
                      </button>
                    }
                  />
                )}
                <button
                  disabled={tableLoading}
                  className={'button center pointer'}
                  onClick={() =>
                    path === 'ants' ? refreshANTs() : refreshDomains()
                  }
                  style={{
                    position: 'absolute',
                    right: '20px',
                    top: '0px',
                    bottom: '0px',
                  }}
                >
                  <RefreshIcon height={16} width={16} fill="var(--text-grey)" />
                </button>
              </div>
            )}
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
              pageSize: 10,
              current: tablePage,
            }}
            locale={{
              emptyText: !walletAddress ? (
                <div
                  className="flex flex-column text-medium center white"
                  style={{
                    padding: '100px',
                    boxSizing: 'border-box',
                    gap: '20px',
                  }}
                >
                  <button
                    onClick={() =>
                      navigate('/connect', {
                        // redirect logic for connect page to use
                        state: { from: '/manage', to: '/manage' },
                      })
                    }
                    className="button-secondary center"
                    style={{
                      boxSizing: 'border-box',
                      padding: '10px',
                      width: 'fit-content',
                    }}
                  >
                    Connect
                  </button>
                  &nbsp; Connect your wallet to view your assets.
                </div>
              ) : tableLoading ? (
                <div
                  className="flex flex-column center white"
                  style={{ padding: '100px', boxSizing: 'border-box' }}
                >
                  <Loader message="Loading assets..." />
                </div>
              ) : (
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
