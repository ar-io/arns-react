import { Pagination } from 'antd';
import Table from 'rc-table';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  useArweaveCompositeProvider,
  useIsMobile,
  useWalletAddress,
  useWalletDomains,
  useWalletPDNTs,
} from '../../../hooks';
import { ArweaveTransactionID, ManageTable } from '../../../types';
import { MANAGE_TABLE_NAMES } from '../../../types';
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
  const [filteredTableData, setFilteredTableData] = useState<any[]>([]);
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
    const baseIndex = Math.max((tablePage - 1) * 10, 0);
    const endIndex = tablePage * 10;
    const filteredData = tableData.slice(baseIndex, endIndex);
    setFilteredTableData(filteredData);
  }, [tablePage]);

  useEffect(() => {
    if (path === 'pdnts') {
      setTableData(pdntRows);
      setTableColumns(pdntColumns);
      setPercentLoaded(percentPDNTsLoaded);
      const baseIndex = Math.max((tablePage - 1) * 10, 0);
      const endIndex = tablePage * 10;
      const filteredData = pdntRows.slice(baseIndex, endIndex);
      setFilteredTableData(filteredData);
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
      const baseIndex = Math.max((tablePage - 1) * 10, 0);
      const endIndex = tablePage * 10;
      const filteredData = domainRows.slice(baseIndex, endIndex);
      setFilteredTableData(filteredData);
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
      // TODO: fetch approved source code TX id's from cache, then pass here
      const { ids } = await arweaveDataProvider.getContractsForWallet(address);
      setPDNTIDs(ids);
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
          </div>
        </div>
        {tableLoading ? (
          <div
            className="flex center"
            style={{ paddingTop: '10%', justifyContent: 'center' }}
          >
            <Loader
              message={
                !percent
                  ? `Querying for wallet contracts...${pdntIds.length} found`
                  : `Validating contracts...${Math.round(percent)}%`
              }
            />
          </div>
        ) : (
          <>
            <Table
              scroll={pdntIds.length ? { x: true } : {}}
              columns={tableColumns}
              data={filteredTableData}
            />
            <Pagination
              pageSize={10}
              onChange={updatePage}
              current={tablePage}
              total={tableData.length}
              rootClassName="center"
              defaultCurrent={1}
              showSizeChanger={false}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default Manage;
