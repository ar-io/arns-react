import { SearchBarFooterProps } from '../../../types';
import AntCard from '../../cards/AntCard/AntCard';
import './styles.css';
import './styles.css';

function SearchBarFooter({
  defaultText,
  searchResult,
}: SearchBarFooterProps): JSX.Element {
  return (
    <>
      {!searchResult?.id ? (
        <div className="textFaded">{defaultText}</div>
      ) : (
        <AntCard contract={searchResult} />
      )}
    </>
  );
}
export default SearchBarFooter;
