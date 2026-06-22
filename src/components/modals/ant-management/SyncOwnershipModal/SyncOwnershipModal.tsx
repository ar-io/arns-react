import { useIsMobile } from '@src/hooks';
import { useWalletState } from '@src/state';
import { formatForMaxCharCount } from '@src/utils';
import { WRITE_OPTIONS } from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import { buildAnt } from '@src/utils/sdk-init';
import { useState } from 'react';

import DialogModal from '../../DialogModal/DialogModal';

/**
 * `syncAcl` is a Solana-only method on `SolanaANTWriteable` not surfaced on the
 * cross-backend `ANTWrite` interface — reached via cast, matching how the app
 * reaches `reconcile` / `getANTStates`.
 */
type AntWithSyncAcl = {
  syncAcl: (options?: typeof WRITE_OPTIONS) => Promise<{ id: string }>;
};

/** One out-of-sync ANT: its mint plus the name(s) it backs. */
export type SyncOwnershipItem = {
  mint: string;
  names: string[];
};

type ItemStatus = 'pending' | 'syncing' | 'done' | 'error';

function SyncOwnershipModal({
  items,
  closeModal,
  onSynced,
}: {
  items: SyncOwnershipItem[];
  closeModal: () => void;
  /** Called after at least one ANT synced, so the caller can refresh state. */
  onSynced: () => void;
}) {
  const isMobile = useIsMobile();
  const [{ wallet }] = useWalletState();
  const [status, setStatus] = useState<Record<string, ItemStatus>>({});
  const [running, setRunning] = useState(false);
  const [syncedAny, setSyncedAny] = useState(false);

  const remaining = items.filter((i) => status[i.mint] !== 'done');

  async function syncOne(mint: string): Promise<boolean> {
    setStatus((s) => ({ ...s, [mint]: 'syncing' }));
    try {
      const ant = await buildAnt({ wallet, processId: mint });
      const tx = await (ant as unknown as AntWithSyncAcl).syncAcl(
        WRITE_OPTIONS,
      );
      setStatus((s) => ({ ...s, [mint]: 'done' }));
      setSyncedAny(true);
      eventEmitter.emit('success', {
        name: 'Sync Ownership',
        message: `Synced ANT ${mint}: ${tx.id}`,
      });
      return true;
    } catch (e) {
      setStatus((s) => ({ ...s, [mint]: 'error' }));
      eventEmitter.emit('error', e);
      return false;
    }
  }

  async function syncAll() {
    setRunning(true);
    try {
      // Sequential — one signed tx per ANT; parallel would prompt the wallet
      // N times at once.
      for (const item of remaining) {
        await syncOne(item.mint);
      }
    } finally {
      setRunning(false);
    }
  }

  function handleClose() {
    if (syncedAny) onSynced();
    closeModal();
  }

  const allDone =
    items.length > 0 && items.every((i) => status[i.mint] === 'done');

  return (
    <div
      className="modal-container"
      style={isMobile ? { padding: 'none' } : {}}
    >
      <DialogModal
        title={<h2 className="white text-xl">Sync Ownership</h2>}
        onClose={handleClose}
        body={
          <div
            className="flex flex-col gap-4"
            style={{ fontSize: '14px', maxWidth: '575px', minWidth: '475px' }}
          >
            <p className="text-grey">
              These ANTs are owned by your wallet on-chain but aren&apos;t in
              your registry yet (e.g. acquired via a raw Metaplex Core
              transfer). Syncing records your ownership so they appear and
              behave normally. Each ANT is a separate transaction your wallet
              will ask you to sign.
            </p>

            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
              {items.map((item) => {
                const st = status[item.mint] ?? 'pending';
                return (
                  <div
                    key={item.mint}
                    className="flex items-center justify-between gap-3 rounded bg-background px-3 py-2"
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="text-white">
                        {item.names
                          .map((n) => formatForMaxCharCount(n, 24))
                          .join(', ') || '(no name)'}
                      </span>
                      <code className="break-all text-xs text-grey">
                        {item.mint}
                      </code>
                    </div>
                    <span
                      className={
                        st === 'done'
                          ? 'text-success text-xs whitespace-nowrap'
                          : st === 'error'
                            ? 'text-error text-xs whitespace-nowrap'
                            : 'text-grey text-xs whitespace-nowrap'
                      }
                    >
                      {st === 'syncing'
                        ? 'Syncing…'
                        : st === 'done'
                          ? 'Synced'
                          : st === 'error'
                            ? 'Failed — retry'
                            : 'Pending'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        }
        footer={
          <div className="flex w-full justify-end gap-2">
            <button
              className="text-grey border-[0.5px] border-dark-grey rounded hover:border-white hover:text-white transition-all py-2 px-4 text-sm font-semibold"
              onClick={handleClose}
              disabled={running}
            >
              {allDone ? 'Done' : 'Close'}
            </button>
            {!allDone && (
              <button
                className="rounded bg-primary px-4 py-2 text-sm font-medium text-black transition-all hover:bg-primary-dark disabled:opacity-50"
                onClick={syncAll}
                disabled={running || remaining.length === 0}
              >
                {running ? 'Syncing…' : `Sync all (${remaining.length})`}
              </button>
            )}
          </div>
        }
      />
    </div>
  );
}

export default SyncOwnershipModal;
