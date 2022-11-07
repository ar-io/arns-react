import { SearchBarHeaderProps } from '../../../types';
import './styles.css';
function SearchBarHeader({isValid,name}:SearchBarHeaderProps): JSX.Element {
  return (
    <>
      {isValid == undefined || name == '' ? (
        <div className="sectionHeader">Find a domain name</div>
      ) : (
        <></>
      )}
      {isValid && name !== '' ? (
        <div className="sectionHeader">
          {name}<span className="available">is available!</span>
        </div>
      ) : (
        <></>
      )}
      {!isValid && name !== '' ? (
        <div className="sectionHeader">
          {name}
          <span className="unavailable">
            is already registered, try another name
          </span>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
export default SearchBarHeader;
