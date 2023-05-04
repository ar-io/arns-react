import { Pagination, Tooltip } from 'antd';
import { Table } from 'antd';
import { ColumnType } from 'rc-table/lib/interface';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useArweaveCompositeProvider, useIsMobile } from '../../../hooks';
import { useUndernames } from '../../../hooks/useUndernames/useUndernames';
import { useTransactionState } from '../../../state/contexts/TransactionState';
import {
  ArweaveTransactionID,
  INTERACTION_TYPES,
  PDNTContractJSON,
  RemoveRecordPayload,
  SetRecordPayload,
  UNDERNAME_TABLE_ACTIONS,
  UndernameMetadata,
  UndernameTableInteractionTypes,
  VALIDATION_INPUT_TYPES,
} from '../../../types';
import {
  TRANSACTION_DATA_KEYS,
  byteSize,
  isArweaveTransactionID,
  isObjectOfTransactionPayloadType,
  mapTransactionDataKeyToPayload,
} from '../../../utils';
import {
  SMARTWEAVE_MAX_TAG_SPACE,
  SMARTWEAVE_TAG_SIZE,
  STUB_ARWEAVE_TXID,
} from '../../../utils/constants';
import eventEmitter from '../../../utils/events';
import { ArrowLeft, TrashIcon } from '../../icons';
import ValidationInput from '../../inputs/text/ValidationInput/ValidationInput';
import DialogModal from '../../modals/DialogModal/DialogModal';
import ArPrice from '../ArPrice/ArPrice';
import Loader from '../Loader/Loader';

function Undernames() {
  const arweaveDataProvider = useArweaveCompositeProvider();
  const [, dispatchTransactionState] = useTransactionState();
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

  function resetActionModal() {
    setUndername(undefined);
    setTargetID(undefined);
    setTTL(undefined);
    setAction(undefined);
    setSelectedRow(undefined);
  }
  async function handleOnNext() {
    try {
      if (!id) {
        throw new Error('No PDNT ID found, unable to perform transaction.');
      }
      const confirmations = await arweaveDataProvider.getTransactionStatus(
        new ArweaveTransactionID(id),
      );
      if (confirmations < 1) {
        throw new Error(
          'PDNT must have a minimum of 1 confirmation before editing, this protects against editing contracts lost due to block reorgs.',
        );
      }
      switch (action) {
        case UNDERNAME_TABLE_ACTIONS.CREATE:
          {
            if (!undername) {
              throw new Error('Must enter an undername to create an undername');
            }
            if (undername === '@') {
              throw new Error(
                "Sorry, you cannot create the an undername called '@' as that is reserved for the record of the PDNS name.",
              );
            }
            if (SMARTWEAVE_MAX_TAG_SPACE < byteSize(undername)) {
              throw new Error(
                'Undername too large, please reduce in length to allow it to fit in the transaction tags.',
              );
            }
            const payload = mapTransactionDataKeyToPayload(
              INTERACTION_TYPES.SET_RECORD,
              [undername, targetID ?? STUB_ARWEAVE_TXID, ttl ?? 3600],
            );
            if (!payload) {
              throw new Error('Unable to generate transaction payload!');
            }
            if (
              !isObjectOfTransactionPayloadType<SetRecordPayload>(
                payload,
                TRANSACTION_DATA_KEYS[INTERACTION_TYPES.SET_RECORD].keys,
              )
            ) {
              throw new Error('Mismatching payload and interation type!');
            }
            dispatchTransactionState({
              type: 'setInteractionType',
              payload: INTERACTION_TYPES.SET_RECORD,
            });
            dispatchTransactionState({
              type: 'setTransactionData',
              payload: { ...payload, assetId: id },
            });
            navigate('/transaction', {
              state: `/manage/pdnts/${id}/undernames`,
            });
          }
          break;
        case UNDERNAME_TABLE_ACTIONS.REMOVE:
          {
            if (!selectedRow?.name) {
              throw new Error('Cannot find undername');
            }

            const payload = mapTransactionDataKeyToPayload(
              INTERACTION_TYPES.REMOVE_RECORD,
              [selectedRow.name],
            );
            if (!payload) {
              throw new Error('Unable to generate transaction payload!');
            }
            if (
              !isObjectOfTransactionPayloadType<RemoveRecordPayload>(
                payload,
                TRANSACTION_DATA_KEYS[INTERACTION_TYPES.REMOVE_RECORD].keys,
              )
            ) {
              throw new Error('Mismatching payload and interation type!');
            }
            dispatchTransactionState({
              type: 'setInteractionType',
              payload: INTERACTION_TYPES.REMOVE_RECORD,
            });
            dispatchTransactionState({
              type: 'setTransactionData',
              payload: { ...payload, assetId: id },
            });
            navigate('/transaction', {
              state: `/manage/pdnts/${id}/undernames`,
            });
          }
          break;
        case UNDERNAME_TABLE_ACTIONS.EDIT:
          {
            if (!selectedRow?.name) {
              throw new Error('Cannot find undername');
            }

            const payload = mapTransactionDataKeyToPayload(
              INTERACTION_TYPES.SET_RECORD,
              [
                selectedRow.name,
                targetID ?? selectedRow.targetID ?? STUB_ARWEAVE_TXID,
                ttl ?? selectedRow.ttlSeconds ?? 3600,
              ],
            );
            if (!payload) {
              throw new Error('Unable to generate transaction payload!');
            }
            if (
              !isObjectOfTransactionPayloadType<SetRecordPayload>(
                payload,
                TRANSACTION_DATA_KEYS[INTERACTION_TYPES.SET_RECORD].keys,
              )
            ) {
              throw new Error('Mismatching payload and interation type!');
            }
            dispatchTransactionState({
              type: 'setInteractionType',
              payload: INTERACTION_TYPES.SET_RECORD,
            });
            dispatchTransactionState({
              type: 'setTransactionData',
              payload: { ...payload, assetId: id },
            });
            navigate('/transaction', {
              state: `/manage/pdnts/${id}/undernames`,
            });
          }
          break;

        default:
          break;
      }
    } catch (error) {
      eventEmitter.emit('error', error);
    }
  }

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
                  onClick={() => setAction(UNDERNAME_TABLE_ACTIONS.CREATE)}
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
                    bordered={false}
                    scroll={{ x: true }}
                    columns={tableColumns}
                    dataSource={filteredTableData}
                    pagination={false}
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
                    onClick={() => setAction(UNDERNAME_TABLE_ACTIONS.CREATE)}
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
              action === UNDERNAME_TABLE_ACTIONS.CREATE
                ? 'Create Undername'
                : action === UNDERNAME_TABLE_ACTIONS.EDIT
                ? `Edit ${selectedRow?.name}`
                : action === UNDERNAME_TABLE_ACTIONS.REMOVE
                ? `Remove ${selectedRow?.name}`
                : ''
            }
            onNext={() => handleOnNext()}
            onCancel={() => {
              resetActionModal();
            }}
            body={
              <>
                {action === UNDERNAME_TABLE_ACTIONS.CREATE ? (
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
                {action === UNDERNAME_TABLE_ACTIONS.CREATE ||
                action === UNDERNAME_TABLE_ACTIONS.EDIT ? (
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
