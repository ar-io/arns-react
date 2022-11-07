import { ReactComponent as SearchIcon } from '../../../icons/Search.svg';
import './styles.css';
import { SearchBarProps } from '../../../../types';
import React, { useState } from 'react';

function SearchBar(props: SearchBarProps) {
  const {
    buttonAction,
    placeholderText,
    headerElement,
    footerText,
    availability,
  } = props;

  const [searchBarText, setSearchBarText] = useState('');

  function onHandleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchBarText(e.target.value);
    if (e.target.value == '') {
      buttonAction(e.target.value);
    }
  }

  return (
    <>
      {headerElement}
      <div
        className="searchBar"
        style={
          availability === 'available'
            ? { borderColor: 'var(--success-green)' }
            : availability === 'unavailable'
            ? { borderColor: 'var(--error-red)' }
            : availability === 'search'
            ? { borderColor: '' }
            : {}
        }
      >
        <input
          type="text"
          placeholder={placeholderText}
          onChange={(e) => onHandleChange(e)}
          onKeyDown={(e) => e.key == 'Enter' && buttonAction(searchBarText)}
        />
        <button
          className="searchButton"
          onClick={() => {
            buttonAction(searchBarText);
          }}
        >
          <SearchIcon
            fill="#121212"
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
