import { TokenType } from '@ardrive/turbo-sdk';

/**
 * ANT custody model for a credit-paid ArNS purchase.
 *
 * On-chain, an ArNS *name* is a pointer to an *ANT* (a Metaplex Core NFT +
 * record/controller PDAs on Solana). Turbo always pays ARIO + SOL and debits
 * the user's credits; the only thing that varies per identity is **who owns
 * the ANT and who may mutate it**. See `arns-spike/UI_INTEGRATION_PLAN.md` §2.
 */
export type CustodyModel =
  /** Model B — the user's Solana wallet spawns + owns the ANT (Phase 1). */
  | 'B-user-owned'
  /** Model A — Turbo (the bundler) provisions + custodies the ANT (Phase 2/3). */
  | 'A-custodial';

export interface CustodyStrategy {
  model: CustodyModel;
  /** Whether the connected wallet owns the ANT outright. */
  ownsAnt: boolean;
  /**
   * Whether the client must spawn the ANT before the buy and hand its
   * `processId` to the bundler. Model B does; Model A leaves the bundler to
   * provision one server-side (no client `processId`).
   */
  requiresClientAntSpawn: boolean;
  /**
   * `true` when this strategy is not yet implemented for credit settlement.
   * Model A is a designed seam only in Phase 1 — the Checkout credits path
   * throws a clear, actionable error rather than half-settling.
   */
  isStub: boolean;
}

/**
 * Resolve the custody strategy purely from the connected wallet's token type.
 * Keeping this a pure function of `wallet.tokenType` lets Model A slot in behind
 * the same Checkout/Manage components later without a rewrite.
 */
export function resolveCustodyStrategy(
  tokenType: TokenType | undefined,
): CustodyStrategy {
  switch (tokenType) {
    case 'solana':
      // Model B — build now. The user's wallet spawns the ANT client-side
      // (as it already does in `dispatchArIOInteraction`) and we pass that
      // `processId` to `POST /v1/arns/purchase/buy-name/:name?processId=...`.
      return {
        model: 'B-user-owned',
        ownsAnt: true,
        requiresClientAntSpawn: true,
        isStub: false,
      };

    // ---- Model A (Arweave / Ethereum / keyless) — custodial ----
    // These identities can't own a Solana ANT directly, so the bundler
    // provisions + custodies it (ARNS_PROVISIONING_ENABLED) and later exposes a
    // claim/exit transfer. The settlement client is identity-agnostic; only the
    // buy params (no client `processId`) + custody UX differ. Now WIRED:
    // multi-wallet is restored, so an Arweave (or ETH) identity pays with
    // credits while Turbo holds the ANT. `isStub: false`.
    default:
      return {
        model: 'A-custodial',
        ownsAnt: false,
        requiresClientAntSpawn: false,
        isStub: false,
      };
  }
}
