import { CheckCircleFilled, InfoCircleOutlined } from '@ant-design/icons';
import { ArNSNameData } from '@ar.io/sdk/web';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  useIsFocused,
  useIsMobile,
  useRegistrationStatus,
} from '../../../../hooks';
import { ArweaveTransactionID } from '../../../../services/arweave/ArweaveTransactionID';
import { useGlobalState } from '../../../../state/contexts/GlobalState';
import { useRegistrationState } from '../../../../state/contexts/RegistrationState';
import { useWalletState } from '../../../../state/contexts/WalletState';
import { SearchBarProps } from '../../../../types';
import {
  decodeDomainToASCII,
  encodeDomainToASCII,
  isARNSDomainNameValid,
  lowerCaseDomain,
  validateMaxASCIILength,
  validateMinASCIILength,
  validateNoLeadingOrTrailingDashes,
  validateNoSpecialCharacters,
} from '../../../../utils';
import {
  ARNS_NAME_REGEX_PARTIAL,
  MAX_ARNS_NAME_LENGTH,
} from '../../../../utils/constants';
import { SearchIcon } from '../../../icons';
import { Loader, SearchBarFooter, SearchBarHeader } from '../../../layout';
import ValidationInput from '../../text/ValidationInput/ValidationInput';
import './styles.css';

const searchBarValidationPredicate = ({
  value,
}: {
  value: string | undefined;
}) => {
  if (!value) {
    return false;
  }

  return isARNSDomainNameValid({
    name: encodeDomainToASCII(value),
  });
};

function SearchBar(props: SearchBarProps) {
  const { disabled = false, placeholderText } = props;
  const navigate = useNavigate();
  const [{ arweaveDataProvider }] = useGlobalState();
  const [{ domain }, dispatchRegisterState] = useRegistrationState();
  const [{ walletAddress }] = useWalletState();
  const isMobile = useIsMobile();
  const [isSearchValid, setIsSearchValid] = useState(true);
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [searchBarText, setSearchBarText] = useState<string>(
    decodeDomainToASCII(domain ?? ''),
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const inputRef = useRef<HTMLDivElement | null>(null);
  const [searchBarBorder, setSearchBarBorder] = useState({});
  const isSearchbarFocused = useIsFocused('searchbar-input-id');
  const {
    isAvailable,
    isReserved,
    reservedFor,
    loading: isValidatingRegistration,
    validated,
  } = useRegistrationStatus(lowerCaseDomain(domain));
  const [registeredDomainRecord, setRegisteredDomainRecord] =
    useState<ArNSNameData>();

  const contractTxID = registeredDomainRecord
    ? new ArweaveTransactionID(registeredDomainRecord.contractTxId)
    : undefined;

  function reset() {
    setSearchSubmitted(false);
    setIsSearchValid(true);
    setSearchBarText('');
    setRegisteredDomainRecord(undefined);
    dispatchRegisterState({
      type: 'reset',
    });

    return;
  }

  useEffect(() => {
    if (searchParams.get('search') !== searchBarText) {
      // clear search params on new search
      const serializeSearchParams: Record<string, string> = {};
      setSearchParams(serializeSearchParams);
    }

    if (!searchBarText) {
      reset();
    }
  }, [searchBarText]);

  useEffect(() => {
    if (domain) {
      _onSubmit();
      return;
    }
  }, [domain]);

  useEffect(() => {
    if (
      (!isValidatingRegistration && validated) ||
      !searchSubmitted ||
      isReserved
    ) {
      const style = handleSearchbarBorderStyle({
        domain: domain,
        available: isAvailable,
        reserved: isReserved,
        reservedFor: reservedFor,
        submitted: searchSubmitted,
        focused: isSearchbarFocused && !validated,
      });
      setSearchBarBorder(style);
    }
  }, [
    searchBarText,
    searchSubmitted,
    isSearchbarFocused,
    isReserved,
    validated,
    isValidatingRegistration,
  ]);

  function _onChange(e: string) {
    setSearchSubmitted(false);
    const input = e.trim();
    const searchValid = searchBarValidationPredicate({
      value: encodeDomainToASCII(input),
    });
    setIsSearchValid(searchValid);
    setSearchBarText(input);
    dispatchRegisterState({
      type: 'reset',
    });
  }

  function _onFocus() {
    // center search bar on the page
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }

  async function _onSubmit(next = false) {
    dispatchRegisterState({
      type: 'setIsSearching',
      payload: true,
    });
    if (next) {
      navigate(`/register/${decodeDomainToASCII(searchBarText)}`, {
        state: { from: `/?search=${searchBarText}` },
      });
    }
    // TODO: validation may also be async, so return a promise that resolves to a boolean

    const searchValid = searchBarValidationPredicate({
      value: lowerCaseDomain(searchBarText ?? ''),
    });
    setIsSearchValid(searchValid);
    if (!searchValid) {
      return;
    }

    if (searchParams.get('search') !== searchBarText) {
      const serializeSearchParams: Record<string, string> = {
        search: decodeDomainToASCII(domain),
      };
      setSearchParams(serializeSearchParams);
    }
    // show updated states based on search result
    const record = await arweaveDataProvider
      .getRecord({ domain: lowerCaseDomain(searchBarText ?? '') })
      .catch(() => null);
    setSearchSubmitted(true);
    if (!record && searchBarText) {
      setRegisteredDomainRecord(undefined);
      // on additional functions passed in
      dispatchRegisterState({
        type: 'setDomainName',
        payload: searchBarText,
      });
      dispatchRegisterState({
        type: 'setANTID',
        payload: undefined,
      });
    } else if (record && searchBarText) {
      setRegisteredDomainRecord(record);
      dispatchRegisterState({
        type: 'setDomainName',
        payload: encodeDomainToASCII(searchBarText),
      });
      dispatchRegisterState({
        type: 'setANTID',
        payload: new ArweaveTransactionID(record.contractTxId),
      });
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
    available,
    reserved,
    reservedFor,
    submitted,
    focused,
  }: {
    domain: string;
    available: boolean;
    reserved: boolean;
    reservedFor?: ArweaveTransactionID;
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
    // Named variables for the cases
    const isTextSubmitted = domain && submitted;
    const isTextNotSubmitted = domain && !submitted;
    const isSearchbarEmptyFocused = !domain && focused;
    const isTextPresentNotSubmitted = domain && !submitted;

    switch (true) {
      case isTextSubmitted: {
        if (reserved && reservedFor?.toString() !== walletAddress?.toString()) {
          return greyBorderStyle;
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
      <SearchBarHeader
        defaultText="Find a name"
        domain={searchSubmitted ? searchBarText : undefined}
        isAvailable={isAvailable}
        isReserved={isReserved}
        reservedFor={reservedFor}
        contractTxId={contractTxID}
      />

      <div
        className="searchbar"
        style={{
          ...searchBarBorder,
          marginBottom:
            searchBarText && searchBarText === 'www' ? '80px' : '30px',
          width: '100%',
          position: 'relative',
        }}
        ref={inputRef}
      >
        <ValidationInput
          inputClassName="searchbar-input"
          inputId="searchbar-input-id"
          customPattern={ARNS_NAME_REGEX_PARTIAL}
          // <input> tag considers emojis as 2 characters in length, so we need to encode the string to ASCII to get the correct length manually
          maxCharLength={(v) =>
            lowerCaseDomain(v).length <= MAX_ARNS_NAME_LENGTH
          }
          inputType="search"
          onPressEnter={() => _onSubmit()}
          disabled={disabled}
          placeholder={placeholderText}
          value={searchBarText}
          setValue={(v) => _onChange(v)}
          onClick={() => _onFocus()}
          inputCustomStyle={{
            height: isMobile ? '50px' : '65px',
          }}
          wrapperCustomStyle={{
            height: isMobile ? 'fit-content' : '65px',
            width: '100%',
          }}
          showValidationChecklist={!isMobile}
          showValidationErrors={false}
          showValidationsDefault={!isMobile}
          validationListStyle={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop:
              searchBarText && searchBarText === 'www' ? '90px' : '15px',
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
          isValidatingRegistration ? (
            <Loader size={30} color="var(--text-grey)" />
          ) : (
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
          )
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
              width: `${65}px`,
              height: `${65}px`,
              borderLeft: '1px solid #38393B',
            }}
            onClick={() => {
              isSearchValid && _onSubmit();
            }}
          >
            <SearchIcon fill="white" width={18} height={18} />
          </button>
        )}
        {searchBarText && searchBarText === 'www' ? (
          <div
            className="warning-container flex"
            style={{
              width: '100%',
              gap: '15px',
              boxSizing: 'border-box',
              position: 'absolute',
              top: '80px',
            }}
          >
            <InfoCircleOutlined />
            <span className="warning-text" style={{ fontSize: '14px' }}>
              This name can not be registered, as &apos;www&apos; is a reserved
              domain in browsers.
            </span>
          </div>
        ) : (
          <></>
        )}
      </div>

      {searchSubmitted &&
      isAvailable &&
      (!isReserved ||
        !(reservedFor?.toString() !== walletAddress?.toString())) ? (
        <div
          className={`flex flex-row fade-in 'flex-center'`}
          style={{
            alignItems: 'center',
            marginTop: isMobile ? '20px' : '50px',
            boxSizing: 'border-box',
            flexDirection: isMobile ? 'column-reverse' : 'row',
          }}
        >
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

      <SearchBarFooter
        isAvailable={isAvailable}
        isReserved={isReserved}
        reservedFor={reservedFor}
        domain={lowerCaseDomain(domain)}
        record={registeredDomainRecord}
        contractTxId={contractTxID}
      />
    </div>
  );
}

export default SearchBar;
