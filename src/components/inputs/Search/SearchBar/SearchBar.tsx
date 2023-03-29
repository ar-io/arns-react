import React, { useEffect, useRef, useState } from 'react';

import { useIsMobile } from '../../../../hooks';
import { useGlobalState } from '../../../../state/contexts/GlobalState';
import { SearchBarProps } from '../../../../types';
import { ArrowUpRight, SearchIcon } from '../../../icons';
import './styles.css';

function SearchBar(props: SearchBarProps) {
  const {
    successPredicate,
    validationPredicate,
    onSuccess,
    onSubmit,
    onFailure,
    onChange,
    disabled = false,
    placeholderText,
    headerElement,
    footerElement,
    values,
    value,
    height,
  } = props;

  const [{ walletAddress }, dispatchGlobalState] = useGlobalState();
  const isMobile = useIsMobile();
  const [isSearchValid, setIsSearchValid] = useState(true);
  const [showDefaultText, setShowDefaultText] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [searchBarText, setSearchBarText] = useState<string | undefined>(value);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function reset() {
    setSearchSubmitted(false);
    setIsSearchValid(true);
    setShowDefaultText(true);
    setSearchBarText(undefined);
    return;
  }
  useEffect(() => {
    if (!searchBarText) {
      reset();
    }
    _onFocus();
  }, [searchBarText]);

  useEffect(() => {
    if (value) {
      setSearchBarText(value);
      _onFocus();
      _onSubmit();
    }
  }, [value]);

  function _onChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange();
    setSearchSubmitted(false);
    const input = e.target.value.trim().toLowerCase();
    if (input === '') {
      reset();
      return;
    }

    // partially reset
    setShowDefaultText(true);

    const searchValid = validationPredicate(input);
    setIsSearchValid(searchValid);
    setSearchBarText(input);
  }

  function _onFocus() {
    // center search bar on the page
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }

  function _onSubmit(next = false) {
    onSubmit(next);
    // TODO: validation may also be async, so return a promise that resolves to a boolean
    const searchValid = validationPredicate(searchBarText);
    setIsSearchValid(searchValid);
    if (!searchValid) {
      return;
    }

    // // show updated states based on search result
    const searchSuccess = successPredicate(searchBarText);
    setShowDefaultText(false);
    setSearchSubmitted(true);
    setIsAvailable(searchSuccess);
    if (searchSuccess && searchBarText && values) {
      // on additional functions passed in
      onSuccess(searchBarText);
    } else if (!searchSuccess && searchBarText && values) {
      onFailure(searchBarText, values[searchBarText].contractTxId);
    }
  }

  function _onSubmitButton() {
    if (!walletAddress) {
      dispatchGlobalState({
        type: 'setShowConnectWallet',
        payload: true,
      });
    }

    _onSubmit(true);
  }

  return (
    <div className="searchbar-container flex-center">
      {headerElement ? (
        React.cloneElement(headerElement, {
          ...props,
          text: searchSubmitted ? searchBarText : undefined,
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
          type="search"
          disabled={disabled}
          placeholder={showDefaultText ? placeholderText : 'try another name'}
          enterKeyHint="search"
          onChange={_onChange}
          onFocus={_onFocus}
          onKeyDown={(e) => {
            if (e.key == 'Enter') {
              _onSubmit();
            }
          }}
          ref={inputRef}
          value={searchBarText ?? ''}
          maxLength={20}
          className="searchbar-input"
          style={height ? { height: `${height}px` } : {}}
        />
        {isMobile ? (
          <></>
        ) : (
          <>
            {!isAvailable || !searchBarText || !searchSubmitted ? (
              <button
                className="search-button"
                style={{
                  width: `${height}px`,
                  height: `${height}px`,
                  maxWidth: `${height}px`,
                  maxHeight: `${height}px`,
                }}
                onClick={() => {
                  isSearchValid && _onSubmit();
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
                <button
                  className="accent icon-button"
                  onClick={_onSubmitButton}
                >
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
        })
      ) : (
        <></>
      )}
    </div>
  );
}

export default SearchBar;
