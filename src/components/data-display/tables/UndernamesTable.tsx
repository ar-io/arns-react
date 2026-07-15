import { ANTRecord, ANTState, sortANTRecords } from '@ar.io/sdk';
import { Tooltip } from '@src/components/data-display';
import { ArioSpinner } from '@src/components/data-display/Spinner';
import { ExternalLinkIcon, PencilIcon, TrashIcon } from '@src/components/icons';
import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import { AddUndernameModal, EditUndernameModal } from '@src/components/modals';
import ConfirmTransactionModal from '@src/components/modals/ConfirmTransactionModal/ConfirmTransactionModal';
import { usePrimaryName } from '@src/hooks/usePrimaryName';
import { useTurboArNSClient } from '@src/hooks/useTurboArNSClient';
import { SolanaAddress } from '@src/services/solana/SolanaAddress';
import { SolanaSignature } from '@src/services/solana/SolanaSignature';
import {
  useArNSState,
  useGlobalState,
  useModalState,
  useTransactionState,
  useWalletState,
} from '@src/state';
import dispatchANTInteraction from '@src/state/actions/dispatchANTInteraction';
import dispatchCustodialANTRecordInteraction from '@src/state/actions/dispatchCustodialANTRecordInteraction';
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
import { NETWORK_DEFAULTS } from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import { queryClient } from '@src/utils/network';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { Plus, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ReactNode } from 'react-markdown';
import { Link } from 'react-router-dom';

import TableView from './TableView';

interface TableData {
  undername: string;
  targetId: string;
  ttlSeconds: number;
  priority: number;
  action: ReactNode;
}

const columnHelper = createColumnHelper<TableData>();

const UndernamesTable = ({
  undernames,
  arnsRecord,
  state,
  isLoading = false,
}: {
  undernames: Record<string, ANTRecord>;
  arnsRecord: {
    name: string;
    version: number;
    undernameLimit: number;
    processId: string;
  };
  state?: ANTState | null;
  isLoading: boolean;
}) => {
  const arioProcessId = '';
  const [, dispatchArNSState] = useArNSState();
  const [{ dataGateway }] = useGlobalState();

  const [{ wallet, walletAddress }] = useWalletState();
  const turbo = useTurboArNSClient();
  const isOwner = walletAddress
    ? state?.Owner === walletAddress.toString()
    : false;
  const isController = walletAddress
    ? state?.Controllers.includes(walletAddress.toString())
    : false;
  const isAuthorized = (isOwner || isController) ?? false;

  // Model A (custodial): ANTs are Solana assets, so a connected NON-Solana
  // identity can never own/control one — the ANT is Turbo-held and the user
  // manages undernames with CREDITS. The bundler authorizes each op against the
  // custody mapping (non-owner → non-leaky 404), so enabling the UI here is
  // server-gated-safe. (The custodian address is not exposed, so detect
  // structurally rather than by owner-address comparison.)
  const isCustodial =
    wallet?.tokenType !== 'solana' &&
    !!arnsRecord.processId &&
    !isOwner &&
    !isController;
  const canManage = isAuthorized || isCustodial;

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

      if (!walletAddress) {
        throw new Error(
          'Unable to interact with ANT contract - missing signer.',
        );
      }

      let id: string;
      if (isCustodial) {
        // Custodial (Model A): pay with credits — the user doesn't own the ANT.
        if (!turbo || !wallet?.turboSigner) {
          throw new Error(
            'A connected wallet is required to manage this name with credits.',
          );
        }
        ({ id } = await dispatchCustodialANTRecordInteraction({
          turbo,
          wallet,
          antId: processId,
          payload,
          workflowName,
          owner: walletAddress.toString(),
          dispatchTransactionState,
        }));
      } else {
        // Model B (self-owned): wallet-signed ANT interaction.
        // Solana wallets don't carry an AO contractSigner — accept either.
        const hasSigner =
          !!wallet?.contractSigner ||
          (wallet?.tokenType === 'solana' && !!wallet.solanaSigner);
        if (!hasSigner) {
          throw new Error(
            'Unable to interact with ANT contract - missing signer.',
          );
        }
        ({ id } = await dispatchANTInteraction({
          processId,
          payload,
          workflowName,
          signer: wallet?.contractSigner as never,
          wallet,
          owner: walletAddress?.toString(),
          dispatchTransactionState,
          dispatchArNSState,
        }));
      }
      eventEmitter.emit('success', {
        name: 'Manage Undernames',
        message: (
          <span
            className="flex flex-row whitespace-nowrap"
            style={{ gap: '10px' }}
          >
            {workflowName} complete.{' '}
            <ArweaveID
              id={new SolanaSignature(id)}
              type={ArweaveIdTypes.INTERACTION}
              shouldLink
              characterCount={8}
            />
          </span>
        ),
      });
      // Invalidate cached ANT state / domain-info queries so the table
      // reflects the on-chain change. The parent (`Undernames` page) reads
      // undernames from `useDomainInfo`, which is keyed on the ArNS name —
      // so invalidating only `['ant', processId, …]` isn't enough; we also
      // have to invalidate `['domainInfo', name, …]`. `setTableData` alone
      // is a no-op because `undernames` is owned by the parent.
      const invalidationKeys = [processId, arnsRecord.name].filter(Boolean);
      await queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
          invalidationKeys.some((k) => queryKey.includes(k)),
        refetchType: 'all',
      });
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

      // sort undernames by priority
      const sortedRecords = sortANTRecords(undernames);
      Object.entries(sortedRecords).map(([undername, record]) => {
        const data = {
          undername,
          targetId: record.transactionId,
          ttlSeconds: record.ttlSeconds,
          priority: record.index,
          action: canManage ? (
            <span className="flex justify-end pr-3 gap-3">
              {isOwner && (
                <Tooltip
                  message={
                    !arnsRecord
                      ? 'Loading...'
                      : primaryNameData?.name ===
                          encodePrimaryName(
                            undername === '@'
                              ? arnsRecord.name
                              : undername + '_' + arnsRecord.name,
                          )
                        ? 'Remove Primary Name'
                        : 'Set Primary Name'
                  }
                  icon={
                    <button
                      onClick={() => {
                        if (!arnsRecord || !arnsRecord.processId) return;
                        const targetName = encodePrimaryName(
                          undername === '@'
                            ? arnsRecord.name
                            : undername + '_' + arnsRecord.name,
                        );
                        if (primaryNameData?.name === targetName) {
                          // remove primary name payload
                          dispatchTransactionState({
                            type: 'setTransactionData',
                            payload: {
                              names: [targetName],
                              arioProcessId,
                              assetId: arnsRecord.processId,
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
                          (encodePrimaryName(
                            undername === '@'
                              ? arnsRecord.name
                              : undername + '_' + arnsRecord.name,
                          ) === primaryNameData?.name
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
              {undername !== '@' ? (
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
              ) : (
                <></>
              )}
            </span>
          ) : null,
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
    'priority',
    'action',
  ].map((key) =>
    columnHelper.accessor(key as keyof TableData, {
      id: key,
      header:
        key === 'action'
          ? ''
          : key === 'targetId'
            ? 'Target ID'
            : key === 'ttlSeconds'
              ? 'TTL Seconds'
              : camelToReadable(key),
      sortDescFirst: false,
      cell: ({ row }) => {
        const rowValue = row.getValue(key) as any;
        if (rowValue === undefined) {
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
                    to={`https://${
                      rowValue === '@' ? '' : `${rowValue}_`
                    }${encodeDomainToASCII(arnsRecord.name)}.${NETWORK_DEFAULTS.ARNS.HOST}`}
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
                linkBase={`https://${dataGateway}/`}
                characterCount={8}
                type={ArweaveIdTypes.TRANSACTION}
              />
            );
          }
          case 'priority': {
            // with tool tip explaining that priority indicates which names will resolve based on the limit
            return (
              <Tooltip
                tooltipOverrides={{
                  overlayClassName: 'w-fit',
                  overlayInnerStyle: { width: 'fit-content' },
                }}
                message={
                  <div className="w-50 text-white text-center">
                    The first {arnsRecord.undernameLimit} undernames for this
                    name (ordered by priority) will resolve on AR.IO gateways.
                    Click{' '}
                    <Link
                      className="text-primary"
                      to={`/manage/names/${arnsRecord.name}/upgrade-undernames`}
                    >
                      here
                    </Link>{' '}
                    to increase the undername limit.
                  </div>
                }
                icon={
                  <div className="flex flex-row items-center gap-2">
                    <span
                      className={`w-fit whitespace-nowrap ${
                        rowValue <= arnsRecord.undernameLimit
                          ? 'text-white'
                          : 'text-primary'
                      }`}
                    >
                      {rowValue}
                    </span>
                  </div>
                }
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
      <TableView
        columns={columns}
        data={tableData}
        isLoading={false}
        noDataFoundText={
          isLoading ? (
            <span className="h-fit flex flex-col text-white w-full items-center p-5 justify-center">
              <ArioSpinner size={100} />
              <span>Loading Undernames...</span>
            </span>
          ) : (
            <span className="h-20 flex w-full items-center justify-center">
              No Undernames Found
            </span>
          )
        }
        defaultSortingState={{ id: 'priority', desc: false }}
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
          // controllers and owners can add undernames; custodial (Model A)
          // names add them with credits
          canManage ? (
            <div className="w-full flex flex-col border-t-[1px] border-dark-grey">
              {isCustodial && (
                <span
                  className="w-full px-3 pt-2 text-xs text-primary"
                  data-testid="undernames-credit-paid-note"
                >
                  Held in Turbo custody — undername changes are paid with your
                  Turbo Credits.
                </span>
              )}
              <div className="w-full flex flex-row text-primary font-semibold text-sm">
                <button
                  data-testid="add-undername-button"
                  className="flex flex-row w-full items-center p-3 bg-background hover:bg-primary-gradient text-primary hover:text-primary fill-primary hover:fill-black transition-all"
                  style={{ gap: '10px' }}
                  onClick={() => setAction(UNDERNAME_TABLE_ACTIONS.CREATE)}
                >
                  <Plus className="size-4 text-primary fill-black" />
                  Add Undername
                </button>
              </div>
            </div>
          ) : (
            <></>
          )
        }
      />
      {action === UNDERNAME_TABLE_ACTIONS.CREATE && (
        <AddUndernameModal
          name={arnsRecord.name}
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
        />
      )}
      {action === UNDERNAME_TABLE_ACTIONS.EDIT && selectedUndername && (
        <EditUndernameModal
          antId={new SolanaAddress(arnsRecord.processId)}
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
      {arnsRecord.processId &&
      transactionData &&
      interactionType &&
      canManage ? (
        <ConfirmTransactionModal
          interactionType={interactionType}
          gasParams={(() => {
            // Custodial (Model A) ops are credit-paid, not SOL-gas-paid, and the
            // gas estimate reads the ANT as if the user owned it — skip it.
            if (isCustodial) return undefined;
            const undername = (transactionData as { subDomain?: string })
              ?.subDomain;
            if (!undername) return undefined;
            switch (interactionType) {
              case ANT_INTERACTION_TYPES.REMOVE_RECORD:
                return {
                  processId: arnsRecord.processId,
                  workflow: { workflow: 'remove-record' as const, undername },
                };
              case ANT_INTERACTION_TYPES.SET_RECORD:
                return {
                  processId: arnsRecord.processId,
                  workflow: { workflow: 'set-record' as const, undername },
                };
              case ANT_INTERACTION_TYPES.EDIT_RECORD:
                return {
                  processId: arnsRecord.processId,
                  workflow: { workflow: 'edit-record' as const, undername },
                };
              default:
                return undefined;
            }
          })()}
          confirm={() =>
            handleInteraction({
              payload: transactionData,
              workflowName: interactionType,
              processId: arnsRecord.processId,
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

export default UndernamesTable;
