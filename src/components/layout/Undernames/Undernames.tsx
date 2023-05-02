import { Pagination, Tooltip } from 'antd';
import Table from 'rc-table';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useArweaveCompositeProvider, useIsMobile } from '../../../hooks';
import { useUndernames } from '../../../hooks/useUndernames/useUndernames';
import {
  ArweaveTransactionID,
  PDNTContractJSON,
  UndernameMetadata,
} from '../../../types';
import { isArweaveTransactionID } from '../../../utils';
import { ArrowLeft } from '../../icons';
import Loader from '../Loader/Loader';

function Undernames() {
  const arweaveDataProvider = useArweaveCompositeProvider();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { id } = useParams();
  const [pdntId, setPDNTId] = useState<ArweaveTransactionID>(
    new ArweaveTransactionID(id!),
  );
  const [pdntState, setPDNTState] = useState<PDNTContractJSON>();
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
  } = useUndernames(pdntId);
  const [tableData, setTableData] = useState<any[]>([]);
  const [filteredTableData, setFilteredTableData] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [tableColumns, setTableColumns] = useState<any[]>();
  const [tablePage, setTablePage] = useState<number>(1);

  useEffect(() => {
    if (id && isArweaveTransactionID(id)) {
      setPDNTId(new ArweaveTransactionID(id));
    }
    arweaveDataProvider
      .getContractState(new ArweaveTransactionID(id!))
      .then((res) => setPDNTState(res as PDNTContractJSON));
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
              <span className="flex faded text-medium bold">
                <button
                  className="faded text-medium bold underline link center"
                  onClick={() => navigate('/manage/pdnts')}
                >
                  <ArrowLeft
                    width={30}
                    height={20}
                    viewBox={'0 0 20 20'}
                    fill={'var(--text-white)'}
                  />
                  Manage PDNTs
                </button>
                &nbsp;/&nbsp;
                <Tooltip
                  placement="top"
                  title={id}
                  showArrow={true}
                  overlayStyle={{
                    maxWidth: 'fit-content',
                  }}
                >
                  <button
                    className="faded text-medium bold underline link center"
                    onClick={() =>
                      navigate(`/manage/pdnts/${pdntId.toString()}`)
                    }
                  >
                    {pdntState?.name.length ? pdntState.name : '[PDNT]'}
                  </button>
                </Tooltip>
                &nbsp;/&nbsp;
                <span className="text-medium white">Manage Undernames</span>
              </span>
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
