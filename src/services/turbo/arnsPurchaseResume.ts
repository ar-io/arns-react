import type { TurboArNSIntent } from './TurboArNSClient';

/**
 * A credit-paid ArNS purchase that has progressed past a costly, non-repeatable
 * step and must survive a reload / tab close / failed attempt. Persisted so a
 * retry resumes rather than repeats work that costs money:
 *
 * - `processId` is captured the instant a Model-B ANT is spawned client-side
 *   (real SOL, ~0.02). A retry MUST reuse this ANT instead of spawning another,
 *   or every failed attempt bleeds SOL and orphans an ANT.
 * - `nonce` is the server-side idempotency + status key captured once the
 *   purchase is submitted (credits debited, on-chain write in flight). Resuming
 *   is a pure read (`GET /v1/arns/purchase/:nonce`); it never re-submits, so it
 *   can never double-debit.
 *
 * At least one of `nonce` / `processId` is always present. See
 * UI_INTEGRATION_PLAN §3.4.
 */
export type PendingArNSPurchase = {
  /** Idempotency + status key. Absent before the purchase is submitted. */
  nonce?: string;
  /** Client-spawned ANT (Model B). Absent for non-Buy intents. */
  processId?: string;
  intent: TurboArNSIntent;
  name: string;
  owner: string;
  savedAt: number;
};

const STORAGE_KEY = 'turbo:pending-arns-purchase';

// Guard against a stale nonce lingering forever if terminal polling never lands
// (the server is durable; this is just UI hygiene). Slightly over the poll
// ceiling used by `executeArNSIntent`.
const MAX_AGE_MS = 30 * 60 * 1000;

function safeStorage(): Storage | undefined {
  try {
    return typeof window !== 'undefined' ? window.localStorage : undefined;
  } catch {
    return undefined;
  }
}

export function savePendingArNSPurchase(entry: PendingArNSPurchase): void {
  const storage = safeStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(entry));
  } catch {
    // Ignore quota / serialization failures — persistence is best-effort.
  }
}

export function getPendingArNSPurchase(): PendingArNSPurchase | undefined {
  const storage = safeStorage();
  if (!storage) return undefined;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as PendingArNSPurchase;
    if (
      // At least one durable key must be present to be worth resuming.
      (!parsed?.nonce && !parsed?.processId) ||
      !parsed?.name ||
      typeof parsed.savedAt !== 'number' ||
      Date.now() - parsed.savedAt > MAX_AGE_MS
    ) {
      clearPendingArNSPurchase();
      return undefined;
    }
    return parsed;
  } catch {
    return undefined;
  }
}

export function clearPendingArNSPurchase(): void {
  const storage = safeStorage();
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}
