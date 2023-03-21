import { Pagination } from 'antd';
import Table from 'rc-table';
import { useEffect, useRef, useState } from 'react';

import { useIsMobile, useWalletAddress } from '../../../hooks';
import useWalletANTs from '../../../hooks/useWalletANTs/useWalletANTs';
import useWalletDomains from '../../../hooks/useWalletDomains/useWalletDomains';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { AntMetadata, ArweaveTransactionID } from '../../../types';
import { TABLE_TYPES } from '../../../types';
import { CodeSandboxIcon, NotebookIcon, RefreshIcon } from '../../icons';
import { Loader } from '../../layout/index';
import ManageAntModal from '../../modals/ManageAntModal/ManageAntModal';
import './styles.css';

function Manage() {
  const [{ arnsSourceContract, arweaveDataProvider }] = useGlobalState();
  const { walletAddress } = useWalletAddress();
  const isMobile = useIsMobile();

  const [tableType, setTableType] = useState<string>(TABLE_TYPES.NAME);

  const modalRef = useRef(null);
  const [cursor] = useState<string | undefined>();
  const [antIds, setAntIDs] = useState<ArweaveTransactionID[]>([]);
  const [selectedRow, setSelectedRow] = useState<AntMetadata>();
  const {
    isLoading: antTableLoading,
    columns: antColumns,
    rows: antRows,
    selectedRow: selectedAntRow,
    sortAscending: antSortAscending,
    sortField: antSortField,
  } = useWalletANTs(antIds);
  const {
    isLoading: domainTableLoading,
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
  const [lastUpdated, setLastedUpdated] = useState<number>(Date.now());

  useEffect(() => {
    // todo: move this to a separate function to manage error state and poll for new ants to concat them to the state.
    if (walletAddress) {
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
    if (tableType === TABLE_TYPES.ANT) {
      setTableLoading(antTableLoading);
      setTableData(antRows);
      setTableColumns(antColumns);
      const baseIndex = Math.max((tablePage - 1) * 10, 0);
      const endIndex = tablePage * 10;
      const filteredData = antRows.slice(baseIndex, endIndex);
      setFilteredTableData(filteredData);
    }
  }, [tableType, antSortAscending, antSortField, antRows, antTableLoading]);

  useEffect(() => {
    if (tableType === TABLE_TYPES.NAME) {
      setTableLoading(domainTableLoading);
      setTableData(domainRows);
      setTableColumns(domainColumns);
      const baseIndex = Math.max((tablePage - 1) * 10, 0);
      const endIndex = tablePage * 10;
      const filteredData = domainRows.slice(baseIndex, endIndex);
      setFilteredTableData(filteredData);
    }
  }, [
    tableType,
    domainSortAscending,
    domainSortField,
    domainTableLoading,
    domainRows,
    antTableLoading,
  ]);

  useEffect(() => {
    setSelectedRow(selectedAntRow);
  }, [selectedAntRow]);

  async function fetchWalletAnts(address: ArweaveTransactionID) {
    try {
      const { ids } = await arweaveDataProvider.getContractsForWallet(
        arnsSourceContract.approvedANTSourceCodeTxs.map(
          (id: string) => new ArweaveTransactionID(id),
        ),
        address,
        cursor,
      );
      setAntIDs(ids);
      setLastedUpdated(Date.now());
    } catch (error: any) {
      console.error(error);
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
        {selectedRow ? (
          <ManageAntModal
            closeModal={() => setSelectedRow(undefined)}
            antDetails={selectedRow}
            contractId={new ArweaveTransactionID(selectedRow.id)}
          />
        ) : (
          <>
            <div className="flex flex-justify-between">
              <div className="table-selector-group">
                {[TABLE_TYPES.NAME, TABLE_TYPES.ANT].map(
                  (t: string, index: number) => (
                    <button
                      key={index}
                      className="table-selector text bold center"
                      onClick={() => {
                        setTableType(t);
                        setTablePage(1);
                        // TODO: update this to a specific block height, currently set to ~2 mins
                        if (
                          lastUpdated < Date.now() - 120_000 &&
                          walletAddress
                        ) {
                          fetchWalletAnts(walletAddress);
                        }
                      }}
                      style={
                        tableType === t
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
                  ),
                )}
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
                  onClick={() =>
                    walletAddress && fetchWalletAnts(walletAddress)
                  }
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
                <Loader size={80} />
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
          </>
        )}
      </div>
    </div>
  );
}

export default Manage;
