/**
 * The resume store is the durable substrate for the credit-purchase
 * money-safety guarantees: it must survive a spawned ANT's processId (SOL-safe
 * retry) and a submitted nonce (debit-safe resume), and must reject records
 * that carry neither.
 */
import {
  clearPendingArNSPurchase,
  getPendingArNSPurchase,
  savePendingArNSPurchase,
} from './arnsPurchaseResume';

describe('arnsPurchaseResume store', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('round-trips a spawn-only record (processId, no nonce yet)', () => {
    savePendingArNSPurchase({
      processId: 'ANT-abc',
      intent: 'Buy-Name',
      name: 'MyName',
      owner: 'owner1',
      savedAt: Date.now(),
    });

    const pending = getPendingArNSPurchase();
    expect(pending?.processId).toBe('ANT-abc');
    expect(pending?.nonce).toBeUndefined();
    expect(pending?.name).toBe('MyName');
  });

  it('round-trips a submitted record (nonce + processId)', () => {
    savePendingArNSPurchase({
      nonce: 'nonce-1',
      processId: 'ANT-abc',
      intent: 'Buy-Name',
      name: 'MyName',
      owner: 'owner1',
      savedAt: Date.now(),
    });

    const pending = getPendingArNSPurchase();
    expect(pending?.nonce).toBe('nonce-1');
    expect(pending?.processId).toBe('ANT-abc');
  });

  it('still accepts a nonce-only record (non-Buy intents have no ANT)', () => {
    savePendingArNSPurchase({
      nonce: 'nonce-1',
      intent: 'Extend-Lease',
      name: 'MyName',
      owner: 'owner1',
      savedAt: Date.now(),
    });

    expect(getPendingArNSPurchase()?.nonce).toBe('nonce-1');
  });

  it('rejects a record with neither nonce nor processId', () => {
    // Write a malformed record directly (the typed API requires one of them).
    window.localStorage.setItem(
      'turbo:pending-arns-purchase',
      JSON.stringify({
        intent: 'Buy-Name',
        name: 'MyName',
        owner: 'owner1',
        savedAt: Date.now(),
      }),
    );

    expect(getPendingArNSPurchase()).toBeUndefined();
    // And it self-heals by clearing the junk.
    expect(
      window.localStorage.getItem('turbo:pending-arns-purchase'),
    ).toBeNull();
  });

  it('expires a stale record past MAX_AGE', () => {
    savePendingArNSPurchase({
      processId: 'ANT-old',
      intent: 'Buy-Name',
      name: 'MyName',
      owner: 'owner1',
      savedAt: Date.now() - 31 * 60 * 1000,
    });

    expect(getPendingArNSPurchase()).toBeUndefined();
  });

  it('clears on demand', () => {
    savePendingArNSPurchase({
      processId: 'ANT-abc',
      intent: 'Buy-Name',
      name: 'MyName',
      owner: 'owner1',
      savedAt: Date.now(),
    });
    clearPendingArNSPurchase();
    expect(getPendingArNSPurchase()).toBeUndefined();
  });
});
