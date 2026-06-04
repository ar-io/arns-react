/**
 * Dev-only "Sign in with private key" panel.
 *
 * Lets a developer paste a Solana private key (either Phantom-style base58
 * or Solana CLI JSON-array format) and use it as the active wallet — bypassing
 * the wallet-adapter modal entirely. Useful for:
 *  - Driving localnet flows from a known funded keypair without unlocking
 *    Phantom every reload.
 *  - Reproducing migration / claim scenarios as a specific Arweave-derived
 *    Solana address.
 *  - Running headless / scripted tests through the same React tree real
 *    users hit.
 *
 * The keypair lives in memory only — we never write it to localStorage.
 * Reload = re-paste. The panel renders only when `VITE_SOLANA_NETWORK=localnet`
 * so it can't ship to devnet/mainnet builds.
 */
import { createKeyPairSignerFromBytes } from '@solana/kit';
import { PrivateKeySolanaWalletConnector } from '@src/services/wallets/PrivateKeySolanaWalletConnector';
import { useWalletState } from '@src/state';
import eventEmitter from '@src/utils/events';
import { IS_LOCALNET } from '@src/utils/solana';
import bs58 from 'bs58';
import { useState } from 'react';

/**
 * Decode a user-supplied private key into the 64-byte Ed25519 secret-key
 * format that `createKeyPairSignerFromBytes` consumes. Accepts:
 *  - Solana CLI JSON: `[12, 34, ...]` (length 64 or 32 bytes).
 *  - Phantom-style base58: a single base58 string of the 64-byte secret key.
 *  - Hex: `0x…` or bare hex string of length 128 (64 bytes) or 64 (32 bytes).
 *
 * 32-byte inputs are treated as the seed half of an expanded Ed25519 key —
 * `createKeyPairSignerFromBytes` requires a full 64-byte secret, so we reject
 * those with a hint instead of silently re-deriving (which would change the
 * resulting address vs. what the user expects).
 */
function decodePrivateKey(input: string): Uint8Array {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error('Private key is empty.');
  }

  // JSON array form (Solana CLI default).
  if (trimmed.startsWith('[')) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      throw new Error(
        'Looks like a JSON array but failed to parse — check for stray commas / brackets.',
      );
    }
    if (!Array.isArray(parsed) || !parsed.every((n) => typeof n === 'number')) {
      throw new Error('JSON private key must be an array of numbers.');
    }
    const bytes = new Uint8Array(parsed as number[]);
    return validateLength(bytes);
  }

  // Hex form.
  const hexCandidate = trimmed.startsWith('0x') ? trimmed.slice(2) : trimmed;
  if (/^[0-9a-fA-F]+$/.test(hexCandidate) && hexCandidate.length % 2 === 0) {
    // Don't auto-detect hex if it's also a valid base58 string (it almost
    // never is at length 128 since base58 omits 0OIl, but be safe). Only
    // treat as hex when the explicit `0x` prefix is present OR length is
    // 128 (64 bytes — unambiguous secret key length, base58 of 64 bytes is
    // 87-88 chars).
    const isUnambiguousHex =
      trimmed.startsWith('0x') ||
      hexCandidate.length === 128 ||
      hexCandidate.length === 64;
    if (isUnambiguousHex) {
      const bytes = new Uint8Array(hexCandidate.length / 2);
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hexCandidate.slice(i * 2, i * 2 + 2), 16);
      }
      return validateLength(bytes);
    }
  }

  // Base58 form (Phantom export).
  let decoded: Uint8Array;
  try {
    decoded = bs58.decode(trimmed);
  } catch {
    throw new Error(
      'Private key is not valid base58, JSON, or hex. Paste a Phantom-style base58 secret key or a Solana CLI JSON array.',
    );
  }
  return validateLength(decoded);
}

function validateLength(bytes: Uint8Array): Uint8Array {
  if (bytes.length === 64) return bytes;
  if (bytes.length === 32) {
    throw new Error(
      '32-byte seed detected. This panel needs a full 64-byte Ed25519 secret key (Solana CLI keypair file or Phantom export). ' +
        'Run `solana-keygen recover` or re-export from Phantom to get the full secret.',
    );
  }
  throw new Error(
    `Expected a 64-byte Solana secret key, got ${bytes.length} bytes.`,
  );
}

function PrivateKeyLogin() {
  const [, dispatchWalletState] = useWalletState();
  const [keyInput, setKeyInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [previewAddress, setPreviewAddress] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  if (!IS_LOCALNET) return null;

  // Live address preview as the user types — gives instant feedback that the
  // key parses correctly without committing it to global state.
  async function refreshPreview(value: string) {
    setKeyInput(value);
    if (!value.trim()) {
      setPreviewAddress(null);
      setPreviewError(null);
      return;
    }
    try {
      const bytes = decodePrivateKey(value);
      const signer = await createKeyPairSignerFromBytes(bytes);
      setPreviewAddress(signer.address.toString());
      setPreviewError(null);
    } catch (e) {
      setPreviewAddress(null);
      setPreviewError(e instanceof Error ? e.message : String(e));
    }
  }

  async function signIn() {
    setBusy(true);
    try {
      const bytes = decodePrivateKey(keyInput);
      const signer = await createKeyPairSignerFromBytes(bytes);
      const connector = new PrivateKeySolanaWalletConnector(signer);
      await connector.connect();
      dispatchWalletState({
        type: 'setWalletAndAddress',
        payload: {
          wallet: connector,
          walletAddress: signer.address.toString() as never,
        },
      });
      eventEmitter.emit('success', {
        name: 'Private-key sign-in',
        message: `Logged in as ${signer.address.toString().slice(0, 6)}…${signer.address
          .toString()
          .slice(-4)} (in-memory keypair, not persisted across reloads).`,
      });
      // Wipe the textarea immediately after sign-in so the secret doesn't
      // linger in the DOM / React devtools.
      setKeyInput('');
      setPreviewAddress(null);
    } catch (e) {
      eventEmitter.emit('error', e);
    } finally {
      setBusy(false);
    }
  }

  const inputContainerClass =
    'flex flex-col gap-2 border border-primary-thin p-2 rounded-md bg-metallic-grey';

  return (
    <div className="flex flex-col w-full h-fit p-3 text-sm">
      <div className={inputContainerClass}>
        <span className="text-white text-md">
          Sign in with private key (localnet)
        </span>
        <p className="text-grey text-xs">
          Paste a Solana private key — Phantom-style base58, Solana CLI JSON
          array (<code>[12, 34, …]</code>), or 64-byte hex. The key is held in
          memory only and is wiped from the textarea after sign-in.
          <strong className="text-color-error">
            {' '}
            Never paste a mainnet key.
          </strong>
        </p>

        <textarea
          data-testid="dev-private-key-input"
          value={keyInput}
          onChange={(e) => refreshPreview(e.target.value)}
          rows={4}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          placeholder="[12,34,...] or 5J… (base58) or 0x… (hex)"
          style={{
            background: 'var(--card-bg)',
            borderRadius: 'var(--corner-radius)',
            border: '1px solid var(--text-faded)',
            padding: '15px',
            color: 'white',
            fontFamily: 'monospace',
            fontSize: '12px',
            resize: 'vertical',
          }}
        />

        {previewAddress && (
          <p className="text-grey text-xs">
            Resolves to <code>{previewAddress}</code>
          </p>
        )}
        {previewError && keyInput.trim() !== '' && (
          <p className="text-color-error text-xs">{previewError}</p>
        )}

        <div className="flex flex-row gap-2 items-center justify-end mt-1">
          <button
            data-testid="dev-private-key-signin-button"
            className="text-grey border-[0.5px] border-dark-grey rounded hover:border-white hover:text-white transition-all h-fit py-3 px-4 text-md font-semibold whitespace-nowrap disabled:opacity-50"
            disabled={busy || !previewAddress}
            onClick={signIn}
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PrivateKeyLogin;
