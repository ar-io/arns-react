import { CheckCircleFilled } from '@ant-design/icons';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  useAuctionInfo,
  useIsFocused,
  useIsMobile,
  useWalletAddress,
} from '../../../../hooks';
import { useGlobalState } from '../../../../state/contexts/GlobalState';
import { useRegistrationState } from '../../../../state/contexts/RegistrationState';
import { SearchBarProps } from '../../../../types';
import {
  encodeDomainToASCII,
  validateMaxASCIILength,
  validateMinASCIILength,
  validateNoLeadingOrTrailingDashes,
  validateNoSpecialCharacters,
} from '../../../../utils';
import {
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
  const [, dispatchRegisterState] = useRegistrationState();
  const { walletAddress } = useWalletAddress();
  const isMobile = useIsMobile();
  const [isSearchValid, setIsSearchValid] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [searchBarText, setSearchBarText] = useState<string>(value);
  const { minimumAuctionBid, auction } = useAuctionInfo(value!);
  const [searchParams, setSearchParams] = useSearchParams();
  const inputRef = useRef<HTMLDivElement | null>(null);
  const isSearchbarFocused = useIsFocused('searchbar-input-id');

  function reset() {
    setSearchSubmitted(false);
    setIsSearchValid(true);
    setSearchBarText('');
    return;
  }
  useEffect(() => {
    if (!searchBarText) {
      reset();
    }
    if (searchParams.get('search') !== searchBarText) {
      // clear search params on new search
      const serializeSearchParams: Record<string, string> = {};
      setSearchParams(serializeSearchParams);
    }
  }, [searchBarText]);

  useEffect(() => {
    if (value) {
      setSearchBarText(value);

      _onSubmit();
      return;
    }
  }, [value]);

  function _onChange(e: string) {
    setSearchSubmitted(false);
    const input = e.trim();
    const searchValid = validationPredicate(encodeDomainToASCII(input));
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
      if (auction?.type) {
        dispatchRegisterState({
          type: 'setRegistrationType',
          payload: auction.type,
        });
      }
    } else if (!searchSuccess && searchBarText && values) {
      onFailure(
        searchBarText,
        values[encodeDomainToASCII(searchBarText)].contractTxId,
      );
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
        if (
          pdnsSourceContract.reserved[encodeDomainToASCII(searchBarText)] ||
          searchBarText.length <= RESERVED_NAME_LENGTH
        ) {
          return { border: '2px solid var(--text-grey)', marginBottom: 30 };
        }
        if (pdnsSourceContract?.auctions?.[searchBarText]) {
          return { borderColor: 'var(--accent)' };
        }
        if (isAvailable) {
          return { border: '2px solid var(--success-green)' };
        } else {
          return { border: '2px solid var(--error-red)', marginBottom: 30 };
        }
      }
      return { border: '2px solid white', marginBottom: 30 };
    } else {
      if (isSearchbarFocused) {
        return { border: 'var(--text-white) solid 2px', marginBottom: 30 };
      }
      return { border: '', marginBottom: 30 };
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

      <div
        className="searchbar"
        style={{
          ...handleSearchbarBorderStyle(),
          width: '100%',
          position: 'relative',
        }}
        ref={inputRef}
      >
        <ValidationInput
          inputClassName="searchbar-input"
          inputId="searchbar-input-id"
          pattern={PDNS_NAME_REGEX_PARTIAL}
          // <input> tag considers emojis as 2 characters in length, so we need to encode the string to ASCII to get the correct length manually
          maxLength={(v) => !(encodeDomainToASCII(v.trim()).length > 32)}
          inputType="search"
          onPressEnter={() => _onSubmit()}
          disabled={disabled}
          placeholder={placeholderText}
          value={searchBarText?.trim()}
          setValue={(v) => _onChange(v.trim())}
          onClick={() => _onFocus()}
          inputCustomStyle={{ height }}
          wrapperCustomStyle={{
            height,
            width: '100%',
          }}
          showValidationChecklist={!isMobile}
          showValidationErrors={false}
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
              fn: (query) => validateMinASCIILength(query, 1),
            },
            'Max. 32 characters': {
              fn: (query) => validateMaxASCIILength(query, 32),
            },
            'No special characters': {
              fn: (query) => validateNoSpecialCharacters(query),
            },
            'Dashes cannot be leading or trailing': {
              fn: (query) => validateNoLeadingOrTrailingDashes(query),
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
        {searchBarText && searchSubmitted ? (
          <button
            className="link bold text flex-center"
            style={{
              color: 'var(--text-grey)',
              width: 'fit-content',
              position: 'absolute',
              right: '75px',
              height: '100%',
            }}
            onClick={() => reset()}
          >
            Clear
          </button>
        ) : (
          <></>
        )}
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
      !Object.keys(pdnsSourceContract.reserved).includes(
        encodeDomainToASCII(searchBarText)!,
      ) &&
      !(encodeDomainToASCII(searchBarText)!.length <= RESERVED_NAME_LENGTH) ? (
        <div
          className={`flex flex-row ${
            minimumAuctionBid ? 'flex-space-between' : 'flex-center'
          }`}
          style={{
            alignItems: 'center',
            marginTop: 90,
            boxSizing: 'border-box',
          }}
        >
          {minimumAuctionBid ? (
            <div
              className="flex flex-column"
              style={{
                gap: '8px',
                justifyContent: 'center',
                width: 'fit-content',
              }}
            >
              <span
                className="white left"
                style={{ fontSize: '16px', width: 'fit-content' }}
              >
                Current auction price for instant buy:{' '}
                {Math.round(minimumAuctionBid ?? 0).toLocaleString()} IO
              </span>
              <span
                className="grey left"
                style={{ fontSize: '13px', width: 'fit-content' }}
              >
                Started by:{' '}
                {pdnsSourceContract?.auctions?.[searchBarText!]?.initiator}
              </span>
            </div>
          ) : (
            <></>
          )}
          <button
            className="accent-button center"
            onClick={_onSubmitButton}
            style={{
              padding: '0px',
              height: '50px',
              width: '130px',
              fontSize: '14px',
            }}
          >
            Register Now
          </button>
        </div>
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
