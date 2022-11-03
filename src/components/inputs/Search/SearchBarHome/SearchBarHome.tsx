import { ReactComponent as SearchIcon } from '../../../../../assets/images/icons/Search.svg';
import './styles.css';
import { searchBar } from '../../../../services/types';

function SearchBarHome({ searchButtonAction }: searchBar) {
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

export default SearchBarHome;
