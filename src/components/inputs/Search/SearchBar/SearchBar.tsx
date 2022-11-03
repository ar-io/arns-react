import { ReactComponent as SearchIcon } from '../../../icons/Search.svg';
import './styles.css';
import { searchBar } from '../../../../types';

function SearchBar({ searchButtonAction }: searchBar) {
  return (
    <div className="searchBar">
      <input type="text" placeholder="sam" />
      <button
        className="searchButton"
        onClick={() => {
          searchButtonAction();
        }}
      >
        <SearchIcon fill="black" stroke="white" width="18.51" />
      </button>
    </div>
  );
}

export default SearchBar;
