import { ArweaveTransactionID } from '@src/services/arweave/ArweaveTransactionID';
import { SolanaAddress } from '@src/services/solana/SolanaAddress';
import { SolanaSignature } from '@src/services/solana/SolanaSignature';
import { AoAddress } from '@src/types';
import { CSSProperties } from 'react';

import { formatForMaxCharCount } from '../../../utils';
import CopyTextButton from '../../inputs/buttons/CopyTextButton/CopyTextButton';

export enum ArweaveIdTypes {
  TRANSACTION = 'transaction',
  CONTRACT = 'contract',
  INTERACTION = 'interaction',
  ADDRESS = 'address',
}

export const ARWEAVE_ID_MAPPING = {
  [ArweaveIdTypes.TRANSACTION]: 'https://viewblock.io/arweave/tx/',
  [ArweaveIdTypes.CONTRACT]: 'https://scan.ar.io/#/entity/',
  [ArweaveIdTypes.INTERACTION]: 'https://scan.ar.io/#/message/',
  [ArweaveIdTypes.ADDRESS]: 'https://viewblock.io/arweave/address/',
};

// Solana explorer routes. `INTERACTION` and `TRANSACTION` are signatures
// (`/tx/`); `CONTRACT` and `ADDRESS` are account pubkeys (`/address/`).
// We use the public mainnet explorer; cluster query string is only needed
// for devnet/testnet so we omit it for production.
export const SOLANA_ID_MAPPING = {
  [ArweaveIdTypes.TRANSACTION]: 'https://explorer.solana.com/tx/',
  [ArweaveIdTypes.CONTRACT]: 'https://explorer.solana.com/address/',
  [ArweaveIdTypes.INTERACTION]: 'https://explorer.solana.com/tx/',
  [ArweaveIdTypes.ADDRESS]: 'https://explorer.solana.com/address/',
};

/**
 * Decide which explorer to link to based on the wrapped id type. Typed
 * wrappers are unambiguous; raw strings fall back to a length heuristic
 * (43 chars → Arweave, anything else → Solana). Call sites should prefer
 * the typed wrappers so the routing is explicit.
 */
function resolveExplorerBase(id: AoAddress, type: ArweaveIdTypes): string {
  if (id instanceof SolanaAddress || id instanceof SolanaSignature) {
    return SOLANA_ID_MAPPING[type];
  }
  if (id instanceof ArweaveTransactionID) {
    return ARWEAVE_ID_MAPPING[type];
  }
  // Raw-string fallback. Arweave tx ids are exactly 43 chars; everything
  // else (Solana address 32–44 base58, Solana signature 64–88 base58) is
  // assumed Solana.
  const s = id.toString();
  if (s.length === 43) return ARWEAVE_ID_MAPPING[type];
  return SOLANA_ID_MAPPING[type];
}

function ArweaveID({
  id,
  type = ArweaveIdTypes.TRANSACTION,
  characterCount,
  shouldLink = false,
  copyButtonStyle,
  wrapperStyle,
  linkStyle,
}: {
  id: AoAddress;
  type?: ArweaveIdTypes;
  characterCount?: number;
  shouldLink?: boolean;
  copyButtonStyle?: CSSProperties;
  wrapperStyle?: CSSProperties;
  linkStyle?: CSSProperties;
}) {
  return (
    <>
      <CopyTextButton
        copyText={id.toString()}
        body={
          shouldLink ? (
            <a
              href={resolveExplorerBase(id, type) + id.toString()}
              target="_blank"
              rel="noreferrer"
              className="link hover flex"
              style={linkStyle}
            >
              {formatForMaxCharCount(id.toString(), characterCount)}
            </a>
          ) : (
            formatForMaxCharCount(id.toString(), characterCount)
          )
        }
        size={'13px'}
        wrapperStyle={{
          fill: 'var(--text-grey)',
          color: 'inherit',
          position: 'static',
          alignItems: 'center',
          ...wrapperStyle,
        }}
        copyButtonStyle={copyButtonStyle}
      />
    </>
  );
}

export default ArweaveID;
