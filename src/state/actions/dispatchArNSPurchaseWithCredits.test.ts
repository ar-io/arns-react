/**
 * Money-safety tests for the credits ArNS purchase orchestrator. The heavy
 * Solana / SDK deps are mocked; the real resume store (localStorage via jsdom)
 * is exercised so we prove:
 *   - a client-spawned ANT is persisted BEFORE the buy,
 *   - a retry REUSES that ANT instead of spawning (and paying for) another,
 *   - a non-402 failure after spawn surfaces an honest "ANT created" message,
 *   - a 402 is re-thrown as InsufficientCreditsError so Checkout can route to
 *     Top-Up.
 */

// Keep import.meta.env / SDK / Solana kit out of the unit test.
jest.mock('@src/utils/constants', () => ({
  devPaymentServiceFqdn: 'payment.ardrive.dev',
  NETWORK_DEFAULTS: {
    AO: { ARIO: {} },
    TURBO: {
      UPLOAD_URL: 'https://turbo.ardrive.io',
      PAYMENT_URL: 'http://localhost:4001',
      GATEWAY_URL: 'https://turbo-gateway.com',
      WALLETS_URL: 'http://localhost:4001/info',
    },
  },
}));
jest.mock('@ardrive/turbo-sdk', () => ({
  TurboFactory: {
    unauthenticated: jest.fn(() => ({})),
    authenticated: jest.fn(() => ({})),
  },
  ARIOToTokenAmount: jest.fn(),
  ARToTokenAmount: jest.fn(),
  ETHToTokenAmount: jest.fn(),
  POLToTokenAmount: jest.fn(),
}));
jest.mock('@permaweb/aoconnect', () => ({ connect: jest.fn(() => ({})) }));

const spawnMock = jest.fn(async (_args: unknown) => ({
  processId: 'ANT-SPAWNED',
}));
jest.mock('@ar.io/sdk/web', () => ({
  ANT: { spawn: (args: unknown) => spawnMock(args) },
}));
jest.mock('@src/utils/solana', () => ({
  getActiveSolanaConfig: () => ({ programIds: { antProgramId: 'prog' } }),
  getSolanaRpc: () => ({}),
  getSolanaRpcSubscriptions: () => ({}),
}));
jest.mock('@src/utils/transactionUtils/transactionUtils', () => ({
  createAntStateForOwner: () => ({}),
}));

import { InsufficientCreditsError } from '@src/services/turbo/TurboArNSClient';

import { getPendingArNSPurchase } from '@src/services/turbo/arnsPurchaseResume';
import dispatchArNSPurchaseWithCredits from './dispatchArNSPurchaseWithCredits';

const OWNER = 'owner-address-1';

function makeWallet() {
  return {
    tokenType: 'solana',
    solanaSigner: { address: OWNER },
    solanaWallet: {},
  } as any;
}

function makeArweaveWallet() {
  return {
    tokenType: 'arweave',
    // Model A authenticates with a turbo signer; no solanaSigner.
    turboSigner: { sign: jest.fn() },
  } as any;
}

function makeArgs(executeArNSIntent: jest.Mock, wallet = makeWallet()) {
  return {
    turbo: { executeArNSIntent } as any,
    workflowName: 'buyRecord' as any,
    intent: 'Buy-Name' as any,
    payload: { name: 'MyCoolName', type: 'lease', years: 1 },
    owner: { toString: () => OWNER } as any,
    wallet,
    dispatch: jest.fn(),
  };
}

describe('dispatchArNSPurchaseWithCredits (money safety)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    spawnMock.mockClear();
  });

  it('spawns an ANT once and persists its processId before the buy', async () => {
    const execute = jest.fn(async ({ processId, onStatus }: any) => {
      onStatus?.({ phase: 'submitted', nonce: 'nonce-1' });
      return { nonce: 'nonce-1', messageId: 'tx-1', receipt: {}, processId };
    });

    await dispatchArNSPurchaseWithCredits(makeArgs(execute));

    expect(spawnMock).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenCalledTimes(1);
    expect(execute.mock.calls[0][0].processId).toBe('ANT-SPAWNED');
    // Cleared on success.
    expect(getPendingArNSPurchase()).toBeUndefined();
  });

  it('REUSES the spawned ANT on retry instead of spawning again', async () => {
    // Attempt 1: buy fails after the ANT is spawned.
    const failing = jest.fn(async () => {
      throw new Error('on-chain submit failed');
    });
    await expect(
      dispatchArNSPurchaseWithCredits(makeArgs(failing)),
    ).rejects.toThrow(/ANT for 'MyCoolName' was created/i);

    expect(spawnMock).toHaveBeenCalledTimes(1);
    // The ANT is persisted (no nonce) so a retry can reuse it.
    const pending = getPendingArNSPurchase();
    expect(pending?.processId).toBe('ANT-SPAWNED');
    expect(pending?.nonce).toBeUndefined();

    // Attempt 2 (retry): succeeds, and must NOT spawn a second ANT.
    const succeeding = jest.fn(async ({ processId }: any) => ({
      nonce: 'nonce-2',
      messageId: 'tx-2',
      receipt: {},
      processId,
    }));
    await dispatchArNSPurchaseWithCredits(makeArgs(succeeding));

    expect(spawnMock).toHaveBeenCalledTimes(1); // still 1 — reused
    expect(succeeding.mock.calls[0][0].processId).toBe('ANT-SPAWNED');
    expect(getPendingArNSPurchase()).toBeUndefined();
  });

  it('re-throws a 402 as InsufficientCreditsError (routes to Top-Up), keeping the ANT', async () => {
    const four02 = jest.fn(async () => {
      throw new InsufficientCreditsError();
    });

    await expect(
      dispatchArNSPurchaseWithCredits(makeArgs(four02)),
    ).rejects.toBeInstanceOf(InsufficientCreditsError);

    // ANT retained so topping up + retrying reuses it (no second spawn).
    expect(getPendingArNSPurchase()?.processId).toBe('ANT-SPAWNED');
  });

  // ---- Model A (custodial, Arweave identity) ----
  it('Model A (arweave): does NOT spawn an ANT and buys with processId omitted', async () => {
    const execute = jest.fn(async ({ processId, onStatus }: any) => {
      onStatus?.({ phase: 'submitted', nonce: 'nonce-a' });
      return {
        nonce: 'nonce-a',
        messageId: 'tx-custodial',
        // Bundler reports the custodial ANT it provisioned.
        receipt: { processId: 'ANT-CUSTODIAL' },
        processId,
      };
    });

    const interaction = await dispatchArNSPurchaseWithCredits(
      makeArgs(execute, makeArweaveWallet()),
    );

    // No client-side ANT spawn for Model A.
    expect(spawnMock).not.toHaveBeenCalled();
    expect(execute).toHaveBeenCalledTimes(1);
    const call = execute.mock.calls[0][0];
    expect(call.processId).toBeUndefined(); // omitted → bundler custodies
    expect(call.tokenType).toBe('arweave');
    expect(call.signer).toBeDefined();
    // Interaction is flagged custodial and carries the bundler's ANT id.
    expect(interaction.payload.custodial).toBe(true);
    expect(interaction.payload.custodialAntId).toBe('ANT-CUSTODIAL');
    expect(interaction.processId).toBe('ANT-CUSTODIAL');
    expect(getPendingArNSPurchase()).toBeUndefined();
  });

  it('Model A (arweave): throws a clear error when no turbo signer is present', async () => {
    const execute = jest.fn();
    const wallet = { tokenType: 'arweave' } as any; // no turboSigner
    await expect(
      dispatchArNSPurchaseWithCredits(makeArgs(execute, wallet)),
    ).rejects.toThrow(/arweave wallet is required/i);
    expect(execute).not.toHaveBeenCalled();
  });
});
