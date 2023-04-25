import { Pagination } from 'antd';
import Table from 'rc-table';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useIsMobile } from '../../../hooks';
import { useUndernames } from '../../../hooks/useUndernames/useUndernames';
import { ArweaveTransactionID, UndernameMetadata } from '../../../types';
import { isArweaveTransactionID } from '../../../utils';
import Loader from '../Loader/Loader';

function Undernames() {
  const isMobile = useIsMobile();
  const { id } = useParams();
  const [antId, setAntId] = useState<ArweaveTransactionID>(
    new ArweaveTransactionID(id!),
  );
  // TODO implement data editing
  const [selectedRow, setSelectedRow] = useState<UndernameMetadata>(); // eslint-disable-line
  const [percent, setPercentLoaded] = useState<number | undefined>();
  const {
    isLoading: undernameTableLoading,
    percent: percentUndernamesLoaded,
    columns: undernameColumns,
    rows: undernameRows,
    selectedRow: selectedUndernameRow,
    sortAscending: undernameSortAscending,
    sortField: undernameSortField,
  } = useUndernames(antId);
  const [tableData, setTableData] = useState<any[]>([]);
  const [filteredTableData, setFilteredTableData] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [tableColumns, setTableColumns] = useState<any[]>();
  const [tablePage, setTablePage] = useState<number>(1);

  useEffect(() => {
    if (id && isArweaveTransactionID(id)) {
      setAntId(new ArweaveTransactionID(id));
    }
  }, [id]);

  useEffect(() => {
    if (id && isArweaveTransactionID(id)) {
      setTableLoading(undernameTableLoading);
      setTableData(undernameRows);
      setTableColumns(undernameColumns);
      setPercentLoaded(percentUndernamesLoaded);
      setSelectedRow(selectedUndernameRow);
      const baseIndex = Math.max((tablePage - 1) * 10, 0);
      const endIndex = tablePage * 10;
      const filteredData = undernameRows.slice(baseIndex, endIndex);
      setFilteredTableData(filteredData);
    }
  }, [
    id,
    undernameSortAscending,
    undernameSortField,
    undernameRows,
    selectedUndernameRow,
    undernameTableLoading,
    percentUndernamesLoaded,
  ]);

  function updatePage(page: number) {
    setTablePage(page);
  }

  return (
    <>
      <div className="page">
        <div className="flex-column">
          <div className="flex flex-justify-between">
            <div className="flex flex-row text-medium white bold">
              Undernames
            </div>
            {/* TODO add table breadcrumb */}
            <div className="flex flex-row flex-right">
              <button
                disabled={undernameTableLoading}
                className={
                  undernameTableLoading
                    ? 'outline-button center disabled-button'
                    : 'outline-button center'
                }
                style={{
                  padding: '0.75em',
                }}
                onClick={() => alert('implement add undername functionality')}
              >
                {/* TODO get undername logo from figma */}
                {isMobile ? (
                  <></>
                ) : (
                  <span
                    className="text white"
                    style={{ fontSize: '16px', padding: '0 0.2em' }}
                  >
                    Add Undername
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
                message={`Loading undernames...${Math.round(percent!)}%`}
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
    </>
  );
}

export default Undernames;
