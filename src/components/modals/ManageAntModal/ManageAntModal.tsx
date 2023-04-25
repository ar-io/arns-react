import { Tooltip } from 'antd';
import Table from 'rc-table';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useArweaveCompositeProvider, useIsMobile } from '../../../hooks';
import { ANTContract } from '../../../services/arweave/AntContract';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useTransactionState } from '../../../state/contexts/TransactionState';
import {
  ANTContractJSON,
  ArNSRecordEntry,
  ArweaveTransactionID,
  CONTRACT_TYPES,
  ManageAntRow,
  TRANSACTION_TYPES,
  VALIDATION_INPUT_TYPES,
} from '../../../types';
import {
  getInteractionTypeFromField,
  getTransactionPayloadByInteractionType,
} from '../../../utils';
import eventEmitter from '../../../utils/events';
import { mapKeyToAttribute } from '../../cards/AntCard/AntCard';
import { ArrowLeft, CloseIcon, PencilIcon } from '../../icons';
import ValidationInput from '../../inputs/text/ValidationInput/ValidationInput';
import TransactionStatus from '../../layout/TransactionStatus/TransactionStatus';

const EDITABLE_FIELDS = [
  'name',
  'ticker',
  'targetID',
  'ttlSeconds',
  'controller',
];

const ACTION_FIELDS: {
  [x: string]: {
    title: string;
    fn?: () => void;
  };
} = {
  owner: {
    title: TRANSACTION_TYPES.TRANSFER,
    // todo: navigate to /transfer route
    fn: () => alert('coming soon!'),
  },
};

function ManageAntModal() {
  const { id } = useParams();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const arweaveDataProvider = useArweaveCompositeProvider();
  const [{ arnsSourceContract }] = useGlobalState();
  const [{}, dispatchTransactionState] = useTransactionState(); // eslint-disable-line
  const [antName, setAntName] = useState<string>();
  const [editingField, setEditingField] = useState<string>();
  const [modifiedValue, setModifiedValue] = useState<string | number>();
  const [rows, setRows] = useState<ManageAntRow[]>([]);

  useEffect(() => {
    try {
      if (!id) {
        throw Error('No id provided.');
      }
      const txId = new ArweaveTransactionID(id);
      fetchAntDetails(txId);
    } catch (error) {
      eventEmitter.emit('error', error);
      navigate('/manage');
    }
  }, [id]);

  function getAssociatedNames(txId: ArweaveTransactionID) {
    return Object.entries(arnsSourceContract.records)
      .map(([name, recordEntry]: [string, ArNSRecordEntry]) => {
        if (recordEntry.contractTxId === txId.toString()) return name;
      })
      .filter((n) => !!n);
  }

  async function fetchAntDetails(txId: ArweaveTransactionID) {
    const names = getAssociatedNames(txId);
    const [contractState, confirmations] = await Promise.all([
      arweaveDataProvider.getContractState<ANTContractJSON>(txId),
      arweaveDataProvider.getTransactionStatus(txId),
    ]);
    const ant = new ANTContract(contractState);
    const record = Object.values(arnsSourceContract.records).find(
      (r) => r.contractTxId === txId.toString(),
    );
    const tier = arnsSourceContract.tiers.history.find(
      (t) => t.id === record?.tier,
    );
    // TODO: add error messages and reload state to row
    const consolidatedDetails: ManageAntRow & any = {
      status: confirmations ?? 0,
      associatedNames: !names.length ? 'N/A' : names.join(', '),
      name: ant.name ?? 'N/A',
      ticker: ant.ticker ?? 'N/A',
      targetID: ant.getRecord('@').transactionId ?? 'N/A',
      ttlSeconds: ant.getRecord('@').ttlSeconds,
      controller:
        contractState.controllers?.join(', ') ??
        contractState.owner?.toString() ??
        'N/A',
      undernames: `${names.length} / ${tier?.settings.maxUndernames ?? 100}`,
      owner: contractState.owner?.toString() ?? 'N/A',
    };

    const rows = Object.keys(consolidatedDetails).reduce(
      (details: ManageAntRow[], attribute: string, index: number) => {
        const detail = {
          attribute,
          value: consolidatedDetails[attribute as keyof ManageAntRow],
          editable: EDITABLE_FIELDS.includes(attribute),
          action: ACTION_FIELDS[attribute] ?? undefined, // navigate to transaction route with details
          key: index,
          interactionType: getInteractionTypeFromField(attribute),
        };
        details.push(detail);
        return details;
      },
      [],
    );
    setAntName(contractState.name ?? id);
    setRows(rows);
  }

  return (
    <div className="page">
      <div className="flex-row flex-space-between">
        <span className="flex white text-large bold">
          <button
            className="faded text-large bold underline link center"
            onClick={() => navigate('/manage/ants')}
          >
            <ArrowLeft
              width={30}
              height={20}
              viewBox={'0 0 20 20'}
              fill={'var(--text-white)'}
            />
            Manage ANTs
          </button>
          <Tooltip
            placement="right"
            title={id}
            showArrow={true}
            overlayStyle={{
              maxWidth: 'fit-content',
            }}
          >
            <span>&nbsp;/&nbsp;{antName}</span>
          </Tooltip>
        </span>
        {/* TODO: make sure the table doesn't refresh if no actions were saved/written */}
        <button
          className="flex flex-right pointer"
          onClick={() => navigate('/manage/ants')}
        >
          <CloseIcon width="30px" height={'30px'} fill="var(--text-white)" />
        </button>
      </div>
      <div className="flex-row">
        <Table
          showHeader={false}
          style={{ width: '100%' }}
          onRow={(row: ManageAntRow) => ({
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
                if (row.editable)
                  return (
                    <>
                      {/* TODO: add label for mobile view */}

                      <ValidationInput
                        showValidationIcon={true}
                        showValidationOutline={true}
                        inputId={row.attribute + '-input'}
                        inputType={
                          row.attribute === 'ttlSeconds' ? 'number' : undefined
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
                            editingField === row.attribute ? 'black' : 'white',
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
                                [VALIDATION_INPUT_TYPES.ARWEAVE_ID]: (
                                  id: string,
                                ) => arweaveDataProvider.validateArweaveId(id),
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
                            style={{ width: '24', height: '24', fill: 'white' }}
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
                            const payload =
                              getTransactionPayloadByInteractionType(
                                CONTRACT_TYPES.ANT,
                                row.interactionType,
                                modifiedValue?.toString(),
                              );
                            if (payload && row.interactionType && id) {
                              // eslint-disable-next-line
                              const { assetId, functionName, ...data } =
                                payload;
                              dispatchTransactionState({
                                type: 'setContractType',
                                payload: CONTRACT_TYPES.ANT,
                              });
                              dispatchTransactionState({
                                type: 'setInteractionType',
                                payload: row.interactionType,
                              });
                              dispatchTransactionState({
                                type: 'setTransactionData',
                                payload: {
                                  assetId: id,
                                  functionName,
                                  ...data,
                                },
                              });
                              navigate(`/transaction`, {
                                state: `/manage/ants/${id}`,
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
                if (row.action) {
                  return (
                    <button
                      onClick={row.action.fn}
                      className="assets-manage-button"
                    >
                      {row.action.title}
                    </button>
                  );
                }
                return value;
              },
            },
          ]}
          data={rows}
        />
      </div>
    </div>
  );
}

export default ManageAntModal;
