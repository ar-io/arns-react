import React from 'react'
import {ReactComponent as SearchIcon} from '../../../../../assets/images/icons/Search.svg';
import './styles.css'
import {searchBar} from '../../../../services/types'

function SearchBarHome({ searchButtonAction }: searchBar) {
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
        <SearchIcon />
      </button>
    </div>
  );
}

export default SearchBarHome;