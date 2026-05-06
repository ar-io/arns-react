import { PublicKey } from '@solana/web3.js';
/**
 * Surfpool dev tools — local-only faucet for SOL and ARIO.
 *
 * SOL airdrop uses the standard Solana JSON-RPC `requestAirdrop` method,
 * which Surfpool implements just like a stock test validator.
 *
 * ARIO airdrop bypasses the on-chain transfer flow (would need the protocol
 * mint-authority keypair, which lives on disk during devnet setup). Instead
 * we use Surfpool's `surfnet_setAccount` cheatcode to forge the user's ARIO
 * SPL associated-token-account directly. That ATA is the canonical liquid
 * balance — every steady-state instruction (`buy_name`, gateway/delegate
 * stake, ARIO transfers) reads/writes via SPL CPIs against it, and so does
 * `SolanaARIOReadable.getBalance`. The `ario-core::Balance` PDA is only
 * populated by the AO→Solana migration importer for legacy snapshot state
 * and is irrelevant to live wallet balances on localnet.
 *
 * This panel only renders when `VITE_SOLANA_NETWORK=localnet` so it can't
 * accidentally ship to devnet/mainnet builds.
 */
import { useWalletState } from '@src/state';
import eventEmitter from '@src/utils/events';
import {
  ARIO_MINT_ADDRESS,
  IS_LOCALNET,
  SOLANA_RPC_URL,
} from '@src/utils/solana';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

const TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
);
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);

const LAMPORTS_PER_SOL = 1_000_000_000n;
const ARIO_DECIMALS = 6;

/**
 * Lamports needed for SPL token account rent exemption (165 bytes).
 * Hardcoded to avoid an extra RPC roundtrip; the standard validator
 * minimum is 2_039_280 lamports as of Solana 2.x.
 */
const SPL_TOKEN_ACCOUNT_RENT = 2_039_280;

/**
 * Write a little-endian u64 into `buf` at `offset`. We can't rely on
 * `Buffer.writeBigUInt64LE` because the bundled browser polyfill (vite's
 * `buffer` package) is missing the BigInt-aware writers. Manual byte
 * shuffling is portable across every shim and identical on the wire.
 */
function writeBigUInt64LE(buf: Uint8Array, value: bigint, offset: number) {
  let v = value;
  for (let i = 0; i < 8; i++) {
    buf[offset + i] = Number(v & 0xffn);
    v >>= 8n;
  }
}

/** Mirrors `spl_token::state::Account` on-chain layout (165 bytes). */
function encodeSplTokenAccount(params: {
  mint: PublicKey;
  owner: PublicKey;
  amount: bigint;
}): Buffer {
  const buf = Buffer.alloc(165);
  let offset = 0;
  params.mint.toBuffer().copy(buf, offset);
  offset += 32;
  params.owner.toBuffer().copy(buf, offset);
  offset += 32;
  writeBigUInt64LE(buf, params.amount, offset);
  offset += 8;
  // delegate: COption<Pubkey> = None
  buf.writeUInt32LE(0, offset);
  offset += 4 + 32;
  // state: AccountState::Initialized = 1
  buf.writeUInt8(1, offset);
  offset += 1;
  // isNative: COption<u64> = None
  buf.writeUInt32LE(0, offset);
  offset += 4 + 8;
  // delegated_amount = 0
  writeBigUInt64LE(buf, 0n, offset);
  offset += 8;
  // close_authority: COption<Pubkey> = None
  buf.writeUInt32LE(0, offset);
  offset += 4 + 32;
  return buf;
}

/** Derive the associated token account for (owner, mint). */
function getAta(owner: PublicKey, mint: PublicKey): PublicKey {
  const [ata] = PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  return ata;
}

async function rpcCall<T = unknown>(
  method: string,
  params: unknown[],
): Promise<T> {
  const res = await fetch(SOLANA_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  if (!res.ok) {
    throw new Error(`RPC ${method} HTTP ${res.status}: ${await res.text()}`);
  }
  const body = (await res.json()) as {
    result?: T;
    error?: { code: number; message: string };
  };
  if (body.error) {
    throw new Error(`RPC ${method} ${body.error.code}: ${body.error.message}`);
  }
  return body.result as T;
}

function SurfpoolTools() {
  const [{ wallet, walletAddress }] = useWalletState();
  const queryClient = useQueryClient();
  const [solAmount, setSolAmount] = useState(10);
  const [arioAmount, setArioAmount] = useState(1000);
  const [busy, setBusy] = useState<'sol' | 'ario' | null>(null);

  // Hide the entire panel off-localnet so it can't ship to prod.
  if (!IS_LOCALNET) return null;

  const isSolanaWallet = wallet?.tokenType === 'solana';
  const ownerAddress =
    isSolanaWallet && walletAddress ? walletAddress.toString() : undefined;

  async function airdropSol() {
    if (!ownerAddress) {
      eventEmitter.emit(
        'error',
        new Error('Connect a Solana wallet first to airdrop SOL.'),
      );
      return;
    }
    setBusy('sol');
    try {
      const lamports = Number(BigInt(Math.round(solAmount)) * LAMPORTS_PER_SOL);
      const sig = await rpcCall<string>('requestAirdrop', [
        ownerAddress,
        lamports,
      ]);
      eventEmitter.emit('success', {
        name: 'SOL Airdrop',
        message: `Requested ${solAmount} SOL → ${ownerAddress.slice(0, 6)}…${ownerAddress.slice(-4)} (sig ${sig.slice(0, 8)}…)`,
      });
    } catch (e) {
      eventEmitter.emit('error', e);
    } finally {
      setBusy(null);
    }
  }

  async function airdropArio() {
    if (!ownerAddress) {
      eventEmitter.emit(
        'error',
        new Error('Connect a Solana wallet first to airdrop ARIO.'),
      );
      return;
    }
    if (!ARIO_MINT_ADDRESS) {
      eventEmitter.emit(
        'error',
        new Error(
          'VITE_ARIO_MINT_ADDRESS is not set; cannot derive the ARIO ATA.',
        ),
      );
      return;
    }
    setBusy('ario');
    try {
      const owner = new PublicKey(ownerAddress);
      const mint = new PublicKey(ARIO_MINT_ADDRESS);
      const ata = getAta(owner, mint);

      // Convert UI amount (whole ARIO) → mARIO (u64, 6 decimals).
      const mARIO =
        BigInt(Math.round(arioAmount)) * BigInt(10 ** ARIO_DECIMALS);

      const splData = encodeSplTokenAccount({ mint, owner, amount: mARIO });

      // Forge the SPL ATA. That's the canonical liquid balance —
      // `SolanaARIOReadable.getBalance` and every steady-state instruction
      // (buy_name, transfer, stake, …) read/write it directly, so this
      // single forge is sufficient. We deliberately do NOT touch the
      // `ario-core::Balance` PDA: that ledger is migration-only and gets
      // separately drained into the ATA at claim time.
      await rpcCall<null>('surfnet_setAccount', [
        ata.toBase58(),
        {
          lamports: SPL_TOKEN_ACCOUNT_RENT,
          owner: TOKEN_PROGRAM_ID.toBase58(),
          executable: false,
          rentEpoch: 0,
          data: splData.toString('hex'),
        },
      ]);

      // Bust react-query caches so the UI shows the new balance without
      // a hard refresh. We deliberately do NOT await the refetches: on a
      // localnet snapshot with a few thousand domains, refetching every
      // active subscription synchronously can overwhelm Surfpool and
      // wedge the airdrop handler in `Promise.all` for 30s+, leaving the
      // button stuck in `Airdropping…` (the actual on-chain forge has
      // already succeeded by this point).
      queryClient.invalidateQueries({
        queryKey: ['ario-liquid-balance'],
        refetchType: 'none',
      });
      queryClient.invalidateQueries({
        queryKey: ['io-balance'],
        refetchType: 'none',
      });

      eventEmitter.emit('success', {
        name: 'ARIO Airdrop',
        message: `Set ${arioAmount.toLocaleString()} ARIO on ATA ${ata.toBase58().slice(0, 4)}…${ata.toBase58().slice(-4)}`,
      });
    } catch (e) {
      eventEmitter.emit('error', e);
    } finally {
      setBusy(null);
    }
  }

  const inputContainerClass =
    'flex flex-col gap-2 border border-primary-thin p-2 rounded-md bg-metallic-grey';

  return (
    <div className="flex flex-col w-full h-fit p-3 text-sm">
      <div className={inputContainerClass}>
        <span className="text-white text-md">Surfpool Faucet (localnet)</span>
        <p className="text-grey text-xs">
          Connected RPC: <code>{SOLANA_RPC_URL}</code>
          {' · '}
          Recipient:{' '}
          {ownerAddress ? (
            <code>{ownerAddress}</code>
          ) : (
            <em className="text-color-error">no Solana wallet connected</em>
          )}
        </p>

        <div className="flex flex-row gap-2 items-end mt-2">
          <div className="flex flex-col gap-1 grow">
            <label className="text-white text-md">SOL amount</label>
            <input
              type="number"
              min={0}
              step={1}
              value={solAmount}
              onChange={(e) =>
                setSolAmount(Math.max(0, Number(e.target.value) || 0))
              }
              style={{
                background: 'var(--card-bg)',
                borderRadius: 'var(--corner-radius)',
                border: '1px solid var(--text-faded)',
                padding: '15px',
                color: 'white',
              }}
            />
          </div>
          <button
            data-testid="dev-surfpool-airdrop-sol-button"
            className="text-grey border-[0.5px] border-dark-grey rounded hover:border-white hover:text-white transition-all h-fit py-3 px-4 text-md font-semibold whitespace-nowrap"
            disabled={!ownerAddress || busy !== null || solAmount <= 0}
            onClick={airdropSol}
          >
            {busy === 'sol' ? 'Airdropping…' : 'Airdrop SOL'}
          </button>
        </div>

        <div className="flex flex-row gap-2 items-end mt-2">
          <div className="flex flex-col gap-1 grow">
            <label className="text-white text-md">ARIO amount</label>
            <input
              type="number"
              min={0}
              step={1}
              value={arioAmount}
              onChange={(e) =>
                setArioAmount(Math.max(0, Number(e.target.value) || 0))
              }
              style={{
                background: 'var(--card-bg)',
                borderRadius: 'var(--corner-radius)',
                border: '1px solid var(--text-faded)',
                padding: '15px',
                color: 'white',
              }}
            />
          </div>
          <button
            data-testid="dev-surfpool-airdrop-ario-button"
            className="text-grey border-[0.5px] border-dark-grey rounded hover:border-white hover:text-white transition-all h-fit py-3 px-4 text-md font-semibold whitespace-nowrap"
            disabled={
              !ownerAddress ||
              busy !== null ||
              arioAmount <= 0 ||
              !ARIO_MINT_ADDRESS
            }
            onClick={airdropArio}
            title={
              !ARIO_MINT_ADDRESS
                ? 'Set VITE_ARIO_MINT_ADDRESS in .env.local'
                : undefined
            }
          >
            {busy === 'ario' ? 'Airdropping…' : 'Airdrop ARIO'}
          </button>
        </div>
        <p className="text-grey text-xs">
          ARIO airdrop forges the user&apos;s SPL associated-token-account via{' '}
          <code>surfnet_setAccount</code>. That&apos;s the canonical liquid
          ledger on Solana, so wallet balance and protocol balance stay in sync
          automatically.
        </p>
      </div>
    </div>
  );
}

export default SurfpoolTools;
