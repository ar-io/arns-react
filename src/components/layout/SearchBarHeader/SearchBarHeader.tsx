import { ArrowDownOutlined, CheckCircleFilled } from '@ant-design/icons';

import { SearchBarHeaderProps } from '../../../types';
import { encodeDomainToASCII, isDomainReservedLength } from '../../../utils';
import { RESERVED_NAME_LENGTH } from '../../../utils/constants';
import './styles.css';

function SearchBarHeader({
  defaultText,
  isAvailable,
  text,
  reservedList,
}: SearchBarHeaderProps): JSX.Element {
  // reserved condition
  if (
    (text && reservedList.includes(encodeDomainToASCII(text))) ||
    (text && isDomainReservedLength(text))
  ) {
    return (
      <span
        className="text-medium white center"
        style={{ fontWeight: 500, fontSize: 23 }}
      >
        <span className="reserved">{text}&nbsp;</span>
        is currently reserved.
      </span>
    );
  }
  // unavailable condition
  if (text && !isAvailable) {
    return (
      <span
        className="text-medium white center"
        style={{ fontWeight: 500, fontSize: 23 }}
      >
        <span className="unavailable">{text}&nbsp;</span>
        is already registered. Try another name.
      </span>
    );
  }

  // available condition
  if (text && isAvailable) {
    return (
      <span
        className="text-medium white center"
        style={{ fontWeight: 500, fontSize: 23 }}
      >
        <span style={{ color: 'var(--success-green)' }}>{text}</span>&nbsp;is
        available!&nbsp;
        <CheckCircleFilled
          style={{ fontSize: 20, color: 'var(--success-green)' }}
        />
      </span>
    );
  }

  // default search state

  return (
    <div
      className="flex flex-column flex-center text-medium white"
      style={{ gap: '5px' }}
    >
      {defaultText} <ArrowDownOutlined />
    </div>
  );
}
export default SearchBarHeader;
