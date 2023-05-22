import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useIsMobile, useWalletAddress } from '../../../../hooks';
import { SearchBarProps } from '../../../../types';
import { ArrowUpRight, SearchIcon } from '../../../icons';
import ValidationInput from '../../text/ValidationInput/ValidationInput';
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
  const navigate = useNavigate();
  const { walletAddress } = useWalletAddress();
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
      return;
    }
    setSearchBarText(undefined);
  }, [value]);

  function _onChange(e: string) {
    onChange();
    setSearchSubmitted(false);
    const input = e.trim().toLowerCase();

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
    if (!walletAddress?.toString()) {
      navigate('/connect', {
        state: `/?search=${searchBarText}`,
      });
    }

    _onSubmit(true);
  }

  return (
    <div className="searchbar-container flex-center" style={{ maxWidth: 787 }}>
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
          !searchBarText
            ? { borderColor: '', marginBottom: 30 }
            : isSearchValid
            ? !searchSubmitted || showDefaultText
              ? { borderColor: 'white', marginBottom: 30 }
              : isAvailable
              ? { borderColor: 'var(--success-green)' }
              : { borderColor: 'var(--error-red)' }
            : { borderColor: 'var(--error-red)' }
        }
      >
        {' '}
        {/** TODO change max input to 32 once contract is updated */}
        <ValidationInput
          inputType="search"
          onPressEnter={() => _onSubmit()}
          disabled={disabled}
          placeholder={showDefaultText ? placeholderText : 'try another name'}
          value={searchBarText}
          setValue={(v) => _onChange(v)}
          onClick={() => _onFocus()}
          maxLength={32}
          inputCustomStyle={{ height }}
          wrapperCustomStyle={{
            height,
            width: '100%',
          }}
          showValidationChecklist={!isMobile}
          validationListStyle={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: '15px',
            gap: 15,
          }}
          validationPredicates={{
            'Min. 1 character': {
              required: false,
              fn: () =>
                new Promise((resolve, reject) => {
                  resolve(1);
                }),
            },
            'Max. 32 characters': {
              fn: () =>
                new Promise((resolve, reject) => {
                  reject();
                }),
            },
            'No special characters': {
              fn: () =>
                new Promise((resolve, reject) => {
                  reject();
                }),
            },
            'Dashes cannot be leading or trailing': {
              fn: () =>
                new Promise((resolve, reject) => {
                  reject();
                }),
            },
          }}
        />
        {isMobile ? (
          <></>
        ) : (
          <button
            className="button pointer"
            style={{
              width: `${height}px`,
              height: `${height}px`,
              borderLeft: '1px solid #38393B',
            }}
            onClick={() => {
              isSearchValid && _onSubmit();
            }}
          >
            <SearchIcon fill="white" width={18} height={18} />
          </button>
        )}
      </div>
      {searchSubmitted && isAvailable ? (
        <button
          className="accent-button center"
          onClick={_onSubmitButton}
          style={{
            width: 130,
            height: 50,
            fontSize: 14,
            padding: 0,
            marginTop: 30,
          }}
        >
          Register Now
        </button>
      ) : (
        <></>
      )}
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
