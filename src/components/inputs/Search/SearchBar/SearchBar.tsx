import { ReactComponent as SearchIcon } from '../../../icons/Search.svg';
import './styles.css';
import { SearchBarProps } from '../../../../types';
import React, { useState } from 'react';

function SearchBar(props: SearchBarProps) {
  const { predicate, placeholderText, headerElement, footerElement, values } =
    props;

  const [isDefault, setIsDefault] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [searchBarText, setSearchBarText] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState('');
  const [searchResult, setSearchResult] = useState('');

  function reset() {
    setSearchSubmitted(false);
    setSubmittedName('');
    setIsValid(false);
    setIsDefault(true);
    setSearchResult('');
    return;
  }

  function onHandleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchBarText(e.target.value);
    if (e.target.value === '') {
      reset();
    }
  }

  function onSubmit(name: string) {
    if (name.length < 1 || name.length > 32) {
    return;
    } else {
      setIsDefault(false);
      setSubmittedName(name);
      setSearchSubmitted(true);
      const isAvailable = predicate(name);
      setIsValid(isAvailable);
      if (!isAvailable) {
        setSearchResult(values[name]);
        setSearchBarText('');
      } else {
        setSearchResult('');
      }
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
          onClick={() => {
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
        searchResult: submittedName
          ? { id: searchResult, domain: submittedName }
          : undefined,
      })}
    </>
  );
}

export default SearchBar;
