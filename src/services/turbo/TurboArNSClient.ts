import { Intent } from '@ar.io/sdk/web';
import {
  ARIOToTokenAmount,
  ARToTokenAmount,
  CurrencyMap,
  ETHToTokenAmount,
  POLToTokenAmount,
  TokenType,
  TurboFactory,
  TurboWincForFiatResponse,
  TwoDecimalCurrency,
} from '@ardrive/turbo-sdk';
import { connect } from '@permaweb/aoconnect';
import {
  isArweaveTransactionID,
  isEthAddress,
  isValidSolanaAddress,
  lowerCaseDomain,
  sleep,
} from '@src/utils';
import { NETWORK_DEFAULTS, devPaymentServiceFqdn } from '@src/utils/constants';
import { PaymentIntent, Stripe } from '@stripe/stripe-js';

export type PaymentInformation = {
  paymentMethodId: string;
  email?: string;
};

export type TurboArNSIntent = Omit<Intent, 'Primary-Name-Request'>;

export interface TurboArNSClientConfig {
  uploadUrl?: string;
  paymentUrl?: string;
  gatewayUrl?: string;
  walletsUrl?: string;
  // `signer` and `ao` are vestigial after the de-AO refactor. Credit-paid ArNS
  // purchases (`executeArNSIntent`) now settle through the bundler
  // payment-service REST API — the authenticated turbo-sdk client is built
  // on demand from the connected Solana wallet adapter, not from these fields.
  // The Stripe (`card`) path remains gated in the UI.
  signer?: any;
  walletAddress?: string;
  stripe: Stripe;
  ao?: any;
}

export type TurboArNSInteractionParams = {
  name: string;
  type?: 'lease' | 'permabuy';
  years?: number;
  intent: TurboArNSIntent;
  increaseQty?: number;
  processId?: string;
};

export type TurboArNSPaymentIntentResponse<
  GenericQuoteParams extends TurboArNSInteractionParams | unknown,
> = {
  purchaseQuote: {
    intent: TurboArNSIntent;
    nonce: string;
    usdArRate: string;
    usdArioRate: string;
    mARIOQty: number;
    wincQty: string;
    owner: string;
    quoteCreationDate: string;
    quoteExpirationDate: string;
    paymentAmount: number;
    quotedPaymentAmount: number;
    currencyType: CurrencyMap['type'];
    paymentProvider: 'stripe';
    excessWincAmount: number;
  } & GenericQuoteParams;
  paymentSession: PaymentIntent;
  adjustments: Array<any>;
  fees: Array<any>;
};

export type TurboArNSIntentPriceResponse = {
  mARIO: string;
  winc: string;
  fiatEstimate: {
    paymentAmount: number;
    quotedPaymentAmount: string;
    adjustments: Array<any>;
    fees: Array<any>;
  };
};

export type TurboArNSIntentStatusResponse<
  GenericIntentParams extends TurboArNSInteractionParams | unknown,
> = {
  status: 'pending' | 'success' | 'failed';
  intent: TurboArNSIntent;
  nonce: string;
  createdData: string;
  paymentAmount: number;
  currencyType: CurrencyMap['type'];
  paymentProvider: 'stripe';
  quoteCreationDate: string;
  quoteExpirationDate: string;
  quotedPaymentAmount: number;
  usdArRate: string;
  useArioRate: string;
  wincQty: string;
  mARIOQty: number;
  owner: string;
  messageId?: string;
} & GenericIntentParams;

export type TurboArNSIntentPriceParams = {
  address?: string;
  name: string;
  intent: TurboArNSIntent;
  increaseQty?: number;
  type?: 'lease' | 'permabuy';
  years?: number;
  currency?: CurrencyMap['type'];
  promoCode?: string;
};

/**
 * The subset of the turbo-sdk authenticated client used to settle an ArNS
 * purchase with Turbo Credits. Declared structurally so it can be injected in
 * tests without standing up the whole SDK.
 */
export interface AuthenticatedArNSPurchaseClient {
  buyArNSName(params: {
    name: string;
    type?: 'lease' | 'permabuy';
    years?: number;
    /**
     * ANT the name resolves to. Required for Model B (user-owned ANT); OMITTED
     * for Model A (custodial) — the bundler provisions + custodies the ANT
     * server-side. The published SDK/CLI make this optional.
     */
    processId?: string;
    paidBy?: string[];
  }): Promise<ArNSPurchaseResult>;
  extendArNSLease(params: {
    name: string;
    years: number;
    paidBy?: string[];
  }): Promise<ArNSPurchaseResult>;
  increaseArNSUndernameLimit(params: {
    name: string;
    increaseQty: number;
    paidBy?: string[];
  }): Promise<ArNSPurchaseResult>;
  upgradeArNSName(params: {
    name: string;
    paidBy?: string[];
  }): Promise<ArNSPurchaseResult>;
}

/** Shape returned by the turbo-sdk `*ArNSName`/`*ArNSLease` purchase methods. */
export type ArNSPurchaseResult = {
  /** UUID that is both the idempotency key and the status-lookup key. */
  nonce: string;
  purchaseReceipt?: { nonce: string; messageId?: string } & Record<
    string,
    unknown
  >;
  arioWriteResult?: { id: string };
};

/**
 * Progress phases emitted while settling an ArNS purchase with credits, so the
 * UI can surface a signing/polling message without echoing raw chain errors.
 */
export type ArNSSettlementPhase =
  | 'submitting'
  | 'submitted'
  | 'resumed'
  | 'polling'
  | 'success';

export type ArNSSettlementStatus = {
  phase: ArNSSettlementPhase;
  nonce?: string;
  messageId?: string;
};

export type ArNSSettlementResult = {
  /** UUID nonce used for the purchase (idempotency + status key). */
  nonce: string;
  /** Solana transaction id of the on-chain ArNS write. Drives success nav. */
  messageId: string;
  /** The terminal purchase record from the status endpoint. */
  receipt: Record<string, unknown>;
};

export type ExecuteArNSIntentParams = {
  intent: TurboArNSIntent;
  name: string;
  type?: 'lease' | 'permabuy';
  years?: number;
  increaseQty?: number;
  /** ANT (Metaplex Core asset) the name resolves to — required for Buy-Name. */
  processId?: string;
  paidBy?: string[];
  /**
   * Solana wallet adapter (e.g. `window.solana`) used to build the
   * authenticated turbo-sdk client that signs the request nonce. Not required
   * when `resumeNonce` is supplied (a resume only polls, it never re-submits).
   * Only used for the Solana (Model B) path.
   */
  walletAdapter?: unknown;
  /**
   * Connected wallet's token type. Drives which authenticated turbo-sdk client
   * is built: `solana` uses the wallet adapter; `arweave`/`ethereum` (Model A —
   * custodial) use {@link signer}. Defaults to `solana` for back-compat.
   */
  tokenType?: TokenType;
  /**
   * arbundles-compatible turbo signer (e.g. `ArconnectSigner` /
   * `InjectedEthereumSigner`) used to build the authenticated client for the
   * Arweave / Ethereum (Model A) path. Ignored for Solana.
   */
  signer?: unknown;
  /**
   * Inject a pre-built authenticated client (used by tests). When omitted, one
   * is constructed from `walletAdapter`.
   */
  purchaseClient?: AuthenticatedArNSPurchaseClient;
  /**
   * Resume polling an already-submitted purchase (e.g. after a page reload)
   * instead of submitting a fresh one. The nonce is the server-side
   * idempotency key, so resuming never risks a double debit.
   */
  resumeNonce?: string;
  onStatus?: (status: ArNSSettlementStatus) => void;
  pollIntervalMs?: number;
  pollTimeoutMs?: number;
};

/**
 * Thrown when the bundler responds `402` — the wallet lacks the Turbo Credits
 * to cover the purchase. Deterministic (not retried); the UI should route to
 * the Top-Up flow rather than showing a generic error.
 */
export class InsufficientCreditsError extends Error {
  public readonly code = 'INSUFFICIENT_CREDITS' as const;
  constructor(message = 'Insufficient Turbo Credits for this purchase.') {
    super(message);
    this.name = 'InsufficientCreditsError';
  }
}

/** Thrown when the purchase terminally fails on-chain (`failedDate` set). */
export class ArNSPurchaseFailedError extends Error {
  public readonly code = 'ARNS_PURCHASE_FAILED' as const;
  constructor(
    message = 'The ArNS purchase failed to settle on-chain.',
    public readonly nonce?: string,
  ) {
    super(message);
    this.name = 'ArNSPurchaseFailedError';
  }
}

/**
 * Thrown when a claim/exit target is not a valid Solana pubkey. ANTs are Solana
 * assets, so the self-custody exit target MUST be a base58 Solana address that
 * decodes to 32 bytes — anything else is rejected client-side BEFORE a signature
 * is produced (a signed request for a junk target only wastes a single-use nonce).
 */
export class InvalidTransferTargetError extends Error {
  public readonly code = 'INVALID_TRANSFER_TARGET' as const;
  constructor(
    message = 'The transfer target must be a valid Solana wallet address.',
  ) {
    super(message);
    this.name = 'InvalidTransferTargetError';
  }
}

/**
 * Thrown when the bundler responds `404` to a custodial transfer — the caller
 * does not custody that ANT (or it does not exist). The bundler deliberately
 * conflates "not found" and "not yours" into one `404` so it never reveals that
 * an ANT exists under another owner; we surface a single non-leaky message.
 */
export class CustodialANTNotFoundError extends Error {
  public readonly code = 'CUSTODIAL_ANT_NOT_FOUND' as const;
  constructor(
    message = 'This name is not held in your Turbo custody, so it cannot be transferred from this account.',
  ) {
    super(message);
    this.name = 'CustodialANTNotFoundError';
  }
}

/** Thrown when the bundler rejects the action-bound signature (`401`). */
export class CustodyTransferUnauthorizedError extends Error {
  public readonly code = 'CUSTODY_TRANSFER_UNAUTHORIZED' as const;
  constructor(
    message = 'The transfer request could not be authenticated. Please reconnect your wallet and try again.',
  ) {
    super(message);
    this.name = 'CustodyTransferUnauthorizedError';
  }
}

/**
 * The subset of the turbo-sdk authenticated client used for the custodial
 * self-custody exit. Declared structurally so it can be injected in tests
 * without standing up the whole SDK.
 */
export interface AuthenticatedArNSCustodyClient {
  transferArNSAnt(params: { antId: string; target: string }): Promise<{
    antId: string;
    target: string;
    name?: string;
    /** Solana tx id of the on-chain transfer; `null` when thrown-but-landed. */
    messageId: string | null;
    /** `false` when the transfer landed on-chain but the confirm RPC failed. */
    confirmed?: boolean;
  }>;
}

/** Result of a successful custodial ANT transfer (self-custody exit). */
export type ArNSTransferResult = {
  antId: string;
  /** Solana pubkey that now owns the ANT. */
  target: string;
  name?: string;
  /** Solana tx id of the on-chain transfer; `null` when thrown-but-landed. */
  messageId: string | null;
  /** `false` when the transfer landed on-chain but the confirm RPC failed. */
  confirmed: boolean;
};

/**
 * The subset of the turbo-sdk authenticated client used to MANAGE a
 * custodially-held ArNS name's records with credits (Model A). Declared
 * structurally so it can be injected in tests without standing up the whole SDK.
 *
 * The concrete SDK client builds an ACTION-BOUND, single-use signed message for
 * each op (`set-record`/`remove-record` + antId + fields + a fresh nonce), so a
 * captured signature can't be replayed against a different ANT/undername. We
 * never hand-roll that message.
 */
export interface AuthenticatedArNSRecordClient {
  setArNSRecord(params: {
    antId: string;
    undername?: string;
    transactionId: string;
    ttlSeconds: number;
  }): Promise<{
    antId: string;
    undername: string;
    transactionId: string;
    ttlSeconds: number;
    messageId: string;
  }>;
  removeArNSRecord(params: { antId: string; undername: string }): Promise<{
    antId: string;
    undername: string;
    messageId: string;
  }>;
}

/** Result of a credit-paid custodial ArNS record set/remove. */
export type ArNSRecordResult = {
  antId: string;
  undername: string;
  /** Present for a set (omitted for a remove). */
  transactionId?: string;
  /** Present for a set (omitted for a remove). */
  ttlSeconds?: number;
  /** Solana tx id of the on-chain record write. */
  messageId: string;
};

export class TurboArNSClient {
  public readonly turboUploader;
  public readonly uploadUrl;
  public readonly paymentUrl;
  public readonly gatewayUrl;
  public readonly walletsUrl;
  private signer;
  public readonly walletAddress;
  public readonly stripe;

  public readonly ao;
  public readonly arioProcessId: string;
  constructor({
    uploadUrl = NETWORK_DEFAULTS.TURBO.UPLOAD_URL,
    paymentUrl = NETWORK_DEFAULTS.TURBO.PAYMENT_URL,
    gatewayUrl = NETWORK_DEFAULTS.TURBO.GATEWAY_URL,
    walletsUrl = NETWORK_DEFAULTS.TURBO.WALLETS_URL,
    signer,
    walletAddress,
    stripe,
    ao = connect(NETWORK_DEFAULTS.AO.ARIO),
  }: TurboArNSClientConfig) {
    this.uploadUrl = uploadUrl;
    this.paymentUrl = paymentUrl;
    this.gatewayUrl = gatewayUrl;
    this.walletsUrl = walletsUrl;
    this.signer = signer;
    this.walletAddress = walletAddress;
    this.stripe = stripe;
    this.ao = ao;
    this.turboUploader = TurboFactory.unauthenticated({
      paymentServiceConfig: {
        url: this.paymentUrl,
      },
      uploadServiceConfig: {
        url: this.uploadUrl,
      },
      gatewayUrl: this.gatewayUrl,
      token: isArweaveTransactionID(this.walletAddress)
        ? 'arweave'
        : isEthAddress(this.walletAddress ?? '')
          ? 'ethereum'
          : isValidSolanaAddress(this.walletAddress ?? '')
            ? 'solana'
            : undefined,
    });
    this.arioProcessId =
      this.paymentUrl === devPaymentServiceFqdn
        ? 'agYcCFJtrMG6cqMuZfskIkFTGvUPddICmtQSBIoPdiA'
        : '';
  }

  // TODO: add to turbo-sdk
  public async getTopupPaymentIntent({
    address,
    amount,
    token,
    promoCode,
  }: {
    address: string;
    amount: number;
    token: TokenType;
    promoCode?: string;
  }): Promise<{
    topUpQuote: { quotedPaymentAmount: number };
    paymentSession: PaymentIntent;
  }> {
    const url = `${this.paymentUrl}/v1/top-up/payment-intent/${address}/usd/${amount}`;

    const queryStringValues = {
      token,
      ...(promoCode && { promoCode }),
    };

    const queryString = `?${new URLSearchParams(queryStringValues).toString()}`;

    const res = await fetch(url.concat(queryString));

    if (res.status !== 200) {
      console.error(res);
      throw new Error('Error connecting to server. Please try again later.');
    }
    return res.json();
  }

  public async getArNSPaymentIntent({
    address,
    name,
    intent,
    increaseQty,
    type,
    years,
    processId,
    promoCode,
    currency = 'usd',
  }: {
    address?: string;
    name: string;
    intent: TurboArNSIntent;
    increaseQty?: number;
    type?: 'lease' | 'permabuy';
    years?: number;
    processId?: string;
    promoCode?: string;
    currency?: CurrencyMap['type'];
  }): Promise<TurboArNSPaymentIntentResponse<TurboArNSInteractionParams>> {
    const queryStringValues = Object.fromEntries(
      Object.entries({
        increaseQty,
        type,
        years,
        currency,
        promoCode,
        processId,
      })
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, value!.toString()]),
    );
    const url = `${
      this.paymentUrl
    }/v1/arns/quote/payment-intent/${address}/${currency}/${intent}/${lowerCaseDomain(
      name,
    )}?${new URLSearchParams(queryStringValues).toString()}`;

    const res = await fetch(url, {
      method: 'GET',
    });

    if (res.status !== 200) {
      console.error(res);
      throw new Error(`Error getting payment intent: ${res.statusText}`);
    }
    return res.json();
  }

  public async getPriceForArNSIntent({
    address,
    name,
    intent,
    increaseQty,
    type,
    years,
    currency = 'usd',
    promoCode,
  }: TurboArNSIntentPriceParams): Promise<TurboArNSIntentPriceResponse> {
    const queryStringValues = Object.fromEntries(
      Object.entries({
        increaseQty,
        type,
        years,
        currency,
        promoCode,
        userAddress: address,
      })
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, value!.toString()]),
    );
    const url = `${this.paymentUrl}/v1/arns/price/${intent}/${lowerCaseDomain(
      name,
    )}?${new URLSearchParams(queryStringValues).toString()}`;

    const res = await fetch(url, {
      method: 'GET',
    });

    if (res.status !== 200) {
      console.error(res);
      throw new Error(`Error getting ArNS intent price: ${res.statusText}`);
    }
    return res.json();
  }

  public async getIntentStatus(
    nonce: string,
  ): Promise<TurboArNSIntentStatusResponse<TurboArNSInteractionParams>> {
    const url = `${this.paymentUrl}/v1/arns/purchase/${nonce}`;
    const res = await fetch(url, {
      method: 'GET',
    });
    return res.json();
  }

  /**
   * Settle an ArNS purchase (buy / extend / increase-undernames / upgrade) by
   * debiting the connected wallet's Turbo Credit balance via the bundler
   * payment-service REST API (`POST /v1/arns/purchase/:intent/:name`), then
   * poll the status endpoint to a terminal state.
   *
   * This is the **credits** settlement path (Model B — the user owns the ANT,
   * whose `processId` is passed for `Buy-Name`). It replaces the dead
   * `@ar.io/sdk buyRecord({ fundFrom: 'turbo' })` alias, which never debited
   * credits (it paid ARIO straight from the wallet's token account).
   *
   * Resilience (see arns-spike RED_TEAM_REVIEW / UI_INTEGRATION_PLAN §3):
   * - The turbo-sdk purchase method mints a UUID nonce which is BOTH the
   *   idempotency key and the status key; we capture it immediately and never
   *   blind-re-call the mint method (that would risk a double debit). The SDK's
   *   own HTTP retry reuses the same signed nonce, so it is debit-safe.
   * - `resumeNonce` lets a page reload resume POLLING an already-submitted
   *   purchase instead of orphaning (or re-charging) it.
   * - A `402` maps to a typed {@link InsufficientCreditsError} so the caller can
   *   route to Top-Up rather than showing a generic failure.
   * - Polling tolerates transient network blips (non-terminal); only a
   *   `messageId` (success) or `failedDate` (failure) is terminal.
   */
  public async executeArNSIntent({
    intent,
    name,
    type,
    years,
    increaseQty,
    processId,
    paidBy,
    walletAdapter,
    tokenType,
    signer,
    purchaseClient,
    resumeNonce,
    onStatus,
    pollIntervalMs = 2500,
    pollTimeoutMs = 120_000,
  }: ExecuteArNSIntentParams): Promise<ArNSSettlementResult> {
    let nonce = resumeNonce;

    if (!nonce) {
      onStatus?.({ phase: 'submitting' });
      const client =
        purchaseClient ??
        this.buildAuthenticatedArNSClient({ walletAdapter, tokenType, signer });
      try {
        const result = await this.submitArNSPurchase(client, {
          intent,
          name,
          type,
          years,
          increaseQty,
          processId,
          paidBy,
          tokenType,
        });
        // Prefer the top-level nonce; fall back to the receipt's copy.
        nonce = result.nonce ?? result.purchaseReceipt?.nonce;
      } catch (error) {
        throw this.mapArNSPurchaseError(error);
      }
      if (!nonce) {
        throw new Error(
          'ArNS purchase did not return a nonce; cannot track settlement.',
        );
      }
      onStatus?.({ phase: 'submitted', nonce });
    } else {
      onStatus?.({ phase: 'resumed', nonce });
    }

    return this.pollArNSPurchaseToTerminal({
      nonce,
      name,
      onStatus,
      pollIntervalMs,
      pollTimeoutMs,
    });
  }

  /**
   * Build the authenticated turbo-sdk client that signs the request nonce for
   * the connected identity. Identity-agnostic:
   *
   * - **Solana (Model B)** — build from the wallet adapter (`window.solana`),
   *   mirroring the proven Solana authed pattern used for logo uploads
   *   (`useUploadArNSLogo`). The user's wallet owns the ANT.
   * - **Arweave / Ethereum (Model A — custodial)** — build from an
   *   arbundles-compatible `signer` (`ArconnectSigner` / `InjectedEthereumSigner`
   *   exposed by the wallet connector's `turboSigner`). The bundler custodies
   *   the ANT; only the buy params + custody UX differ, not this client.
   */
  private buildAuthenticatedArNSClient({
    walletAdapter,
    tokenType = 'solana',
    signer,
  }: {
    walletAdapter?: unknown;
    tokenType?: TokenType;
    signer?: unknown;
  }): AuthenticatedArNSPurchaseClient {
    return this.buildAuthenticatedTurboClient({
      walletAdapter,
      tokenType,
      signer,
    }) as unknown as AuthenticatedArNSPurchaseClient;
  }

  /**
   * Build the raw authenticated turbo-sdk client for the connected identity.
   * The concrete client exposes BOTH the credit-purchase methods and the
   * custodial ANT methods (`transferArNSAnt`, `setArNSRecord`, …); callers cast
   * it to the narrow interface they use. Identity handling is identical to the
   * purchase path — the same signer authenticates every credit-authed request.
   */
  private buildAuthenticatedTurboClient({
    walletAdapter,
    tokenType = 'solana',
    signer,
  }: {
    walletAdapter?: unknown;
    tokenType?: TokenType;
    signer?: unknown;
  }): unknown {
    if (tokenType === 'arweave' || tokenType === 'ethereum') {
      if (!signer) {
        throw new Error(
          `A connected ${tokenType} wallet signer is required to authenticate this request.`,
        );
      }
      return TurboFactory.authenticated({
        token: tokenType,
        signer: signer as any,
        paymentServiceConfig: {
          url: this.paymentUrl,
        },
      } as any);
    }

    // Solana (default): use the injected wallet adapter.
    const adapter =
      walletAdapter ??
      (typeof window !== 'undefined' ? (window as any).solana : undefined);
    if (!adapter) {
      throw new Error(
        'A connected Solana wallet is required to authenticate this request.',
      );
    }
    return TurboFactory.authenticated({
      walletAdapter: adapter,
      token: 'solana',
      paymentServiceConfig: {
        url: this.paymentUrl,
      },
    } as any);
  }

  /** Map an ArNS intent to the matching turbo-sdk per-intent purchase method. */
  private submitArNSPurchase(
    client: AuthenticatedArNSPurchaseClient,
    {
      intent,
      name,
      type,
      years,
      increaseQty,
      processId,
      paidBy,
      tokenType = 'solana',
    }: {
      intent: TurboArNSIntent;
      name: string;
      type?: 'lease' | 'permabuy';
      years?: number;
      increaseQty?: number;
      processId?: string;
      paidBy?: string[];
      tokenType?: TokenType;
    },
  ): Promise<ArNSPurchaseResult> {
    const domain = lowerCaseDomain(name);
    switch (intent) {
      case 'Buy-Name': {
        // Model B (Solana) MUST supply the client-spawned ANT's processId.
        // Model A (Arweave / Ethereum — custodial) OMITS it so the bundler
        // provisions + custodies the ANT server-side.
        if (tokenType === 'solana' && !processId) {
          throw new Error(
            'A processId (ANT) is required to buy an ArNS name with credits.',
          );
        }
        return client.buyArNSName({
          name: domain,
          type,
          years,
          // Only forward processId when present (Model B). Omitting it for
          // Model A triggers the bundler's custodial provisioning path.
          ...(processId ? { processId } : {}),
          paidBy,
        });
      }
      case 'Extend-Lease': {
        if (years === undefined) {
          throw new Error('years is required to extend an ArNS lease.');
        }
        return client.extendArNSLease({ name: domain, years, paidBy });
      }
      case 'Increase-Undername-Limit': {
        if (increaseQty === undefined) {
          throw new Error(
            'increaseQty is required to increase the undername limit.',
          );
        }
        return client.increaseArNSUndernameLimit({
          name: domain,
          increaseQty,
          paidBy,
        });
      }
      case 'Upgrade-Name':
        return client.upgradeArNSName({ name: domain, paidBy });
      default:
        throw new Error(
          `Unsupported ArNS intent for credit settlement: ${String(intent)}`,
        );
    }
  }

  /**
   * Poll `GET /v1/arns/purchase/:nonce` to a terminal state. `messageId` ⇒
   * success; `failedDate` ⇒ failure. Transient network errors are non-terminal.
   */
  private async pollArNSPurchaseToTerminal({
    nonce,
    name,
    onStatus,
    pollIntervalMs,
    pollTimeoutMs,
  }: {
    nonce: string;
    name: string;
    onStatus?: (status: ArNSSettlementStatus) => void;
    pollIntervalMs: number;
    pollTimeoutMs: number;
  }): Promise<ArNSSettlementResult> {
    const deadline = Date.now() + pollTimeoutMs;

    while (Date.now() < deadline) {
      onStatus?.({ phase: 'polling', nonce });
      let record: Record<string, any> | undefined;
      try {
        record = (await this.getIntentStatus(nonce)) as Record<string, any>;
      } catch {
        // Transient network/parse error — non-terminal, keep polling.
        record = undefined;
      }

      const messageId = record?.messageId as string | undefined;
      if (messageId) {
        onStatus?.({ phase: 'success', nonce, messageId });
        return { nonce, messageId, receipt: record ?? {} };
      }
      if (record?.failedDate) {
        throw new ArNSPurchaseFailedError(
          `The purchase of '${name}' failed to settle on-chain.`,
          nonce,
        );
      }

      await sleep(pollIntervalMs);
    }

    throw new Error(
      `Timed out waiting for the '${name}' purchase to settle (nonce ${nonce}). ` +
        'Your credits are safe; the purchase may still complete — check back shortly.',
    );
  }

  /**
   * Normalize a purchase error. A bundler `402` (surfaced by the turbo-sdk as a
   * `FailedRequestError` with `status === 402`, or a "(Status 402)" message)
   * becomes a typed {@link InsufficientCreditsError}.
   */
  private mapArNSPurchaseError(error: unknown): Error {
    const status = (error as { status?: number })?.status;
    const message = error instanceof Error ? error.message : String(error);
    if (status === 402 || /\(Status 402\)/.test(message)) {
      return new InsufficientCreditsError();
    }
    return error instanceof Error ? error : new Error(message);
  }

  public async getWincForToken(
    amount: number,
    tokenType: TokenType = 'arweave',
  ) {
    const turbo = TurboFactory.unauthenticated({
      paymentServiceConfig: {
        url: this.paymentUrl,
      },
      uploadServiceConfig: {
        url: this.uploadUrl,
      },
      token: tokenType,
    });

    return turbo.getWincForToken({ tokenAmount: amount });
  }

  public async getWincForFiat({
    amount,
    promoCode,
    destinationAddress,
  }: {
    amount: TwoDecimalCurrency;
    promoCode?: string;
    destinationAddress?: string;
  }): Promise<TurboWincForFiatResponse> {
    const url = `${this.paymentUrl}/v1/price/usd/${amount.amount}`;
    const queryString =
      promoCode && destinationAddress
        ? `?${new URLSearchParams({
            promoCode,
            destinationAddress,
          }).toString()}`
        : '';
    const response = await fetch(url.concat(queryString));

    if (response.status === 404) {
      return {
        winc: '0',
        adjustments: [],
        fees: [],
        actualPaymentAmount: 0,
        quotedPaymentAmount: 0,
      };
    }

    return response.json();
  }

  public getAmountByTokenType(amount: number, tokenType: TokenType) {
    switch (tokenType) {
      case 'arweave':
        return ARToTokenAmount(amount);
      case 'ario':
        return ARIOToTokenAmount(amount);
      case 'ethereum':
      case 'base-eth':
        return ETHToTokenAmount(amount);
      case 'pol':
        return POLToTokenAmount(amount);
      case 'usdc':
      case 'base-usdc':
      case 'polygon-usdc':
      case 'base-ario':
        // USDC and Base ARIO use 6 decimals
        return (amount * 1e6).toString();
      default:
        return undefined;
    }
  }

  public wincToCredits(winc: number) {
    return winc / 1_000_000_000_000;
  }

  /**
   * Claim / transfer a **custodially-held** ArNS name (Model A) out to a
   * wallet-controlled owner via the credit-authed bundler endpoint
   * `POST /v1/arns/transfer/:antId?target=<solanaPubkey>`.
   *
   * This is the self-custody escape hatch: the buyer's credit-identity signer
   * (solana / arweave / ethereum — whichever bought the name) authenticates an
   * **action-bound, single-use** request; the bundler confirms the caller
   * custodies the ANT, then Turbo (the on-chain owner) transfers it to `target`.
   * On success the bundler clears the `user_ant` custody mapping, so the name is
   * fully self-custodied.
   *
   * Security:
   * - `target` MUST be a valid Solana pubkey (ANTs are Solana assets). Validated
   *   BEFORE any signature is produced — a junk target never burns a nonce.
   * - The signed message is built by the SDK (`arns\ntransfer\n{antId}\n{target}`
   *   + a fresh nonce), so it is bound to this exact antId+target and cannot be
   *   replayed against a different ANT/recipient. We never hand-roll that string.
   * - The request is NOT retried on 5xx (single-use nonce). The bundler
   *   reconciles a "thrown-but-landed" transfer server-side.
   * - A `404` ("not found" == "not yours", deliberately conflated) maps to a
   *   typed {@link CustodialANTNotFoundError} so the UI never leaks another
   *   owner's name; a `401` maps to {@link CustodyTransferUnauthorizedError}.
   */
  public async transferCustodialArNSName({
    antId,
    target,
    tokenType,
    signer,
    walletAdapter,
    transferClient,
  }: {
    /** Custodial ANT id (Solana Metaplex Core asset) to move out of custody. */
    antId: string;
    /** Destination Solana pubkey that will own the ANT. */
    target: string;
    /** Connected wallet's token type (drives which authed client is built). */
    tokenType?: TokenType;
    /** arbundles-compatible turbo signer for arweave/ethereum identities. */
    signer?: unknown;
    /** Solana wallet adapter for the solana identity. */
    walletAdapter?: unknown;
    /** Inject a pre-built authenticated client (tests). */
    transferClient?: AuthenticatedArNSCustodyClient;
  }): Promise<ArNSTransferResult> {
    if (!antId) {
      throw new Error('An ANT id is required to transfer a custodial name.');
    }
    // Target MUST be a real Solana pubkey — reject malformed/empty up front,
    // before we ask the wallet to sign (a signed junk request wastes a nonce).
    if (!target || !isValidSolanaAddress(target)) {
      throw new InvalidTransferTargetError();
    }

    const client =
      transferClient ??
      (this.buildAuthenticatedTurboClient({
        walletAdapter,
        tokenType,
        signer,
      }) as AuthenticatedArNSCustodyClient);

    try {
      const result = await client.transferArNSAnt({ antId, target });
      return {
        antId: result.antId ?? antId,
        target: result.target ?? target,
        name: result.name,
        messageId: result.messageId ?? null,
        // The SDK types omit `confirmed`; the bundler returns it. Treat a
        // returned messageId as confirmed when the flag is absent.
        confirmed: result.confirmed ?? result.messageId != null,
      };
    } catch (error) {
      throw this.mapCustodyTransferError(error);
    }
  }

  /**
   * Normalize a custodial-transfer error. A bundler `404` (not-your-ANT) →
   * {@link CustodialANTNotFoundError}; a `401` (bad signature) →
   * {@link CustodyTransferUnauthorizedError}. Surfaced by the turbo-sdk as a
   * `FailedRequestError` carrying `.status` (and a "(Status NNN)" message).
   */
  private mapCustodyTransferError(error: unknown): Error {
    const status = (error as { status?: number })?.status;
    const message = error instanceof Error ? error.message : String(error);
    if (status === 404 || /\(Status 404\)/.test(message)) {
      return new CustodialANTNotFoundError();
    }
    if (status === 401 || /\(Status 401\)/.test(message)) {
      return new CustodyTransferUnauthorizedError();
    }
    return error instanceof Error ? error : new Error(message);
  }

  /**
   * Set an ArNS record (target `@` or an undername) on a **custodially-held**
   * (Model A) ANT by debiting the connected identity's Turbo Credits via the
   * bundler `POST /v1/arns/manage/:antId/set-record`.
   *
   * Distinct from the wallet-signed `dispatchANTInteraction` path (Model B): the
   * user does NOT own the ANT — Turbo does — so a wallet interaction physically
   * can't work. Instead the user's credit-identity signer authenticates an
   * ACTION-BOUND, single-use request (built by the SDK, bound to this exact
   * antId+op+fields) and the bundler, as the on-chain owner, writes the record.
   *
   * Security:
   * - The bundler authorizes against the `user_ant` custody mapping; a caller
   *   who doesn't custody the ANT gets a deliberately non-leaky `404`
   *   ({@link CustodialANTNotFoundError}) — we never reveal another owner's name.
   * - A `401` (bad signature) maps to {@link CustodyTransferUnauthorizedError}.
   */
  public async setCustodialArNSRecord({
    antId,
    undername = '@',
    transactionId,
    ttlSeconds,
    tokenType,
    signer,
    walletAdapter,
    recordClient,
  }: {
    antId: string;
    undername?: string;
    transactionId: string;
    ttlSeconds: number;
    tokenType?: TokenType;
    signer?: unknown;
    walletAdapter?: unknown;
    recordClient?: AuthenticatedArNSRecordClient;
  }): Promise<ArNSRecordResult> {
    if (!antId) {
      throw new Error('An ANT id is required to manage a custodial name.');
    }
    if (!transactionId) {
      throw new Error('A target transaction id is required to set a record.');
    }

    const client =
      recordClient ??
      (this.buildAuthenticatedTurboClient({
        walletAdapter,
        tokenType,
        signer,
      }) as AuthenticatedArNSRecordClient);

    try {
      const result = await client.setArNSRecord({
        antId,
        undername,
        transactionId,
        ttlSeconds,
      });
      return {
        antId: result.antId ?? antId,
        undername: result.undername ?? undername,
        transactionId: result.transactionId ?? transactionId,
        ttlSeconds: result.ttlSeconds ?? ttlSeconds,
        messageId: result.messageId,
      };
    } catch (error) {
      throw this.mapCustodyManageError(error);
    }
  }

  /**
   * Remove an undername record from a **custodially-held** (Model A) ANT by
   * debiting the connected identity's Turbo Credits via the bundler
   * `POST /v1/arns/manage/:antId/remove-record`. See {@link setCustodialArNSRecord}
   * for the identity/security model.
   */
  public async removeCustodialArNSRecord({
    antId,
    undername,
    tokenType,
    signer,
    walletAdapter,
    recordClient,
  }: {
    antId: string;
    undername: string;
    tokenType?: TokenType;
    signer?: unknown;
    walletAdapter?: unknown;
    recordClient?: AuthenticatedArNSRecordClient;
  }): Promise<ArNSRecordResult> {
    if (!antId) {
      throw new Error('An ANT id is required to manage a custodial name.');
    }
    if (!undername || undername === '@') {
      throw new Error('A non-apex undername is required to remove a record.');
    }

    const client =
      recordClient ??
      (this.buildAuthenticatedTurboClient({
        walletAdapter,
        tokenType,
        signer,
      }) as AuthenticatedArNSRecordClient);

    try {
      const result = await client.removeArNSRecord({ antId, undername });
      return {
        antId: result.antId ?? antId,
        undername: result.undername ?? undername,
        messageId: result.messageId,
      };
    } catch (error) {
      throw this.mapCustodyManageError(error);
    }
  }

  /**
   * Normalize a custodial-manage error. A bundler `404` (not-your-ANT, or the
   * ANT doesn't exist — deliberately conflated) → {@link CustodialANTNotFoundError}
   * with manage-appropriate copy; a `401` (bad signature) →
   * {@link CustodyTransferUnauthorizedError}.
   */
  private mapCustodyManageError(error: unknown): Error {
    const status = (error as { status?: number })?.status;
    const message = error instanceof Error ? error.message : String(error);
    if (status === 404 || /\(Status 404\)/.test(message)) {
      return new CustodialANTNotFoundError(
        'This name is not held in your Turbo custody, so its records cannot be managed from this account.',
      );
    }
    if (status === 401 || /\(Status 401\)/.test(message)) {
      return new CustodyTransferUnauthorizedError();
    }
    return error instanceof Error ? error : new Error(message);
  }
}
