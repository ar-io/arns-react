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
import {
  getInteractionTypeFromField,
  mapTransactionDataKeyToPayload,
} from '../../../utils';
import { STUB_ARWEAVE_TXID } from '../../../utils/constants';
import eventEmitter from '../../../utils/events';
import { mapKeyToAttribute } from '../../cards/PDNTCard/PDNTCard';
import { ArrowLeft, CloseIcon, PencilIcon } from '../../icons';
import ValidationInput from '../../inputs/text/ValidationInput/ValidationInput';
import { Loader } from '../../layout';
import TransactionStatus from '../../layout/TransactionStatus/TransactionStatus';
import TransferPDNTModal from '../TransferPDNTModal/TransferPDNTModal';

function ManagePDNTModal() {
  const { id } = useParams();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const arweaveDataProvider = useArweaveCompositeProvider();
  const [{ pdnsSourceContract }] = useGlobalState();
  const [{}, dispatchTransactionState] = useTransactionState(); // eslint-disable-line
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
    if (!id) {
      navigate('/manage/pdnts');
      return;
    }
    const txId = new ArweaveTransactionID(id);
    fetchPDNTDetails(txId);
  }, [id]);

  function getAssociatedNames(txId: ArweaveTransactionID) {
    return Object.entries(pdnsSourceContract.records)
      .map(([name, recordEntry]: [string, PDNSRecordEntry]) => {
        if (recordEntry.contractTxId === txId.toString()) return name;
      })
      .filter((n) => !!n);
  }

  async function fetchPDNTDetails(txId: ArweaveTransactionID) {
    try {
      setLoading(true);
      const names = getAssociatedNames(txId);
      const [contractState, confirmations] = await Promise.all([
        arweaveDataProvider.getContractState<PDNTContractJSON>(txId),
        arweaveDataProvider.getTransactionStatus(txId),
      ]);
      const pdnt = new PDNTContract(contractState);
      setPDNTState(pdnt);
      const record = Object.values(pdnsSourceContract.records).find(
        (r) => r.contractTxId === txId.toString(),
      );
      const tier = pdnsSourceContract.tiers.history.find(
        (t) => t.id === record?.tier,
      );
      // TODO: add error messages and reload state to row
      const consolidatedDetails: ManagePDNTRow & any = {
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

      const rows = Object.keys(consolidatedDetails).reduce(
        (details: ManagePDNTRow[], attribute: string, index: number) => {
          const detail = {
            attribute,
            value: consolidatedDetails[attribute as keyof ManagePDNTRow],
            editable: EDITABLE_FIELDS.includes(attribute),
            key: index,
            interactionType: getInteractionTypeFromField(attribute),
          };
          details.push(detail);
          return details;
        },
        [],
      );
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
                  dataIndex: 'attribute',
                  key: 'attribute',
                  align: 'left',
                  width: isMobile ? '0px' : '30%',
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
                  width: '80%',
                  className: 'white',
                  render: (value: string | number, row: any) => {
                    if (row.attribute === 'status')
                      return (
                        <>
                          {/* TODO: add label for mobile view */}
                          <TransactionStatus confirmations={+value} />
                        </>
                      );
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
      {showTransferPDNTModal ? (
        <TransferPDNTModal
          showModal={() => setShowTransferPDNTModal(false)}
          pdntId={new ArweaveTransactionID(id!)}
        />
      ) : (
        <></>
      )}
    </>
  );
}

export default ManagePDNTModal;