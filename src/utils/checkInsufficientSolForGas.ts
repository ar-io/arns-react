import type { PaymentMethod } from '@src/components/forms/PaymentOptionsForm/PaymentOptionsForm';

/**
 * Pure predicate for the "not enough native SOL to cover the on-chain cost"
 * pay-button gate, extracted so it can be unit-tested without rendering the
 * Checkout tree.
 *
 * On Solana every ArNS intent costs SOL (transaction fee + rent for accounts
 * the intent creates — Buy-Name spawns an ANT). Crucially this is true on the
 * **credits** path too: the ANT is spawned client-side (~0.02 SOL) *before* the
 * credit-funded buy, so a wallet flush with credits but empty of SOL still
 * can't complete. The gate therefore applies to both `crypto` (ARIO) and
 * `credits`. It does NOT apply to:
 *  - `card` (fiat) — no Solana leg here, and
 *  - Base-token crypto top-ups — gas is paid on the EVM side.
 *
 * Returns `false` (do not block) while inputs are still loading, so the UI
 * never blocks on missing data.
 */
export function checkInsufficientSolForGas({
  paymentMethod,
  isBaseTokenSelected,
  gasEstimateTotalLamports,
  solBalanceLamports,
}: {
  paymentMethod: PaymentMethod;
  isBaseTokenSelected: boolean;
  gasEstimateTotalLamports?: number;
  solBalanceLamports?: number;
}): boolean {
  if (paymentMethod === 'card') return false;
  if (paymentMethod === 'crypto' && isBaseTokenSelected) return false;
  if (
    gasEstimateTotalLamports === undefined ||
    solBalanceLamports === undefined
  ) {
    return false;
  }
  return solBalanceLamports < gasEstimateTotalLamports;
}
