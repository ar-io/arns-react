import { AoANTRecord, AoANTState } from '@ar.io/sdk';
import { ExternalLinkIcon, PencilIcon, TrashIcon } from '@src/components/icons';
import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import { AddUndernameModal, EditUndernameModal } from '@src/components/modals';
import ConfirmTransactionModal from '@src/components/modals/ConfirmTransactionModal/ConfirmTransactionModal';
import { usePrimaryName } from '@src/hooks/usePrimaryName';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import {
  useArNSState,
  useGlobalState,
  useModalState,
  useTransactionState,
  useWalletState,
} from '@src/state';
import dispatchANTInteraction from '@src/state/actions/dispatchANTInteraction';
import {
  ANT_INTERACTION_TYPES,
  SetRecordPayload,
  TransactionDataPayload,
  UNDERNAME_TABLE_ACTIONS,
  UndernameTableInteractionTypes,
} from '@src/types';
import {
  camelToReadable,
  decodeDomainToASCII,
  encodeDomainToASCII,
  encodePrimaryName,
  formatForMaxCharCount,
} from '@src/utils';
import { MIN_ANT_VERSION, NETWORK_DEFAULTS } from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { Plus, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ReactNode } from 'react-markdown';
import { Link } from 'react-router-dom';

import { Tooltip } from '..';
import TableView from './TableView';

interface TableData {
  undername: string;
  targetId: string;
  ttlSeconds: number;
  action: ReactNode;
}

const columnHelper = createColumnHelper<TableData>();

const UndernamesSubtable = ({
  undernames,
  arnsDomain,
  antId,
  version,
  state,
}: {
  undernames: Record<string, AoANTRecord>;
  arnsDomain: string;
  version: number;
  antId: string;
  state?: AoANTState | null;
}) => {
  const [{ arioProcessId, antAoClient, hyperbeamUrl }] = useGlobalState();
  const [, dispatchArNSState] = useArNSState();

  const [{ wallet, walletAddress }] = useWalletState();
  const isOwner = walletAddress
    ? state?.Owner === walletAddress.toString()
    : false;
  const [, dispatchTransactionState] = useTransactionState();
  const [, dispatchModalState] = useModalState();
  const { data: primaryNameData } = usePrimaryName();
  const [tableData, setTableData] = useState<Array<TableData>>([]);

  const [action, setAction] = useState<
    UndernameTableInteractionTypes | undefined
  >();
  const [transactionData, setTransactionData] = useState<
    TransactionDataPayload | undefined
  >();
  const [interactionType, setInteractionType] =
    useState<ANT_INTERACTION_TYPES>();
  const [selectedUndername, setSelectedUndername] = useState<string>();

  async function handleInteraction({
    payload,
    workflowName,
    processId,
  }: {
    payload: TransactionDataPayload;
    workflowName: ANT_INTERACTION_TYPES;
    processId?: string;
  }) {
    try {
      if (!processId) {
        throw new Error('Unable to interact with ANT contract - missing ID.');
      }

      if (!wallet?.contractSigner || !walletAddress) {
        throw new Error(
          'Unable to interact with ANT contract - missing signer.',
        );
      }

      const { id } = await dispatchANTInteraction({
        processId,
        payload,
        workflowName,
        signer: wallet?.contractSigner,
        owner: walletAddress?.toString(),
        dispatchTransactionState,
        dispatchArNSState,
        ao: antAoClient,
        hyperbeamUrl,
      });
      eventEmitter.emit('success', {
        name: 'Manage Undernames',
        message: (
          <span
            className="flex flex-row whitespace-nowrap"
            style={{ gap: '10px' }}
          >
            {workflowName} complete.{' '}
            <ArweaveID
              id={new ArweaveTransactionID(id)}
              type={ArweaveIdTypes.INTERACTION}
              shouldLink
              characterCount={8}
            />
          </span>
        ),
      });
      // refresh the row
      setTableData(tableData);
    } catch (error) {
      eventEmitter.emit('error', error);
    } finally {
      setTransactionData(undefined);
      setInteractionType(undefined);
    }
  }

  useEffect(() => {
    if (undernames) {
      const newTableData: TableData[] = [];

      Object.entries(undernames)
        .filter(([u]) => u !== '@')
        .map(([undername, record]) => {
          const data = {
            undername,
            targetId: record.transactionId,
            ttlSeconds: record.ttlSeconds,
            action: (
              <span className="flex justify-end pr-3 gap-3">
                {isOwner && (
                  <Tooltip
                    message={
                      !arnsDomain
                        ? 'Loading...'
                        : version < MIN_ANT_VERSION
                        ? 'Update ANT to access Primary Names workflow'
                        : primaryNameData?.name ===
                          encodePrimaryName(undername + '_' + arnsDomain)
                        ? 'Remove Primary Name'
                        : 'Set Primary Name'
                    }
                    icon={
                      <button
                        disabled={version < MIN_ANT_VERSION}
                        onClick={() => {
                          if (!arnsDomain || !antId) return;
                          const targetName = encodePrimaryName(
                            undername + '_' + arnsDomain,
                          );
                          if (primaryNameData?.name === targetName) {
                            // remove primary name payload
                            dispatchTransactionState({
                              type: 'setTransactionData',
                              payload: {
                                names: [targetName],
                                arioProcessId,
                                assetId: antId,
                                functionName: 'removePrimaryNames',
                              },
                            });
                          } else {
                            dispatchTransactionState({
                              type: 'setTransactionData',
                              payload: {
                                name: targetName,
                                arioProcessId,
                                assetId: arioProcessId,
                                functionName: 'primaryNameRequest',
                              },
                            });
                          }

                          dispatchModalState({
                            type: 'setModalOpen',
                            payload: { showPrimaryNameModal: true },
                          });
                        }}
                      >
                        <Star
                          className={
                            (encodePrimaryName(undername + '_' + arnsDomain) ==
                            primaryNameData?.name
                              ? 'text-primary fill-primary'
                              : 'text-grey') +
                            ` 
                    w-[18px]
                    `
                          }
                        />
                      </button>
                    }
                  />
                )}
                <button
                  className="fill-grey hover:fill-white"
                  onClick={() => {
                    setSelectedUndername(undername);
                    setAction(UNDERNAME_TABLE_ACTIONS.EDIT);
                  }}
                >
                  <PencilIcon width={'18px'} height={'18px'} fill="inherit" />
                </button>
                <button
                  className="fill-grey hover:fill-white"
                  onClick={() => {
                    setSelectedUndername(undername);
                    setAction(UNDERNAME_TABLE_ACTIONS.REMOVE);
                    setTransactionData({
                      subDomain: undername,
                    });
                    setInteractionType(ANT_INTERACTION_TYPES.REMOVE_RECORD);
                    dispatchTransactionState({
                      type: 'setWorkflowName',
                      payload: ANT_INTERACTION_TYPES.REMOVE_RECORD,
                    });
                  }}
                >
                  <TrashIcon width={'18px'} height={'18px'} fill="inherit" />
                </button>
              </span>
            ),
          };
          newTableData.push(data as TableData);
        });

      setTableData(newTableData as TableData[]);
    }
  }, [undernames, primaryNameData]);

  // Define columns for the table
  const columns: ColumnDef<TableData, any>[] = [
    'undername',
    'targetId',
    'ttlSeconds',
    'action',
  ].map((key) =>
    columnHelper.accessor(key as keyof TableData, {
      id: key,
      header:
        key == 'action'
          ? ''
          : key == 'targetId'
          ? 'Target ID'
          : key == 'ttlSeconds'
          ? 'TTL Seconds'
          : camelToReadable(key),
      sortDescFirst: true,
      cell: ({ row }) => {
        const rowValue = row.getValue(key) as any;
        if (!rowValue) {
          return '';
        }
        switch (key) {
          case 'undername': {
            return (
              <Tooltip
                tooltipOverrides={{
                  overlayClassName: 'w-fit',
                  overlayInnerStyle: { width: 'fit-content' },
                }}
                message={
                  <span className="w-fit whitespace-nowrap text-white">
                    {rowValue}
                  </span>
                }
                icon={
                  <Link
                    className="link gap-2 items-center w-fit"
                    to={`https://${encodeDomainToASCII(
                      rowValue,
                    )}_${encodeDomainToASCII(arnsDomain ?? '')}.${
                      NETWORK_DEFAULTS.ARNS.HOST
                    }`}
                    target="_blank"
                  >
                    {formatForMaxCharCount(decodeDomainToASCII(rowValue), 30)}{' '}
                    <ExternalLinkIcon
                      width={'12px'}
                      height={'12px'}
                      fill={'var(--text-white)'}
                    />
                  </Link>
                }
              />
            );
          }

          case 'targetId': {
            return (
              <ArweaveID
                id={rowValue}
                shouldLink={true}
                characterCount={8}
                type={ArweaveIdTypes.TRANSACTION}
              />
            );
          }
          default: {
            return rowValue;
          }
        }
      },
    }),
  );

  return (
    <>
      {' '}
      <TableView
        columns={columns}
        data={tableData}
        isLoading={false}
        noDataFoundText={
          <span className="h-20 flex w-full items-center justify-center">
            No Undernames Found
          </span>
        }
        defaultSortingState={{ id: 'undername', desc: true }}
        tableClass="bg-metallic-grey"
        rowClass={(props) => {
          const pad = '*:pl-[60px]';
          if (props?.row !== undefined) {
            const expanded = props.row.getIsExpanded();
            return expanded ? '' : 'hover:bg-primary-thin ' + pad;
          }

          if (props?.headerGroup !== undefined) {
            return pad;
          }

          return '';
        }}
        addOnAfterTable={
          isOwner ? (
            <div className="w-full flex flex-row text-primary font-semibold border-t-[1px] border-dark-grey text-sm">
              <button
                className="flex flex-row w-full items-center p-3 bg-background hover:bg-primary-gradient text-primary hover:text-primary fill-primary hover:fill-black transition-all"
                style={{ gap: '10px' }}
                onClick={() => setAction(UNDERNAME_TABLE_ACTIONS.CREATE)}
              >
                <Plus className="size-4 text-primary fill-black" />
                Add Undername
              </button>
            </div>
          ) : (
            <></>
          )
        }
      />
      {action === UNDERNAME_TABLE_ACTIONS.CREATE && (
        <AddUndernameModal
          closeModal={() => {
            setAction(undefined);
          }}
          payloadCallback={(payload: SetRecordPayload) => {
            setTransactionData(payload);
            setInteractionType(ANT_INTERACTION_TYPES.SET_RECORD);
            dispatchTransactionState({
              type: 'setWorkflowName',
              payload: ANT_INTERACTION_TYPES.SET_RECORD,
            });
            setAction(undefined);
          }}
          antId={antId}
        />
      )}
      {action === UNDERNAME_TABLE_ACTIONS.EDIT && selectedUndername && (
        <EditUndernameModal
          antId={new ArweaveTransactionID(antId)}
          undername={selectedUndername}
          closeModal={() => setAction(undefined)}
          payloadCallback={(p) => {
            setTransactionData(p);
            setInteractionType(ANT_INTERACTION_TYPES.EDIT_RECORD);
            dispatchTransactionState({
              type: 'setWorkflowName',
              payload: ANT_INTERACTION_TYPES.EDIT_RECORD,
            });
            setAction(undefined);
          }}
        />
      )}
      {antId && transactionData && interactionType && isOwner ? (
        <ConfirmTransactionModal
          interactionType={interactionType}
          confirm={() =>
            handleInteraction({
              payload: transactionData,
              workflowName: interactionType,
              processId: antId!,
            })
          }
          cancel={() => {
            setTransactionData(undefined);
            setInteractionType(undefined);
            setSelectedUndername(undefined);
          }}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default UndernamesSubtable;
