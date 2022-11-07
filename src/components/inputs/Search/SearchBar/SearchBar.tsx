import { ReactComponent as SearchIcon } from '../../../icons/Search.svg';
import './styles.css';
import { SearchBarProps } from '../../../../types';
import React, { useEffect, useState } from 'react';

function SearchBar(props: SearchBarProps) {
  
  const {
    buttonAction,
    placeholderText,
    headerElement,
    footerText
  } = props;

  
  const [searchBarText, setSearchBarText] = useState('');
  const [isValid, setIsValid] = useState<Boolean | undefined>(undefined);

 

  function onHandleChange(name:string) {
    setSearchBarText(name);
  }

  return (
    <>
      {headerElement}
      <div
        className="searchBar"
        style={
          isValid
            ? { borderColor: 'var(--success-green)' }
            : isValid === false
            ? { borderColor: 'var(--error-red)' }
            : isValid === undefined
            ? { borderColor: '' }
            : {}
        }
      >
        <input
          type="text"
          placeholder={placeholderText}
          value={searchBarText}
          onChange={(e) => onHandleChange(e.target.value)}
          onKeyDown={
            (e) => {
              if ( e.key == 'Enter'){
              setIsValid(buttonAction(searchBarText))
            }
            if ( e.key == 'Backspace'){
             onHandleChange(""); setIsValid(undefined)
            }
            }          
          }
        />
        <button
          className="searchButton"
          onClick={() => {
            setIsValid(buttonAction(searchBarText));
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
