import React, { useState } from 'react';
import { SearchIcon } from '../../../icons';
import { SearchBarProps } from '../../../../types';
import './styles.css';

function SearchBar(props: SearchBarProps) {
  const {
    successPredicate,
    validationPredicate,
    placeholderText,
    headerElement,
    footerElement,
    values,
  } = props;

  const [isSearchValid, setIsSearchValid] = useState(true);
  const [showDefaultText, setShowDefaultText] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [searchBarText, setSearchBarText] = useState<string | undefined>();
  const [submittedName, setSubmittedName] = useState<string | undefined>();
  const [searchResult, setSearchResult] = useState<string | undefined>();

  function reset() {
    setSearchSubmitted(false);
    setSubmittedName(undefined);
    setIsSearchValid(true);
    setShowDefaultText(true);
    setSearchResult(undefined);
    setSearchBarText(undefined);
    return;
  }

  function onHandleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target.value.trim().toLowerCase();
    if (input === '') {
      reset();
      return;
    }

    // partially reset
    setSearchResult(undefined);
    setShowDefaultText(true);
    setSubmittedName(undefined);

    const searchValid = validationPredicate(input);
    setIsSearchValid(searchValid);
    if (!searchValid) {
      return;
    }

    // valid name
    setSearchBarText(input);
  }

  function onSubmit(e: any) {
    e.preventDefault();

    // validate again, just in case
    const searchValid = validationPredicate(searchBarText);
    setIsSearchValid(searchValid);
    if (!searchValid) {
      return;
    }

    // show updated states based on search result
    const name = searchBarText!;
    const searchSuccess = successPredicate(name);
    setShowDefaultText(false);
    setSubmittedName(name);
    setSearchSubmitted(true);
    setIsAvailable(searchSuccess);
    setSearchResult(undefined);
    if (!searchSuccess) {
      setSearchResult(values[name]);
      return;
    }
  }

  return (
    <>
      {React.cloneElement(headerElement, {
        ...props,
        text: submittedName,
        isAvailable,
      })}
      <div
        className="searchBar"
        style={
          isSearchValid
            ? !searchSubmitted || showDefaultText
              ? { borderColor: '' }
              : isAvailable
              ? { borderColor: 'var(--success-green)' }
              : { borderColor: 'var(--error-red)' }
            : { borderColor: 'var(--error-red)' }
        }
      >
        <input
          type="text"
          placeholder={showDefaultText ? placeholderText : 'try another name'}
          onChange={onHandleChange}
          onKeyDown={(e) => e.key == 'Enter' && isSearchValid && onSubmit(e)}
          maxLength={32}
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
        isSearchValid,
        searchResult: submittedName
          ? { id: searchResult, domain: submittedName }
          : undefined,
      })}
    </>
  );
}

export default SearchBar;
