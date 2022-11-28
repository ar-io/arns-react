import React, { useRef, useState } from 'react';

import useIsMobile from '../../../../hooks/useIsMobile/useIsMobile';
import { useStateValue } from '../../../../state/state';
import { SearchBarProps } from '../../../../types';
import { ArrowUpRight, SearchIcon } from '../../../icons';
import './styles.css';

function SearchBar(props: SearchBarProps) {
  const {
    successPredicate,
    validationPredicate,
    placeholderText,
    headerElement,
    footerElement,
    values,
    height,
    setIsSearching,
  } = props;

  const [{ walletAddress }, dispatch] = useStateValue();
  const isMobile = useIsMobile();
  const [isSearchValid, setIsSearchValid] = useState(true);
  const [showDefaultText, setShowDefaultText] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [searchBarText, setSearchBarText] = useState<string | undefined>();
  const [submittedName, setSubmittedName] = useState<string | undefined>();
  const [searchResult, setSearchResult] = useState<string | undefined>();
  const searchRef = useRef<HTMLDivElement | null>(null);

  function reset() {
    setSearchSubmitted(false);
    setSubmittedName(undefined);
    setIsSearchValid(true);
    setShowDefaultText(true);
    setSearchResult(undefined);
    setSearchBarText(undefined);
    if (setIsSearching) {
      setIsSearching(false);
    }

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

  function onFocus() {
    // center search bar on the page
    if (searchRef.current) {
      searchRef.current.scrollIntoView();
    }
  }

  function onSubmit(e: any) {
    e.preventDefault();
    if (setIsSearching) {
      setIsSearching(true);
    }
    // validate again, just in case
    const searchValid = validationPredicate(searchBarText);
    setIsSearchValid(searchValid);
    if (!searchValid) {
      return;
    }

    // show updated states based on search result
    const name = searchBarText;
    const searchSuccess = successPredicate(name);
    setShowDefaultText(false);
    setSubmittedName(name);
    setSearchSubmitted(true);
    setIsAvailable(searchSuccess);
    setSearchResult(undefined);
    if (!searchSuccess && name && values) {
      setSearchResult(values[name]);
      return;
    }
  }

  function handleNext() {
    if (!walletAddress) {
      dispatch({
        type: 'setConnectWallet',
        payload: true,
      });
      return;
    }
    return;
  }

  return (
    <div className="searchBarContainer flex-center" ref={searchRef}>
      {headerElement ? (
        React.cloneElement(headerElement, {
          ...props,
          text: submittedName,
          isAvailable,
        })
      ) : (
        <></>
      )}
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
          onFocus={onFocus}
          onKeyDown={(e) => e.key == 'Enter' && isSearchValid && onSubmit(e)}
          maxLength={32}
          className="searchBarInput"
        />
        {isMobile ? (
          <></>
        ) : (
          <>
            {!isAvailable || !submittedName ? (
              <button
                className="searchButton"
                style={{width:`${height}px`, height:`${height}px`}}
                onClick={(e) => {
                  onSubmit(e);
                }}
              >
                <SearchIcon
                  fill="#121212"
                  stroke="white"
                  width="18.51"
                  height="18.51"
                />
              </button>
            ) : (
              <>
                <span
                  className="test faded bold"
                  style={{ marginRight: '18px' }}
                >
                  Register
                </span>
                <button className="accent roundButton" onClick={handleNext}>
                  <ArrowUpRight
                    fill="var(--text-black)"
                    stroke="var(--text-black)"
                    width="18.51"
                    height="18.51"
                  />
                </button>
              </>
            )}
          </>
        )}
      </div>
      {footerElement ? (
        React.cloneElement(footerElement, {
          ...props,
          isSearchValid,
          isAvailable,
          searchResult: submittedName
            ? { id: searchResult, domain: submittedName }
            : undefined,
        })
      ) : (
        <></>
      )}
    </div>
  );
}

export default SearchBar;
