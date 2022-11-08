import { ReactComponent as SearchIcon } from '../../../icons/Search.svg';
import './styles.css';
import { SearchBarProps } from '../../../../types';
import React, { useState } from 'react';

function SearchBar(props: SearchBarProps) {
  const { predicate, placeholderText, headerElement, footerElement } = props;

  const [isDefault, setIsDefault] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [searchBarText, setSearchBarText] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState('');

  function reset() {
    setSearchSubmitted(false);
    setSubmittedName('');
    setIsValid(false);
    setIsDefault(true);
    return;
  }

  function onHandleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchBarText(e.target.value.trim());
    if (e.target.value === '') {
      reset();
    }
  }

  function onSubmit(name: string) {
    setIsDefault(false);
    setSubmittedName(name);
    setSearchSubmitted(true);
    const isAvailable = predicate(name);
    setIsValid(isAvailable);
    if (!isAvailable) {
      setSearchBarText('');
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
          placeholder={isDefault ? placeholderText : 'try another name'}
          value={searchBarText}
          onChange={(e) => onHandleChange(e)}
          onKeyDown={(e) => e.key == 'Enter' && onSubmit(searchBarText)}
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
