import { ArrowDownOutlined, CheckCircleFilled } from '@ant-design/icons';

import { SearchBarHeaderProps } from '../../../types';
import { decodeDomainToASCII } from '../../../utils';
import './styles.css';

function SearchBarHeader({
  defaultText,
  isAvailable,
  isDefault,
  text,
}: SearchBarHeaderProps): JSX.Element {
  return (
    <>
      {!text || isDefault ? (
        <div
          className="flex flex-column flex-center text-medium white"
          style={{ gap: '5px' }}
        >
          {defaultText} <ArrowDownOutlined />
        </div>
      ) : isAvailable ? (
        <span
          className="text-medium white center"
          style={{ fontWeight: 500, fontSize: 23 }}
        >
          <span style={{ color: 'var(--success-green)' }}>
            {decodeDomainToASCII(text)}
          </span>
          &nbsp;is available!&nbsp;
          <CheckCircleFilled
            style={{ fontSize: 20, color: 'var(--success-green)' }}
          />
        </span>
      ) : (
        <span
          className="text-medium white center"
          style={{ fontWeight: 500, fontSize: 23 }}
        >
          <span className="unavailable">{decodeDomainToASCII(text)}&nbsp;</span>
          is already registered. Try another name.
        </span>
      )}
    </>
  );
}
export default SearchBarHeader;
