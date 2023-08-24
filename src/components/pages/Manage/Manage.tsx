import { PlusOutlined } from '@ant-design/icons';
import { Table } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import logo from '../../../../assets/images/logo/looped-winston-white.gif';
import {
  useArweaveCompositeProvider,
  useIsMobile,
  useWalletAddress,
  useWalletDomains,
  useWalletPDNTs,
} from '../../../hooks';
import { ArweaveTransactionID, ManageTable } from '../../../types';
import { MANAGE_TABLE_NAMES } from '../../../types';
import { getCustomPaginationButtons } from '../../../utils';
import eventEmitter from '../../../utils/events';
import { CodeSandboxIcon, NotebookIcon, RefreshIcon } from '../../icons';
import { Loader } from '../../layout/index';
import './styles.css';

function Manage() {
  const arweaveDataProvider = useArweaveCompositeProvider();
  const { walletAddress } = useWalletAddress();
  const isMobile = useIsMobile();
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
  } = useWalletPDNTs(pdntIds);
  const {
    isLoading: domainTableLoading,
    percent: percentDomainsLoaded,
    columns: domainColumns,
    rows: domainRows,
    sortAscending: domainSortAscending,
    sortField: domainSortField,
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
      <div className="flex-column">
        <div className="flex flex-justify-between">
          <div className="table-selector-group">
            {Object.keys(MANAGE_TABLE_NAMES).map((t: string, index: number) => (
              <button
                key={index}
                className="table-selector text bold center"
                onClick={() => {
                  navigate(`/manage/${t}`);
                }}
                style={
                  path === t
                    ? {
                        borderColor: 'var(--text-white)',
                        color: 'var(--text-black)',
                        fill: 'var(--text-black)',
                        backgroundColor: 'var(--text-white)',
                        borderRadius: 'var(--corner-radius)',
                      }
                    : {
                        color: 'var(--text-white)',
                        fill: 'var(--text-white)',
                      }
                }
              >
                {t === 'names' ? (
                  <NotebookIcon width={'20px'} height="20px" />
                ) : (
                  <CodeSandboxIcon width={'20px'} height="20px" />
                )}
                {MANAGE_TABLE_NAMES[t as ManageTable]}
              </button>
            ))}
          </div>
          <div className="flex flex-row flex-right">
            <button
              disabled={tableLoading}
              className={
                tableLoading
                  ? 'outline-button center disabled-button'
                  : 'outline-button center'
              }
              style={{
                padding: '0.75em',
              }}
              onClick={() => walletAddress && fetchWalletPDNTs(walletAddress)}
            >
              <RefreshIcon height={20} width={20} fill="white" />
              {isMobile ? (
                <></>
              ) : (
                <span
                  className="text white"
                  style={{ fontSize: '16px', padding: '0 0.2em' }}
                >
                  Refresh
                </span>
              )}
            </button>

            <button
              className={'outline-button center'}
              style={{
                padding: '0.75em',
              }}
              onClick={() => navigate('/create')}
            >
              <span
                className="text white"
                style={{ fontSize: '16px', padding: '0 0.2em' }}
              >
                Create ANT
              </span>
            </button>
          </div>
        </div>
        <Table
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
          loading={{
            spinning: tableLoading,
            indicator: <></>,
            tip: (
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
                  className="flex flex-column center"
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
                  {!percent
                    ? `Querying for wallet contracts...${pdntIds.length} found`
                    : `Validating contracts...${Math.round(percent)}%`}
                </div>
              </div>
            ),
            style: {
              display: 'flex',
              flexDirection: 'column',
              height: '150%',
              width: '100%',
              color: 'white',
              fontSize: '16px',
              boxSizing: 'border-box',
            },
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
                      of ArNS names. With ANTs you can easily manage, transfer,
                      and adjust your domains, as well as create undernames.
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
                    to="/create"
                    className="button-secondary center hover"
                    style={{ gap: '8px' }}
                  >
                    <PlusOutlined width={'16px'} height={'16px'} />
                    Create an ANT
                  </Link>
                  <Link to="/" className="button-primary center hover">
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

export default Manage;
