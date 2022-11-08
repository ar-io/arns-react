import './styles.css';
import AntCard from '../../cards/AntCard/AntCard';
import { SearchBarFooterProps } from '../../../types';

function SearchBarFooter({
  defaultText,
  isValid,
}: SearchBarFooterProps): JSX.Element {
  return (
    <>
      {!isValid ? <div className="textFaded">{defaultText}</div> : <AntCard />}
    </>
  );
}
export default SearchBarFooter;
