import { Pagination } from 'antd';
import Table from 'rc-table';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useIsMobile, useWalletAddress } from '../../../hooks';
import useWalletANTs from '../../../hooks/useWalletANTs/useWalletANTs';
import useWalletDomains from '../../../hooks/useWalletDomains/useWalletDomains';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { AntMetadata, ArweaveTransactionID } from '../../../types';
import { TABLE_TYPES } from '../../../types';
import { CodeSandboxIcon, NotebookIcon, RefreshIcon } from '../../icons';
import { Loader } from '../../layout/index';
import './styles.css';

function Manage() {
  const [
    { arnsSourceContract, arweaveDataProvider, lastFetchedAnts },
    dispatchGlobalState,
  ] = useGlobalState();
  const { walletAddress } = useWalletAddress();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { path } = useParams();

  const modalRef = useRef(null);
  const [cursor] = useState<string | undefined>();
  const [antIds, setAntIDs] = useState<ArweaveTransactionID[]>([]);
  const [selectedRow, setSelectedRow] = useState<AntMetadata>();
  const [percent, setPercentLoaded] = useState<number | undefined>();
  const {
    isLoading: antTableLoading,
    percent: percentANTsLoaded,
    columns: antColumns,
    rows: antRows,
    selectedRow: selectedAntRow,
    sortAscending: antSortAscending,
    sortField: antSortField,
  } = useWalletANTs(antIds);
  const {
    isLoading: domainTableLoading,
    percent: percentDomainsLoaded,
    columns: domainColumns,
    rows: domainRows,
    sortAscending: domainSortAscending,
    sortField: domainSortField,
  } = useWalletDomains(antIds);

  const [tableData, setTableData] = useState<any[]>([]);
  const [filteredTableData, setFilteredTableData] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [tableColumns, setTableColumns] = useState<any[]>();
  const [tablePage, setTablePage] = useState<number>(1);
  const [error, setError] = useState();

  useEffect(() => {
    if (!path) {
      navigate('names');
    }
  }, [path]);

  useEffect(() => {
    // todo: move this to a separate function to manage error state and poll for new ants to concat them to the state.
    if (
      walletAddress &&
      (!lastFetchedAnts || Date.now() - lastFetchedAnts >= 50_000)
    ) {
      fetchWalletAnts(walletAddress);
    }
  }, [walletAddress?.toString()]);

  useEffect(() => {
    const baseIndex = Math.max((tablePage - 1) * 10, 0);
    const endIndex = tablePage * 10;
    const filteredData = tableData.slice(baseIndex, endIndex);
    setFilteredTableData(filteredData);
  }, [tablePage]);

  useEffect(() => {
    if (path === 'ants') {
      setTableLoading(antTableLoading);
      setTableData(antRows);
      setTableColumns(antColumns);
      setPercentLoaded(percentANTsLoaded);
      setSelectedRow(selectedAntRow);
      const baseIndex = Math.max((tablePage - 1) * 10, 0);
      const endIndex = tablePage * 10;
      const filteredData = antRows.slice(baseIndex, endIndex);
      setFilteredTableData(filteredData);
    }
  }, [
    path,
    antSortAscending,
    antSortField,
    antRows,
    selectedAntRow,
    antTableLoading,
    percentANTsLoaded,
  ]);

  useEffect(() => {
    if (path === 'names') {
      setTableLoading(domainTableLoading);
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
    antTableLoading,
    percentDomainsLoaded,
  ]);

  useEffect(() => {
    if (selectedRow) {
      navigate(selectedRow.id);
    }
  }, [selectedRow]);

  useEffect(() => {
    if (percent === 100) {
      setPercentLoaded(undefined);
    }
  }, [percent]);

  async function fetchWalletAnts(address: ArweaveTransactionID) {
    try {
      setError(undefined);
      const { ids } = await arweaveDataProvider.getContractsForWallet(
        arnsSourceContract.approvedANTSourceCodeTxs.map(
          (id: string) => new ArweaveTransactionID(id),
        ),
        address,
        cursor,
      );
      setAntIDs(ids);
      dispatchGlobalState({
        type: 'lastFetchedAnts',
        payload: Date.now(),
      });
    } catch (error: any) {
      console.error(error);
      // TODO: emit error message to error listener
      setError(error.message);
    }
  }

  function handleClickOutside(e: any) {
    if (modalRef.current && modalRef.current === e.target) {
      setSelectedRow(undefined);
    }
    return;
  }

  function updatePage(page: number) {
    setTablePage(page);
  }

  return (
    // eslint-disable-next-line
    <div className="page" ref={modalRef} onClick={handleClickOutside}>
      <div className="flex-column">
        <div className="flex flex-justify-between">
          <div className="table-selector-group">
            {['names', 'ants'].map((t: string, index: number) => (
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
                {t === TABLE_TYPES.NAME ? (
                  <NotebookIcon width={'20px'} height="20px" />
                ) : (
                  <CodeSandboxIcon width={'20px'} height="20px" />
                )}
                {t}
              </button>
            ))}
          </div>
          <div className="flex flex-row flex-right">
            <button
              disabled={antTableLoading}
              className={
                antTableLoading
                  ? 'outline-button center disabled-button'
                  : 'outline-button center'
              }
              style={{
                padding: '0.75em',
              }}
              onClick={() => walletAddress && fetchWalletAnts(walletAddress)}
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
        {tableLoading && !error ? (
          <div
            className="flex center"
            style={{ paddingTop: '10%', justifyContent: 'center' }}
          >
            <Loader
              message={
                !percent
                  ? `Querying for wallet contracts...${antIds.length} found`
                  : `Validating contracts...${Math.round(percent)}%`
              }
            />
          </div>
        ) : (
          <>
            <Table
              scroll={{ x: true }}
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
            />
          </>
        )}
      </div>
    </div>
  );
}

export default Manage;
