import {
  ACL_ROLE_CONTROLLER,
  ACL_ROLE_OWNER,
  deserializeAclConfig,
  deserializeAclPage,
  getAclConfigPDA,
  getAclPagePDA,
} from '@ar.io/sdk/web';
import { type Address, address } from '@solana/kit';
import { useWalletState } from '@src/state';
import eventEmitter from '@src/utils/events';
import { getActiveSolanaConfig, getSolanaRpc } from '@src/utils/solana';
import { useState } from 'react';

import {
  getAccountInfoLegacy,
  getMultipleAccountsInfoLegacy,
} from './rpcHelpers';

type AclEntry = { asset: string; role: number };

const inputContainerClass =
  'flex flex-col gap-2 border border-primary-thin p-2 rounded-md bg-metallic-grey';

function AclFetcher() {
  const [{ walletAddress }] = useWalletState();
  const [inputAddress, setInputAddress] = useState<string>('');
  const [entries, setEntries] = useState<AclEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [configInfo, setConfigInfo] = useState<{
    pageCount: bigint;
    totalEntries: bigint;
  } | null>(null);

  const effectiveAddress =
    inputAddress.trim() || walletAddress?.toString() || '';

  async function fetchAcl() {
    if (!effectiveAddress) {
      eventEmitter.emit(
        'error',
        new Error('Enter an address or connect a wallet.'),
      );
      return;
    }

    setLoading(true);
    setEntries(null);
    setConfigInfo(null);

    try {
      const rpc = getSolanaRpc();
      const config = getActiveSolanaConfig();
      const antProgramId = config.programIds.antProgramId as
        | Address
        | undefined;

      const userAddr = address(effectiveAddress);
      const [configPda] = antProgramId
        ? await getAclConfigPDA(userAddr, antProgramId)
        : await getAclConfigPDA(userAddr);

      const configAccount = await getAccountInfoLegacy(rpc, configPda);
      if (!configAccount) {
        setEntries([]);
        eventEmitter.emit('success', {
          name: 'ACL Fetch',
          message: 'No AclConfig found for this address (empty ACL).',
        });
        return;
      }

      const aclConfig = deserializeAclConfig(configAccount.data);
      setConfigInfo({
        pageCount: aclConfig.pageCount,
        totalEntries: aclConfig.totalEntries,
      });

      if (aclConfig.pageCount === 0n) {
        setEntries([]);
        return;
      }

      const pageAddrs: Address[] = [];
      for (let i = 0n; i < aclConfig.pageCount; i++) {
        const [pagePda] = antProgramId
          ? await getAclPagePDA(userAddr, i, antProgramId)
          : await getAclPagePDA(userAddr, i);
        pageAddrs.push(pagePda);
      }

      const pageAccounts = await getMultipleAccountsInfoLegacy(rpc, pageAddrs);
      const allEntries: AclEntry[] = [];

      for (const acct of pageAccounts) {
        if (!acct) continue;
        const page = deserializeAclPage(acct.data);
        for (const entry of page.entries) {
          allEntries.push({ asset: entry.asset, role: entry.role });
        }
      }

      setEntries(allEntries);
      eventEmitter.emit('success', {
        name: 'ACL Fetch',
        message: `Found ${allEntries.length} ACL entries across ${aclConfig.pageCount} page(s).`,
      });
    } catch (e) {
      eventEmitter.emit('error', e);
    } finally {
      setLoading(false);
    }
  }

  const owned = entries?.filter((e) => e.role === ACL_ROLE_OWNER) ?? [];
  const controlled =
    entries?.filter((e) => e.role === ACL_ROLE_CONTROLLER) ?? [];

  return (
    <div className="flex flex-col w-full h-fit p-3 text-sm">
      <div className={inputContainerClass}>
        <span className="text-white text-md">
          ACL Fetcher (ANTs by Address)
        </span>
        <p className="text-grey text-xs">
          Reads the on-chain paginated ACL to list all ANTs owned or controlled
          by an address. Leave blank to use the connected wallet.
        </p>

        <div className="flex flex-row gap-2 items-end mt-2">
          <div className="flex flex-col gap-1 grow">
            <label className="text-white text-md">Solana Address</label>
            <input
              type="text"
              placeholder={
                walletAddress?.toString() || 'Enter a Solana address'
              }
              value={inputAddress}
              onChange={(e) => setInputAddress(e.target.value)}
              style={{
                background: 'var(--card-bg)',
                borderRadius: 'var(--corner-radius)',
                border: '1px solid var(--text-faded)',
                padding: '15px',
                color: 'white',
                fontFamily: 'monospace',
                fontSize: '12px',
              }}
            />
          </div>
          <button
            className="text-grey border-[0.5px] border-dark-grey rounded hover:border-white hover:text-white transition-all h-fit py-3 px-4 text-md font-semibold whitespace-nowrap"
            disabled={loading || !effectiveAddress}
            onClick={fetchAcl}
          >
            {loading ? 'Fetching…' : 'Fetch ACL'}
          </button>
        </div>

        {configInfo && (
          <div className="text-grey text-xs mt-2">
            Pages: {configInfo.pageCount.toString()} · Total entries:{' '}
            {configInfo.totalEntries.toString()}
          </div>
        )}

        {entries !== null && entries.length === 0 && (
          <p className="text-grey text-xs mt-2 italic">
            No ACL entries found for this address.
          </p>
        )}

        {owned.length > 0 && (
          <div className="mt-3">
            <span className="text-white text-xs font-semibold">
              Owned ({owned.length})
            </span>
            <div className="flex flex-col gap-1 mt-1 max-h-48 overflow-y-auto">
              {owned.map((e) => (
                <code
                  key={`owned-${e.asset}`}
                  className="text-xs text-white bg-background rounded px-2 py-1 break-all"
                >
                  {e.asset}
                </code>
              ))}
            </div>
          </div>
        )}

        {controlled.length > 0 && (
          <div className="mt-3">
            <span className="text-white text-xs font-semibold">
              Controlled ({controlled.length})
            </span>
            <div className="flex flex-col gap-1 mt-1 max-h-48 overflow-y-auto">
              {controlled.map((e) => (
                <code
                  key={`ctrl-${e.asset}`}
                  className="text-xs text-white bg-background rounded px-2 py-1 break-all"
                >
                  {e.asset}
                </code>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AclFetcher;
