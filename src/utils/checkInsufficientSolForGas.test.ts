import { checkInsufficientSolForGas } from './checkInsufficientSolForGas';

describe('checkInsufficientSolForGas', () => {
  const gas = 20_000_000; // ~0.02 SOL in lamports

  it('never blocks the card (fiat) path', () => {
    expect(
      checkInsufficientSolForGas({
        paymentMethod: 'card',
        isBaseTokenSelected: false,
        gasEstimateTotalLamports: gas,
        solBalanceLamports: 0,
      }),
    ).toBe(false);
  });

  it('never blocks a Base-token crypto top-up (gas paid on the EVM side)', () => {
    expect(
      checkInsufficientSolForGas({
        paymentMethod: 'crypto',
        isBaseTokenSelected: true,
        gasEstimateTotalLamports: gas,
        solBalanceLamports: 0,
      }),
    ).toBe(false);
  });

  it('blocks the crypto (ARIO) path when SOL < gas', () => {
    expect(
      checkInsufficientSolForGas({
        paymentMethod: 'crypto',
        isBaseTokenSelected: false,
        gasEstimateTotalLamports: gas,
        solBalanceLamports: gas - 1,
      }),
    ).toBe(true);
  });

  // The core money-safety fix: credits still need SOL for the client-side ANT
  // spawn, so the same gate must apply to the credits path.
  it('blocks the CREDITS path when the wallet has credits but < gas SOL', () => {
    expect(
      checkInsufficientSolForGas({
        paymentMethod: 'credits',
        isBaseTokenSelected: false,
        gasEstimateTotalLamports: gas,
        solBalanceLamports: 0,
      }),
    ).toBe(true);
  });

  it('allows the credits path when SOL covers the gas', () => {
    expect(
      checkInsufficientSolForGas({
        paymentMethod: 'credits',
        isBaseTokenSelected: false,
        gasEstimateTotalLamports: gas,
        solBalanceLamports: gas,
      }),
    ).toBe(false);
  });

  it('does not block while inputs are still loading (missing gas or balance)', () => {
    expect(
      checkInsufficientSolForGas({
        paymentMethod: 'credits',
        isBaseTokenSelected: false,
        gasEstimateTotalLamports: undefined,
        solBalanceLamports: 0,
      }),
    ).toBe(false);
    expect(
      checkInsufficientSolForGas({
        paymentMethod: 'credits',
        isBaseTokenSelected: false,
        gasEstimateTotalLamports: gas,
        solBalanceLamports: undefined,
      }),
    ).toBe(false);
  });
});
