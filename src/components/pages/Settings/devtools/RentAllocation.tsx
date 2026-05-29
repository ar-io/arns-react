import {
  ARIO_ANT_PROGRAM_ID,
  deserializeAclConfig,
  deserializeAclPage,
  getAclConfigPDA,
  getAclPagePDA,
  getAntConfigPDA,
  getAntControllersPDA,
} from '@ar.io/sdk/web';
import { type Address, address } from '@solana/kit';
import { useWalletState } from '@src/state';
import eventEmitter from '@src/utils/events';
import { getActiveSolanaConfig, getSolanaRpc } from '@src/utils/solana';
import { useState } from 'react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import {
  getAccountInfoLegacy,
  getMultipleAccountsInfoLegacy,
} from './rpcHelpers';

const LAMPORTS_PER_SOL = 1_000_000_000;

type RentEntry = {
  name: string;
  address: string;
  lamports: number;
};

const COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
  '#0088fe',
  '#00c49f',
  '#ffbb28',
  '#ff8042',
  '#a4de6c',
  '#d0ed57',
];

const inputContainerClass =
  'flex flex-col gap-2 border border-primary-thin p-2 rounded-md bg-metallic-grey';

function RentAllocation() {
  const [{ walletAddress }] = useWalletState();
  const [inputAddress, setInputAddress] = useState<string>('');
  const [rentData, setRentData] = useState<RentEntry[] | null>(null);
  const [loading, setLoading] = useState(false);

  const effectiveAddress =
    inputAddress.trim() || walletAddress?.toString() || '';

  async function fetchRentAllocation() {
    if (!effectiveAddress) {
      eventEmitter.emit(
        'error',
        new Error('Enter an address or connect a wallet.'),
      );
      return;
    }

    setLoading(true);
    setRentData(null);

    try {
      const rpc = getSolanaRpc();
      const config = getActiveSolanaConfig();
      const antProgramId = (config.programIds.antProgramId ??
        ARIO_ANT_PROGRAM_ID) as Address;

      const userAddr = address(effectiveAddress);
      const entries: RentEntry[] = [];

      // 1. Fetch ACL config + pages to see the user's rent footprint
      const [configPda] = await getAclConfigPDA(userAddr, antProgramId);
      const configAccount = await getAccountInfoLegacy(rpc, configPda);

      if (configAccount) {
        entries.push({
          name: 'AclConfig',
          address: configPda,
          lamports: configAccount.lamports,
        });

        const aclConfig = deserializeAclConfig(configAccount.data);

        if (aclConfig.pageCount > 0n) {
          const pageAddrs: Address[] = [];
          for (let i = 0n; i < aclConfig.pageCount; i++) {
            const [pagePda] = await getAclPagePDA(userAddr, i, antProgramId);
            pageAddrs.push(pagePda);
          }

          const pageAccounts = await getMultipleAccountsInfoLegacy(
            rpc,
            pageAddrs,
          );

          for (let i = 0; i < pageAccounts.length; i++) {
            const acct = pageAccounts[i];
            if (!acct) continue;
            entries.push({
              name: `AclPage[${i}]`,
              address: pageAddrs[i],
              lamports: acct.lamports,
            });

            // For each owned ANT in this page, fetch its config/controllers rent
            const page = deserializeAclPage(acct.data);
            const antMints = page.entries.map((e) => e.asset as Address);

            // Batch-fetch ANT config PDAs
            const antConfigPdas: Address[] = [];
            const antControllerPdas: Address[] = [];
            for (const mint of antMints) {
              const [cfgPda] = await getAntConfigPDA(mint, antProgramId);
              const [ctrlPda] = await getAntControllersPDA(mint, antProgramId);
              antConfigPdas.push(cfgPda);
              antControllerPdas.push(ctrlPda);
            }

            const configAccounts = await getMultipleAccountsInfoLegacy(
              rpc,
              antConfigPdas,
            );
            const ctrlAccounts = await getMultipleAccountsInfoLegacy(
              rpc,
              antControllerPdas,
            );

            for (let j = 0; j < antMints.length; j++) {
              const cfgAcct = configAccounts[j];
              if (cfgAcct) {
                entries.push({
                  name: `AntConfig(${antMints[j].slice(0, 6)}…)`,
                  address: antConfigPdas[j],
                  lamports: cfgAcct.lamports,
                });
              }
              const ctrlAcct = ctrlAccounts[j];
              if (ctrlAcct) {
                entries.push({
                  name: `AntControllers(${antMints[j].slice(0, 6)}…)`,
                  address: antControllerPdas[j],
                  lamports: ctrlAcct.lamports,
                });
              }
            }
          }
        }
      }

      setRentData(entries);

      const totalLamports = entries.reduce((sum, e) => sum + e.lamports, 0);
      eventEmitter.emit('success', {
        name: 'Rent Scan',
        message: `Found ${entries.length} PDAs totalling ${(totalLamports / LAMPORTS_PER_SOL).toFixed(6)} SOL in rent.`,
      });
    } catch (e) {
      eventEmitter.emit('error', e);
    } finally {
      setLoading(false);
    }
  }

  const totalLamports = rentData?.reduce((sum, e) => sum + e.lamports, 0) ?? 0;

  // Group by PDA type for the pie chart
  const grouped = rentData
    ? Object.entries(
        rentData.reduce(
          (acc, entry) => {
            const type = entry.name
              .replace(/\(.*\)/, '')
              .replace(/\[\d+\]/, '');
            acc[type] = (acc[type] || 0) + entry.lamports;
            return acc;
          },
          {} as Record<string, number>,
        ),
      ).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="flex flex-col w-full h-fit p-3 text-sm">
      <div className={inputContainerClass}>
        <span className="text-white text-md">Rent Allocation</span>
        <p className="text-grey text-xs">
          Scans all AR.IO program PDAs associated with an address and shows SOL
          rent distribution. Useful for identifying reclaimable rent in
          closed/unused accounts.
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
            onClick={fetchRentAllocation}
          >
            {loading ? 'Scanning…' : 'Scan Rent'}
          </button>
        </div>

        {rentData !== null && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-xs font-semibold">
                Total Rent: {(totalLamports / LAMPORTS_PER_SOL).toFixed(6)} SOL
              </span>
              <span className="text-grey text-xs">
                {rentData.length} PDA(s)
              </span>
            </div>

            {grouped.length > 0 && (
              <div className="w-full h-48 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={grouped}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      label={({ name, percent, x, y, textAnchor }) => (
                        <text
                          x={x}
                          y={y}
                          textAnchor={textAnchor}
                          fill="white"
                          fontSize={10}
                        >
                          {`${name} (${(percent * 100).toFixed(0)}%)`}
                        </text>
                      )}
                      labelLine={false}
                    >
                      {grouped.map((_, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={COLORS[idx % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) =>
                        `${(value / LAMPORTS_PER_SOL).toFixed(6)} SOL`
                      }
                      contentStyle={{
                        background: '#1a1a2e',
                        border: '1px solid #333',
                        borderRadius: '4px',
                      }}
                      labelStyle={{ color: 'white' }}
                      itemStyle={{ color: '#ccc' }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '10px', color: 'white' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
              {rentData.map((entry) => (
                <div
                  key={entry.address}
                  className="flex items-center justify-between bg-background rounded px-2 py-1"
                >
                  <div className="flex flex-col">
                    <span className="text-white text-xs font-semibold">
                      {entry.name}
                    </span>
                    <code className="text-grey text-[10px] break-all">
                      {entry.address}
                    </code>
                  </div>
                  <span className="text-white text-xs whitespace-nowrap ml-2">
                    {(entry.lamports / LAMPORTS_PER_SOL).toFixed(6)} SOL
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RentAllocation;
