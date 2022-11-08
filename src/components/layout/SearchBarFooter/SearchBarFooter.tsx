import './styles.css';
import AntCard from '../../cards/AntCard/AntCard';
import { SearchBarFooterProps } from '../../../types';

function SearchBarFooter({
  defaultText,
  isValid,
}: SearchBarFooterProps): JSX.Element {
  return (
    <>
      {!isValid ? <div className="textFaded">{defaultText}</div> : <AntCard contractId="Bmd3dbeMD5oxLxgMJuoxd5Ihi1qnNI6Ici8-24gN-Vw" />}
    </>
  );
}
export default SearchBarFooter;
