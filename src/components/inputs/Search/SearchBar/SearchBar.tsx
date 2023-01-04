import React, { useEffect, useRef, useState } from 'react';

import { useIsMobile } from '../../../../hooks';
import { useGlobalState } from '../../../../state/contexts/GlobalState';
import { useRegistrationState } from '../../../../state/contexts/RegistrationState';
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
  } = props;

  const [{ walletAddress }, dispatchGlobalState] = useGlobalState();
  const [{ stage }, dispatchRegisterState] = useRegistrationState();
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
    dispatchGlobalState({
      type: 'setIsSearching',
      payload: false,
    });

    return;
  }
  useEffect(() => {
    if (!searchBarText) {
      reset();
    }
  }, [searchBarText]);
  function onHandleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target.value.trim().toLowerCase();
    if (input === '') {
      reset();
      return;
    }

    // partially reset
    setSearchResult(undefined);
    setShowDefaultText(true);

    const searchValid = validationPredicate(input);
    setIsSearchValid(searchValid);
    if (!searchValid) {
      return;
    }

    // valid
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
    // TODO: validation may also be async, so return a promise that resolves to a boolean
    const searchValid = validationPredicate(searchBarText);
    setIsSearchValid(searchValid);
    if (!searchValid) {
      return;
    }
    dispatchGlobalState({
      type: 'setIsSearching',
      payload: true,
    });

    // show updated states based on search result
    const name = searchBarText;
    const searchSuccess = successPredicate(name);
    setShowDefaultText(false);
    setSubmittedName(name);
    setSearchSubmitted(true);
    setIsAvailable(searchSuccess);
    setSearchResult(undefined);
    if (name) {
      dispatchRegisterState({
        type: 'setDomainName',
        payload: name,
      });
    }
    if (!searchSuccess && name && values) {
      setSearchResult(values[name]);
    }
  }

  function handleNext() {
    if (!walletAddress) {
      dispatchGlobalState({
        type: 'setShowConnectWallet',
        payload: true,
      });
      return;
    }
    dispatchRegisterState({
      type: 'setStage',
      payload: stage + 1,
    });
    return;
  }

  return (
    <div className="searchbar-container flex-center" ref={searchRef}>
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
        className="searchbar"
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
        {' '}
        {/** TODO change max input to 32 once contract is updated */}
        <input
          type="text"
          placeholder={showDefaultText ? placeholderText : 'try another name'}
          onChange={onHandleChange}
          onFocus={onFocus}
          onKeyDown={(e) => e.key == 'Enter' && isSearchValid && onSubmit(e)}
          maxLength={20}
          className="searchbar-input"
          style={height ? { height: `${height}px` } : {}}
        />
        {isMobile ? (
          <></>
        ) : (
          <>
            {!isAvailable || !submittedName ? (
              <button
                className="search-button"
                style={{
                  width: `${height}px`,
                  height: `${height}px`,
                  maxWidth: `${height}px`,
                  maxHeight: `${height}px`,
                }}
                onClick={(e) => {
                  onSubmit(e);
                }}
              >
                <SearchIcon
                  fill="#121212"
                  stroke="white"
                  width={height ? `${height / 2.2}` : '18.51px'}
                  height={height ? `${height / 2.2}` : '18.51px'}
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
                <button className="accent round-button" onClick={handleNext}>
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
