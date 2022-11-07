import './styles.css';
import AntCard from '../AntCard/AntCard';

function SearchBarFooter({
  defaultText,
  isValid,
}: {
  defaultText: string;
  isValid?: boolean;
}): JSX.Element {
  return (
    <>
      {!isValid ? <div className="textFaded">{defaultText}</div> : <AntCard />}
    </>
  );
}
export default SearchBarFooter;
