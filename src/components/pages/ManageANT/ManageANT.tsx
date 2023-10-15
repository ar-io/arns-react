import { Tooltip } from 'antd';
import { Table } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import { useArweaveCompositeProvider, useIsMobile } from '../../../hooks';
import { PDNTContract } from '../../../services/arweave/PDNTContract';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import {
  ArweaveTransactionID,
  ContractInteraction,
  INTERACTION_TYPES,
  ManageANTRow,
  PDNTContractJSON,
  PDNTDetails,
  PDNT_INTERACTION_TYPES,
  UNDERNAME_TABLE_ACTIONS,
  VALIDATION_INPUT_TYPES,
} from '../../../types';
import {
  getInteractionTypeFromField,
  mapTransactionDataKeyToPayload,
  validateMaxASCIILength,
  validateTTLSeconds,
} from '../../../utils';
import {
  DEFAULT_MAX_UNDERNAMES,
  DEFAULT_TTL_SECONDS,
  MAX_TTL_SECONDS,
  MIN_TTL_SECONDS,
  PDNS_TX_ID_ENTRY_REGEX,
  SMARTWEAVE_MAX_INPUT_SIZE,
  STUB_ARWEAVE_TXID,
  TTL_SECONDS_ENTRY_REGEX,
} from '../../../utils/constants';
import eventEmitter from '../../../utils/events';
import { AntDetailKey, mapKeyToAttribute } from '../../cards/PDNTCard/PDNTCard';
import TransactionSuccessCard from '../../cards/TransactionSuccessCard/TransactionSuccessCard';
import {
  CirclePending,
  CodeSandboxIcon,
  ExternalLinkIcon,
  NewspaperIcon,
  PencilIcon,
  VerticalDotMenuIcon,
} from '../../icons';
import ValidationInput from '../../inputs/text/ValidationInput/ValidationInput';
import TransactionStatus from '../../layout/TransactionStatus/TransactionStatus';
import PageLoader from '../../layout/progress/PageLoader/PageLoader';
import { TransferANTModal } from '../../modals';
import AddControllerModal from '../../modals/AddControllerModal/AddControllerModal';
import ConfirmTransactionModal, {
  CONFIRM_TRANSACTION_PROPS_MAP,
} from '../../modals/ConfirmTransactionModal/ConfirmTransactionModal';
import RemoveControllersModal from '../../modals/RemoveControllerModal/RemoveControllerModal';
import './styles.css';

function ManageANT() {
  const { id } = useParams();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const arweaveDataProvider = useArweaveCompositeProvider();
  const [{ walletAddress }] = useGlobalState();
  const [pdntState, setPDNTState] = useState<PDNTContract>();
  const [pdntName, setPDNTName] = useState<string>();
  const [editingField, setEditingField] = useState<string>();
  const [modifiedValue, setModifiedValue] = useState<string | number>();
  const [rows, setRows] = useState<ManageANTRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showTransferANTModal, setShowTransferANTModal] =
    useState<boolean>(false);
  const [showAddControllerModal, setShowAddControllerModal] =
    useState<boolean>(false);
  const [showRemoveControllerModal, setShowRemoveControllerModal] =
    useState<boolean>(false);
  const [pendingInteractions, setPendingInteractions] = useState<
    Array<ContractInteraction>
  >([]);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [interactionType, setInteractionType] =
    useState<PDNT_INTERACTION_TYPES>();
  const [transactionData, setTransactionData] = useState<any>();
  const [deployedTransactionId, setDeployedTransactionId] =
    useState<ArweaveTransactionID>();

  const EDITABLE_FIELDS = ['name', 'ticker', 'targetID', 'ttlSeconds'];

  useEffect(() => {
    if (!id || !walletAddress) {
      navigate('/manage/ants');
      return;
    }
    const txId = new ArweaveTransactionID(id);
    fetchPDNTDetails(walletAddress, txId);
  }, [id, deployedTransactionId]);

  async function fetchPDNTDetails(
    address: ArweaveTransactionID,
    contractTxId: ArweaveTransactionID,
  ) {
    try {
      setLoading(true);
      const [
        contractState,
        confirmations,
        pendingContractInteractions,
        associatedRecords,
      ] = await Promise.all([
        arweaveDataProvider.getContractState<PDNTContractJSON>(contractTxId),
        arweaveDataProvider
          .getTransactionStatus(contractTxId)
          .then((status) => status[contractTxId.toString()]),
        arweaveDataProvider.getPendingContractInteractions(
          contractTxId,
          address.toString(),
        ),
        arweaveDataProvider.getRecords({
          filters: {
            contractTxId: [contractTxId],
          },
        }),
      ]);
      const contract = new PDNTContract(contractState);

      // simple check that it is ANT shaped contract
      if (!contract.isValid()) {
        throw Error('Invalid ANT contract');
      }

      const names = Object.keys(associatedRecords);

      const consolidatedDetails: PDNTDetails = {
        status: confirmations ?? 0,
        contractTxId: contractTxId.toString(),
        associatedNames: !names.length ? 'N/A' : names.join(', '),
        //
        undernames: `${
          Object.entries(contract.records).filter(([n]) => n !== '@').length
        }/${
          Object.values(associatedRecords)[0]?.undernames ??
          DEFAULT_MAX_UNDERNAMES
        }`,
        name: contract.name ?? 'N/A',
        ticker: contract.ticker ?? 'N/A',
        owner: contract.owner ?? 'N/A',
        controllers: contract.controllers.join(', ') ?? 'N/A',
        targetID: contract.getRecord('@')?.transactionId ?? 'N/A',
        ttlSeconds: contract.getRecord('@')?.ttlSeconds ?? DEFAULT_TTL_SECONDS,
      };

      const rows = Object.keys(consolidatedDetails).reduce(
        (details: ManageANTRow[], attribute: string, index: number) => {
          const existingValue =
            consolidatedDetails[attribute as keyof PDNTDetails];

          const value = existingValue;
          const detail = {
            attribute,
            value,
            editable: EDITABLE_FIELDS.includes(attribute),
            key: index,
            interactionType: getInteractionTypeFromField(attribute),
          };
          details.push(detail);
          return details;
        },
        [],
      );

      setPendingInteractions(pendingContractInteractions);
      setPDNTState(contract);
      setPDNTName(contractState.name ?? id);
      setRows(rows);
      setLoading(false);
    } catch (error) {
      eventEmitter.emit('error', error);
      navigate('/manage/ants', { state: location.pathname });
    }
  }

  function getValidationPredicates(
    value: string | number | undefined,
    row: ManageANTRow,
  ): { [x: string]: { fn: (value: any) => Promise<any>; required?: boolean } } {
    switch (row.attribute) {
      case 'ttlSeconds':
        return {
          [VALIDATION_INPUT_TYPES.VALID_TTL]: {
            fn: validateTTLSeconds,
          },
        };

      case 'name':
      case 'ticker':
        return {
          [VALIDATION_INPUT_TYPES.VALID_ANT_NAME]: {
            fn: (name: any) =>
              validateMaxASCIILength(name, SMARTWEAVE_MAX_INPUT_SIZE),
          },
        };
      case 'targetID':
      case 'controller': {
        return {
          [VALIDATION_INPUT_TYPES.ARWEAVE_ID]: {
            fn: (id: string) => arweaveDataProvider.validateArweaveId(id),
          },
        };
      }
      default:
        return {};
    }
  }

  function handleSave(row: ManageANTRow) {
    // TODO: make this more clear, we should be updating only the value that matters and not overwriting anything
    if (!row.isValid || !row.interactionType || !pdntState) {
      return;
    }
    const payload =
      row.interactionType === INTERACTION_TYPES.SET_TARGET_ID
        ? mapTransactionDataKeyToPayload(row.interactionType, [
            '@',
            modifiedValue!.toString(),
            pdntState.getRecord('@')?.ttlSeconds ?? MIN_TTL_SECONDS,
          ])
        : row.interactionType === INTERACTION_TYPES.SET_TTL_SECONDS
        ? mapTransactionDataKeyToPayload(row.interactionType, [
            '@',
            pdntState.getRecord('@')?.transactionId?.length
              ? pdntState.getRecord('@')!.transactionId
              : STUB_ARWEAVE_TXID,
            +modifiedValue!,
          ])
        : mapTransactionDataKeyToPayload(
            row.interactionType,
            modifiedValue!.toString(),
          );

    if (payload && row.interactionType && id) {
      const transactionData = {
        ...payload,
        assetId: id,
      };
      setInteractionType(
        row.interactionType as unknown as PDNT_INTERACTION_TYPES,
      );
      setTransactionData(transactionData);
      setShowConfirmModal(true);
    }
  }

  return (
    <>
      <div className="page" style={{ gap: '30px' }}>
        {deployedTransactionId && interactionType ? (
          <TransactionSuccessCard
            txId={deployedTransactionId}
            title={CONFIRM_TRANSACTION_PROPS_MAP[interactionType].successHeader}
            close={() => {
              setDeployedTransactionId(undefined);
              setInteractionType(undefined);
            }}
          />
        ) : (
          <></>
        )}
        <div className="flex-row flex-space-between">
          <h2 className="flex white center" style={{ gap: '15px' }}>
            <CodeSandboxIcon
              width={'24px'}
              height={'24px'}
              fill="var(--text-white)"
            />
            {pdntName ?? id}
          </h2>
        </div>
        <div className="flex-row center">
          {loading ? (
            <div className="flex" style={{ padding: '10%' }}>
              <PageLoader
                loading={loading}
                message={'Loading ANT data, please wait.'}
              />
            </div>
          ) : (
            <Table
              showHeader={false}
              style={{ width: '100%' }}
              onRow={(row: ManageANTRow) => ({
                className: row.attribute === editingField ? 'active-row' : '',
              })}
              scroll={{ x: true }}
              pagination={false}
              prefixCls="manage-ant-table"
              columns={[
                {
                  title: '',
                  dataIndex: 'attribute',
                  key: 'attribute',
                  align: 'left',
                  width: isMobile ? '0px' : '20%',
                  className: 'grey whitespace-no-wrap',
                  render: (value: string) =>
                    `${mapKeyToAttribute(value as AntDetailKey)}:`,
                },
                {
                  title: '',
                  dataIndex: 'value',
                  key: 'value',
                  align: 'left',
                  width: '70%',
                  className: 'white',
                  render: (value: string | number, row: any) => {
                    const isEditMode = row.attribute === editingField;
                    if (row.attribute === 'status' && pendingInteractions)
                      return (
                        <Tooltip
                          placement="right"
                          title={pendingInteractions.map(
                            (interaction, index) => (
                              <Link
                                key={'interaction-' + index}
                                className="link white text underline"
                                to={`https://viewblock.io/arweave/tx/${interaction.id}`}
                                target="_blank"
                              >
                                There is a pending transaction modifying this
                                field.
                                <ExternalLinkIcon
                                  height={12}
                                  width={12}
                                  fill={'var(--text-white)'}
                                />
                              </Link>
                            ),
                          )}
                          showArrow={true}
                          overlayStyle={{
                            maxWidth: 'fit-content',
                          }}
                        >
                          {!pendingInteractions.length ? (
                            <TransactionStatus confirmations={+value} />
                          ) : (
                            <CirclePending
                              height={20}
                              width={20}
                              fill={'var(--accent)'}
                            />
                          )}
                        </Tooltip>
                      );
                    if (row.attribute === 'undernames') {
                      return (
                        <span
                          className="flex center"
                          style={{
                            justifyContent: 'flex-start',
                            gap: '10px',
                          }}
                        >
                          {value}
                          <NewspaperIcon
                            width={'20px'}
                            height={'20px'}
                            fill="var(--text-grey)"
                          />
                        </span>
                      );
                    }
                    if (row.editable) {
                      return (
                        <>
                          {/* TODO: add label for mobile view */}

                          <ValidationInput
                            customPattern={
                              row.attribute === 'targetID'
                                ? PDNS_TX_ID_ENTRY_REGEX
                                : row.attribute === 'ttlSeconds'
                                ? TTL_SECONDS_ENTRY_REGEX
                                : undefined
                            }
                            catchInvalidInput={true}
                            showValidationIcon={
                              row.attribute == editingField && !!modifiedValue
                            }
                            onPressEnter={() => handleSave(row)}
                            showValidationOutline={false}
                            inputId={row.attribute + '-input'}
                            minNumber={MIN_TTL_SECONDS}
                            maxNumber={MAX_TTL_SECONDS}
                            onClick={() => {
                              if (editingField === row.attribute) {
                                return;
                              }
                              setEditingField(row.attribute);
                              setModifiedValue(value);
                            }}
                            inputClassName={'flex'}
                            wrapperCustomStyle={{
                              position: 'relative',
                              boxSizing: 'border-box',
                            }}
                            inputCustomStyle={{
                              width: '100%',
                              overflow: 'hidden',
                              fontSize: '13px',
                              outline: 'none',
                              color: 'white',
                              alignContent: 'center',
                              borderBottom: 'none',
                              boxSizing: 'border-box',
                              ...(isEditMode
                                ? {
                                    background: 'var(--card-bg)',
                                    borderRadius: 'var(--corner-radius)',
                                    border: '1px solid var(--text-faded)',
                                    padding: '15px',
                                  }
                                : {
                                    border: 'none',
                                    background: 'transparent',
                                  }),
                            }}
                            disabled={editingField !== row.attribute}
                            placeholder={`Enter a ${mapKeyToAttribute(
                              row.attribute,
                            )}`}
                            value={
                              editingField === row.attribute
                                ? modifiedValue
                                : row.value
                            }
                            setValue={(e) => {
                              if (row.attribute === editingField) {
                                setModifiedValue(e ?? '');
                              }
                            }}
                            validityCallback={(valid: boolean) => {
                              row.isValid = valid;
                            }}
                            validationPredicates={getValidationPredicates(
                              modifiedValue,
                              row,
                            )}
                            maxCharLength={(length) => {
                              if (
                                row.attribute === 'name' ||
                                row.attribute === 'ticker'
                              ) {
                                return (
                                  length.length <= SMARTWEAVE_MAX_INPUT_SIZE
                                );
                              }
                              if (row.attribute === 'ttlSeconds') {
                                return length.length <= 7;
                              }
                              if (row.attribute === 'targetID') {
                                return length.length <= 43;
                              }
                              return false;
                            }}
                          />
                        </>
                      );
                    }
                    return value;
                  },
                },
                {
                  title: '',
                  dataIndex: 'action',
                  key: 'action',
                  width: '10%',
                  align: 'right',
                  className: 'white',
                  render: (value: any, row: any) => {
                    //TODO: if it's got an action attached, show it
                    if (row.editable) {
                      return (
                        <>
                          {editingField !== row.attribute ? (
                            <button
                              className="button pointer hover"
                              onClick={() => {
                                setEditingField(row.attribute);
                                setModifiedValue(row.value);
                              }}
                              style={{ boxSizing: 'border-box' }}
                            >
                              <PencilIcon
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  fill: 'var(--text-grey)',
                                  boxSizing: 'border-box',
                                }}
                              />
                            </button>
                          ) : (
                            <span
                              className="flex flex-row"
                              style={{
                                boxSizing: 'border-box',
                                gap: '10px',
                              }}
                            >
                              <button
                                className="button bold grey pointer hover"
                                style={{
                                  padding: '6px',
                                  fontSize: '13px',
                                  boxSizing: 'border-box',
                                }}
                                onClick={() => setEditingField('')}
                              >
                                Cancel
                              </button>
                              <button
                                className="button-primary hover"
                                style={{
                                  padding: '9px 12px',
                                  fontSize: '13px',
                                  boxSizing: 'border-box',
                                }}
                                onClick={() => handleSave(row)}
                              >
                                Save
                              </button>
                            </span>
                          )}
                        </>
                      );
                    }
                    if (row.attribute === 'owner') {
                      return (
                        <span className={'flex flex-right'}>
                          <button
                            onClick={() => setShowTransferANTModal(true)}
                            className="button-secondary"
                            style={{
                              padding: '9px 12px',
                              fontSize: '13px',
                              boxSizing: 'border-box',
                              letterSpacing: '0.5px',
                              fontWeight: 500,
                            }}
                          >
                            Transfer
                          </button>
                        </span>
                      );
                    }
                    if (row.attribute === 'controllers') {
                      return (
                        // TODO: add condition to "open" to be false when modals are open
                        <Tooltip
                          open={undefined}
                          placement="bottomRight"
                          color="var(--card-bg)"
                          autoAdjustOverflow
                          arrow={false}
                          overlayInnerStyle={{
                            width: 'fit-content',
                            border: '1px solid var(--text-faded)',
                            padding: '9px 12px',
                          }}
                          overlayStyle={{ width: 'fit-content' }}
                          trigger={'click'}
                          title={
                            <div
                              className="flex-column flex"
                              style={{ gap: '10px' }}
                            >
                              <button
                                className="flex flex-right white pointer button"
                                onClick={() => setShowAddControllerModal(true)}
                              >
                                Add Controller
                              </button>
                              <button
                                className="flex flex-right white pointer button"
                                onClick={() =>
                                  setShowRemoveControllerModal(true)
                                }
                              >
                                Remove Controller
                              </button>
                            </div>
                          }
                        >
                          <VerticalDotMenuIcon
                            width={'18px'}
                            height={'18px'}
                            fill="var(--text-grey)"
                            className="pointer"
                          />
                        </Tooltip>
                      );
                    }
                    if (row.attribute === 'undernames') {
                      return (
                        <Tooltip
                          placement="bottomRight"
                          color="var(--card-bg)"
                          autoAdjustOverflow
                          arrow={false}
                          overlayInnerStyle={{
                            width: 'fit-content',
                            border: '1px solid var(--text-faded)',
                            padding: '9px 12px',
                          }}
                          overlayStyle={{ width: 'fit-content' }}
                          trigger={'click'}
                          title={
                            <div
                              className="flex-column flex"
                              style={{ gap: '10px' }}
                            >
                              <button
                                className="flex flex-right white pointer button"
                                onClick={() =>
                                  navigate(`/manage/ants/${id}/undernames`)
                                }
                              >
                                Manage
                              </button>
                              <button
                                className="flex flex-right white pointer button"
                                onClick={() => {
                                  const params = new URLSearchParams({
                                    modal: UNDERNAME_TABLE_ACTIONS.CREATE,
                                  });
                                  navigate(
                                    encodeURI(
                                      `/manage/ants/${id}/undernames?${params.toString()}`,
                                    ),
                                  );
                                }}
                              >
                                Add Undername
                              </button>
                            </div>
                          }
                        >
                          <VerticalDotMenuIcon
                            width={'18px'}
                            height={'18px'}
                            fill="var(--text-grey)"
                            className="pointer"
                          />
                        </Tooltip>
                      );
                    }
                    return value;
                  },
                },
              ]}
              dataSource={rows}
            />
          )}
        </div>
      </div>
      {showTransferANTModal && id ? (
        <TransferANTModal
          closeModal={() => setShowTransferANTModal(false)}
          antId={new ArweaveTransactionID(id)}
          payloadCallback={(payload) => {
            setTransactionData(payload);
            setInteractionType(PDNT_INTERACTION_TYPES.TRANSFER);
            setShowConfirmModal(true);
            setShowTransferANTModal(false);
          }}
        />
      ) : (
        <></>
      )}
      {showAddControllerModal && id ? (
        <AddControllerModal
          closeModal={() => setShowAddControllerModal(false)}
          antId={new ArweaveTransactionID(id)}
          payloadCallback={(payload) => {
            setTransactionData(payload);
            setInteractionType(PDNT_INTERACTION_TYPES.SET_CONTROLLER);
            setShowConfirmModal(true);
            setShowAddControllerModal(false);
          }}
        />
      ) : (
        <></>
      )}
      {showRemoveControllerModal && id ? (
        <RemoveControllersModal
          closeModal={() => setShowRemoveControllerModal(false)}
          antId={new ArweaveTransactionID(id)}
          payloadCallback={(payload) => {
            setTransactionData(payload);
            setInteractionType(PDNT_INTERACTION_TYPES.REMOVE_CONTROLLER);
            setShowConfirmModal(true);
            setShowRemoveControllerModal(false);
          }}
        />
      ) : (
        <></>
      )}
      {showConfirmModal && interactionType && id ? (
        <ConfirmTransactionModal
          interactionType={interactionType}
          payload={transactionData}
          close={() => {
            setShowConfirmModal(false);
            setTransactionData(undefined);
            setEditingField(undefined);
            setModifiedValue(undefined);
          }}
          cancel={() => {
            if (interactionType === PDNT_INTERACTION_TYPES.TRANSFER) {
              setShowTransferANTModal(true);
              setShowConfirmModal(false);
              return;
            }
            if (interactionType === PDNT_INTERACTION_TYPES.SET_CONTROLLER) {
              setShowAddControllerModal(true);
              setShowConfirmModal(false);
              return;
            }
            if (interactionType === PDNT_INTERACTION_TYPES.REMOVE_CONTROLLER) {
              setShowRemoveControllerModal(true);
              setShowConfirmModal(false);
              return;
            }
            setShowConfirmModal(false);
            setTransactionData(undefined);
            setEditingField(undefined);
            setModifiedValue(undefined);
          }}
          cancelText={
            interactionType === PDNT_INTERACTION_TYPES.TRANSFER ||
            interactionType === PDNT_INTERACTION_TYPES.SET_CONTROLLER ||
            interactionType === PDNT_INTERACTION_TYPES.REMOVE_CONTROLLER
              ? 'Back'
              : 'Cancel'
          }
          setDeployedTransactionId={(id) => setDeployedTransactionId(id)}
          assetId={new ArweaveTransactionID(id)}
        />
      ) : (
        <></>
      )}
    </>
  );
}

export default ManageANT;
