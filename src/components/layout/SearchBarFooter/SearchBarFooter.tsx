import { SearchBarFooterProps } from '../../../types';
import AntCard from '../../cards/AntCard/AntCard';
import UpgradeTier from '../UpgradeTier/UpgradeTier';
import './styles.css';

function SearchBarFooter({
  defaultText,
  searchResult,
  isSearchValid,
  isAvailable,
}: SearchBarFooterProps): JSX.Element {
  return (
    <>
      {!searchResult?.domain ? (
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
      ) : isAvailable ? (
        <UpgradeTier />
      ) : (
        <AntCard
          domain={searchResult?.domain}
          id={searchResult?.id}
          compact={true}
        />
      )}
    </>
  );
}
export default SearchBarFooter;
