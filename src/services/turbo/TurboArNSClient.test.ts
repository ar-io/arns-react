/**
 * Unit tests for the credit-settlement path added in Phase 1
 * (`TurboArNSClient.executeArNSIntent`). The turbo-sdk authenticated client is
 * injected (`purchaseClient`) so these tests never stand up the real SDK; the
 * status endpoint is exercised through a mocked `fetch`.
 */

// Keep the heavy SDK / AO deps out of the unit test — the settlement path uses
// an injected client, so only lightweight stubs are needed for module load.
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
// `@src/utils/constants` uses `import.meta.env`, which ts-jest (CJS) cannot
// compile — a pre-existing repo-wide jest limitation. Stub the two values the
// client actually reads so this suite runs in isolation.
jest.mock('@src/utils/constants', () => ({
  devPaymentServiceFqdn: 'payment.ardrive.dev',
  ARNS_TX_ID_REGEX: new RegExp('^[a-zA-Z0-9\\-_s+]{43}$'),
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

import {
  ArNSPurchaseFailedError,
  AuthenticatedArNSCustodyClient,
  AuthenticatedArNSPurchaseClient,
  AuthenticatedArNSRecordClient,
  CustodialANTNotFoundError,
  CustodyTransferUnauthorizedError,
  ExecuteArNSIntentParams,
  InsufficientCreditsError,
  InvalidTransferTargetError,
  TurboArNSClient,
} from './TurboArNSClient';

// A valid-length Solana address so the constructor derives token 'solana'.
const SOLANA_ADDRESS = '3xJ8mF1qZ9wYtP2vN6bK7cR4dQ5eH8gS1uA2iL3oM4n';
const NONCE = '11111111-2222-4333-8444-555555555555';

function makeClient(): TurboArNSClient {
  return new TurboArNSClient({
    paymentUrl: 'http://localhost:4001',
    walletAddress: SOLANA_ADDRESS,
    stripe: {} as any,
  });
}

function makePurchaseClient(
  nonce = NONCE,
): jest.Mocked<AuthenticatedArNSPurchaseClient> {
  const ok = async () => ({ nonce, purchaseReceipt: { nonce } });
  return {
    buyArNSName: jest.fn(ok),
    extendArNSLease: jest.fn(ok),
    increaseArNSUndernameLimit: jest.fn(ok),
    upgradeArNSName: jest.fn(ok),
  } as any;
}

/** Mock `fetch` (used by `getIntentStatus`) to yield a sequence of records. */
function mockStatusSequence(records: Record<string, unknown>[]) {
  let i = 0;
  const fn = jest.fn(async (_url: unknown) => ({
    json: async () => records[Math.min(i++, records.length - 1)],
  }));
  (global as any).fetch = fn;
  return fn;
}

const baseParams = (
  overrides: Partial<ExecuteArNSIntentParams>,
): ExecuteArNSIntentParams => ({
  intent: 'Buy-Name',
  name: 'mycoolname',
  pollIntervalMs: 1,
  pollTimeoutMs: 2000,
  ...overrides,
});

describe('TurboArNSClient.executeArNSIntent', () => {
  afterEach(() => jest.clearAllMocks());

  describe('intent → turbo-sdk method mapping', () => {
    it('routes Buy-Name to buyArNSName with the processId (ANT)', async () => {
      const client = makeClient();
      const purchaseClient = makePurchaseClient();
      mockStatusSequence([{ messageId: 'tx-buy' }]);

      const res = await client.executeArNSIntent(
        baseParams({
          intent: 'Buy-Name',
          name: 'MyCoolName',
          type: 'lease',
          years: 2,
          processId: 'ANT-123',
          paidBy: ['payer1'],
          purchaseClient,
        }),
      );

      expect(purchaseClient.buyArNSName).toHaveBeenCalledTimes(1);
      expect(purchaseClient.buyArNSName).toHaveBeenCalledWith({
        name: 'mycoolname', // lower-cased
        type: 'lease',
        years: 2,
        processId: 'ANT-123',
        paidBy: ['payer1'],
      });
      expect(res.messageId).toBe('tx-buy');
      expect(res.nonce).toBe(NONCE);
    });

    it('routes Extend-Lease to extendArNSLease', async () => {
      const client = makeClient();
      const purchaseClient = makePurchaseClient();
      mockStatusSequence([{ messageId: 'tx-extend' }]);

      await client.executeArNSIntent(
        baseParams({ intent: 'Extend-Lease', years: 3, purchaseClient }),
      );

      expect(purchaseClient.extendArNSLease).toHaveBeenCalledWith({
        name: 'mycoolname',
        years: 3,
        paidBy: undefined,
      });
      expect(purchaseClient.buyArNSName).not.toHaveBeenCalled();
    });

    it('routes Increase-Undername-Limit to increaseArNSUndernameLimit', async () => {
      const client = makeClient();
      const purchaseClient = makePurchaseClient();
      mockStatusSequence([{ messageId: 'tx-inc' }]);

      await client.executeArNSIntent(
        baseParams({
          intent: 'Increase-Undername-Limit',
          increaseQty: 100,
          purchaseClient,
        }),
      );

      expect(purchaseClient.increaseArNSUndernameLimit).toHaveBeenCalledWith({
        name: 'mycoolname',
        increaseQty: 100,
        paidBy: undefined,
      });
    });

    it('routes Upgrade-Name to upgradeArNSName', async () => {
      const client = makeClient();
      const purchaseClient = makePurchaseClient();
      mockStatusSequence([{ messageId: 'tx-up' }]);

      await client.executeArNSIntent(
        baseParams({ intent: 'Upgrade-Name', purchaseClient }),
      );

      expect(purchaseClient.upgradeArNSName).toHaveBeenCalledWith({
        name: 'mycoolname',
        paidBy: undefined,
      });
    });

    it('rejects Buy-Name without a processId (would orphan the buy)', async () => {
      const client = makeClient();
      const purchaseClient = makePurchaseClient();
      mockStatusSequence([{ messageId: 'never' }]);

      await expect(
        client.executeArNSIntent(
          baseParams({ intent: 'Buy-Name', purchaseClient }),
        ),
      ).rejects.toThrow(/processId/i);
      expect(purchaseClient.buyArNSName).not.toHaveBeenCalled();
    });
  });

  describe('nonce capture + idempotent resume', () => {
    it('captures the UUID nonce and polls the status endpoint with it', async () => {
      const client = makeClient();
      const purchaseClient = makePurchaseClient();
      const fetchMock = mockStatusSequence([{ messageId: 'tx-1' }]);

      const res = await client.executeArNSIntent(
        baseParams({ intent: 'Upgrade-Name', purchaseClient }),
      );

      expect(res.nonce).toBe(NONCE);
      const polledUrl = String(fetchMock.mock.calls[0][0]);
      expect(polledUrl).toContain(`/v1/arns/purchase/${NONCE}`);
    });

    it('resumes polling an existing nonce WITHOUT re-submitting (no double debit)', async () => {
      const client = makeClient();
      const purchaseClient = makePurchaseClient();
      const fetchMock = mockStatusSequence([{ messageId: 'tx-resumed' }]);

      const res = await client.executeArNSIntent(
        baseParams({
          intent: 'Buy-Name',
          processId: 'ANT-1',
          resumeNonce: NONCE,
          purchaseClient,
        }),
      );

      // Critical: the mint method must NOT be called again on resume.
      expect(purchaseClient.buyArNSName).not.toHaveBeenCalled();
      expect(res.nonce).toBe(NONCE);
      expect(res.messageId).toBe('tx-resumed');
      expect(String(fetchMock.mock.calls[0][0])).toContain(NONCE);
    });
  });

  describe('error mapping', () => {
    it('maps a 402 to a typed InsufficientCreditsError', async () => {
      const client = makeClient();
      const purchaseClient = makePurchaseClient();
      purchaseClient.upgradeArNSName.mockRejectedValueOnce(
        Object.assign(new Error('Failed request (Status 402): no credits'), {
          status: 402,
        }),
      );
      mockStatusSequence([{ messageId: 'never' }]);

      await expect(
        client.executeArNSIntent(
          baseParams({ intent: 'Upgrade-Name', purchaseClient }),
        ),
      ).rejects.toBeInstanceOf(InsufficientCreditsError);
    });

    it('maps a "(Status 402)" message with no status field to InsufficientCreditsError', async () => {
      const client = makeClient();
      const purchaseClient = makePurchaseClient();
      purchaseClient.upgradeArNSName.mockRejectedValueOnce(
        new Error('Failed request (Status 402): insufficient balance'),
      );
      mockStatusSequence([{ messageId: 'never' }]);

      await expect(
        client.executeArNSIntent(
          baseParams({ intent: 'Upgrade-Name', purchaseClient }),
        ),
      ).rejects.toBeInstanceOf(InsufficientCreditsError);
    });
  });

  describe('polling to terminal', () => {
    it('tolerates pending/blip responses then resolves on messageId', async () => {
      const client = makeClient();
      const purchaseClient = makePurchaseClient();
      const fetchMock = mockStatusSequence([
        {}, // pending — no messageId
        {}, // pending again
        { messageId: 'tx-final' }, // terminal success
      ]);

      const res = await client.executeArNSIntent(
        baseParams({ intent: 'Upgrade-Name', purchaseClient }),
      );

      expect(res.messageId).toBe('tx-final');
      expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(3);
    });

    it('throws ArNSPurchaseFailedError when the record carries failedDate', async () => {
      const client = makeClient();
      const purchaseClient = makePurchaseClient();
      mockStatusSequence([{ failedDate: '2026-07-15T00:00:00Z' }]);

      await expect(
        client.executeArNSIntent(
          baseParams({ intent: 'Upgrade-Name', purchaseClient }),
        ),
      ).rejects.toBeInstanceOf(ArNSPurchaseFailedError);
    });

    it('keeps polling through a transient fetch rejection (network blip)', async () => {
      const client = makeClient();
      const purchaseClient = makePurchaseClient();
      let call = 0;
      (global as any).fetch = jest.fn(async () => {
        call += 1;
        if (call === 1) throw new Error('network down');
        return { json: async () => ({ messageId: 'tx-after-blip' }) };
      });

      const res = await client.executeArNSIntent(
        baseParams({ intent: 'Upgrade-Name', purchaseClient }),
      );

      expect(res.messageId).toBe('tx-after-blip');
      expect(call).toBeGreaterThanOrEqual(2);
    });
  });

  // ---- Model A (custodial) — identity-agnostic authenticated client ----
  describe('identity-agnostic client + Model A custodial buy', () => {
    it('Model A (arweave, injected client): buys WITHOUT a processId', async () => {
      const client = makeClient();
      const purchaseClient = makePurchaseClient();
      mockStatusSequence([{ messageId: 'tx-custodial' }]);

      const res = await client.executeArNSIntent(
        baseParams({
          intent: 'Buy-Name',
          name: 'CoolName',
          type: 'lease',
          years: 1,
          tokenType: 'arweave',
          // No processId — the bundler custodially provisions the ANT.
          purchaseClient,
        }),
      );

      expect(purchaseClient.buyArNSName).toHaveBeenCalledTimes(1);
      const arg = purchaseClient.buyArNSName.mock.calls[0][0];
      expect(arg).not.toHaveProperty('processId'); // omitted for Model A
      expect(arg.name).toBe('coolname');
      expect(res.messageId).toBe('tx-custodial');
    });

    it('Model B (solana) still REQUIRES a processId for Buy-Name', async () => {
      const client = makeClient();
      const purchaseClient = makePurchaseClient();
      mockStatusSequence([{ messageId: 'never' }]);

      await expect(
        client.executeArNSIntent(
          baseParams({
            intent: 'Buy-Name',
            tokenType: 'solana',
            purchaseClient,
          }),
        ),
      ).rejects.toThrow(/processId/i);
      expect(purchaseClient.buyArNSName).not.toHaveBeenCalled();
    });

    it('builds an arweave-signed authenticated client from the wallet signer', async () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { TurboFactory } = require('@ardrive/turbo-sdk');
      const buyArNSName = jest.fn(async () => ({
        nonce: NONCE,
        purchaseReceipt: { nonce: NONCE },
      }));
      TurboFactory.authenticated.mockReturnValueOnce({
        buyArNSName,
        extendArNSLease: jest.fn(),
        increaseArNSUndernameLimit: jest.fn(),
        upgradeArNSName: jest.fn(),
      });
      mockStatusSequence([{ messageId: 'tx-arweave' }]);

      const client = makeClient();
      const fakeSigner = { sign: jest.fn() };
      const res = await client.executeArNSIntent(
        baseParams({
          intent: 'Buy-Name',
          name: 'ArweaveName',
          tokenType: 'arweave',
          signer: fakeSigner,
        }),
      );

      expect(TurboFactory.authenticated).toHaveBeenCalledWith(
        expect.objectContaining({ token: 'arweave', signer: fakeSigner }),
      );
      expect(buyArNSName).toHaveBeenCalledTimes(1);
      expect((buyArNSName as jest.Mock).mock.calls[0][0]).not.toHaveProperty(
        'processId',
      );
      expect(res.messageId).toBe('tx-arweave');
    });

    it('throws a clear error when a Model A (ethereum) signer is missing', async () => {
      const client = makeClient();
      mockStatusSequence([{ messageId: 'never' }]);

      await expect(
        client.executeArNSIntent(
          baseParams({ intent: 'Upgrade-Name', tokenType: 'ethereum' }),
        ),
      ).rejects.toThrow(/signer is required/i);
    });
  });

  // ---- Claim / exit — custodial ANT self-custody transfer ----
  describe('transferCustodialArNSName (claim/exit)', () => {
    const ANT_ID = 'ANT-custodial-1';
    // A valid Solana pubkey (base58, 32 bytes) — the exit target.
    const TARGET = '7T9x6CWBfdC8UUVsifNS3bWbroSvuFi7g8vebXHAxcxB';

    function makeTransferClient(
      impl?: () => Promise<any>,
    ): jest.Mocked<AuthenticatedArNSCustodyClient> {
      return {
        transferArNSAnt: jest.fn(
          impl ??
            (async () => ({
              antId: ANT_ID,
              target: TARGET,
              name: 'mycoolname',
              messageId: 'tx-transfer',
              confirmed: true,
            })),
        ),
      } as any;
    }

    it('calls transferArNSAnt with { antId, target } and normalizes the result', async () => {
      const client = makeClient();
      const transferClient = makeTransferClient();

      const res = await client.transferCustodialArNSName({
        antId: ANT_ID,
        target: TARGET,
        tokenType: 'arweave',
        transferClient,
      });

      expect(transferClient.transferArNSAnt).toHaveBeenCalledTimes(1);
      expect(transferClient.transferArNSAnt).toHaveBeenCalledWith({
        antId: ANT_ID,
        target: TARGET,
      });
      expect(res).toEqual({
        antId: ANT_ID,
        target: TARGET,
        name: 'mycoolname',
        messageId: 'tx-transfer',
        confirmed: true,
      });
    });

    it('treats a null messageId (thrown-but-landed) as unconfirmed but successful', async () => {
      const client = makeClient();
      const transferClient = makeTransferClient(async () => ({
        antId: ANT_ID,
        target: TARGET,
        messageId: null,
        confirmed: false,
      }));

      const res = await client.transferCustodialArNSName({
        antId: ANT_ID,
        target: TARGET,
        transferClient,
      });

      expect(res.messageId).toBeNull();
      expect(res.confirmed).toBe(false);
    });

    it('rejects a malformed target BEFORE signing (no request is made)', async () => {
      const client = makeClient();
      const transferClient = makeTransferClient();

      await expect(
        client.transferCustodialArNSName({
          antId: ANT_ID,
          target: 'not-a-real-address!!',
          transferClient,
        }),
      ).rejects.toBeInstanceOf(InvalidTransferTargetError);
      expect(transferClient.transferArNSAnt).not.toHaveBeenCalled();
    });

    it('rejects an empty target BEFORE signing', async () => {
      const client = makeClient();
      const transferClient = makeTransferClient();

      await expect(
        client.transferCustodialArNSName({
          antId: ANT_ID,
          target: '   ',
          transferClient,
        }),
      ).rejects.toBeInstanceOf(InvalidTransferTargetError);
      expect(transferClient.transferArNSAnt).not.toHaveBeenCalled();
    });

    it('requires an antId', async () => {
      const client = makeClient();
      const transferClient = makeTransferClient();

      await expect(
        client.transferCustodialArNSName({
          antId: '',
          target: TARGET,
          transferClient,
        }),
      ).rejects.toThrow(/ANT id is required/i);
      expect(transferClient.transferArNSAnt).not.toHaveBeenCalled();
    });

    it('maps a 404 to a non-leaky CustodialANTNotFoundError', async () => {
      const client = makeClient();
      const transferClient = makeTransferClient(async () => {
        throw Object.assign(
          new Error('Failed request (Status 404): ANT not found'),
          { status: 404 },
        );
      });

      await expect(
        client.transferCustodialArNSName({
          antId: ANT_ID,
          target: TARGET,
          transferClient,
        }),
      ).rejects.toBeInstanceOf(CustodialANTNotFoundError);
    });

    it('maps a 401 to a CustodyTransferUnauthorizedError', async () => {
      const client = makeClient();
      const transferClient = makeTransferClient(async () => {
        throw Object.assign(
          new Error('Failed request (Status 401): bad signature'),
          { status: 401 },
        );
      });

      await expect(
        client.transferCustodialArNSName({
          antId: ANT_ID,
          target: TARGET,
          transferClient,
        }),
      ).rejects.toBeInstanceOf(CustodyTransferUnauthorizedError);
    });
  });

  // ---- Model A (custodial) — credit-paid record management ----
  describe('setCustodialArNSRecord / removeCustodialArNSRecord', () => {
    const ANT_ID = 'ANT-custodial-1';
    const TX_ID = 'abcdefghijklmnopqrstuvwxyz0123456789-_ABCDE';

    function makeRecordClient(
      overrides?: Record<string, any>,
    ): jest.Mocked<AuthenticatedArNSRecordClient> {
      return {
        setArNSRecord: jest.fn(async (p: any) => ({
          antId: p.antId,
          undername: p.undername ?? '@',
          transactionId: p.transactionId,
          ttlSeconds: p.ttlSeconds,
          messageId: 'tx-set',
        })),
        removeArNSRecord: jest.fn(async (p: any) => ({
          antId: p.antId,
          undername: p.undername,
          messageId: 'tx-remove',
        })),
        ...overrides,
      } as any;
    }

    it('sets the apex @ record via the injected record client', async () => {
      const client = makeClient();
      const recordClient = makeRecordClient();

      const res = await client.setCustodialArNSRecord({
        antId: ANT_ID,
        transactionId: TX_ID,
        ttlSeconds: 900,
        tokenType: 'arweave',
        recordClient,
      });

      expect(recordClient.setArNSRecord).toHaveBeenCalledWith({
        antId: ANT_ID,
        undername: '@',
        transactionId: TX_ID,
        ttlSeconds: 900,
      });
      expect(res).toEqual({
        antId: ANT_ID,
        undername: '@',
        transactionId: TX_ID,
        ttlSeconds: 900,
        messageId: 'tx-set',
      });
    });

    it('sets an undername record with the provided undername', async () => {
      const client = makeClient();
      const recordClient = makeRecordClient();

      await client.setCustodialArNSRecord({
        antId: ANT_ID,
        undername: 'blog',
        transactionId: TX_ID,
        ttlSeconds: 3600,
        recordClient,
      });

      expect(recordClient.setArNSRecord).toHaveBeenCalledWith({
        antId: ANT_ID,
        undername: 'blog',
        transactionId: TX_ID,
        ttlSeconds: 3600,
      });
    });

    it('removes an undername record', async () => {
      const client = makeClient();
      const recordClient = makeRecordClient();

      const res = await client.removeCustodialArNSRecord({
        antId: ANT_ID,
        undername: 'blog',
        recordClient,
      });

      expect(recordClient.removeArNSRecord).toHaveBeenCalledWith({
        antId: ANT_ID,
        undername: 'blog',
      });
      expect(res).toEqual({
        antId: ANT_ID,
        undername: 'blog',
        messageId: 'tx-remove',
      });
    });

    it('refuses to remove the apex @ record', async () => {
      const client = makeClient();
      const recordClient = makeRecordClient();

      await expect(
        client.removeCustodialArNSRecord({
          antId: ANT_ID,
          undername: '@',
          recordClient,
        }),
      ).rejects.toThrow(/non-apex undername/i);
      expect(recordClient.removeArNSRecord).not.toHaveBeenCalled();
    });

    it('requires an antId to set a record', async () => {
      const client = makeClient();
      const recordClient = makeRecordClient();

      await expect(
        client.setCustodialArNSRecord({
          antId: '',
          transactionId: TX_ID,
          ttlSeconds: 900,
          recordClient,
        }),
      ).rejects.toThrow(/ANT id is required/i);
      expect(recordClient.setArNSRecord).not.toHaveBeenCalled();
    });

    it('maps a 404 to a non-leaky CustodialANTNotFoundError', async () => {
      const client = makeClient();
      const recordClient = makeRecordClient({
        setArNSRecord: jest.fn(async () => {
          throw Object.assign(
            new Error('Failed request (Status 404): not found'),
            { status: 404 },
          );
        }),
      });

      await expect(
        client.setCustodialArNSRecord({
          antId: ANT_ID,
          transactionId: TX_ID,
          ttlSeconds: 900,
          recordClient,
        }),
      ).rejects.toBeInstanceOf(CustodialANTNotFoundError);
    });

    it('maps a 401 to a CustodyTransferUnauthorizedError', async () => {
      const client = makeClient();
      const recordClient = makeRecordClient({
        removeArNSRecord: jest.fn(async () => {
          throw Object.assign(
            new Error('Failed request (Status 401): bad signature'),
            { status: 401 },
          );
        }),
      });

      await expect(
        client.removeCustodialArNSRecord({
          antId: ANT_ID,
          undername: 'blog',
          recordClient,
        }),
      ).rejects.toBeInstanceOf(CustodyTransferUnauthorizedError);
    });
  });

  // ---- Identity-agnostic fiat top-up ----
  describe('getTopupPaymentIntent (identity-agnostic fiat top-up)', () => {
    afterEach(() => {
      (global as any).fetch = undefined;
    });

    it.each([
      ['arweave', '7gI4LqBxQSyTRu5e2Zfgyw2UEMgsUsxsoW2KajneFC8'],
      ['ethereum', '0x1F98431c8aD98523631AE4a59f267346ea31F984'],
      ['solana', SOLANA_ADDRESS],
    ] as const)(
      'credits the connected %s identity address with its native token',
      async (token, address) => {
        const client = makeClient();
        const fetchMock = jest.fn(async () => ({
          status: 200,
          json: async () => ({
            topUpQuote: { quotedPaymentAmount: 1000 },
            paymentSession: { id: 'pi_1' },
          }),
        }));
        (global as any).fetch = fetchMock;

        const res = await client.getTopupPaymentIntent({
          address,
          amount: 1000,
          token,
        });

        expect(res.paymentSession).toEqual({ id: 'pi_1' });
        const calledUrl = (fetchMock.mock.calls[0] as any[])[0] as string;
        // The connected identity's native address is the credit destination,
        // and its token drives the destination-address type — no Solana default.
        expect(calledUrl).toContain(
          `/top-up/payment-intent/${address}/usd/1000`,
        );
        expect(calledUrl).toContain(`token=${token}`);
      },
    );
  });
});
