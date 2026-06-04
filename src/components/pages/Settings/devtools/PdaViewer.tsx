import {
  ARIO_ANT_PROGRAM_ID,
  ARIO_ARNS_PROGRAM_ID,
  deserializeAntConfig,
  deserializeAntControllers,
  deserializeAntRecord,
  deserializeArnsRecord,
  getAntConfigPDA,
  getAntControllersPDA,
  getAntRecordPDA,
  getArnsRecordPDA,
} from '@ar.io/sdk/web';
import { type Address, address } from '@solana/kit';
import eventEmitter from '@src/utils/events';
import { getActiveSolanaConfig, getSolanaRpc } from '@src/utils/solana';
import { useState } from 'react';

import { getAccountInfoLegacy } from './rpcHelpers';

type PdaResult = {
  label: string;
  address: string;
  raw: string;
  decoded: object | null;
  lamports: number;
  dataSize: number;
};

const inputContainerClass =
  'flex flex-col gap-2 border border-primary-thin p-2 rounded-md bg-metallic-grey';

function PdaViewer() {
  const [nameInput, setNameInput] = useState('');
  const [antMintInput, setAntMintInput] = useState('');
  const [undernameInput, setUndernameInput] = useState('@');
  const [results, setResults] = useState<PdaResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  async function fetchArnsRecord() {
    const name = nameInput.trim();
    if (!name) {
      eventEmitter.emit('error', new Error('Enter an ArNS name.'));
      return;
    }

    setLoading(true);
    try {
      const rpc = getSolanaRpc();
      const config = getActiveSolanaConfig();
      const arnsProgramId = (config.programIds.arnsProgramId ??
        ARIO_ARNS_PROGRAM_ID) as Address;

      const [pda] = await getArnsRecordPDA(name, arnsProgramId);
      const acct = await getAccountInfoLegacy(rpc, pda);

      if (!acct) {
        setResults((prev) => [
          ...prev,
          {
            label: `ArNS Record: "${name}"`,
            address: pda,
            raw: '(account not found)',
            decoded: null,
            lamports: 0,
            dataSize: 0,
          },
        ]);
        return;
      }

      const decoded = deserializeArnsRecord(acct.data);
      setResults((prev) => [
        ...prev,
        {
          label: `ArNS Record: "${name}"`,
          address: pda,
          raw: acct.data.toString('hex'),
          decoded,
          lamports: acct.lamports,
          dataSize: acct.data.length,
        },
      ]);

      eventEmitter.emit('success', {
        name: 'PDA Fetch',
        message: `Loaded ArNS record for "${name}".`,
      });
    } catch (e) {
      eventEmitter.emit('error', e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAntRecords() {
    const mint = antMintInput.trim();
    if (!mint) {
      eventEmitter.emit('error', new Error('Enter an ANT mint address.'));
      return;
    }

    setLoading(true);
    try {
      const rpc = getSolanaRpc();
      const config = getActiveSolanaConfig();
      const antProgramId = (config.programIds.antProgramId ??
        ARIO_ANT_PROGRAM_ID) as Address;
      const mintAddr = address(mint);

      const newResults: PdaResult[] = [];

      // ANT Config
      const [configPda] = await getAntConfigPDA(mintAddr, antProgramId);
      const configAcct = await getAccountInfoLegacy(rpc, configPda);
      if (configAcct) {
        const decoded = deserializeAntConfig(configAcct.data);
        newResults.push({
          label: `AntConfig (${mint.slice(0, 8)}…)`,
          address: configPda,
          raw: configAcct.data.toString('hex'),
          decoded,
          lamports: configAcct.lamports,
          dataSize: configAcct.data.length,
        });
      } else {
        newResults.push({
          label: `AntConfig (${mint.slice(0, 8)}…)`,
          address: configPda,
          raw: '(not found)',
          decoded: null,
          lamports: 0,
          dataSize: 0,
        });
      }

      // ANT Controllers
      const [ctrlPda] = await getAntControllersPDA(mintAddr, antProgramId);
      const ctrlAcct = await getAccountInfoLegacy(rpc, ctrlPda);
      if (ctrlAcct) {
        const decoded = deserializeAntControllers(ctrlAcct.data);
        newResults.push({
          label: `AntControllers (${mint.slice(0, 8)}…)`,
          address: ctrlPda,
          raw: ctrlAcct.data.toString('hex'),
          decoded,
          lamports: ctrlAcct.lamports,
          dataSize: ctrlAcct.data.length,
        });
      } else {
        newResults.push({
          label: `AntControllers (${mint.slice(0, 8)}…)`,
          address: ctrlPda,
          raw: '(not found)',
          decoded: null,
          lamports: 0,
          dataSize: 0,
        });
      }

      // ANT Record (undername)
      const undername = undernameInput.trim() || '@';
      const [recordPda] = await getAntRecordPDA(
        mintAddr,
        undername,
        antProgramId,
      );
      const recordAcct = await getAccountInfoLegacy(rpc, recordPda);
      if (recordAcct) {
        const decoded = deserializeAntRecord(recordAcct.data);
        newResults.push({
          label: `AntRecord "${undername}" (${mint.slice(0, 8)}…)`,
          address: recordPda,
          raw: recordAcct.data.toString('hex'),
          decoded,
          lamports: recordAcct.lamports,
          dataSize: recordAcct.data.length,
        });
      } else {
        newResults.push({
          label: `AntRecord "${undername}" (${mint.slice(0, 8)}…)`,
          address: recordPda,
          raw: '(not found)',
          decoded: null,
          lamports: 0,
          dataSize: 0,
        });
      }

      setResults((prev) => [...prev, ...newResults]);
      eventEmitter.emit('success', {
        name: 'PDA Fetch',
        message: `Loaded ${newResults.length} ANT PDAs for mint ${mint.slice(0, 8)}….`,
      });
    } catch (e) {
      eventEmitter.emit('error', e);
    } finally {
      setLoading(false);
    }
  }

  function clearResults() {
    setResults([]);
    setExpandedIdx(null);
  }

  return (
    <div className="flex flex-col w-full h-fit p-3 text-sm">
      <div className={inputContainerClass}>
        <div className="flex items-center justify-between">
          <span className="text-white text-md">Raw PDA Viewer</span>
          {results.length > 0 && (
            <button
              onClick={clearResults}
              className="text-grey border-[0.5px] border-dark-grey rounded hover:border-white hover:text-white transition-all px-2 py-1 text-xs"
            >
              Clear
            </button>
          )}
        </div>
        <p className="text-grey text-xs">
          Fetch and inspect raw on-chain PDA data for ArNS records and ANT
          accounts. Shows both decoded JSON and raw hex.
        </p>

        {/* ArNS Record lookup */}
        <div className="flex flex-col gap-2 mt-3 p-2 border border-dark-grey rounded">
          <span className="text-white text-xs font-semibold">
            ArNS Record (by name)
          </span>
          <div className="flex flex-row gap-2 items-end">
            <div className="flex flex-col gap-1 grow">
              <input
                type="text"
                placeholder="e.g. ardrive"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                style={{
                  background: 'var(--card-bg)',
                  borderRadius: 'var(--corner-radius)',
                  border: '1px solid var(--text-faded)',
                  padding: '10px',
                  color: 'white',
                  fontSize: '12px',
                }}
              />
            </div>
            <button
              className="text-grey border-[0.5px] border-dark-grey rounded hover:border-white hover:text-white transition-all h-fit py-2 px-3 text-xs font-semibold whitespace-nowrap"
              disabled={loading || !nameInput.trim()}
              onClick={fetchArnsRecord}
            >
              Fetch
            </button>
          </div>
        </div>

        {/* ANT Record lookup */}
        <div className="flex flex-col gap-2 mt-3 p-2 border border-dark-grey rounded">
          <span className="text-white text-xs font-semibold">
            ANT PDAs (by mint)
          </span>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="ANT mint address"
              value={antMintInput}
              onChange={(e) => setAntMintInput(e.target.value)}
              style={{
                background: 'var(--card-bg)',
                borderRadius: 'var(--corner-radius)',
                border: '1px solid var(--text-faded)',
                padding: '10px',
                color: 'white',
                fontFamily: 'monospace',
                fontSize: '12px',
              }}
            />
            <div className="flex flex-row gap-2 items-end">
              <div className="flex flex-col gap-1 grow">
                <label className="text-grey text-[10px]">
                  Undername (default: @)
                </label>
                <input
                  type="text"
                  placeholder="@"
                  value={undernameInput}
                  onChange={(e) => setUndernameInput(e.target.value)}
                  style={{
                    background: 'var(--card-bg)',
                    borderRadius: 'var(--corner-radius)',
                    border: '1px solid var(--text-faded)',
                    padding: '10px',
                    color: 'white',
                    fontSize: '12px',
                  }}
                />
              </div>
              <button
                className="text-grey border-[0.5px] border-dark-grey rounded hover:border-white hover:text-white transition-all h-fit py-2 px-3 text-xs font-semibold whitespace-nowrap"
                disabled={loading || !antMintInput.trim()}
                onClick={fetchAntRecords}
              >
                Fetch
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="flex flex-col gap-2 mt-4 max-h-96 overflow-y-auto">
            {results.map((result, idx) => (
              <div
                key={`${result.address}-${idx}`}
                className="bg-background rounded p-2"
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() =>
                    setExpandedIdx(expandedIdx === idx ? null : idx)
                  }
                >
                  <div className="flex flex-col">
                    <span className="text-white text-xs font-semibold">
                      {result.label}
                    </span>
                    <code className="text-grey text-[10px] break-all">
                      {result.address}
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.lamports > 0 && (
                      <span className="text-grey text-[10px]">
                        {result.dataSize}B ·{' '}
                        {(result.lamports / 1_000_000_000).toFixed(6)} SOL
                      </span>
                    )}
                    <span className="text-grey text-xs">
                      {expandedIdx === idx ? '▼' : '▶'}
                    </span>
                  </div>
                </div>

                {expandedIdx === idx && (
                  <div className="mt-2 flex flex-col gap-2">
                    {result.decoded && (
                      <div>
                        <span className="text-white text-[10px] font-semibold">
                          Decoded:
                        </span>
                        <pre className="text-white bg-[#0d1117] rounded p-2 overflow-auto text-[10px] mt-1 max-h-48">
                          {JSON.stringify(
                            result.decoded,
                            (_, v) =>
                              typeof v === 'bigint' ? v.toString() : v,
                            2,
                          )}
                        </pre>
                      </div>
                    )}
                    <div>
                      <span className="text-white text-[10px] font-semibold">
                        Raw hex:
                      </span>
                      <pre className="text-white bg-[#0d1117] rounded p-2 overflow-auto text-[10px] mt-1 max-h-32 break-all whitespace-pre-wrap">
                        {result.raw}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PdaViewer;
