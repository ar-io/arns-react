import { Checkbox } from '@src/components/inputs/Checkbox';
import { useANT } from '@src/hooks/useANT/useANT';
import { AoAddress } from '@src/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useIsMobile } from '../../../../hooks';
import { ArweaveTransactionID } from '../../../../services/arweave/ArweaveTransactionID';
import { formatForMaxCharCount, isEthAddress } from '../../../../utils';
import DialogModal from '../../DialogModal/DialogModal';
import './styles.css';

function RemoveControllersModal({
  antId,
  controllers = [],
  closeModal,
  payloadCallback,
}: {
  antId: ArweaveTransactionID;
  controllers: string[];
  closeModal: () => void;
  payloadCallback: (payload: { controller: string }) => void;
}) {
  const isMobile = useIsMobile();
  const [controllersToRemove, setControllersToRemove] = useState<AoAddress[]>(
    [],
  );
  const [tablePage, setTablePage] = useState<number>(1);
  const { name = 'N/A' } = useANT(antId.toString());
  const pageSize = 8;
  const [rows, setRows] = useState<{ controller: AoAddress }[]>(
    controllers.map((controller) => ({
      controller: isEthAddress(controller)
        ? controller
        : new ArweaveTransactionID(controller),
    })),
  );

  useEffect(() => {
    setRows(
      controllers.map((controller) => ({
        controller: isEthAddress(controller)
          ? controller
          : new ArweaveTransactionID(controller),
      })),
    );
  }, [controllers]);

  function handlePayloadCallback() {
    payloadCallback({
      controller: controllersToRemove[0].toString(),
    });
  }

  const totalPages = Math.ceil(rows.length / pageSize);
  const paginatedRows = rows.slice(
    (tablePage - 1) * pageSize,
    tablePage * pageSize,
  );

  return (
    <div
      className="modal-container"
      style={isMobile ? { padding: 'none' } : {}}
    >
      {/**modal header */}
      <DialogModal
        title={<h2 className="text-foreground text-xl">Remove Controller</h2>}
        body={
          <div
            className="flex flex-col gap-8"
            style={{ fontSize: '14px', maxWidth: '575px', minWidth: '475px' }}
          >
            <div className="flex flex-col gap-2">
              <span className="grey">Process ID</span>
              <span className="white">{antId.toString()}</span>
            </div>
            <div className="flex flex-row">
              <div className="flex flex-col gap-2">
                <span className="grey">Nickname</span>
                <span className="white">{formatForMaxCharCount(name, 20)}</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="grey" style={{ whiteSpace: 'nowrap' }}>
                  Total Controllers
                </span>
                <span className="white">{rows.length ?? 'N/A'}</span>
              </div>
              <div
                className="flex flex-col gap-2"
                style={{
                  height: '100%',
                  justifyContent: 'flex-start',
                  width: 'fit-content',
                }}
              >
                <span className="grey">Selected</span>
                <span
                  style={{
                    color:
                      controllersToRemove.length > 0
                        ? 'var(--error-red)'
                        : 'var(--text-white)',
                  }}
                >
                  {controllersToRemove.length}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-8" style={{ paddingBottom: '30px' }}>
              <div className="flex flex-col gap-8" style={{ gap: '10px' }}>
                {rows.length ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      {paginatedRows.map((row) => (
                        <div
                          key={row.controller.toString()}
                          className="flex items-center gap-3 p-2 rounded hover:bg-surface/50 cursor-pointer"
                          onClick={() => {
                            if (
                              controllersToRemove
                                .map((c) => c.toString())
                                .includes(row.controller.toString())
                            ) {
                              setControllersToRemove([]);
                              return;
                            }
                            setControllersToRemove([row.controller]);
                          }}
                        >
                          <Checkbox
                            checked={controllersToRemove
                              .map((c) => c.toString())
                              .includes(row.controller.toString())}
                            onCheckedChange={() => {
                              if (
                                controllersToRemove
                                  .map((c) => c.toString())
                                  .includes(row.controller.toString())
                              ) {
                                setControllersToRemove([]);
                                return;
                              }
                              setControllersToRemove([row.controller]);
                            }}
                          />
                          <span
                            className={
                              controllersToRemove
                                .map((c) => c.toString())
                                .includes(row.controller.toString())
                                ? 'text-white'
                                : 'text-grey'
                            }
                          >
                            {row.controller.toString()}
                          </span>
                        </div>
                      ))}
                    </div>
                    {totalPages > 1 && (
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          className="p-1 rounded hover:bg-surface/50 disabled:opacity-30 disabled:cursor-not-allowed"
                          onClick={() =>
                            setTablePage((p) => Math.max(1, p - 1))
                          }
                          disabled={tablePage === 1}
                        >
                          <ChevronLeft className="size-4 text-white" />
                        </button>
                        <span className="text-grey text-sm">
                          {tablePage} / {totalPages}
                        </span>
                        <button
                          className="p-1 rounded hover:bg-surface/50 disabled:opacity-30 disabled:cursor-not-allowed"
                          onClick={() =>
                            setTablePage((p) => Math.min(totalPages, p + 1))
                          }
                          disabled={tablePage === totalPages}
                        >
                          <ChevronRight className="size-4 text-white" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-8 justify-center items-center">
                    <span
                      className="flex flex-row warning-container text-center justify-center items-center"
                      style={{ boxSizing: 'border-box' }}
                    >
                      {`This ANT token has no controllers to remove.`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        }
        onCancel={closeModal}
        onClose={closeModal}
        onNext={
          controllersToRemove.length > 0
            ? () => handlePayloadCallback()
            : undefined
        }
        footer={
          <div className="flex">
            {/* <TransactionCost
              fee={{}}
              feeWrapperStyle={{ alignItems: 'flex-start' }}
              showBorder={false}
            /> */}
          </div>
        }
        nextText="Remove"
        cancelText="Cancel"
      />
    </div>
  );
}

export default RemoveControllersModal;
