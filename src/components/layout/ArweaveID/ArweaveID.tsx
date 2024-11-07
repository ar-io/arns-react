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
  [ArweaveIdTypes.CONTRACT]: 'https://www.ao.link/#/entity/',
  [ArweaveIdTypes.INTERACTION]: 'https://www.ao.link/#/message/',
  [ArweaveIdTypes.ADDRESS]: 'https://viewblock.io/arweave/address/',
};

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
              href={ARWEAVE_ID_MAPPING[type] + id.toString()}
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
