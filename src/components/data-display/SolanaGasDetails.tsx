import { GasEstimate } from '@ar.io/sdk/web';
import { formatSolFromLamports } from '@src/utils';

/**
 * Network-cost summary for Solana actions, split the way wallets present
 * it: the transaction fee, the rent deposited for accounts the action
 * creates (the bulk of the cost when present), their total, and — when the
 * action closes accounts (e.g. removing an undername) — the rent refunded.
 */
export function SolanaGasDetails({
  gasEstimate,
  isLoading,
  insufficientSol = false,
  className = '',
}: {
  gasEstimate?: GasEstimate;
  isLoading?: boolean;
  insufficientSol?: boolean;
  className?: string;
}) {
  if (isLoading) {
    return (
      <span className="text-grey text-sm animate-pulse">
        Estimating network cost...
      </span>
    );
  }
  if (!gasEstimate) return null;
  const { feeLamports, rentLamports, rentReclaimedLamports, totalLamports } =
    gasEstimate;
  const hasRent = rentLamports > 0;
  const insufficientNote = insufficientSol ? ' (insufficient SOL)' : '';
  return (
    <div className={`flex flex-col gap-1 text-sm ${className}`}>
      <span
        className={insufficientSol && !hasRent ? 'text-error' : 'text-grey'}
      >
        Network fee (est.): ~{formatSolFromLamports(feeLamports)} SOL
        {hasRent ? '' : insufficientNote}
      </span>
      {hasRent && (
        <>
          <span className="text-grey">
            Storage rent (est.): ~{formatSolFromLamports(rentLamports)} SOL
          </span>
          <span className={insufficientSol ? 'text-error' : 'text-white'}>
            Total (est.): ~{formatSolFromLamports(totalLamports)} SOL
            {insufficientNote}
          </span>
        </>
      )}
      {rentReclaimedLamports > 0 && (
        <span className="text-success">
          Rent reclaimed: +{formatSolFromLamports(rentReclaimedLamports)} SOL
        </span>
      )}
    </div>
  );
}
