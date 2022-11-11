import './styles.css';
import AntCard from '../../cards/AntCard/AntCard';
import { SearchBarFooterProps } from '../../../types';

function SearchBarFooter({
  defaultText,
  searchResult,
  isSearchValid,
}: SearchBarFooterProps): JSX.Element {
  return (
    <>
      {!searchResult?.id ? (
        <div className="text faded">
          {!isSearchValid ? (
            <div className="errorContainer">
              <span className="illegalChar">{defaultText}</span>
            </div>
          ) : (
            defaultText
          )}
        </div>
      ) : (
        <AntCard contract={searchResult} />
      )}
    </>
  );
}
export default SearchBarFooter;
