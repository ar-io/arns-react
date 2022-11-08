import { ReactComponent as SearchIcon } from '../../../icons/Search.svg';
import './styles.css';
import { SearchBarProps } from '../../../../types';
import React, { useEffect, useState } from 'react';

function SearchBar(props: SearchBarProps) {
  const { predicate, placeholderText, headerElement, footerElement } = props;

  const [isDefault, setIsDefault] = useState(true)
  const [isValid, setIsValid] = useState(false);
  const [searchBarText, setSearchBarText] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState('')


  function onHandleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchBarText(e.target.value);
    if (e.target.value === '') {
      setSearchSubmitted(false);
      setSubmittedName("")
      setIsValid(false);
      setIsDefault(true)
    }
  }

  function onSubmit(e: any) {
    setIsDefault(false)
    setSubmittedName(e.target.value);
    setSearchSubmitted(true);
    const isAvailable = predicate(e.target.value);
    setIsValid(isAvailable);
    if (!isAvailable) {
      setSearchBarText("")
    }
  }

  return (
    <>
      {React.cloneElement(headerElement, {
        ...props,
        text: submittedName,
        isValid,
      })}
      <div
        className="searchBar"
        style={
          !searchSubmitted || isDefault
            ? { borderColor: '' }
            : isValid
            ? { borderColor: 'var(--success-green)' }
            : { borderColor: 'var(--error-red)' }
        }
      >
        <input
          type="text"
          placeholder={
          isDefault ? placeholderText : "try another name"
          }
          value={searchBarText}
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
      {React.cloneElement(footerElement, {
        ...props,
        isValid: isValid || searchSubmitted, // TODO: show the ANT detail if name is taken, show purchase options/component if it's available
        text: submittedName,
      })}
    </>
  );
}

export default SearchBar;
