import { CSSProperties } from '@ant-design/cssinjs/lib/hooks/useStyleRegister';
import { Link } from 'react-router-dom';

import { ArweaveTransactionID } from '../../../types';
import { splitStringToCharCount } from '../../../utils';
import CopyTextButton from '../../inputs/buttons/CopyTextButton/CopyTextButton';

export enum ArweaveIdTypes {
  TRANSACTION = 'transaction',
  CONTRACT = 'contract',
  INTERACTION = 'interaction',
  ADDRESS = 'address',
}

export const ARWEAVE_ID_MAPPING = {
  [ArweaveIdTypes.TRANSACTION]: 'https://viewblock.io/arweave/tx/',
  [ArweaveIdTypes.CONTRACT]: 'https://sonar.warp.cc/#/app/contract/',
  [ArweaveIdTypes.INTERACTION]: 'https://sonar.warp.cc/#/app/interaction/',
  [ArweaveIdTypes.ADDRESS]: 'https://viewblock.io/arweave/address/',
};

function ArweaveID({
  id,
  type = ArweaveIdTypes.TRANSACTION,
  characterCount,
  shouldLink = false,
  copyButtonStyle,
  wrapperStyle,
}: {
  id: ArweaveTransactionID;
  type?: ArweaveIdTypes;
  characterCount?: number;
  shouldLink?: boolean;
  copyButtonStyle?: CSSProperties;
  wrapperStyle?: CSSProperties;
}) {
  return (
    <>
      <CopyTextButton
        copyText={id.toString()}
        body={
          shouldLink ? (
            <Link
              to={ARWEAVE_ID_MAPPING[type] + id.toString()}
              target="_blank"
              rel="noreferrer"
              className="link hover"
              style={{ color: 'var(--text-link)' }}
            >
              {splitStringToCharCount(id.toString(), characterCount)}
            </Link>
          ) : (
            splitStringToCharCount(id.toString(), characterCount)
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
