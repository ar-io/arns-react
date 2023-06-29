import { CheckCircleFilled } from '@ant-design/icons';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useIsMobile, useWalletAddress } from '../../../../hooks';
import { useGlobalState } from '../../../../state/contexts/GlobalState';
import { SearchBarProps } from '../../../../types';
import {
  ALPHA_NUMERIC_REGEX,
  PDNS_NAME_REGEX_PARTIAL,
  RESERVED_NAME_LENGTH,
} from '../../../../utils/constants';
import { SearchIcon } from '../../../icons';
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
  const [{ pdnsSourceContract }] = useGlobalState();
  const { walletAddress } = useWalletAddress();
  const isMobile = useIsMobile();
  const [isSearchValid, setIsSearchValid] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [searchBarText, setSearchBarText] = useState<string | undefined>(value);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function reset() {
    setSearchSubmitted(false);
    setIsSearchValid(true);
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
  }, [value]);

  function _onChange(e: string) {
    setSearchSubmitted(false);
    const input = e.trim().toLowerCase();
    const searchValid = validationPredicate(input);
    setIsSearchValid(searchValid);
    setSearchBarText(input);
    onChange();
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

    // show updated states based on search result
    const searchSuccess = successPredicate(searchBarText);
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

  const handleSearchbarBorderStyle = () => {
    if (searchBarText) {
      if (searchSubmitted) {
        if (isAvailable) {
          return { borderColor: 'var(--success-green)' };
        } else {
          return { borderColor: 'var(--error-red)' };
        }
      }
      return { borderColor: 'white', marginBottom: 30 };
    } else {
      return { borderColor: '', marginBottom: 30 };
    }
  };

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

      <div className="searchbar" style={handleSearchbarBorderStyle()}>
        {/** TODO change max input to 32 once contract is updated */}
        <ValidationInput
          inputType="search"
          onPressEnter={() => _onSubmit()}
          disabled={disabled}
          placeholder={placeholderText}
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
          showValidationsDefault={true}
          validationListStyle={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: '15px',
            gap: 15,
            color: searchBarText ? 'var(--text-white)' : 'var(--text-grey)',
          }}
          validationPredicates={{
            'Min. 1 character': {
              fn: (query: string) =>
                new Promise((resolve, reject) =>
                  !query || !query.length ? reject() : resolve(true),
                ),
            },
            'Max. 32 characters': {
              fn: (query: string) =>
                new Promise((resolve, reject) =>
                  query.length && query.length <= 32 ? resolve(true) : reject(),
                ),
            },
            'No special characters': {
              fn: (query: string) =>
                new Promise((resolve, reject) =>
                  query.length && PDNS_NAME_REGEX_PARTIAL.test(query)
                    ? resolve(true)
                    : reject(),
                ),
            },
            'Dashes cannot be leading or trailing': {
              fn: (query: string) =>
                new Promise((resolve, reject) =>
                  query.length &&
                  ALPHA_NUMERIC_REGEX.test(query[0]) &&
                  ALPHA_NUMERIC_REGEX.test(query[query.length - 1])
                    ? resolve(true)
                    : reject(),
                ),
            },
          }}
          customValidationIcons={{
            error: (
              <CheckCircleFilled
                style={{ fontSize: 16, color: 'var(--text-grey)' }}
              />
            ),
            success: (
              <CheckCircleFilled
                style={{ fontSize: 16, color: 'var(--success-green)' }}
              />
            ),
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
      {searchSubmitted &&
      isAvailable &&
      !Object.keys(pdnsSourceContract.reserved).includes(searchBarText!) &&
      !(searchBarText!.length <= RESERVED_NAME_LENGTH) ? (
        <button
          className="accent-button center"
          onClick={_onSubmitButton}
          style={{
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
