import { useState } from 'react';

/**
 * Shown for a name bought with Turbo Credits under the **Model-A custodial**
 * path (Arweave / Ethereum identities). The bundler provisioned and OWNS the
 * ANT on the buyer's behalf, so the buyer controls the name through Turbo but
 * does not yet hold the ANT in their own wallet.
 *
 * The "Claim / transfer out" action is the credit-authed exit
 * (`POST /v1/arns/transfer/:antId`). It is a STUB in this PR — the endpoint +
 * signed-request wiring land with the claim/exit work. The seam is here so the
 * UX is honest today and the button can be enabled without a layout change.
 */
export function CustodialNameNotice({
  antId,
  className,
}: {
  /** Custodial ANT id, when the settlement receipt reported it. */
  antId?: string;
  className?: string;
}): JSX.Element {
  const [claiming, setClaiming] = useState(false);

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
        You can claim it to a wallet you control later.
        {antId ? ` (ANT ${antId})` : ''}
      </span>
      <div>
        <button
          type="button"
          className="flex button hover center white"
          // Stub: the credit-authed exit (POST /v1/arns/transfer/:antId) is not
          // wired yet. Disabled so the UX is honest.
          disabled
          aria-disabled
          onClick={() => setClaiming(true)}
          title="Claiming a custodial name to your own wallet is coming soon."
          style={{
            gap: '10px',
            marginTop: '4px',
            opacity: 0.6,
            cursor: 'not-allowed',
          }}
        >
          {claiming ? 'Claiming…' : 'Claim / transfer out (coming soon)'}
        </button>
      </div>
    </div>
  );
}

export default CustodialNameNotice;
