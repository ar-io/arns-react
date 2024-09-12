import { AoANTRecord } from '@ar.io/sdk';
import { ExternalLinkIcon, PencilIcon } from '@src/components/icons';
import ArweaveID, {
  ArweaveIdTypes,
} from '@src/components/layout/ArweaveID/ArweaveID';
import { EditUndernameModal } from '@src/components/modals';
import ConfirmTransactionModal from '@src/components/modals/ConfirmTransactionModal/ConfirmTransactionModal';
import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import {
  dispatchArNSUpdate,
  useArNSState,
  useGlobalState,
  useTransactionState,
  useWalletState,
} from '@src/state';
import dispatchANTInteraction from '@src/state/actions/dispatchANTInteraction';
import { ANT_INTERACTION_TYPES, TransactionDataPayload } from '@src/types';
import { camelToReadable, formatForMaxCharCount } from '@src/utils';
import eventEmitter from '@src/utils/events';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { CornerDownRight } from 'lucide-react';
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
}: {
  undernames: Record<string, AoANTRecord>;
  arnsDomain: string;
  antId: string;
}) => {
  const [{ gateway, ioProcessId }] = useGlobalState();
  const [{ arnsEmitter }, dispatchArNSState] = useArNSState();
  const [{ wallet, walletAddress }] = useWalletState();
  const [, dispatchTransactionState] = useTransactionState();
  const [tableData, setTableData] = useState<Array<TableData>>([]);
  // modal state
  const [transactionData, setTransactionData] = useState<
    TransactionDataPayload | undefined
  >();
  const [showEditUndernameModal, setShowEditUndernameModal] =
    useState<boolean>(false);
  const [selectedUndername, setSelectedUndername] = useState<string>();

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
              <span className="flex justify-end pr-3">
                <button
                  className="fill-grey hover:fill-white"
                  onClick={() => {
                    setSelectedUndername(undername);
                    setShowEditUndernameModal(true);
                  }}
                >
                  <PencilIcon width={'18px'} height={'18px'} fill="inherit" />
                </button>
              </span>
            ),
          };
          newTableData.push(data as TableData);
        });

      setTableData(newTableData as TableData[]);
    }
  }, [undernames]);

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
                  <span className="w-fit whitespace-nowrap text-primary">
                    {rowValue}
                  </span>
                }
                icon={
                  <Link
                    className="link gap-2 items-center"
                    to={`https://${rowValue}_${arnsDomain}.${gateway}`}
                    target="_blank"
                  >
                    <CornerDownRight className="text-dark-grey w-[18px]" />
                    {formatForMaxCharCount(rowValue, 12)}{' '}
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
      />
      {showEditUndernameModal && selectedUndername && (
        <EditUndernameModal
          antId={new ArweaveTransactionID(antId)}
          undername={selectedUndername}
          closeModal={() => setShowEditUndernameModal(false)}
          payloadCallback={(p) => setTransactionData(p)}
        />
      )}
      {transactionData && wallet?.arconnectSigner && walletAddress ? (
        <ConfirmTransactionModal
          interactionType={ANT_INTERACTION_TYPES.EDIT_RECORD}
          confirm={() =>
            dispatchANTInteraction({
              processId: new ArweaveTransactionID(antId),
              payload: transactionData,
              workflowName: ANT_INTERACTION_TYPES.EDIT_RECORD,
              signer: wallet.arconnectSigner!,
              owner: walletAddress.toString(),
              dispatch: dispatchTransactionState,
            }).then(() => {
              eventEmitter.emit('success', {
                message: (
                  <div>
                    <span>{selectedUndername} successfully updated!</span>
                  </div>
                ),
                name: 'Edit Undername',
              });
              dispatchArNSUpdate({
                emitter: arnsEmitter,
                walletAddress: walletAddress,
                ioProcessId,
                dispatch: dispatchArNSState,
              });
              setTransactionData(undefined);
              setSelectedUndername(undefined);
              setShowEditUndernameModal(false);
            })
          }
          cancel={() => {
            setTransactionData(undefined);
            setSelectedUndername(undefined);
            setShowEditUndernameModal(false);
          }}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default UndernamesSubtable;