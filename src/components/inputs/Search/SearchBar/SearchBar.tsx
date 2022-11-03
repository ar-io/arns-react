import { ReactComponent as SearchIcon } from '../../../icons/Search.svg';
import { ReactComponent as ArrowUpRight } from '../../../icons/ArrowUpRight.svg';
import { useState, useEffect } from 'react';
import './styles.css';
import { SearchBarProps } from '../../../../types';

function SearchBar(props: SearchBarProps) {
  const {
    buttonAction,
    searchBarState,
    searchState,
    onChangeHandler,
    placeholderText,
    headerText,
    footerText,
  } = props;

  return (
    <>
      <div>{headerText}</div>
      <div className="searchBar">
        <input
          type="text"
          placeholder={placeholderText}
          onChange={(e) => {
            onChangeHandler(e.target.value);
          }}
        />
        <button
          className="searchButton"
          onClick={() => {
            buttonAction();
          }}
        >
          <SearchIcon fill="black" stroke="white" width="18.51" height="18.51" />
        </button>
      </div>
      <div>{footerText}</div>
    </>
  );
}

export default SearchBar;
