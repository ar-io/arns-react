import ConfirmTransactionModal from '@src/components/modals/ConfirmTransactionModal/ConfirmTransactionModal';
import useDomainInfo from '@src/hooks/useDomainInfo';
import dispatchANTInteraction from '@src/state/actions/dispatchANTInteraction';
import { useTransactionState } from '@src/state/contexts/TransactionState';
import { Table } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { useUndernames } from '../../../hooks/useUndernames/useUndernames';
import { ANTContract } from '../../../services/arweave/ANTContract';
import { ArweaveTransactionID } from '../../../services/arweave/ArweaveTransactionID';
import { useWalletState } from '../../../state/contexts/WalletState';
import {
  ANT_INTERACTION_TYPES,
  SetRecordPayload,
  TransactionDataPayload,
  UNDERNAME_TABLE_ACTIONS,
  UndernameMetadata,
} from '../../../types';
import {
  getCustomPaginationButtons,
  isArweaveTransactionID,
} from '../../../utils';
import eventEmitter from '../../../utils/events';
import TransactionSuccessCard from '../../cards/TransactionSuccessCard/TransactionSuccessCard';
import { PlusIcon } from '../../icons';
import { Loader } from '../../layout';
import { AddUndernameModal, EditUndernameModal } from '../../modals';
import './styles.css';

function Undernames() {
  const navigate = useNavigate();
  const { id, name } = useParams();
  const { data } = useDomainInfo({
    domain: name,
    antId: id ? new ArweaveTransactionID(id) : undefined,
  });
  const [{ walletAddress }] = useWalletState();
  const [antId, setANTId] = useState<ArweaveTransactionID>();
  const [antState, setANTState] = useState<ANTContract>();
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
    refresh,
  } = useUndernames(antId, name);
  const [tableLoading, setTableLoading] = useState(true);
  const [tablePage, setTablePage] = useState<number>(1);
  const [searchParams, setSearchParams] = useSearchParams();

  // modal state
  const [transactionData, setTransactionData] = useState<
    TransactionDataPayload | undefined
  >();
  const [interactionType, setInteractionType] =
    useState<ANT_INTERACTION_TYPES>();
  const [{ interactionResult, workflowName }, dispatchTransactionState] =
    useTransactionState();

  useEffect(() => {
    if (!id && !name) {
      eventEmitter.emit('error', new Error('Missing ANT transaction ID.'));
      navigate('/manage/ants');
      return;
    }

    setTableLoading(undernameTableLoading);
    setPercentLoaded(percentUndernamesLoaded);
    setSelectedRow(selectedUndernameRow);

    if (tableLoading) load();

    setAction(action);

    if (
      action === UNDERNAME_TABLE_ACTIONS.REMOVE &&
      antId &&
      selectedUndernameRow?.name
    ) {
      setTransactionData({
        subDomain: selectedUndernameRow?.name,
      });
      setInteractionType(ANT_INTERACTION_TYPES.REMOVE_RECORD);
    }
  }, [
    id,
    name,
    undernameSortAscending,
    undernameSortField,
    selectedUndernameRow,
    action,
    undernameRows,
  ]);

  async function load() {
    try {
      let contractTxId: ArweaveTransactionID | undefined = undefined;
      if (isArweaveTransactionID(id)) {
        contractTxId = new ArweaveTransactionID(id);
      } else if (name) {
        const record = data.arnsRecord;
        contractTxId = new ArweaveTransactionID(record?.contractTxId);
      }

      if (!contractTxId) {
        throw new Error('Unable to load undernames, cannot resolve ANT ID.');
      }
      setANTId(contractTxId);
      setANTState(new ANTContract(data.antState, contractTxId));
    } catch (error) {
      eventEmitter.emit('error', error);
      navigate('/manage/ants');
    }
  }

  async function handleInteraction({
    payload,
    workflowName,
    contractTxId,
  }: {
    payload: TransactionDataPayload;
    workflowName: ANT_INTERACTION_TYPES;
    contractTxId?: ArweaveTransactionID;
  }) {
    try {
      if (!contractTxId) {
        throw new Error('Unable to interact with ANT contract - missing ID.');
      }
      const res = await dispatchANTInteraction({
        contractTxId,
        payload,
        workflowName,
        antProvider: data.antProvider,
        dispatch: dispatchTransactionState,
      });
      console.debug('Interaction result:', res.id);
    } catch (error) {
      eventEmitter.emit('error', error);
    } finally {
      setTransactionData(undefined);
      setInteractionType(undefined);
      refresh();
    }
  }

  return (
    <>
      <div className="page">
        <div className="flex-column">
          {interactionResult ? (
            <TransactionSuccessCard
              txId={new ArweaveTransactionID(interactionResult.id)}
              close={() => {
                dispatchTransactionState({
                  type: 'reset',
                });
              }}
              title={`${workflowName} completed`}
            />
          ) : (
            <></>
          )}
          <div className="flex flex-justify-between">
            <div
              className="flex flex-row"
              style={{ justifyContent: 'space-between' }}
            >
              <h2 className="white">Manage Undernames</h2>
              {antState?.getOwnershipStatus(walletAddress) ? (
                <button
                  disabled={
                    antState?.getOwnershipStatus(walletAddress) === undefined
                  }
                  className={'button-secondary center'}
                  style={{
                    gap: '10px',
                    padding: '9px 12px',
                    fontSize: '14px',
                    textAlign: 'center',
                  }}
                  onClick={() =>
                    setSearchParams({ modal: UNDERNAME_TABLE_ACTIONS.CREATE })
                  }
                >
                  <PlusIcon
                    width={'16px'}
                    height={'16px'}
                    fill={'var(--accent)'}
                  />
                  Add Undername
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
            <Table
              onRow={() => ({ className: 'hovered-row' })}
              prefixCls="manage-undernames-table"
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
                onChange: (page: number) => setTablePage(page),
                showPrevNextJumpers: true,
                showSizeChanger: false,
                current: tablePage,
              }}
              locale={{
                emptyText: (
                  <div
                    className="flex flex-column center"
                    style={{
                      padding: '100px',
                      boxSizing: 'border-box',
                      width: '100%',
                    }}
                  >
                    <span className="white bold" style={{ fontSize: '16px' }}>
                      No Undernames Found
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
                      {antState?.getOwnershipStatus(walletAddress) ? (
                        <button
                          className={'button-secondary center'}
                          style={{
                            gap: '10px',
                            padding: '9px 12px',
                            fontSize: '14px',
                            textAlign: 'center',
                          }}
                          onClick={() =>
                            setSearchParams({
                              modal: UNDERNAME_TABLE_ACTIONS.CREATE,
                            })
                          }
                        >
                          <PlusIcon
                            width={'16px'}
                            height={'16px'}
                            fill={'var(--accent)'}
                          />
                          Add Undername
                        </button>
                      ) : (
                        <></>
                      )}
                    </div>
                  </div>
                ),
              }}
            />
          )}
        </div>
      </div>
      {searchParams.has('modal') &&
      antId &&
      antState?.getOwnershipStatus(walletAddress) ? (
        <AddUndernameModal
          closeModal={() => {
            setSearchParams({});
            setSelectedRow(undefined);
            setSearchParams({});
          }}
          payloadCallback={(payload: SetRecordPayload) => {
            setTransactionData(payload);
            setInteractionType(ANT_INTERACTION_TYPES.SET_RECORD);
            setAction(undefined);
            setSelectedRow(undefined);
            setSearchParams({});
          }}
          antId={antId}
        />
      ) : (
        <> </>
      )}

      {action === UNDERNAME_TABLE_ACTIONS.EDIT &&
      antId &&
      selectedRow?.name &&
      antState?.getOwnershipStatus(walletAddress) ? (
        <EditUndernameModal
          closeModal={() => {
            setAction(undefined);
            setSelectedRow(undefined);
          }}
          payloadCallback={(payload: SetRecordPayload) => {
            setTransactionData(payload);
            setInteractionType(ANT_INTERACTION_TYPES.EDIT_RECORD);
            setAction(undefined);
            setSelectedRow(undefined);
          }}
          antId={antId}
          undername={selectedRow.name}
        />
      ) : (
        <> </>
      )}

      {antId &&
      transactionData &&
      interactionType &&
      antState?.getOwnershipStatus(walletAddress) ? (
        <ConfirmTransactionModal
          interactionType={interactionType}
          confirm={() =>
            handleInteraction({
              payload: transactionData,
              workflowName: interactionType,
              contractTxId: antId,
            })
          }
          cancel={() => {
            setTransactionData(undefined);
            setInteractionType(undefined);
            setSelectedRow(undefined);
            setAction(undefined);
          }}
        />
      ) : (
        <></>
      )}
    </>
  );
}

export default Undernames;
