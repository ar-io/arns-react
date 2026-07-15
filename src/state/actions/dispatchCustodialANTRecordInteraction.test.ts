/**
 * Tests for the custodial (Model A) credit-paid record manager. Proves each
 * manage workflow routes to the correct `TurboArNSClient` method with the
 * connected credit-identity signer, and that owner-only ops are rejected — so a
 * Model A user's target/undername edits go through credits (never a wallet
 * interaction they can't sign, since Turbo owns the ANT).
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

import { ANT_INTERACTION_TYPES } from '@src/types';

import dispatchCustodialANTRecordInteraction from './dispatchCustodialANTRecordInteraction';

const OWNER = '7gI4LqBxQSyTRu5e2Zfgyw2UEMgsUsxsoW2KajneFC8';
const ANT_ID = 'ANT-custodial-1';
const TX_ID = 'abcdefghijklmnopqrstuvwxyz0123456789-_ABCDE';

function makeArweaveWallet() {
  return { tokenType: 'arweave', turboSigner: { sign: jest.fn() } } as any;
}

function makeTurbo() {
  return {
    setCustodialArNSRecord: jest.fn(async () => ({
      antId: ANT_ID,
      undername: '@',
      transactionId: TX_ID,
      ttlSeconds: 900,
      messageId: 'tx-set',
    })),
    removeCustodialArNSRecord: jest.fn(async () => ({
      antId: ANT_ID,
      undername: 'blog',
      messageId: 'tx-remove',
    })),
  } as any;
}

function baseArgs(overrides: Record<string, any> = {}) {
  return {
    turbo: makeTurbo(),
    wallet: makeArweaveWallet(),
    antId: ANT_ID,
    payload: {},
    owner: OWNER,
    dispatchTransactionState: jest.fn(),
    ...overrides,
  };
}

describe('dispatchCustodialANTRecordInteraction', () => {
  it('routes SET_TARGET_ID to setCustodialArNSRecord on the apex @ record', async () => {
    const args = baseArgs({
      workflowName: ANT_INTERACTION_TYPES.SET_TARGET_ID,
      payload: { transactionId: TX_ID, ttlSeconds: 900 },
    });

    const res = await dispatchCustodialANTRecordInteraction(args as any);

    expect(args.turbo.setCustodialArNSRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        antId: ANT_ID,
        undername: '@',
        transactionId: TX_ID,
        ttlSeconds: 900,
        tokenType: 'arweave',
        signer: args.wallet.turboSigner,
      }),
    );
    expect(res.id).toBe('tx-set');
    expect(res.payload.custodial).toBe(true);
    // Records the final interaction so the manage UI refreshes.
    expect(args.dispatchTransactionState).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'setInteractionResult' }),
    );
  });

  it('routes SET_RECORD to setCustodialArNSRecord with the (lowercased) undername', async () => {
    const args = baseArgs({
      workflowName: ANT_INTERACTION_TYPES.SET_RECORD,
      payload: { subDomain: 'BLOG', transactionId: TX_ID, ttlSeconds: 3600 },
    });

    await dispatchCustodialANTRecordInteraction(args as any);

    expect(args.turbo.setCustodialArNSRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        antId: ANT_ID,
        undername: 'blog',
        transactionId: TX_ID,
        ttlSeconds: 3600,
      }),
    );
  });

  it('routes REMOVE_RECORD to removeCustodialArNSRecord', async () => {
    const args = baseArgs({
      workflowName: ANT_INTERACTION_TYPES.REMOVE_RECORD,
      payload: { subDomain: 'blog' },
    });

    const res = await dispatchCustodialANTRecordInteraction(args as any);

    expect(args.turbo.removeCustodialArNSRecord).toHaveBeenCalledWith(
      expect.objectContaining({ antId: ANT_ID, undername: 'blog' }),
    );
    expect(res.id).toBe('tx-remove');
  });

  it('rejects a Model A wallet with no turbo signer', async () => {
    const args = baseArgs({
      wallet: { tokenType: 'arweave' } as any,
      workflowName: ANT_INTERACTION_TYPES.SET_TARGET_ID,
      payload: { transactionId: TX_ID, ttlSeconds: 900 },
    });

    await expect(
      dispatchCustodialANTRecordInteraction(args as any),
    ).rejects.toThrow(/required to manage this name with credits/i);
  });

  it('rejects an unsupported (owner-only) workflow', async () => {
    const args = baseArgs({
      workflowName: ANT_INTERACTION_TYPES.TRANSFER,
      payload: { target: 'x' },
    });

    await expect(
      dispatchCustodialANTRecordInteraction(args as any),
    ).rejects.toThrow(/Unsupported custodial record interaction/i);
  });
});
