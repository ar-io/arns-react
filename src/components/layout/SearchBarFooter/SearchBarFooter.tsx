import './styles.css';
import AntCard from '../../cards/AntCard/AntCard';
import { SearchBarFooterProps } from '../../../types';

function SearchBarFooter({
  defaultText,
  searchResult,
  isValid
}: SearchBarFooterProps): JSX.Element {
  return (
    <>
      {!searchResult?.id ? (<div className='text faded'>
           {!isValid ? (
            <div className="errorContainer">
              <span className="illegalChar">
                {defaultText}
              </span>
            </div>
          ) : (
            defaultText
          )}</div>
      ) : (
        <AntCard contract={searchResult} />
      )}
    </>
  );
}
export default SearchBarFooter;
