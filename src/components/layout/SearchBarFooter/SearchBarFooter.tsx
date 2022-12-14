import { SearchBarFooterProps } from '../../../types';
import AntCard from '../../cards/AntCard/AntCard';
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
      ) : !isAvailable && searchResult && searchTerm ? (
        <AntCard
          domain={searchTerm}
          id={searchResult}
          compact={true}
          enableActions={true}
        />
      ) : (
        <UpgradeTier />
      )}
    </>
  );
}
export default SearchBarFooter;
