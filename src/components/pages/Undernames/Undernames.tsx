import { Table, TableProps } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useArweaveCompositeProvider, useIsMobile } from '../../../hooks';
import { useUndernames } from '../../../hooks/useUndernames/useUndernames';
import { useTransactionState } from '../../../state/contexts/TransactionState';
import {
  ArweaveTransactionID,
  CreateOrEditUndernameInteraction,
  INTERACTION_TYPES,
  PDNTContractJSON,
  RemoveRecordPayload,
  SetRecordPayload,
  UNDERNAME_TABLE_ACTIONS,
  UndernameMetadata,
  VALIDATION_INPUT_TYPES,
  createOrUpdateUndernameInteractions,
} from '../../../types';
import {
  TRANSACTION_DATA_KEYS,
  byteSize,
  getCustomPaginationButtons,
  isArweaveTransactionID,
  isObjectOfTransactionPayloadType,
  mapTransactionDataKeyToPayload,
  validateTTLSeconds,
} from '../../../utils';
import {
  MAX_TTL_SECONDS,
  MIN_SAFE_EDIT_CONFIRMATIONS,
  MIN_TTL_SECONDS,
  SMARTWEAVE_MAX_TAG_SPACE,
  SMARTWEAVE_TAG_SIZE,
  STUB_ARWEAVE_TXID,
} from '../../../utils/constants';
import eventEmitter from '../../../utils/events';
import { PlusIcon, TrashIcon } from '../../icons';
import ValidationInput from '../../inputs/text/ValidationInput/ValidationInput';
import { Loader } from '../../layout';
import ArPrice from '../../layout/ArPrice/ArPrice';
import DialogModal from '../../modals/DialogModal/DialogModal';
import './styles.css';

function Undernames() {
  const arweaveDataProvider = useArweaveCompositeProvider();
  const [, dispatchTransactionState] = useTransactionState();
  const navigate = useNavigate();
  const { id } = useParams();
  const [pdntId, setPDNTId] = useState<ArweaveTransactionID>();
  const [pdntState, setPDNTState] = useState<PDNTContractJSON>();
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
    action,
    setAction,
    undernameFilter,
  } = useUndernames(pdntId);
  const [tableLoading, setTableLoading] = useState(true);
  const [tablePage, setTablePage] = useState<number>(1);

  // modal state
  const [confirmations, setConfirmations] = useState(0);
  const [undername, setUndername] = useState<string>();
  const [targetID, setTargetID] = useState<string>();
  const [ttl, setTTL] = useState<number>();
  const [changesValid, setChangesValid] = useState<boolean>();

  useEffect(() => {
    if (!id) {
      eventEmitter.emit('error', new Error('Missing PDNT transaction ID.'));
      navigate('/manage/ants');
      return;
    }
    setPDNTId(new ArweaveTransactionID(id));

    // TODO: move this to function and wrap in Promise.all so they trigger concurrently
    arweaveDataProvider
      .getContractState<PDNTContractJSON>(new ArweaveTransactionID(id))
      .then((state) => setPDNTState(state));

    arweaveDataProvider
      .getTransactionStatus(new ArweaveTransactionID(id))
      .then((res) => setConfirmations(res[id]));
  }, [id]);

  useEffect(() => {
    if (!id) {
      eventEmitter.emit('error', new Error('Missing ANT transaction ID.'));
      navigate('/manage/ants');
      return;
    }
    if (isArweaveTransactionID(id)) {
      setTableLoading(undernameTableLoading);
      setPercentLoaded(percentUndernamesLoaded);
      setSelectedRow(selectedUndernameRow);
    }
  }, [
    id,
    undernameSortAscending,
    undernameSortField,
    undernameRows,
    selectedUndernameRow,
    undernameTableLoading,
    percentUndernamesLoaded,
    action,
    undernameFilter,
  ]);
  useEffect(() => {
    console.log(undernameFilter);
  }, [undernameFilter]);

  function resetActionModal() {
    setUndername(undefined);
    setTargetID(undefined);
    setTTL(undefined);
    setAction(undefined);
    setSelectedRow(undefined);
    setChangesValid(undefined);
  }
  function handleOnNext() {
    try {
      if (!pdntState) {
        throw new Error(
          'There was an issue loading the contract, unable to make changes',
        );
      }
      if (!id) {
        throw new Error('No ANT ID found, unable to perform transaction.');
      }

      if (confirmations < MIN_SAFE_EDIT_CONFIRMATIONS) {
        throw new Error(
          `ANT must have a minimum of ${MIN_SAFE_EDIT_CONFIRMATIONS} confirmations before editing.`,
        );
      }
      switch (action) {
        case UNDERNAME_TABLE_ACTIONS.CREATE:
          {
            if (!undername) {
              throw new Error(
                'Must enter an undername to create an undername.',
              );
            }
            if (undername === '@') {
              // prevent overwritting the @ record
              throw new Error(
                "Sorry, you cannot create the an undername called '@' as that is reserved for the record of the ARNS name.",
              );
            }
            if (Object.keys(pdntState.records).includes(undername)) {
              // dont overwrite an undername
              throw new Error(
                `${undername} already exists, please choose another name.`,
              );
            }
            if (SMARTWEAVE_MAX_TAG_SPACE < byteSize(undername)) {
              throw new Error(
                'Undername too large, please reduce in length to allow it to fit in the transaction tags.',
              );
            }
            const payload = mapTransactionDataKeyToPayload(
              INTERACTION_TYPES.SET_RECORD,
              [
                undername,
                targetID ?? STUB_ARWEAVE_TXID,
                ttl ?? MIN_TTL_SECONDS,
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
            if (!changesValid) {
              throw new Error('Changes not valid, fix errors to continue');
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
              state: `/manage/ants/${id}/undernames`,
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
            // don't check validity - there are no inputs
            dispatchTransactionState({
              type: 'setInteractionType',
              payload: INTERACTION_TYPES.REMOVE_RECORD,
            });
            dispatchTransactionState({
              type: 'setTransactionData',
              payload: { ...payload, assetId: id },
            });
            navigate('/transaction', {
              state: `/manage/ants/${id}/undernames`,
            });
          }
          break;
        case UNDERNAME_TABLE_ACTIONS.EDIT:
          {
            if (!selectedRow?.name) {
              throw new Error('Cannot find undername');
            }
            if (!targetID && !ttl) {
              throw new Error('No changes supplied for undername change');
            }
            if (ttl) {
              validateTTLSeconds(+ttl);
            }

            const payload = mapTransactionDataKeyToPayload(
              INTERACTION_TYPES.SET_RECORD,
              [
                selectedRow.name,
                targetID ?? selectedRow.targetID ?? STUB_ARWEAVE_TXID,
                ttl ?? selectedRow.ttlSeconds ?? MIN_TTL_SECONDS,
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
            if (!changesValid) {
              throw new Error('Changes not valid, fix errors to continue');
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
              state: `/manage/ants/${id}/undernames`,
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

  function getActionModalTitle(): string {
    switch (action) {
      case UNDERNAME_TABLE_ACTIONS.CREATE:
        return 'Create Undername';
      case UNDERNAME_TABLE_ACTIONS.EDIT:
        return `Edit ${selectedRow?.name}`;
      case UNDERNAME_TABLE_ACTIONS.REMOVE:
        return `Remove ${selectedRow?.name}`;
      default:
        return '';
    }
  }

  const onTableChange: TableProps<UndernameMetadata>['onChange'] = (
    pagination,
    filters,
    sorter,
    extra,
  ) => {
    console.log('params', pagination, filters, sorter, extra);
  };

  return (
    <>
      <div className="page">
        <div className="flex-column">
          <div className="flex flex-justify-between">
            <div
              className="flex flex-row"
              style={{ justifyContent: 'space-between' }}
            >
              <h2 className="white">Manage Undernames</h2>
              <button
                className={'button-secondary center'}
                style={{
                  gap: '10px',
                  padding: '9px 12px',
                  fontSize: '14px',
                  textAlign: 'center',
                }}
                onClick={() => setAction(UNDERNAME_TABLE_ACTIONS.CREATE)}
              >
                <PlusIcon
                  width={'16px'}
                  height={'16px'}
                  fill={'var(--accent)'}
                />
                Add Undername
              </button>
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
            <Table
              onChange={(pagination, filters, sorter, extra) =>
                onTableChange(pagination, filters, sorter, extra)
              }
              onRow={() => ({ className: 'hovered-row' })}
              prefixCls="manage-table"
              bordered={false}
              scroll={{ x: true }}
              columns={undernameColumns}
              dataSource={undernameRows}
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
          )}
        </div>
      </div>
      {action ? (
        <div className="modal-container">
          <DialogModal
            title={getActionModalTitle()}
            onNext={() => handleOnNext()}
            nextText="Next"
            cancelText="Cancel"
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
                    inputCustomStyle={{ paddingLeft: '15px' }}
                    placeholder={`Enter an Undername`}
                    value={undername}
                    setValue={(e) => {
                      setUndername(e);
                    }}
                    validityCallback={(isValid) => setChangesValid(isValid)}
                    validationPredicates={{}}
                  />
                ) : (
                  <></>
                )}
                {createOrUpdateUndernameInteractions.includes(
                  action as CreateOrEditUndernameInteraction,
                ) ? (
                  <>
                    <ValidationInput
                      inputClassName="data-input"
                      showValidationIcon={true}
                      showValidationOutline={true}
                      wrapperCustomStyle={{
                        width: '100%',
                        border: 'none',
                        overflow: 'hidden',
                        fontSize: '16px',
                        outline: 'none',
                        borderRadius: 'var(--corner-radius)',
                        boxSizing: 'border-box',
                      }}
                      inputCustomStyle={{
                        paddingLeft: '15px',
                        paddingRight: '30px',
                      }}
                      placeholder={`Enter a Target ID`}
                      value={targetID}
                      setValue={(e) => {
                        setTargetID(e);
                      }}
                      validationPredicates={{
                        [VALIDATION_INPUT_TYPES.ARWEAVE_ID]: {
                          fn: (id: string) =>
                            arweaveDataProvider.validateArweaveId(id),
                        },
                      }}
                      validityCallback={(isValid) => setChangesValid(isValid)}
                      maxLength={43}
                    />
                    <ValidationInput
                      inputClassName="data-input"
                      showValidationIcon={true}
                      showValidationOutline={true}
                      inputType={'number'}
                      minNumber={MIN_TTL_SECONDS}
                      maxNumber={MAX_TTL_SECONDS}
                      wrapperCustomStyle={{
                        width: '100%',
                        border: 'none',
                        overflow: 'hidden',
                        fontSize: '16px',
                        outline: 'none',
                        borderRadius: 'var(--corner-radius)',
                        display: 'flex',
                      }}
                      inputCustomStyle={{ paddingLeft: '15px' }}
                      placeholder={`Enter TTL Seconds`}
                      value={ttl}
                      setValue={(e) => {
                        e ? setTTL(+e) : setTTL(undefined);
                      }}
                      validityCallback={(isValid) => setChangesValid(isValid)}
                      validationPredicates={{
                        [VALIDATION_INPUT_TYPES.VALID_TTL]: {
                          fn: (ttlSeconds) =>
                            new Promise((resolve, reject) => {
                              try {
                                validateTTLSeconds(+ttlSeconds);
                                resolve(undefined);
                              } catch (error) {
                                reject(error);
                              }
                            }),
                        },
                      }}
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
              <div className="flex flex-column" style={{ gap: 0 }}>
                {' '}
                <span className="text white">This transaction will cost</span>
                <span className="text white">
                  <ArPrice dataSize={SMARTWEAVE_TAG_SIZE} />
                </span>
              </div>
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
