import { SearchBarFooterProps } from '../../../types';
import { encodeDomainToASCII } from '../../../utils';
import { RESERVED_NAME_LENGTH } from '../../../utils/constants';
import PDNTCard from '../../cards/PDNTCard/PDNTCard';
import EmailNotificationCard from '../EmailNotificationCard/EmailNotificationCard';
import './styles.css';

function SearchBarFooter({
  searchTerm,
  searchResult,
  isAvailable,
  reservedList,
}: SearchBarFooterProps): JSX.Element {
  if (
    (searchTerm && reservedList.includes(encodeDomainToASCII(searchTerm))) ||
    (searchTerm &&
      encodeDomainToASCII(searchTerm).length <= RESERVED_NAME_LENGTH)
  ) {
    return (
      <div className="flex flex-row" style={{ marginTop: '30px' }}>
        <EmailNotificationCard />
      </div>
    );
  }
  return (
    <div className="flex flex-column" style={{ marginTop: 30 }}>
      {!isAvailable && searchResult && searchTerm ? (
        <>
          <span className="flex flex-row white text-medium flex-left">
            Ownership Details:
          </span>
          <PDNTCard
            domain={searchTerm}
            contractTxId={searchResult}
            compact={true}
            enableActions={true}
          />
        </>
      ) : (
        <></>
      )}
    </div>
  );
}
export default SearchBarFooter;
