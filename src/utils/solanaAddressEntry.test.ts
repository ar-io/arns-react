import {
  ARNS_TX_ID_ENTRY_REGEX,
  SOLANA_ADDRESS_ENTRY_REGEX,
  SOLANA_ADDRESS_MAX_LENGTH,
} from './constants';

/**
 * Regression coverage for the ANT address inputs.
 *
 * A 32-byte Solana pubkey base58-encodes to 43 or 44 characters, and the
 * large majority land on 44. The "bring your own ANT" inputs previously
 * validated against Arweave's fixed 43-character transaction ID length, so
 * most pasted addresses were rejected — silently, because `ValidationInput`
 * drops input that fails `customPattern` without surfacing an error.
 */

/** Real-world shaped Solana pubkeys (base58, 32 bytes). */
const SOLANA_ADDRESS_44 = 'SysvarC1ock11111111111111111111111111111111';
const TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
const MPL_CORE = 'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d';

describe('SOLANA_ADDRESS_ENTRY_REGEX', () => {
  it('accepts the full 32-44 character base58 range', () => {
    expect(SOLANA_ADDRESS_MAX_LENGTH).toBe(44);

    const fortyFour = 'A'.repeat(44);
    expect(fortyFour).toHaveLength(44);
    expect(SOLANA_ADDRESS_ENTRY_REGEX.test(fortyFour)).toBe(true);

    const fortyThree = 'A'.repeat(43);
    expect(SOLANA_ADDRESS_ENTRY_REGEX.test(fortyThree)).toBe(true);

    const thirtyTwo = 'A'.repeat(32);
    expect(SOLANA_ADDRESS_ENTRY_REGEX.test(thirtyTwo)).toBe(true);
  });

  it('accepts realistic Solana program and mint addresses', () => {
    for (const address of [SOLANA_ADDRESS_44, TOKEN_PROGRAM, MPL_CORE]) {
      expect(SOLANA_ADDRESS_ENTRY_REGEX.test(address)).toBe(true);
    }
  });

  it('permits partial entry so a value can be typed one character at a time', () => {
    const address = TOKEN_PROGRAM;
    for (let i = 1; i <= address.length; i++) {
      expect(SOLANA_ADDRESS_ENTRY_REGEX.test(address.slice(0, i))).toBe(true);
    }
  });

  it('rejects input beyond 44 characters', () => {
    expect(SOLANA_ADDRESS_ENTRY_REGEX.test('A'.repeat(45))).toBe(false);
  });

  it('rejects characters outside the base58 alphabet', () => {
    // Base58 omits 0, O, I and l to avoid visual ambiguity.
    for (const excluded of ['0', 'O', 'I', 'l']) {
      expect(
        SOLANA_ADDRESS_ENTRY_REGEX.test(`${'A'.repeat(31)}${excluded}`),
      ).toBe(false);
    }
    expect(SOLANA_ADDRESS_ENTRY_REGEX.test('')).toBe(false);
  });

  it('regression: the Arweave entry pattern rejects 44-character addresses', () => {
    // This is the bug. ARNS_TX_ID_ENTRY_REGEX caps entry at 43 characters,
    // so guarding a Solana address input with it discarded most pastes.
    const fortyFour = 'A'.repeat(44);
    expect(ARNS_TX_ID_ENTRY_REGEX.test(fortyFour)).toBe(false);
    expect(SOLANA_ADDRESS_ENTRY_REGEX.test(fortyFour)).toBe(true);
  });
});
