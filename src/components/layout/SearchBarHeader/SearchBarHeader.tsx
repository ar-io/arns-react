import { ArrowDownOutlined, CheckCircleFilled } from '@ant-design/icons';

import { SearchBarHeaderProps } from '../../../types';
import { RESERVED_NAME_LENGTH } from '../../../utils/constants';
import './styles.css';

function SearchBarHeader({
  defaultText,
  isAvailable,
  text,
  reservedList,
}: SearchBarHeaderProps): JSX.Element {
  // unavailable condition
  if (text && !isAvailable) {
    return (
      <span
        className="text-medium white center"
        style={{ fontWeight: 500, fontSize: 23 }}
      >
        <span className="unavailable">{text}&nbsp;</span>
        is already registered, try another name
      </span>
    );
  }

  // reserved condition
  if (
    (text && reservedList.includes(text)) ||
    (text && text.length <= RESERVED_NAME_LENGTH)
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
