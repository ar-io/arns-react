import { Pagination, Tooltip } from 'antd';
import Table from 'rc-table';
import { ColumnType } from 'rc-table/lib/interface';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useArweaveCompositeProvider, useIsMobile } from '../../../hooks';
import { useUndernames } from '../../../hooks/useUndernames/useUndernames';
import {
  ArweaveTransactionID,
  PDNTContractJSON,
  UndernameMetadata,
  UndernameTableInteractionTypes,
  VALIDATION_INPUT_TYPES,
} from '../../../types';
import { isArweaveTransactionID } from '../../../utils';
import { SMARTWEAVE_TAG_SIZE } from '../../../utils/constants';
import eventEmitter from '../../../utils/events';
import { ArrowLeft, TrashIcon } from '../../icons';
import ValidationInput from '../../inputs/text/ValidationInput/ValidationInput';
import DialogModal from '../../modals/DialogModal/DialogModal';
import ArPrice from '../ArPrice/ArPrice';
import Loader from '../Loader/Loader';

function Undernames() {
  const arweaveDataProvider = useArweaveCompositeProvider();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { id } = useParams();
  const [pdntId, setPDNTId] = useState<ArweaveTransactionID>();
  const [pdntState, setPDNTState] = useState<PDNTContractJSON>();
  // TODO implement data editing
  const [selectedRow, setSelectedRow] = useState<
    UndernameMetadata | undefined
  >();
  const [percent, setPercentLoaded] = useState<number>(0);
  const {
    isLoading: undernameTableLoading,
    percent: percentUndernamesLoaded,
    columns: undernameColumns,
    rows: undernameRows,
    selectedRow: selectedUndernameRow,
    sortAscending: undernameSortAscending,
    sortField: undernameSortField,
    action: undernameAction,
  } = useUndernames(pdntId);
  const [tableData, setTableData] = useState<UndernameMetadata[]>([]);
  const [filteredTableData, setFilteredTableData] = useState<
    UndernameMetadata[]
  >([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [tableColumns, setTableColumns] =
    useState<ColumnType<UndernameMetadata>[]>();
  const [tablePage, setTablePage] = useState<number>(1);

  // modal state
  const [action, setAction] = useState<
    UndernameTableInteractionTypes | undefined
  >();
  const [undername, setUndername] = useState<string>();
  const [targetID, setTargetID] = useState<string>();
  const [ttl, setTTL] = useState<number>();

  useEffect(() => {
    if (!id) {
      eventEmitter.emit('error', new Error('Missing PDNT transaction ID.'));
      navigate('/manage/pdnts');
      return;
    }
    setPDNTId(new ArweaveTransactionID(id));
    arweaveDataProvider
      .getContractState<PDNTContractJSON>(new ArweaveTransactionID(id))
      .then((state) => setPDNTState(state));
  }, [id]);

  useEffect(() => {
    if (!id) {
      eventEmitter.emit('error', new Error('Missing PDNT transaction ID.'));
      navigate('/manage/pdnts');
      return;
    }
    if (isArweaveTransactionID(id)) {
      setAction(undernameAction);
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
    undernameAction,
  ]);

  function updatePage(page: number) {
    setTablePage(page);
  }

  return (
    <>
      <div className="page">
        <div className="flex-column">
          <div className="flex flex-justify-between">
            <div className="flex flex-row text-large white bold">
              <span className="flex faded text-large bold">
                <button
                  className="faded text-large bold underline link center"
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
                    className="faded text-large bold underline link center"
                    onClick={() =>
                      navigate(`/manage/pdnts/${pdntId?.toString()}`)
                    }
                  >
                    {pdntState?.name.length
                      ? pdntState.name
                      : `${id?.slice(0, 4)}...${id?.slice(-4)}`}
                  </button>
                </Tooltip>
                &nbsp;/&nbsp;
                <span className="text-large white">Manage Undernames</span>
              </span>
            </div>
            <div className="flex flex-row flex-right">
              {filteredTableData.length ? (
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
                  onClick={() => setAction('create')}
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
              ) : (
                <></>
              )}
            </div>
          </div>
          {tableLoading ? (
            <div
              className="flex center"
              style={{ paddingTop: '10%', justifyContent: 'center' }}
            >
              <Loader
                message={`Loading undernames... ${Math.round(percent)}%`}
              />
            </div>
          ) : (
            <>
              {filteredTableData.length ? (
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
                    showSizeChanger={false}
                  />
                </>
              ) : (
                <div
                  className="flex flex-column flex-center"
                  style={{ marginTop: '100px' }}
                >
                  <span className="text-large white bold center">
                    No Undernames present on PDNT
                  </span>
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
                    onClick={() => setAction('create')}
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
              )}
            </>
          )}
        </div>
      </div>
      {action ? (
        <div className="modal-container">
          <DialogModal
            title={
              action === 'create'
                ? 'Create Undername'
                : action === 'edit'
                ? `Edit ${selectedRow?.name}`
                : action === 'remove'
                ? `Remove ${selectedRow?.name}`
                : ''
            }
            onCancel={() => {
              setUndername(undefined);
              setTargetID(undefined);
              setTTL(undefined);
              setAction(undefined);
            }}
            body={
              <>
                {action === 'create' ? (
                  <ValidationInput
                    inputClassName="data-input"
                    showValidationIcon={false}
                    showValidationOutline={true}
                    minNumber={100}
                    maxNumber={1000000}
                    wrapperCustomStyle={{
                      width: '100%',
                      border: 'none',
                      overflow: 'hidden',
                      fontSize: '16px',
                      outline: 'none',
                      borderRadius: 'var(--corner-radius)',
                      boxSizing: 'border-box',
                    }}
                    placeholder={`Enter an Undername`}
                    value={undername}
                    setValue={(e) => {
                      setUndername(e);
                    }}
                    validationPredicates={{}}
                  />
                ) : (
                  <></>
                )}
                {action === 'create' || action === 'edit' ? (
                  <>
                    <ValidationInput
                      inputClassName="data-input"
                      showValidationIcon={true}
                      showValidationOutline={true}
                      minNumber={100}
                      maxNumber={1000000}
                      wrapperCustomStyle={{
                        width: '100%',
                        border: 'none',
                        overflow: 'hidden',
                        fontSize: '16px',
                        outline: 'none',
                        borderRadius: 'var(--corner-radius)',
                        boxSizing: 'border-box',
                      }}
                      inputCustomStyle={{ paddingRight: '30px' }}
                      placeholder={`Enter a Target ID`}
                      value={targetID}
                      setValue={(e) => {
                        setTargetID(e);
                      }}
                      validationPredicates={{
                        [VALIDATION_INPUT_TYPES.ARWEAVE_ID]: (id: string) =>
                          arweaveDataProvider.validateArweaveId(id),
                      }}
                      maxLength={43}
                    />
                    <ValidationInput
                      inputClassName="data-input"
                      showValidationIcon={false}
                      showValidationOutline={true}
                      inputType={'number'}
                      minNumber={100}
                      maxNumber={1000000}
                      wrapperCustomStyle={{
                        width: '100%',
                        border: 'none',
                        overflow: 'hidden',
                        fontSize: '16px',
                        outline: 'none',
                        borderRadius: 'var(--corner-radius)',
                        display: 'flex',
                      }}
                      placeholder={`Enter TTL Seconds`}
                      value={ttl}
                      setValue={(e) => {
                        e ? setTTL(+e) : setTTL(undefined);
                      }}
                      validationPredicates={{}}
                    />
                  </>
                ) : (
                  <div
                    className="flex flex-row flex-center"
                    style={{ marginTop: '30px' }}
                  >
                    <TrashIcon width={75} height={75} fill="white" />
                  </div>
                )}
              </>
            }
            showClose={false}
            footer={
              <span className="text white bold">
                <ArPrice dataSize={SMARTWEAVE_TAG_SIZE} />
              </span>
            }
          />
        </div>
      ) : (
        <></>
      )}
    </>
  );
}

export default Undernames;
