import { SearchBarFooterProps } from '../../../types';
import PDNTCard from '../../cards/PDNTCard/PDNTCard';
import UpgradeTier from '../UpgradeTier/UpgradeTier';
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
      {!searchTerm ? (
        <>
          <div className="text faded center" style={{ width: '100%' }}>
            {!isSearchValid ? (
              <div className="error-container">
                <span className="illegal-char">{defaultText}</span>
              </div>
            ) : (
              defaultText
            )}
          </div>
        </>
      ) : !isAvailable && searchResult && searchTerm ? (
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
        <UpgradeTier />
      )}
    </>
  );
}
export default SearchBarFooter;
