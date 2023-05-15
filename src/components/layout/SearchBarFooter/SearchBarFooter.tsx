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
    <>
      <>
        <div
          className="text faded center"
          style={{ width: '75%', maxWidth: '475px' }}
        >
          {!isSearchValid ? (
            <div className="error-container">
              <span className="illegal-char">{defaultText}</span>
            </div>
          ) : (
            defaultText
          )}
        </div>
      </>
      {!isAvailable && searchResult && searchTerm ? (
        <PDNTCard
          domain={searchTerm}
          id={searchResult}
          compact={true}
          enableActions={true}
        />
      ) : (
        <></>
      )}
    </>
  );
}
export default SearchBarFooter;
