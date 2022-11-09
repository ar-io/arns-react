import './styles.css';
import AntCard from '../../cards/AntCard/AntCard';
import { SearchBarFooterProps } from '../../../types';

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
