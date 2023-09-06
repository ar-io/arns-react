import { CheckCircleFilled } from '@ant-design/icons';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  useArweaveCompositeProvider,
  useIsFocused,
  useIsMobile,
  useRegistrationStatus,
  useWalletAddress,
} from '../../../../hooks';
import { useGlobalState } from '../../../../state/contexts/GlobalState';
import { useRegistrationState } from '../../../../state/contexts/RegistrationState';
import { FullAuctionInfo, SearchBarProps } from '../../../../types';
import {
  decodeDomainToASCII,
  encodeDomainToASCII,
  lowerCaseDomain,
  validateMaxASCIILength,
  validateMinASCIILength,
  validateNoLeadingOrTrailingDashes,
  validateNoSpecialCharacters,
} from '../../../../utils';
import {
  MAX_ARNS_NAME_LENGTH,
  PDNS_NAME_REGEX_PARTIAL,
} from '../../../../utils/constants';
import eventEmitter from '../../../../utils/events';
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
  const [{ blockHeight }, dispatchGlobalState] = useGlobalState();
  const arweaveDataProvider = useArweaveCompositeProvider();
  const [, dispatchRegisterState] = useRegistrationState();
  const { walletAddress } = useWalletAddress();
  const isMobile = useIsMobile();
  const [isSearchValid, setIsSearchValid] = useState(true);
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [searchBarText, setSearchBarText] = useState<string>(
    decodeDomainToASCII(value),
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const inputRef = useRef<HTMLDivElement | null>(null);
  const [searchBarBorder, setSearchBarBorder] = useState({});
  const isSearchbarFocused = useIsFocused('searchbar-input-id');
  const [
    { isAvailable, isAuction, isReserved, loading: isValidatingRegistration },
  ] = useRegistrationStatus(encodeDomainToASCII(value));
  const [auctionInfo, setAuctionInfo] = useState<FullAuctionInfo>();

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
      setSearchBarText(decodeDomainToASCII(value));
      _onSubmit();
      return;
    }
  }, [value]);

  useEffect(() => {
    const style = handleSearchbarBorderStyle({
      domain: searchBarText,
      auction: isAuction,
      available: isAvailable,
      reserved: isReserved,
      submitted: searchSubmitted && !isValidatingRegistration,
      focused: isSearchbarFocused,
    });
    if (isValidatingRegistration) {
      return;
    }
    if (isAuction === true && value) {
      updateAuctionInfo(value);
    }
    setSearchBarBorder(style);
  }, [
    searchBarText,
    searchSubmitted,
    isSearchbarFocused,
    isAuction,
    isAvailable,
    isReserved,
  ]);

  async function updateAuctionInfo(domain: string) {
    try {
      if (!blockHeight) {
        const block = await arweaveDataProvider.getCurrentBlockHeight();
        dispatchGlobalState({
          type: 'setBlockHeight',
          payload: block,
        });
        return;
      }
      const info = await arweaveDataProvider.getFullAuctionInfo(
        lowerCaseDomain(domain),
        blockHeight,
      );
      if (!info) {
        return;
      }
      setAuctionInfo(info);
    } catch (error) {
      eventEmitter.emit('error', error);
    }
  }

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
    // setIsAvailable(searchSuccess);
    if (searchSuccess && searchBarText && values) {
      // on additional functions passed in
      onSuccess(searchBarText);
      if (auctionInfo?.type) {
        dispatchRegisterState({
          type: 'setRegistrationType',
          payload: auctionInfo.type,
        });
      }
    } else if (!searchSuccess && searchBarText && values) {
      onFailure(
        searchBarText,
        values[lowerCaseDomain(searchBarText)].contractTxId,
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

  function handleSearchbarBorderStyle({
    domain,
    auction,
    available,
    reserved,
    submitted,
    focused,
  }: {
    domain: string;
    auction: boolean;
    available: boolean;
    reserved: boolean;
    submitted: boolean;
    focused: boolean;
  }) {
    const noTextBorderStyle = {
      border: 'solid 1px var(--text-faded)',
      marginBottom: '30px',
    };
    const whiteBorderStyle = {
      border: 'var(--text-white) solid 2px',
      marginBottom: '30px',
    };
    const greyBorderStyle = {
      border: '2px solid var(--text-grey)',
      marginBottom: '30px',
    };
    const greenBorderStyle = {
      border: '2px solid var(--success-green)',
      marginBottom: '0px',
    };
    const redBorderStyle = {
      border: '2px solid var(--error-red)',
      marginBottom: '30px',
    };
    const accentBorderStyle = {
      border: '2px solid var(--accent)',
      marginBottom: '30px',
    };

    // Named variables for the cases
    const isTextSubmitted = domain && submitted;
    const isTextNotSubmitted = domain && !submitted;
    const isSearchbarEmptyFocused = !domain && focused;
    const isTextPresentNotSubmitted = domain && !submitted;

    switch (true) {
      case isTextSubmitted: {
        if (reserved) {
          return greyBorderStyle;
        }
        if (auction) {
          return accentBorderStyle;
        }

        return available ? greenBorderStyle : redBorderStyle;
      }

      case isTextNotSubmitted:
      case isSearchbarEmptyFocused:
      case isTextPresentNotSubmitted:
        return whiteBorderStyle;

      default:
        return noTextBorderStyle;
    }
  }

  return (
    <div
      className="searchbar-container flex-center"
      style={{ maxWidth: '787px' }}
    >
      {headerElement ? (
        React.cloneElement(headerElement, {
          ...props,
          text:
            searchSubmitted && !isValidatingRegistration
              ? searchBarText
              : undefined,
          isAvailable,
        })
      ) : (
        <></>
      )}

      <div
        className="searchbar"
        style={{
          marginBottom: '30px',
          width: '100%',
          position: 'relative',
          ...searchBarBorder,
        }}
        ref={inputRef}
      >
        <ValidationInput
          inputClassName="searchbar-input"
          inputId="searchbar-input-id"
          pattern={PDNS_NAME_REGEX_PARTIAL}
          // <input> tag considers emojis as 2 characters in length, so we need to encode the string to ASCII to get the correct length manually
          maxLength={(v) => !(lowerCaseDomain(v).length > MAX_ARNS_NAME_LENGTH)}
          inputType="search"
          onPressEnter={() => _onSubmit()}
          disabled={disabled}
          placeholder={placeholderText}
          value={searchBarText}
          setValue={(v) => _onChange(v)}
          onClick={() => _onFocus()}
          inputCustomStyle={{ height }}
          wrapperCustomStyle={{
            height,
            width: '100%',
          }}
          showValidationChecklist={!isMobile}
          showValidationErrors={false}
          showValidationsDefault={!isMobile}
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
            [`Max. ${MAX_ARNS_NAME_LENGTH} characters`]: {
              fn: (query) =>
                validateMaxASCIILength(query, MAX_ARNS_NAME_LENGTH),
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
              right: isMobile ? '10px' : '75px',
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
            data-testid="search-button"
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
      {searchSubmitted && isAvailable && !isReserved ? (
        <div
          className={`flex flex-row fade-in ${
            isAuction ? 'flex-space-between' : 'flex-center'
          }`}
          style={{
            alignItems: 'center',
            marginTop: isMobile ? '20px' : '50px',
            boxSizing: 'border-box',
            flexDirection: isMobile ? 'column-reverse' : 'row',
          }}
        >
          {isAuction && auctionInfo?.minimumAuctionBid ? (
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
                {(auctionInfo?.minimumAuctionBid
                  ? Math.round(auctionInfo?.minimumAuctionBid)
                  : 0
                ).toLocaleString('en-US')}{' '}
                IO
              </span>
              <span
                className="grey left"
                style={{ fontSize: '13px', width: 'fit-content' }}
              >
                Started by: {auctionInfo?.initiator}
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
