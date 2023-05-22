import { SearchBarFooterProps } from '../../../types';
import PDNTCard from '../../cards/PDNTCard/PDNTCard';
import './styles.css';

function SearchBarFooter({
  defaultText,
  searchTerm,
  searchResult,
  isSearchValid,
  isAvailable,
}: SearchBarFooterProps): JSX.Element {
  return (
    <div className="flex flex-column" style={{ marginTop: 60 }}>
      {!isAvailable && searchResult && searchTerm ? (
        <>
          <span className="flex flex-row white text-medium flex-left">
            Ownership Details:
          </span>
          <PDNTCard
            domain={searchTerm}
            id={searchResult}
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
