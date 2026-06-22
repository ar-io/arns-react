import { type ARIORead } from '@ar.io/sdk/web';
import { useGlobalState } from '@src/state/contexts/GlobalState';
import { useWalletState } from '@src/state/contexts/WalletState';
import { computeAclDrift } from '@src/utils/aclSync';
import { WRITE_OPTIONS } from '@src/utils/constants';
import eventEmitter from '@src/utils/events';
import { buildAnt } from '@src/utils/sdk-init';
import { useState } from 'react';

/** A drifted ANT row: an owned asset that backs a name but is missing from the ACL. */
type AclSyncTarget = { name: string; mint: string };

const inputContainerClass =
  'flex flex-col gap-2 border border-primary-thin p-2 rounded-md bg-metallic-grey';

/**
 * `syncAcl` reconciles an ANT's on-chain ACL (records the caller's owner
 * entry, reconciles `AntConfig`, removes the previous owner's/controllers'
 * stale entries) after an out-of-band MPL Core transfer. It's a Solana-only
 * method on `SolanaANTWriteable` that the cross-backend `ANTWrite` interface
 * doesn't surface — hence the cast, matching how the app reaches `reconcile`
 * and `getANTStates`.
 */
type AntWithSyncAcl = {
  syncAcl: (options?: typeof WRITE_OPTIONS) => Promise<{ id: string }>;
};

function AclSync() {
  const [{ arioContract }] = useGlobalState();
  const [{ wallet, walletAddress }] = useWalletState();
  const [scanning, setScanning] = useState(false);
  const [syncingMint, setSyncingMint] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [targets, setTargets] = useState<AclSyncTarget[] | null>(null);

  const address = walletAddress?.toString();

  async function scan() {
    if (!address) {
      eventEmitter.emit('error', new Error('Connect a wallet first.'));
      return;
    }
    setScanning(true);
    setTargets(null);
    try {
      const { driftRecords } = await computeAclDrift({
        owner: address,
        ario: arioContract as ARIORead,
      });
      const found: AclSyncTarget[] = driftRecords.map((r) => ({
        name: r.name,
        mint: r.processId,
      }));
      setTargets(found);
      eventEmitter.emit('success', {
        name: 'ACL Sync Scan',
        message: found.length
          ? `${found.length} name(s) across ${
              new Set(found.map((t) => t.mint)).size
            } ANT(s) drifted from the ACL.`
          : 'No drift — every owned ANT is in the ACL.',
      });
    } catch (e) {
      eventEmitter.emit('error', e);
    } finally {
      setScanning(false);
    }
  }

  async function syncMint(mint: string) {
    setSyncingMint(mint);
    try {
      const ant = await buildAnt({ wallet, processId: mint });
      const tx = await (ant as unknown as AntWithSyncAcl).syncAcl(
        WRITE_OPTIONS,
      );
      eventEmitter.emit('success', {
        name: 'ACL Sync',
        message: `Synced ANT ${mint}: ${tx.id}`,
      });
      // One ACL fix covers every name backed by this mint.
      setTargets((prev) => prev?.filter((t) => t.mint !== mint) ?? null);
    } catch (e) {
      eventEmitter.emit('error', e);
    } finally {
      setSyncingMint(null);
    }
  }

  async function syncAll() {
    if (!targets) return;
    setBusy(true);
    try {
      // One tx per ANT, sequential — firing them in parallel would prompt the
      // wallet N times at once.
      const uniqueMints = Array.from(new Set(targets.map((t) => t.mint)));
      for (const mint of uniqueMints) {
        await syncMint(mint);
      }
    } finally {
      setBusy(false);
    }
  }

  const uniqueMintCount = targets
    ? new Set(targets.map((t) => t.mint)).size
    : 0;

  return (
    <div className="flex flex-col w-full h-fit p-3 text-sm">
      <div className={inputContainerClass}>
        <span className="text-white text-md">ACL Sync</span>
        <p className="text-grey text-xs">
          Finds ANTs this wallet actually owns (per MPL Core) that back an ArNS
          name but are missing from the on-chain ACL — e.g. after a raw Metaplex
          Core transfer — and runs <code>syncAcl</code> to record the owner
          entry, reconcile <code>AntConfig</code>, and clear the previous
          owner&apos;s/controllers&apos; stale entries so the name shows up in
          your asset list.
        </p>

        <div className="flex gap-2 items-center mt-2">
          <button
            className="text-grey border-[0.5px] border-dark-grey rounded hover:border-white hover:text-white transition-all h-fit py-3 px-4 text-md font-semibold whitespace-nowrap"
            disabled={scanning || busy || !address}
            onClick={scan}
          >
            {scanning ? 'Scanning…' : 'Scan for ACL drift'}
          </button>
          {targets && targets.length > 0 && (
            <button
              className="text-grey border-[0.5px] border-dark-grey rounded hover:border-white hover:text-white transition-all h-fit py-3 px-4 text-md font-semibold whitespace-nowrap"
              disabled={busy || !!syncingMint}
              onClick={syncAll}
            >
              {busy ? 'Syncing…' : `Sync all (${uniqueMintCount})`}
            </button>
          )}
        </div>

        {targets !== null && targets.length === 0 && (
          <p className="text-grey text-xs mt-2 italic">
            No drift detected for this wallet.
          </p>
        )}

        {targets && targets.length > 0 && (
          <div className="flex flex-col gap-1 mt-3 max-h-64 overflow-y-auto">
            {targets.map((t) => (
              <div
                key={`${t.mint}-${t.name}`}
                className="flex items-center justify-between gap-2 bg-background rounded px-2 py-1"
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-white text-xs font-semibold">
                    {t.name}
                  </span>
                  <code className="text-grey text-xs break-all">{t.mint}</code>
                </div>
                <button
                  className="text-grey border-[0.5px] border-dark-grey rounded hover:border-white hover:text-white transition-all h-fit py-1 px-3 text-xs font-semibold whitespace-nowrap"
                  disabled={busy || !!syncingMint}
                  onClick={() => syncMint(t.mint)}
                >
                  {syncingMint === t.mint ? 'Syncing…' : 'Sync'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AclSync;
