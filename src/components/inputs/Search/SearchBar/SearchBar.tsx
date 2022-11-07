import { ReactComponent as SearchIcon } from '../../../icons/Search.svg';
import './styles.css';
import { SearchBarProps } from '../../../../types';
import React, { useState } from 'react';

function SearchBar(props: SearchBarProps) {
  const { predicate, placeholderText, headerElement, footerText } = props;

  const [isValid, setIsValid] = useState(false);
  const [searchBarText, setSearchBarText] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  function onHandleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value === '') {
      setSearchSubmitted(false);
      setSearchBarText('');
    }
  }

  function onSubmit(e: any) {
    setSearchBarText(e.target.value);
    setSearchSubmitted(true);
    const isAvailable = predicate(e.target.value);
    setIsValid(isAvailable);
  }

  return (
    <>
      <div>
        {React.cloneElement(headerElement, {
          ...props,
          text: searchBarText,
          isValid,
        })}
      </div>
      <div
        className="searchBar"
        style={
          !searchSubmitted
            ? { borderColor: '' }
            : isValid
            ? { borderColor: 'var(--success-green)' }
            : { borderColor: 'var(--error-red)' }
        }
      >
        <input
          type="text"
          placeholder={placeholderText}
          onChange={(e) => onHandleChange(e)}
          onKeyDown={(e) => e.key == 'Enter' && onSubmit(e)}
        />
        <button
          className="searchButton"
          onClick={(e) => {
            onSubmit(searchBarText);
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
