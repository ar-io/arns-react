import TransactionSuccessCard from '@src/components/cards/TransactionSuccessCard/TransactionSuccessCard';
import ValidationInput from '@src/components/inputs/text/ValidationInput/ValidationInput';
import { TransferANTModal } from '@src/components/modals';
import AddControllerModal from '@src/components/modals/AddControllerModal/AddControllerModal';
import ConfirmTransactionModal, {
  CONFIRM_TRANSACTION_PROPS_MAP,
} from '@src/components/modals/ConfirmTransactionModal/ConfirmTransactionModal';
import RemoveControllersModal from '@src/components/modals/RemoveControllerModal/RemoveControllerModal';
import { ANTContract } from '@src/services/arweave/ANTContract';
import { Tooltip } from 'antd';
import { Table } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import { useIsMobile } from '../../../hooks';
import { ArweaveTransactionID } from '../../../services/arweave/ArweaveTransactionID';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useWalletState } from '../../../state/contexts/WalletState';
import {
  ANT_INTERACTION_TYPES,
  ARNSRecordEntry,
  ContractInteraction,
  DomainDetails,
  INTERACTION_TYPES,
  ManageDomainRow,
  UNDERNAME_TABLE_ACTIONS,
  VALIDATION_INPUT_TYPES,
} from '../../../types';
import {
  formatDate,
  getInteractionTypeFromField,
  getLeaseDurationFromEndTimestamp,
  getPendingInteractionsRowsForContract,
  getUndernameCount,
  isArweaveTransactionID,
  lowerCaseDomain,
  mapTransactionDataKeyToPayload,
  validateMaxASCIILength,
  validateTTLSeconds,
} from '../../../utils';
import {
  ARNS_TX_ID_ENTRY_REGEX,
  DEFAULT_MAX_UNDERNAMES,
  DEFAULT_TTL_SECONDS,
  MAX_LEASE_DURATION,
  MAX_TTL_SECONDS,
  MAX_UNDERNAME_COUNT,
  MIN_TTL_SECONDS,
  SECONDS_IN_GRACE_PERIOD,
  SMARTWEAVE_MAX_INPUT_SIZE,
  STUB_ARWEAVE_TXID,
  TTL_SECONDS_ENTRY_REGEX,
} from '../../../utils/constants';
import eventEmitter from '../../../utils/events';
import { AntDetailKey, mapKeyToAttribute } from '../../cards/ANTCard/ANTCard';
import {
  CirclePending,
  ExternalLinkIcon,
  HamburgerOutlineIcon,
  NewspaperIcon,
  PencilIcon,
  VerticalDotMenuIcon,
} from '../../icons';
import { Loader } from '../../layout';
import TransactionStatus from '../../layout/TransactionStatus/TransactionStatus';
import './styles.css';

const EDITABLE_FIELDS = ['name', 'ticker', 'targetID', 'ttlSeconds'];

function ManageDomain() {
  const { name } = useParams();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const [{ arweaveDataProvider }] = useGlobalState();
  const [{ walletAddress }] = useWalletState();
  const [rows, setRows] = useState<ManageDomainRow[]>([]);
  const [isMaxLeaseDuration, setIsMaxLeaseDuration] = useState<boolean>(false);
  const [isMaxUndernameCount, setIsMaxUndernameCount] =
    useState<boolean>(false);
  const [undernameCount, setUndernameCount] = useState<number>();
  const [loading, setLoading] = useState<boolean>(true);
  const [showTransferANTModal, setShowTransferANTModal] =
    useState<boolean>(false);
  const [showAddControllerModal, setShowAddControllerModal] =
    useState<boolean>(false);
  const [showRemoveControllerModal, setShowRemoveControllerModal] =
    useState<boolean>(false);
  const [editingField, setEditingField] = useState<string>();
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [interactionType, setInteractionType] =
    useState<ANT_INTERACTION_TYPES>();
  const [transactionData, setTransactionData] = useState<any>();
  const [deployedTransactionId, setDeployedTransactionId] =
    useState<ArweaveTransactionID>();
  const [pendingInteractions, setPendingInteractions] = useState<
    Array<ContractInteraction>
  >([]);
  const [modifiedValue, setModifiedValue] = useState<string | number>();
  const [antState, setANTState] = useState<ANTContract>();
  const [contractTxId, setContractTxId] = useState<ArweaveTransactionID>();

  useEffect(() => {
    if (!name || !walletAddress) {
      navigate('/manage/names');
      return;
    }

    fetchDomainDetails(name);
  }, [name, deployedTransactionId]);

  // TODO: [PE-4630] tech debt, refactor this into smaller pure functions
  async function fetchDomainDetails(domainName: string) {
    try {
      setLoading(true);

      const recordEntry = await arweaveDataProvider.getRecord({
        domain: lowerCaseDomain(domainName),
      });
      const txId = recordEntry?.contractTxId;
      if (!txId) {
        throw Error('This name is not registered');
      }
      const contractTxId = new ArweaveTransactionID(txId);

      const [
        contract,
        confirmations,
        pendingContractInteractions,
        associatedRecords,
      ] = await Promise.all([
        arweaveDataProvider.buildANTContract(contractTxId),
        arweaveDataProvider
          .getTransactionStatus(contractTxId)
          .then((status) => status[contractTxId.toString()].confirmations),
        arweaveDataProvider.getPendingContractInteractions(contractTxId),
        arweaveDataProvider.getRecords<ARNSRecordEntry>({
          filters: {
            contractTxId: [contractTxId],
          },
        }),
      ]);

      // simple check that it is ANT shaped contract
      // TODO: add more checks, eg AST tree and function IO's
      if (!contract.isValid()) {
        throw Error('Invalid ANT contract');
      }

      const names = Object.keys(associatedRecords).filter(
        (key) => key !== name,
      );

      const record = name
        ? await arweaveDataProvider
            .getRecord({
              domain: lowerCaseDomain(name),
            })
            .catch(() => undefined)
        : undefined;
      if (!record) {
        throw Error('This name is not registered');
      }

      const duration = record?.endTimestamp
        ? getLeaseDurationFromEndTimestamp(
            record.startTimestamp * 1000,
            record.endTimestamp * 1000,
          )
        : 'Indefinite';

      const getLeaseDurationString = () => {
        if (record?.endTimestamp) {
          const duration = Math.max(
            1,
            getLeaseDurationFromEndTimestamp(
              record.startTimestamp * 1000,
              record.endTimestamp * 1000,
            ),
          );
          const y = duration > 1 ? 'years' : 'year';
          return `${duration} ${y}`;
        }
        return 'Indefinite';
      };

      setIsMaxLeaseDuration(
        (duration &&
          typeof duration === 'number' &&
          duration >= MAX_LEASE_DURATION) ||
          duration === 'Indefinite',
      );

      setUndernameCount(record.undernames);
      setIsMaxUndernameCount(
        !!undernameCount && record.undernames >= MAX_UNDERNAME_COUNT,
      );

      const consolidatedDetails: DomainDetails = {
        expiryDate: record?.endTimestamp
          ? // assume permabuy if missing timestamp
            +record.endTimestamp
          : 'Indefinite',
        leaseDuration: `${getLeaseDurationString()}`,
        associatedNames: !names.length ? 'N/A' : names.join(', '),
        status: confirmations,
        name: contract.name ?? 'N/A',
        contractTxId: contractTxId.toString(),
        targetID:
          contract.getRecord('@') &&
          isArweaveTransactionID(contract.getRecord('@')!.transactionId)
            ? contract.getRecord('@')!.transactionId
            : 'N/A',
        ticker: contract.ticker ?? 'N/A',
        controllers: contract.controllers.join(', ') ?? 'N/A',
        owner: contract.owner ?? 'N/A',
        ttlSeconds: contract.getRecord('@')?.ttlSeconds ?? DEFAULT_TTL_SECONDS,

        // -1 because @ record is not counted
        undernames: `${getUndernameCount(contract.records)}/${(
          record?.undernames ?? DEFAULT_MAX_UNDERNAMES
        ).toLocaleString()}`,
      };

      // get pending tx details
      const pendingTxs = getPendingInteractionsRowsForContract(
        pendingContractInteractions,
        consolidatedDetails,
      );

      const rows = Object.keys(consolidatedDetails).reduce(
        (details: ManageDomainRow[], attribute: string, index: number) => {
          const existingValue =
            consolidatedDetails[attribute as keyof DomainDetails];
          const pendingInteraction = pendingTxs.find(
            (i) => i.attribute === attribute,
          );
          const value = pendingInteraction
            ? pendingInteraction.value
            : existingValue;
          const detail = {
            attribute,
            value,
            key: index,
            interactionType: getInteractionTypeFromField(attribute),
            pendingInteraction,
            editable: EDITABLE_FIELDS.includes(attribute),
          };
          details.push(detail);
          return details;
        },
        [],
      );

      setRows(rows);
      setANTState(contract);
      setContractTxId(contractTxId);
      setPendingInteractions(pendingContractInteractions);
      setLoading(false);
    } catch (error) {
      eventEmitter.emit('error', error);
      navigate('/manage/names', { state: location.pathname });
    }
  }

  function getValidationPredicates(
    value: string | number | undefined,
    row: ManageDomainRow,
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

  function handleSave(row: ManageDomainRow) {
    // TODO: make this more clear, we should be updating only the value that matters and not overwriting anything
    if (!row.isValid || !row.interactionType || !antState) {
      return;
    }
    const payload =
      row.interactionType === INTERACTION_TYPES.SET_TARGET_ID
        ? mapTransactionDataKeyToPayload(row.interactionType, [
            '@',
            modifiedValue!.toString(),
            antState.getRecord('@')?.ttlSeconds ?? MIN_TTL_SECONDS,
          ])
        : row.interactionType === INTERACTION_TYPES.SET_TTL_SECONDS
        ? mapTransactionDataKeyToPayload(row.interactionType, [
            '@',
            antState.getRecord('@')?.transactionId?.length
              ? antState.getRecord('@')!.transactionId
              : STUB_ARWEAVE_TXID,
            +modifiedValue!,
          ])
        : mapTransactionDataKeyToPayload(
            row.interactionType,
            modifiedValue!.toString(),
          );

    if (payload && row.interactionType && contractTxId) {
      const transactionData = {
        ...payload,
        assetId: contractTxId,
      };
      setInteractionType(
        row.interactionType as unknown as ANT_INTERACTION_TYPES,
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
        <div
          className="flex flex-row"
          style={{ justifyContent: 'space-between', width: '100%' }}
        >
          <h2 className="flex white center" style={{ gap: '16px' }}>
            <HamburgerOutlineIcon
              width={'20px'}
              height={'20px'}
              fill="var(--text-white)"
            />
            {name}
          </h2>
          <div
            className="flex flex-row"
            style={{ gap: '20px', width: 'fit-content' }}
          >
            <Tooltip
              trigger={['hover']}
              title={
                isMaxUndernameCount
                  ? 'Max undername support reached'
                  : 'Increase undername support'
              }
              color="#222224"
              placement="top"
              rootClassName="notification-tooltip"
            >
              <button
                disabled={loading || isMaxUndernameCount}
                className={`button-secondary ${
                  loading || isMaxUndernameCount ? 'disabled-button' : 'hover'
                }`}
                style={{
                  padding: loading || isMaxUndernameCount ? '0px' : '9px',
                  gap: '8px',
                  fontSize: '14px',
                  color: 'var(--accent)',
                  fontFamily: 'Rubik',
                }}
                onClick={() =>
                  navigate(`/manage/names/${name}/upgrade-undernames`)
                }
              >
                Increase Undernames
              </button>
            </Tooltip>
            <Tooltip
              trigger={['hover']}
              title={
                isMaxLeaseDuration
                  ? 'Max lease duration reached'
                  : 'Extend lease'
              }
              color="#222224"
              placement="top"
              rootClassName="notification-tooltip"
            >
              <button
                disabled={loading || isMaxLeaseDuration}
                className={`button-primary ${
                  loading || isMaxLeaseDuration ? 'disabled-button' : 'hover'
                }`}
                style={{
                  padding: loading || isMaxLeaseDuration ? '0px' : '9px',
                  gap: '8px',
                  fontSize: '14px',
                  color: 'var(--text-black)',
                  fontFamily: 'Rubik',
                }}
                onClick={() => navigate(`/manage/names/${name}/extend`)}
              >
                Extend Lease
              </button>
            </Tooltip>
          </div>
        </div>
        <div className="flex-row center">
          {loading || !antState ? (
            <div className="flex" style={{ padding: '10%' }}>
              <Loader size={80} />
            </div>
          ) : (
            <Table
              showHeader={false}
              style={{ width: '100%' }}
              onRow={(row: ManageDomainRow) => ({
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
                    if (
                      row.attribute === 'expiryDate' &&
                      typeof value === 'number'
                    ) {
                      return (
                        <span
                          style={{
                            color:
                              value * 1000 > Date.now()
                                ? 'var(--success-green)'
                                : value * 1000 +
                                    SECONDS_IN_GRACE_PERIOD * 1000 <
                                  Date.now()
                                ? 'var(--accent)'
                                : 'var(--error-red)',
                          }}
                        >
                          {formatDate(value * 1000)}
                        </span>
                      );
                    }
                    if (row.attribute === 'status' && pendingInteractions)
                      return (
                        <Tooltip
                          placement="right"
                          title={pendingInteractions.map(
                            (interaction, index) => (
                              <Link
                                key={'interaction-' + index}
                                className="link white text underline"
                                to={`https://viewblock.io/arweave/tx/${interaction.contractTxId}`}
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
                                ? ARNS_TX_ID_ENTRY_REGEX
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
                            maxCharLength={(str) => {
                              if (
                                row.attribute === 'name' ||
                                row.attribute === 'ticker'
                              ) {
                                return str.length <= SMARTWEAVE_MAX_INPUT_SIZE;
                              }
                              if (row.attribute === 'ttlSeconds') {
                                return str.length <= 7;
                              }
                              if (row.attribute === 'targetID') {
                                return str.length <= 43;
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
                    if (
                      row.editable &&
                      antState.getOwnershipStatus(walletAddress)
                    ) {
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
                    if (
                      row.attribute === 'owner' &&
                      antState.getOwnershipStatus(walletAddress) === 'owner'
                    ) {
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
                    if (
                      row.attribute === 'controllers' &&
                      antState.getOwnershipStatus(walletAddress) === 'owner'
                    ) {
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
                                  navigate(`/manage/names/${name}/undernames`)
                                }
                              >
                                Manage
                              </button>
                              {antState?.getOwnershipStatus(walletAddress) &&
                              contractTxId ? (
                                <button
                                  className="flex flex-right white pointer button"
                                  onClick={() => {
                                    const params = new URLSearchParams({
                                      modal: UNDERNAME_TABLE_ACTIONS.CREATE,
                                    });
                                    navigate(
                                      encodeURI(
                                        `/manage/names/${name}/undernames?${params.toString()}`,
                                      ),
                                    );
                                  }}
                                >
                                  Add Undername
                                </button>
                              ) : (
                                <></>
                              )}
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
      {showTransferANTModal && contractTxId ? (
        <TransferANTModal
          closeModal={() => setShowTransferANTModal(false)}
          antId={contractTxId}
          payloadCallback={(payload) => {
            setTransactionData(payload);
            setInteractionType(ANT_INTERACTION_TYPES.TRANSFER);
            setShowConfirmModal(true);
            setShowTransferANTModal(false);
          }}
        />
      ) : (
        <></>
      )}
      {showAddControllerModal && contractTxId ? (
        <AddControllerModal
          closeModal={() => setShowAddControllerModal(false)}
          antId={contractTxId}
          payloadCallback={(payload) => {
            setTransactionData(payload);
            setInteractionType(ANT_INTERACTION_TYPES.SET_CONTROLLER);
            setShowConfirmModal(true);
            setShowAddControllerModal(false);
          }}
        />
      ) : (
        <></>
      )}
      {showRemoveControllerModal && contractTxId ? (
        <RemoveControllersModal
          closeModal={() => setShowRemoveControllerModal(false)}
          antId={contractTxId}
          payloadCallback={(payload) => {
            setTransactionData(payload);
            setInteractionType(ANT_INTERACTION_TYPES.REMOVE_CONTROLLER);
            setShowConfirmModal(true);
            setShowRemoveControllerModal(false);
          }}
        />
      ) : (
        <></>
      )}
      {showConfirmModal && interactionType && contractTxId ? (
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
            if (interactionType === ANT_INTERACTION_TYPES.TRANSFER) {
              setShowTransferANTModal(true);
              setShowConfirmModal(false);
              return;
            }
            if (interactionType === ANT_INTERACTION_TYPES.SET_CONTROLLER) {
              setShowAddControllerModal(true);
              setShowConfirmModal(false);
              return;
            }
            if (interactionType === ANT_INTERACTION_TYPES.REMOVE_CONTROLLER) {
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
            interactionType === ANT_INTERACTION_TYPES.TRANSFER ||
            interactionType === ANT_INTERACTION_TYPES.SET_CONTROLLER ||
            interactionType === ANT_INTERACTION_TYPES.REMOVE_CONTROLLER
              ? 'Back'
              : 'Cancel'
          }
          setDeployedTransactionId={(id) => setDeployedTransactionId(id)}
          assetId={contractTxId}
        />
      ) : (
        <></>
      )}
    </>
  );
}

export default ManageDomain;
