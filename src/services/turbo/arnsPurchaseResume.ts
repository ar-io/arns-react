import { TurboArNSIntent } from './TurboArNSClient';

/**
 * A credit-paid ArNS purchase that has been submitted (credits debited, on-chain
 * write in flight) but not yet observed reaching a terminal state. Persisted so
 * a page reload / tab close resumes POLLING the same nonce rather than orphaning
 * — or, worse, re-charging — a paid purchase. See UI_INTEGRATION_PLAN §3.4.
 *
 * The nonce is the server-side idempotency + status key, so resuming is a pure
 * read (`GET /v1/arns/purchase/:nonce`); it never re-submits.
 */
export type PendingArNSPurchase = {
  nonce: string;
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
      !parsed?.nonce ||
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
