/**
 * Unit tests for the custodial claim/exit UX (`CustodialNameNotice`).
 *
 * Focus: the confirmation gate (a transfer can only fire with a valid Solana
 * target AND a deliberate confirmation) and that the wallet's credit-identity
 * is threaded to `transferCustodialArNSName`.
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

// CustodialNameNotice imports typed error classes from TurboArNSClient, which
// pulls the heavy (ESM) turbo-sdk / AO deps. Stub them for module load — the
// component only needs the exported error classes, not a live SDK. Mirrors the
// stubs in TurboArNSClient.test.ts.
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

import CustodialNameNotice from './CustodialNameNotice';

const transferCustodialArNSName = jest.fn();

jest.mock('@src/hooks/useTurboArNSClient', () => ({
  useTurboArNSClient: jest.fn(() => ({
    transferCustodialArNSName,
  })),
}));

jest.mock('@src/state', () => ({
  useWalletState: jest.fn(() => [
    {
      wallet: {
        tokenType: 'arweave',
        turboSigner: { sign: jest.fn() },
      },
    },
  ]),
}));

const ANT_ID = 'ANT-custodial-1';
const VALID_TARGET = '7T9x6CWBfdC8UUVsifNS3bWbroSvuFi7g8vebXHAxcxB';

describe('CustodialNameNotice (claim/exit)', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('opens the claim form and keeps the transfer button disabled until valid + confirmed', () => {
    render(<CustodialNameNotice antId={ANT_ID} name="mycoolname" />);

    fireEvent.click(screen.getByTestId('custodial-claim-open'));
    const submit = screen.getByTestId(
      'custodial-claim-submit',
    ) as HTMLButtonElement;

    // Nothing entered yet → disabled.
    expect(submit).toBeDisabled();

    // Valid target but not yet confirmed → still disabled.
    fireEvent.change(screen.getByTestId('custodial-claim-target'), {
      target: { value: VALID_TARGET },
    });
    expect(submit).toBeDisabled();

    // Confirm → enabled.
    fireEvent.click(screen.getByTestId('custodial-claim-confirm'));
    expect(submit).toBeEnabled();
  });

  it('flags a malformed Solana target and blocks the transfer', () => {
    render(<CustodialNameNotice antId={ANT_ID} name="mycoolname" />);
    fireEvent.click(screen.getByTestId('custodial-claim-open'));

    fireEvent.change(screen.getByTestId('custodial-claim-target'), {
      target: { value: 'not-a-real-address!!' },
    });
    fireEvent.click(screen.getByTestId('custodial-claim-confirm'));

    expect(
      screen.getByTestId('custodial-claim-invalid-target'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('custodial-claim-submit')).toBeDisabled();
    expect(transferCustodialArNSName).not.toHaveBeenCalled();
  });

  it('transfers with the wallet credit-identity on confirm, then shows success', async () => {
    transferCustodialArNSName.mockResolvedValueOnce({
      antId: ANT_ID,
      target: VALID_TARGET,
      name: 'mycoolname',
      messageId: 'tx-1',
      confirmed: true,
    });

    render(<CustodialNameNotice antId={ANT_ID} name="mycoolname" />);
    fireEvent.click(screen.getByTestId('custodial-claim-open'));
    fireEvent.change(screen.getByTestId('custodial-claim-target'), {
      target: { value: VALID_TARGET },
    });
    fireEvent.click(screen.getByTestId('custodial-claim-confirm'));
    fireEvent.click(screen.getByTestId('custodial-claim-submit'));

    expect(transferCustodialArNSName).toHaveBeenCalledWith(
      expect.objectContaining({
        antId: ANT_ID,
        target: VALID_TARGET,
        tokenType: 'arweave',
      }),
    );

    // Success state renders once the promise resolves.
    expect(
      await screen.findByTestId('custodial-name-notice-claimed'),
    ).toBeInTheDocument();
    expect(screen.getByText(VALID_TARGET)).toBeInTheDocument();
  });

  it('disables the open button when there is no known ANT id', () => {
    render(<CustodialNameNotice name="mycoolname" />);
    expect(screen.getByTestId('custodial-claim-open')).toBeDisabled();
  });
});
