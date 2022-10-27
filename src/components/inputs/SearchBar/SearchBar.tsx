import searchIcon from '../../../assets/images/DarkMode/SearchIcon.png';

type searchBar = {
  searchButtonAction: any;
};

function SearchBar({ searchButtonAction }: searchBar) {
  return (
    <div className="searchBar">
      <input
        type="text"
        placeholder="click search button to toggle the search state"
      />
      <button
        className="searchButton"
        onClick={() => {
          searchButtonAction();
        }}
      >
        <img src={searchIcon} />
      </button>
    </div>
  );
}

export default SearchBar;
