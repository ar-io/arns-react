import { ReactComponent as SearchIcon } from '../../../icons/Search.svg';
import { ReactComponent as ArrowUpRight } from '../../../icons/ArrowUpRight.svg';
import './styles.css';
import { SearchBarProps } from '../../../../types';

function SearchBar(props: SearchBarProps) {
  const { buttonAction, placeholderText, headerText, footerText } = props;

  return (
    <>
      <div className="sectionHeader">{headerText}</div>
      <div className="searchBar">
        <input type="text" placeholder={placeholderText} />
        <button
          className="searchButton"
          onClick={() => {
            buttonAction();
          }}
        >
          <SearchIcon
            fill="black"
            stroke="white"
            width="18.51"
            height="18.51"
          />
        </button>
      </div>
      <div className="textFaded">{footerText}</div>
    </>
  );
}

export default SearchBar;
