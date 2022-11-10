import { ReactComponent as SearchIcon } from '../../../icons/Search.svg';
import './styles.css';
import { SearchBarProps } from '../../../../types';
import React, { useState } from 'react';
import { ARNS_NAME_REGEX } from '../../../../../types/constants';

function SearchBar(props: SearchBarProps) {
  const { predicate, placeholderText, headerElement, footerElement, values } =
    props;

  const [isDefault, setIsDefault] = useState(true);
  const [isValid, setIsValid] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [searchBarText, setSearchBarText] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState('');
  const [searchResult, setSearchResult] = useState('');

  function reset() {
    setSearchSubmitted(false);
    setSubmittedName('');
    setIsValid(true);
    setIsDefault(true);
    setSearchResult('');
    return;
  }

  function onHandleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (ARNS_NAME_REGEX.test(e.target.value) || e.target.value.length < 1) {
      setSearchBarText(e.target.value);
      setIsValid(true);
    } else {
      setIsValid(false);
    }
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
      setIsAvailable(predicate(name.toLowerCase()));
      if (!isAvailable) {
        setSearchResult(values[name]);
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
        isAvailable,
      })}
      <div
        className="searchBar"
        style={
          !searchSubmitted || isDefault
            ? { borderColor: '' }
            : isAvailable
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
          pattern={ARNS_NAME_REGEX.source}
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
        defaultText: (
          <>
            {!isValid ? (
              <div className="errorContainer">
                <span className="illegalChar">
                  INVALID CHARACTER, FOLLOW THE PATTERN REQUIRED BELOW
                </span>
                {footerElement.props.defaultText}
              </div>
            ) : (
              footerElement.props.defaultText
            )}
          </>
        ),
        searchResult: submittedName
          ? { id: searchResult, domain: submittedName }
          : undefined,
      })}
    </>
  );
}

export default SearchBar;
