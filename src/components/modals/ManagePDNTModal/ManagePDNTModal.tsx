import { Tooltip } from 'antd';
import Table from 'rc-table';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useArweaveCompositeProvider, useIsMobile } from '../../../hooks';
import { PDNTContract } from '../../../services/arweave/PDNTContract';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useTransactionState } from '../../../state/contexts/TransactionState';
import {
  ArweaveTransactionID,
  INTERACTION_TYPES,
  ManagePDNTRow,
  PDNSRecordEntry,
  PDNTContractJSON,
  VALIDATION_INPUT_TYPES,
} from '../../../types';
import { ContractInteraction } from '../../../types';
import {
  getAttributesFromInteractionFunction,
  getInteractionTypeFromField,
  mapTransactionDataKeyToPayload,
} from '../../../utils';
import { STUB_ARWEAVE_TXID } from '../../../utils/constants';
import eventEmitter from '../../../utils/events';
import { mapKeyToAttribute } from '../../cards/PDNTCard/PDNTCard';
import {
  ArrowLeft,
  CirclePending,
  CloseIcon,
  ExternalLinkIcon,
  PencilIcon,
} from '../../icons';
import ValidationInput from '../../inputs/text/ValidationInput/ValidationInput';
import { Loader } from '../../layout';
import TransactionStatus from '../../layout/TransactionStatus/TransactionStatus';
import TransferPDNTModal from '../TransferPDNTModal/TransferPDNTModal';

function ManagePDNTModal() {
  const { id } = useParams();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const arweaveDataProvider = useArweaveCompositeProvider();
  const [{ walletAddress, pdnsSourceContract }] = useGlobalState();
  const [, dispatchTransactionState] = useTransactionState();
  const [pdntState, setPDNTState] = useState<PDNTContract>();
  const [pdntName, setPDNTName] = useState<string>();
  const [editingField, setEditingField] = useState<string>();
  const [modifiedValue, setModifiedValue] = useState<string | number>();
  const [rows, setRows] = useState<ManagePDNTRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showTransferPDNTModal, setShowTransferPDNTModal] =
    useState<boolean>(false);

  const EDITABLE_FIELDS = [
    'name',
    'ticker',
    'targetID',
    'ttlSeconds',
    'controller',
  ];

  useEffect(() => {
    if (!id || !walletAddress) {
      navigate('/manage/pdnts');
      return;
    }
    const txId = new ArweaveTransactionID(id);
    fetchPDNTDetails(walletAddress, txId);
  }, [id]);

  function getAssociatedNames(txId: ArweaveTransactionID) {
    return Object.entries(pdnsSourceContract.records)
      .map(([name, recordEntry]: [string, PDNSRecordEntry]) => {
        if (recordEntry.contractTxId === txId.toString()) return name;
      })
      .filter((n) => !!n);
  }

  function getPendingInteractionsForContract(
    pendingContractInteractions: ContractInteraction[],
    existingValues: any,
  ): {
    attribute: string;
    value: string;
    id: string;
    valid: boolean | undefined;
  }[] {
    // no indexed transactions, return all in cache relevant to the contract id
    // indexed transactions, find them
    const pendingTxRowData = [];
    for (const i of pendingContractInteractions) {
      const attributes = getAttributesFromInteractionFunction(
        i.payload.function,
      );
      for (const attribute of attributes) {
        const nonConfirmedTx = {
          attribute: attribute,
          value: i.payload[attribute],
          id: i.id,
          valid: i.valid,
        };
        if (
          existingValues[attribute] &&
          existingValues[attribute] !== nonConfirmedTx.value
        ) {
          pendingTxRowData.push(nonConfirmedTx);
        }
      }
    }
    return pendingTxRowData;
  }

  async function fetchPDNTDetails(
    address: ArweaveTransactionID,
    contractTxId: ArweaveTransactionID,
  ) {
    try {
      setLoading(true);
      const names = getAssociatedNames(contractTxId);
      const [contractState, confirmations, pendingContractInteractions] =
        await Promise.all([
          arweaveDataProvider.getContractState<PDNTContractJSON>(contractTxId),
          arweaveDataProvider.getTransactionStatus(contractTxId),
          arweaveDataProvider.getPendingContractInteractions(
            contractTxId,
            address.toString(),
          ),
        ]);
      const pdnt = new PDNTContract(contractState);
      const record = Object.values(pdnsSourceContract.records).find(
        (r) => r.contractTxId === contractTxId.toString(),
      );
      const tier = pdnsSourceContract.tiers.history.find(
        (t) => t.id === record?.tier,
      );

      // TODO: add error messages and reload state to row
      const consolidatedDetails: any = {
        status: confirmations ?? 0,
        associatedNames: !names.length ? 'N/A' : names.join(', '),
        name: pdnt.name ?? 'N/A',
        ticker: pdnt.ticker ?? 'N/A',
        targetID: pdnt.getRecord('@')?.transactionId ?? 'N/A',
        ttlSeconds: pdnt.getRecord('@')?.ttlSeconds,
        controller:
          contractState.controllers?.join(', ') ??
          contractState.owner?.toString() ??
          'N/A',
        undernames: `${Object.keys(contractState.records).length - 1} / ${
          tier?.settings.maxUndernames ?? 100
        }`,
        owner: contractState.owner?.toString() ?? 'N/A',
      };

      // get pending tx details
      const pendingTxs = getPendingInteractionsForContract(
        pendingContractInteractions,
        consolidatedDetails,
      );

      const rows = Object.keys(consolidatedDetails).reduce(
        (details: ManagePDNTRow[], attribute: string, index: number) => {
          const existingValue =
            consolidatedDetails[attribute as keyof ManagePDNTRow];
          const pendingInteraction = pendingTxs.find(
            (i) => i.attribute === attribute,
          );
          const value = pendingInteraction
            ? pendingInteraction.value
            : existingValue;
          const detail = {
            attribute,
            value,
            editable:
              EDITABLE_FIELDS.includes(attribute) && !pendingInteraction,
            key: index,
            interactionType: getInteractionTypeFromField(attribute),
            pendingInteraction,
          };
          details.push(detail);
          return details;
        },
        [],
      );

      setPDNTState(pdnt);
      setPDNTName(contractState.name ?? id);
      setRows(rows);
      setLoading(false);
    } catch (error) {
      eventEmitter.emit('error', error);
      navigate('/manage/pdnts');
    }
  }

  return (
    <>
      <div className="page">
        <div className="flex-row flex-space-between">
          <span className="flex white text-large bold">
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
            <Tooltip
              placement="right"
              title={id}
              showArrow={true}
              overlayStyle={{
                maxWidth: 'fit-content',
              }}
            >
              <span>&nbsp;/&nbsp;{pdntName?.length ? pdntName : id}</span>
            </Tooltip>
          </span>
          {/* TODO: make sure the table doesn't refresh if no actions were saved/written */}
          <button
            className="flex flex-right pointer"
            onClick={() => navigate('/manage/pdnts')}
          >
            <CloseIcon width="30px" height={'30px'} fill="var(--text-white)" />
          </button>
        </div>
        <div className="flex-row center">
          {loading ? (
            <div className="flex" style={{ padding: '10%' }}>
              <Loader size={80} />
            </div>
          ) : (
            <Table
              showHeader={false}
              style={{ width: '100%' }}
              onRow={(row: ManagePDNTRow) => ({
                className: row.attribute === editingField ? 'active-row' : '',
              })}
              scroll={{ x: true }}
              columns={[
                {
                  title: '',
                  dataIndex: 'pendingInteraction',
                  key: 'pendingInteraction',
                  align: 'left',
                  width: isMobile ? '0px' : '3%',
                  className: 'icon-padding white',
                  render: (interaction: {
                    value: string;
                    valid: boolean;
                    id: string;
                  }) => {
                    if (interaction) {
                      return (
                        <Tooltip
                          placement="right"
                          title={
                            <Link
                              className="link white text underline"
                              to={`https://viewblock.io/arweave/tx/${interaction.id}`}
                              target="_blank"
                            >
                              There is a transaction pending for this field.
                              <ExternalLinkIcon
                                height={12}
                                width={12}
                                fill={'var(--text-white)'}
                              />
                            </Link>
                          }
                          showArrow={true}
                          overlayStyle={{
                            maxWidth: 'fit-content',
                          }}
                        >
                          <CirclePending
                            height={20}
                            width={20}
                            fill={'var(--accent)'}
                          />
                        </Tooltip>
                      );
                    }
                    return <></>;
                  },
                },
                {
                  title: '',
                  dataIndex: 'attribute',
                  key: 'attribute',
                  align: 'left',
                  width: isMobile ? '0px' : '25%',
                  className: 'icon-padding white',
                  render: (value: string) => {
                    return `${mapKeyToAttribute(value)}:`;
                  },
                },
                {
                  title: '',
                  dataIndex: 'value',
                  key: 'value',
                  align: 'left',
                  width: '70%',
                  className: 'white',
                  render: (value: string | number, row: any) => {
                    if (row.attribute === 'status')
                      return <TransactionStatus confirmations={+value} />;
                    if (row.attribute === 'undernames') {
                      return (
                        <Link to={'undernames'} className={'link'}>
                          {value}
                        </Link>
                      );
                    }
                    if (row.editable)
                      return (
                        <>
                          {/* TODO: add label for mobile view */}

                          <ValidationInput
                            showValidationIcon={true}
                            showValidationOutline={true}
                            inputId={row.attribute + '-input'}
                            inputType={
                              row.attribute === 'ttlSeconds'
                                ? 'number'
                                : undefined
                            }
                            minNumber={100}
                            maxNumber={1000000}
                            onClick={() => {
                              setEditingField(row.attribute);
                              setModifiedValue(value);
                            }}
                            inputClassName={'flex'}
                            inputCustomStyle={{
                              width: '100%',
                              border: 'none',
                              overflow: 'hidden',
                              fontSize: '16px',
                              outline: 'none',
                              borderRadius: 'var(--corner-radius)',
                              background:
                                editingField === row.attribute
                                  ? 'white'
                                  : 'transparent',
                              color:
                                editingField === row.attribute
                                  ? 'black'
                                  : 'white',
                              padding:
                                editingField === row.attribute
                                  ? '10px 40px 10px 10px'
                                  : '10px 0px',
                              display: 'flex',
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
                                setModifiedValue(e);
                              }
                            }}
                            validityCallback={(valid: boolean) => {
                              row.isValid = valid;
                            }}
                            validationPredicates={
                              modifiedValue &&
                              (row.attribute === 'owner' ||
                                row.attribute === 'controller' ||
                                row.attribute === 'targetID')
                                ? {
                                    [VALIDATION_INPUT_TYPES.ARWEAVE_ID]: {
                                      fn: (id: string) =>
                                        arweaveDataProvider.validateArweaveId(
                                          id,
                                        ),
                                    },
                                  }
                                : {}
                            }
                            maxLength={43}
                          />
                        </>
                      );
                    return value;
                  },
                },
                {
                  title: '',
                  dataIndex: 'action',
                  key: 'action',
                  width: '5%',
                  align: 'right',
                  className: 'white',
                  render: (value: any, row: any) => {
                    //TODO: if it's got an action attached, show it
                    if (row.editable) {
                      return (
                        <>
                          {editingField !== row.attribute ? (
                            <button
                              onClick={() => {
                                setEditingField(row.attribute);
                                setModifiedValue(row.value);
                              }}
                            >
                              <PencilIcon
                                style={{
                                  width: '24',
                                  height: '24',
                                  fill: 'white',
                                }}
                              />
                            </button>
                          ) : (
                            <button
                              className="assets-manage-button"
                              style={{
                                backgroundColor: 'var(--accent)',
                                borderColor: 'var(--accent)',
                              }}
                              onClick={() => {
                                // TODO: make this more clear, we should be updating only the value that matters and not overwriting anything
                                const payload =
                                  row.interactionType ===
                                  INTERACTION_TYPES.SET_TARGET_ID
                                    ? mapTransactionDataKeyToPayload(
                                        row.interactionType,
                                        [
                                          '@',
                                          modifiedValue!.toString(),
                                          pdntState!.records['@'].ttlSeconds,
                                        ],
                                      )
                                    : row.interactionType ===
                                      INTERACTION_TYPES.SET_TTL_SECONDS
                                    ? mapTransactionDataKeyToPayload(
                                        row.interactionType,
                                        [
                                          '@',
                                          pdntState!.records['@'].transactionId
                                            .length
                                            ? pdntState!.records['@']
                                                .transactionId
                                            : STUB_ARWEAVE_TXID,
                                          modifiedValue!,
                                        ],
                                      )
                                    : mapTransactionDataKeyToPayload(
                                        row.interactionType,
                                        modifiedValue!.toString(),
                                      );

                                if (payload && row.interactionType && id) {
                                  const transactionData = {
                                    ...payload,
                                    assetId: id,
                                  };
                                  dispatchTransactionState({
                                    type: 'setInteractionType',
                                    payload: row.interactionType,
                                  });
                                  dispatchTransactionState({
                                    type: 'setTransactionData',
                                    payload: transactionData,
                                  });

                                  navigate(`/transaction`, {
                                    state: `/manage/pdnts/${id}`,
                                  });
                                }
                              }}
                            >
                              Save
                            </button>
                          )}
                        </>
                      );
                    }
                    if (row.attribute == 'owner') {
                      return (
                        <button
                          onClick={() => setShowTransferPDNTModal(true)}
                          className="assets-manage-button"
                        >
                          Transfer
                        </button>
                      );
                    }
                    return value;
                  },
                },
              ]}
              data={rows}
            />
          )}
        </div>
      </div>
      {showTransferPDNTModal && id ? (
        <TransferPDNTModal
          showModal={() => setShowTransferPDNTModal(false)}
          pdntId={new ArweaveTransactionID(id)}
        />
      ) : (
        <></>
      )}
    </>
  );
}

export default ManagePDNTModal;
