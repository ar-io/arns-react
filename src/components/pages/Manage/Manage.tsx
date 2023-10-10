import { Table } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import {
  useArweaveCompositeProvider,
  useWalletANTs,
  useWalletAddress,
  useWalletDomains,
} from '../../../hooks';
import { ArweaveTransactionID, ManageTable } from '../../../types';
import { MANAGE_TABLE_NAMES } from '../../../types';
import { getCustomPaginationButtons } from '../../../utils';
import eventEmitter from '../../../utils/events';
import {
  CodeSandboxIcon,
  DownloadIcon,
  NotebookIcon,
  RefreshIcon,
} from '../../icons';
import { Loader } from '../../layout/index';
import PageLoader from '../../layout/progress/PageLoader/PageLoader';
import './styles.css';

function Manage() {
  const arweaveDataProvider = useArweaveCompositeProvider();
  const { walletAddress } = useWalletAddress();
  const navigate = useNavigate();
  const { path } = useParams();

  const modalRef = useRef(null);
  const [pdntIds, setPDNTIDs] = useState<ArweaveTransactionID[]>([]);
  const [percent, setPercentLoaded] = useState<number | undefined>();
  const {
    isLoading: pdntTableLoading,
    percent: percentPDNTsLoaded,
    columns: pdntColumns,
    rows: pdntRows,
    sortAscending: pdntSortAscending,
    sortField: pdntSortField,
  } = useWalletANTs(pdntIds);
  const {
    isLoading: domainTableLoading,
    percent: percentDomainsLoaded,
    columns: domainColumns,
    rows: domainRows,
    sortAscending: domainSortAscending,
    sortField: domainSortField,
    loadingManageDomain,
  } = useWalletDomains(pdntIds);

  const [tableData, setTableData] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [tableColumns, setTableColumns] = useState<any[]>();
  const [tablePage, setTablePage] = useState<number>(1);

  useEffect(() => {
    if (!path) {
      navigate('names');
    }
  }, [path]);

  useEffect(() => {
    // todo: move this to a separate function to manage error state and poll for new pdnts to concat them to the state.
    if (walletAddress) {
      fetchWalletPDNTs(walletAddress);
    }
  }, [walletAddress?.toString()]);

  useEffect(() => {
    if (path === 'ants') {
      setTableData(pdntRows);
      setTableColumns(pdntColumns);
      setPercentLoaded(percentPDNTsLoaded);
    }
  }, [
    path,
    pdntSortAscending,
    pdntSortField,
    pdntRows,
    pdntTableLoading,
    percentPDNTsLoaded,
  ]);

  useEffect(() => {
    if (path === 'names') {
      setTableData(domainRows);
      setTableColumns(domainColumns);
      setPercentLoaded(percentDomainsLoaded);
    }
  }, [
    path,
    domainSortAscending,
    domainSortField,
    domainTableLoading,
    domainRows,
    pdntTableLoading,
    percentDomainsLoaded,
  ]);

  useEffect(() => {
    setTableLoading(domainTableLoading || pdntTableLoading);
  }, [domainTableLoading, pdntTableLoading]);

  useEffect(() => {
    if (percent === 100) {
      setPercentLoaded(undefined);
    }
  }, [percent]);

  async function fetchWalletPDNTs(address: ArweaveTransactionID) {
    try {
      setTableLoading(true);
      const { contractTxIds } = await arweaveDataProvider.getContractsForWallet(
        address,
        'ant', // only fetches contracts that have a state that matches ant spec
      );
      if (!contractTxIds.length) {
        throw new Error('No contracts found for wallet');
      }
      setPDNTIDs(contractTxIds);
    } catch (error: any) {
      eventEmitter.emit('error', error);
      setTableLoading(false);
    }
  }

  function updatePage(page: number) {
    setTablePage(page);
  }

  return (
    <div className="page" ref={modalRef}>
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
                      navigate(`/manage/${t}`);
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
              className={
                tableLoading
                  ? 'button center disabled-button'
                  : 'button center hover'
              }
              onClick={() => walletAddress && fetchWalletPDNTs(walletAddress)}
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
          {!tableLoading ? (
            <Table
              prefixCls="manage-table"
              scroll={pdntIds.length ? { x: true } : {}}
              columns={tableColumns}
              dataSource={tableData}
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
                        <span
                          className="white bold"
                          style={{ fontSize: '16px' }}
                        >
                          No Name Tokens Found
                        </span>
                        <span
                          className={'grey'}
                          style={{ fontSize: '13px', maxWidth: '400px' }}
                        >
                          Arweave Name Tokens (ANTs) provide ownership and
                          control of ArNS names. With ANTs you can easily
                          manage, transfer, and adjust your domains, as well as
                          create undernames.
                        </span>
                      </>
                    ) : (
                      <>
                        <span
                          className="white bold"
                          style={{ fontSize: '16px' }}
                        >
                          No Registered Names Found
                        </span>
                        <span
                          className={'grey'}
                          style={{ fontSize: '13px', maxWidth: '400px' }}
                        >
                          Arweave Names are friendly names for data on the
                          Arweave blockchain. They serve to improve finding,
                          sharing, and access to data, resistant to takedowns or
                          losses.
                        </span>
                      </>
                    )}
                    <div
                      className="flex flex-row center"
                      style={{ gap: '16px' }}
                    >
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
                        }}
                      >
                        Search for a Name
                      </Link>
                    </div>
                  </div>
                ),
              }}
            />
          ) : (
            <div
              className={'flex flex-column center'}
              style={{
                position: 'absolute',
                height: '100%',
                width: '100%',
                boxSizing: 'border-box',
                top: '0px',
              }}
            >
              <div
                className="flex flex-column center white"
                style={{
                  background: 'var(--card-bg)',
                  borderRadius: 'var(--corner-radius)',
                  padding: '20px',
                  width: 'fit-content',
                }}
              >
                <Loader
                  size={80}
                  color="var(--accent)"
                  wrapperStyle={{ margin: 'auto', position: 'static' }}
                />
                {/* TODO: [PE-4637] fix infinity load percentage */}
                {!percent
                  ? `Querying for wallet contracts...${pdntIds.length} found`
                  : `Validating contracts...${Math.round(percent)}%`}
              </div>
            </div>
          )}
        </div>
      </div>
      {loadingManageDomain ? (
        <div className="modal-container">
          <PageLoader
            loading={true}
            message={`Loading details for ${loadingManageDomain}`}
          />
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default Manage;
