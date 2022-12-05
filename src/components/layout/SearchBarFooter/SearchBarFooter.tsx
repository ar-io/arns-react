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
          <div className="text faded center">
            {!isSearchValid ? (
              <div className="errorContainer">
                <span className="illegalChar">{defaultText}</span>
              </div>
            ) : (
              defaultText
            )}
          </div>
        </>
      ) : isAvailable ? (
        <UpgradeTier />
      ) : (
        <AntCard domain={searchResult?.domain} id={searchResult?.id} />
      )}
    </>
  );
}
export default SearchBarFooter;
