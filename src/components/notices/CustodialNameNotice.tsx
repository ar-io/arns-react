import { useTurboArNSClient } from '@src/hooks/useTurboArNSClient';
import {
  CustodialANTNotFoundError,
  CustodyTransferUnauthorizedError,
  InvalidTransferTargetError,
} from '@src/services/turbo/TurboArNSClient';
import { useWalletState } from '@src/state';
import { isValidSolanaAddress } from '@src/utils';
import { useState } from 'react';

/**
 * Shown for a name bought with Turbo Credits under the **Model-A custodial**
 * path (Arweave / Ethereum identities). The bundler provisioned and OWNS the
 * ANT on the buyer's behalf, so the buyer controls the name through Turbo but
 * does not yet hold the ANT in their own wallet.
 *
 * The "Claim / Transfer to a wallet" action is the credit-authed self-custody
 * exit (`POST /v1/arns/transfer/:antId?target=<solanaPubkey>`). ANTs are Solana
 * assets, so the exit **target must be a Solana pubkey**. The flow is:
 *   1. the user enters/pastes a Solana pubkey (validated: base58, 32 bytes),
 *   2. an explicit IRREVERSIBLE-action confirmation gates the transfer,
 *   3. the user's credit-identity signer produces an ACTION-BOUND, single-use
 *      signature (built by the SDK — bound to this exact antId+target, so it
 *      can't be replayed elsewhere), and the bundler transfers the ANT and
 *      clears the `user_ant` custody mapping.
 *
 * Threat model (see the PR security note):
 * - **Wrong target** — an incorrect address permanently loses the name, so the
 *   target is validated and a deliberate confirmation is required.
 * - **Replay** — the signed message is action-bound + single-use nonce (SDK),
 *   so a captured signature cannot move a different ANT or to a different owner.
 * - **Not-owner** — the bundler authorizes against custody and returns a
 *   deliberately non-leaky 404 (we surface it without revealing other names).
 */
export function CustodialNameNotice({
  antId,
  name,
  className,
  onClaimed,
}: {
  /** Custodial ANT id, when the settlement receipt reported it. */
  antId?: string;
  /** The ArNS name, shown in the irreversible-action confirmation copy. */
  name?: string;
  className?: string;
  /** Notified with the destination pubkey after a successful transfer. */
  onClaimed?: (target: string) => void;
}): JSX.Element {
  const turbo = useTurboArNSClient();
  const [{ wallet }] = useWalletState();

  const [mode, setMode] = useState<'idle' | 'form' | 'done'>('idle');
  const [target, setTarget] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claimedTo, setClaimedTo] = useState<string | null>(null);

  const trimmedTarget = target.trim();
  const targetIsValid = isValidSolanaAddress(trimmedTarget);
  const displayName = name ? `'${name}'` : 'this name';

  const resetForm = () => {
    setMode('idle');
    setTarget('');
    setConfirmed(false);
    setError(null);
  };

  const handleTransfer = async () => {
    setError(null);

    if (!targetIsValid) {
      setError(
        'Enter a valid Solana wallet address (base58). ANTs are Solana assets, so the destination must be a Solana pubkey.',
      );
      return;
    }
    if (!confirmed) {
      setError('Please confirm you understand this action is permanent.');
      return;
    }
    if (!antId) {
      setError('This name has no known ANT id yet, so it cannot be claimed.');
      return;
    }
    if (!turbo) {
      setError('Wallet is not ready. Please try again in a moment.');
      return;
    }
    if (!wallet) {
      setError('Connect a wallet to claim this name.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await turbo.transferCustodialArNSName({
        antId,
        target: trimmedTarget,
        tokenType: wallet.tokenType,
        // Model A (Arweave / ETH) authenticates with the wallet's turbo signer;
        // a solana identity would use the wallet adapter instead.
        signer: wallet.turboSigner,
        walletAdapter:
          wallet.tokenType === 'solana'
            ? ((typeof window !== 'undefined'
                ? (window as any).solana
                : undefined) ?? (wallet as any).solanaWallet)
            : undefined,
      });
      setClaimedTo(result.target);
      setMode('done');
      onClaimed?.(result.target);
    } catch (e) {
      // Map typed errors to safe, actionable copy. Never echo another owner's
      // name or raw chain internals.
      if (e instanceof InvalidTransferTargetError) {
        setError(e.message);
      } else if (e instanceof CustodialANTNotFoundError) {
        setError(e.message);
      } else if (e instanceof CustodyTransferUnauthorizedError) {
        setError(e.message);
      } else {
        setError(
          e instanceof Error
            ? `The transfer did not complete: ${e.message}`
            : 'The transfer did not complete. Please try again.',
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Success state: the name is now self-custodied. ----
  if (mode === 'done' && claimedTo) {
    return (
      <div
        className={className}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '16px 20px',
          borderRadius: '6px',
          background: 'var(--green-bg, #10231a)',
          border: '1px solid #44AF69',
          color: 'var(--text-white, #fff)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
        data-testid="custodial-name-notice-claimed"
      >
        <span style={{ fontWeight: 600 }}>Name transferred out of custody</span>
        <span style={{ fontSize: '14px', color: 'var(--text-grey, #aaa)' }}>
          {displayName}&apos;s ANT now belongs to the Solana wallet you control:
        </span>
        <code
          style={{
            fontSize: '13px',
            wordBreak: 'break-all',
            color: 'var(--primary, #5c9dff)',
          }}
        >
          {claimedTo}
        </code>
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        padding: '16px 20px',
        borderRadius: '6px',
        background: 'var(--card-bg, #1a1a1a)',
        border: '1px solid var(--primary, #5c9dff)',
        color: 'var(--text-white, #fff)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
      data-testid="custodial-name-notice"
    >
      <span style={{ fontWeight: 600 }}>
        Turbo is holding this name for you
      </span>
      <span style={{ fontSize: '14px', color: 'var(--text-grey, #aaa)' }}>
        You paid with Turbo Credits, so Turbo provisioned and custodies the name
        record (ANT) on your behalf. You control it through your ar.io account.
        You can claim it to a Solana wallet you control at any time.
        {antId ? ` (ANT ${antId})` : ''}
      </span>

      {mode === 'idle' ? (
        <div>
          <button
            type="button"
            className="flex button hover center white"
            disabled={!antId}
            aria-disabled={!antId}
            onClick={() => setMode('form')}
            title={
              antId
                ? 'Transfer this name to a Solana wallet you control.'
                : 'This name has no known ANT id yet.'
            }
            data-testid="custodial-claim-open"
            style={{ gap: '10px', marginTop: '4px' }}
          >
            Claim / Transfer to a wallet
          </button>
        </div>
      ) : (
        <div
          className="flex-column"
          style={{ gap: '10px', marginTop: '4px' }}
          data-testid="custodial-claim-form"
        >
          <label
            htmlFor="custodial-claim-target"
            style={{ fontSize: '13px', color: 'var(--text-grey, #aaa)' }}
          >
            Destination Solana wallet address
          </label>
          <input
            id="custodial-claim-target"
            type="text"
            autoComplete="off"
            spellCheck={false}
            value={target}
            disabled={submitting}
            onChange={(e) => {
              setTarget(e.target.value);
              setError(null);
            }}
            placeholder="Solana pubkey (base58)"
            data-testid="custodial-claim-target"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '10px 12px',
              borderRadius: '4px',
              background: 'var(--bg, #0f0f0f)',
              color: 'var(--text-white, #fff)',
              border: `1px solid ${
                trimmedTarget && !targetIsValid
                  ? 'var(--error, #e8636b)'
                  : 'var(--divider, #333)'
              }`,
            }}
          />
          {trimmedTarget && !targetIsValid ? (
            <span
              style={{ fontSize: '12px', color: 'var(--error, #e8636b)' }}
              data-testid="custodial-claim-invalid-target"
            >
              Not a valid Solana address.
            </span>
          ) : null}

          <div
            style={{
              fontSize: '13px',
              lineHeight: 1.5,
              padding: '10px 12px',
              borderRadius: '4px',
              background: 'var(--warning-bg, #2a1e0a)',
              border: '1px solid var(--warning, #d9a441)',
            }}
          >
            This transfers ownership of {displayName}&apos;s ANT to the address
            above, moving it out of Turbo custody.{' '}
            <strong>
              This is permanent — an incorrect address loses the name.
            </strong>{' '}
            After claiming, you manage this name yourself: record edits will
            need your Solana wallet&apos;s signature and a little SOL for
            network fees (they&apos;re no longer gasless credit-paid).
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={confirmed}
              disabled={submitting}
              onChange={(e) => {
                setConfirmed(e.target.checked);
                setError(null);
              }}
              data-testid="custodial-claim-confirm"
            />
            <span>
              I understand this permanently transfers the name to the address
              above and cannot be undone.
            </span>
          </label>

          {error ? (
            <span
              style={{ fontSize: '13px', color: 'var(--error, #e8636b)' }}
              role="alert"
              data-testid="custodial-claim-error"
            >
              {error}
            </span>
          ) : null}

          <div className="flex flex-row" style={{ gap: '10px' }}>
            <button
              type="button"
              className="flex button hover center white"
              disabled={submitting || !targetIsValid || !confirmed}
              aria-disabled={submitting || !targetIsValid || !confirmed}
              onClick={handleTransfer}
              data-testid="custodial-claim-submit"
              style={{ gap: '10px' }}
            >
              {submitting ? 'Transferring…' : 'Transfer name'}
            </button>
            <button
              type="button"
              className="flex button hover center"
              disabled={submitting}
              onClick={resetForm}
              data-testid="custodial-claim-cancel"
              style={{ gap: '10px' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustodialNameNotice;
