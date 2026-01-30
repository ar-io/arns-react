import { CheckCircle } from 'lucide-react';
import { AoArNSNameData } from '@ar.io/sdk/web';
import DomainDetailsTip from '@src/components/Tooltips/DomainDetailsTip';
import { Tooltip } from '@src/components/data-display';
import { ArioSpinner } from '@src/components/data-display/Spinner';
import { RNPChart } from '@src/components/data-display/charts/RNPChart';
import { CircleCheckFilled, SearchIcon } from '@src/components/icons';
import { useGlobalState } from '@src/state';
import { decodeDomainToASCII, lowerCaseDomain } from '@src/utils';
import { ChevronRight, CircleAlert, XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DomainSearch from '../DomainSearch';
import DomainPiceList from './DomainPriceList';

const recentlyReturnedTooltipMessage = `Recently expired leases or returned permanent names are initially priced with a premium starting at a 50x multiplier. This premium decreases linearly over 14 days, eventually returning to the base registration price.`;

const maxCharValidation = 'Max. 51 characters';
const noSpecialCharsValidation = 'No special characters';
const dashesValidation = 'Dashes cannot be leading or trailing';
const wwwValidation = 'Cannot be www';
const arweaveAddressLength = 'Not an Arweave address';
const defaultValidations = {
  [maxCharValidation]: false,
  [noSpecialCharsValidation]: false,
  [dashesValidation]: false,
  [wwwValidation]: false,
  [arweaveAddressLength]: false,
};

function HomeSearch() {
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [validations, setValidations] =
    useState<typeof defaultValidations>(defaultValidations);
  const [validationError, setValidationError] = useState('');
  const [isValidDomain, setIsValidDomain] = useState(false);
  const [domainQuery, setDomainQuery] = useState('');
  const [domainRecord, setDomainRecord] = useState<AoArNSNameData>();
  const [showResults, setShowResults] = useState(true);
  const [isReturnedName, setIsReturnedName] = useState(false);
  const [{ gateway }] = useGlobalState();

  useEffect(() => {
    validateDomain(domainQuery);
  }, [domainQuery]);

  function validateDomain(domain: string) {
    if (!domain.length) {
      setValidations(defaultValidations);
      setIsValidDomain(false);
      return;
    }
    const safeDomain = lowerCaseDomain(domain.trim());
    const validations: typeof defaultValidations = {
      [maxCharValidation]: safeDomain.length <= 51,
      [noSpecialCharsValidation]: /^[a-zA-Z0-9-]*$/.test(safeDomain),
      [dashesValidation]: !/^-|-$/g.test(safeDomain),
      [wwwValidation]: safeDomain !== 'www',
      [arweaveAddressLength]: safeDomain.length !== 43,
    };
    let validDomain = true;
    Object.entries(validations).forEach(([name, isValid]) => {
      switch (name) {
        case 'No special characters':
          if (!isValid && validDomain) {
            validDomain = false;
            const specialChars =
              decodeDomainToASCII(safeDomain).match(/[^a-zA-Z0-9-]/g);
            setValidationError(`remove '${specialChars?.join("', '")}'`);
          }
          return;
        case 'Dashes cannot be leading or trailing':
          if (!isValid && validDomain) {
            validDomain = false;
            setValidationError('dashes cannot be leading or trailing');
          }
          return;
        case 'Cannot be www':
          if (!isValid) {
            validDomain = false;
            setValidationError('cannot be www');
          }
          return;
        case 'Not an Arweave address':
          if (!isValid) {
            validDomain = false;
            setValidationError('cannot be length of an Arweave address');
          }
          return;
        case 'Max. 51 characters':
          if (!isValid && validDomain) {
            validDomain = false;
            setValidationError('exceeds maximum length of 51 characters');
          }
          return;
        default:
          break;
      }
    });
    setValidations(validations);
    setIsValidDomain(validDomain);
  }

  function getBorderStyle({
    availability,
    searching,
    domain,
    validDomain,
  }: {
    availability: boolean;
    searching: boolean;
    domain: string;
    validDomain: boolean;
  }) {
    if (!validDomain) {
      return 'border-muted';
    }
    if (domain.length === 0) {
      return 'border-dark-grey';
    }
    if (searching) {
      return 'border-foreground';
    }
    if (availability) {
      return 'border-success';
    } else {
      return 'border-error';
    }
  }

  const hasResults = domainQuery.length > 0 && showResults;

  return (
    <div className="flex flex-col w-full">
        {/* Status Header */}
        <div className="min-h-[50px] flex items-center justify-center pb-2">
          {!isValidDomain && domainQuery.length ? (
            <span
              className="text-xl font-semibold text-muted"
              data-testid="home-search-invalid-header"
            >
              Invalid ArNS domain, {validationError}
            </span>
          ) : isSearching || domainQuery.length === 0 || !isAvailable ? null : (
            <span
              className="text-2xl font-semibold text-foreground flex items-center gap-2 flex-wrap justify-center"
              data-testid="home-search-available-header"
            >
              <span className="text-success">
                {decodeDomainToASCII(domainQuery)}
              </span>
              is available!
              <CheckCircle className="text-success" size={20} />
            </span>
          )}
        </div>

        {/* Search Input */}
        <DomainSearch
          className={`flex flex-col w-full rounded bg-surface border ${getBorderStyle({
            availability: isAvailable,
            searching: isSearching,
            domain: domainQuery,
            validDomain: isValidDomain,
          })}`}
          inputWrapperClass="flex-row w-full p-2 pr-[100px] relative gap-2"
          inputClass="flex w-full pl-4 h-[50px] bg-transparent focus:outline-none placeholder:text-muted text-lg text-foreground"
          buttonClass="flex items-center justify-center absolute right-0 top-0 bottom-0 w-16"
          setIsSearching={(v) => setIsSearching(v)}
          setIsAvailable={(v) => setIsAvailable(v)}
          setIsReturnedName={(v) => setIsReturnedName(v)}
          setDomainQuery={(v) => setDomainQuery(v)}
          setDomainRecord={(v) => setDomainRecord(v)}
          onClickOutside={() => setShowResults(false)}
          onFocus={() => setShowResults(true)}
          placeholder="Search for a name"
          searchIcon={
            <span className="flex h-full items-center border-l border-dark-grey pl-4">
              <SearchIcon width="18px" height="18px" className="fill-foreground" />
            </span>
          }
          clearIcon={
            <XIcon width="18px" height="18px" className="text-foreground" />
          }
        >
          {/* Search Results */}
          {hasResults && (
            <div
              className="flex flex-col w-full p-6 pt-4 border-t border-dark-grey bg-surface"
              data-testid="home-search-child-container"
            >
              {/* Status Badge & Price */}
              <div className="flex flex-row w-full justify-between items-start">
                <span className="text-muted text-sm">
                  {isSearching ? (
                    <span>Searching...</span>
                  ) : isAvailable ? (
                    !isValidDomain ? (
                      <span className="flex items-center gap-2 text-error">
                        INVALID
                        <CircleAlert size={14} />
                      </span>
                    ) : isReturnedName ? (
                      <span className="flex items-center gap-2 text-primary">
                        RECENTLY RETURNED
                        <Tooltip
                          message={recentlyReturnedTooltipMessage}
                          icon={<CircleAlert size={14} />}
                          tooltipOverrides={{
                            overlayInnerStyle: { width: '338px', padding: '1rem' },
                          }}
                        />
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-success">
                        AVAILABLE
                        <CircleCheckFilled width="14px" height="14px" className="fill-success" />
                      </span>
                    )
                  ) : (
                    <span className="flex items-center gap-2">
                      NOT AVAILABLE
                      <DomainDetailsTip domain={domainQuery} domainRecord={domainRecord} />
                    </span>
                  )}
                </span>
                {isAvailable && !isSearching && isValidDomain && (
                  <DomainPiceList domain={domainQuery} />
                )}
              </div>

              {/* Results Content */}
              <div className="mt-4">
                {isSearching ? (
                  <div className="flex w-full justify-center py-4">
                    <ArioSpinner size={60} />
                  </div>
                ) : isReturnedName ? (
                  <div className="flex flex-col w-full gap-4">
                    <div className="flex flex-row w-full justify-between items-center">
                      <span className="text-xl text-foreground">
                        ar://{decodeDomainToASCII(domainQuery)}
                      </span>
                      <button
                        className="py-2 px-4 text-sm bg-primary font-bold rounded text-primary-foreground disabled:opacity-50"
                        disabled={!isValidDomain}
                        onClick={() => navigate(`/register/${lowerCaseDomain(domainQuery)}`)}
                      >
                        Register
                      </button>
                    </div>
                    <div className="h-[200px]">
                      <RNPChart name={lowerCaseDomain(domainQuery)} />
                    </div>
                  </div>
                ) : isAvailable ? (
                  <div className="flex flex-row w-full justify-between items-center">
                    <span className="text-xl text-foreground">
                      ar://{decodeDomainToASCII(domainQuery)}
                    </span>
                    <button
                      className="py-2 px-4 text-sm bg-primary font-bold rounded text-primary-foreground disabled:opacity-50"
                      disabled={!isValidDomain}
                      onClick={() => navigate(`/register/${lowerCaseDomain(domainQuery)}`)}
                    >
                      Register
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-row w-full justify-between items-center">
                    <span className="text-xl text-muted">
                      {decodeDomainToASCII(domainQuery)}.{gateway}
                    </span>
                    <button
                      className="text-sm text-foreground flex items-center gap-1 hover:text-primary transition-colors"
                      onClick={() => navigate(`/manage/names/${lowerCaseDomain(domainQuery)}`)}
                    >
                      View Details
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DomainSearch>

        {/* Validation Notes */}
        {domainQuery.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 w-full mt-3">
            {Object.entries(validations).map(([name, isValid], index) => (
              <span
                key={index}
                className={`inline-flex items-center gap-1.5 text-sm ${
                  isValid ? 'text-muted' : 'text-muted animate-pulse'
                }`}
              >
                <CircleCheckFilled
                  width="14px"
                  height="14px"
                  fill={isValid ? 'rgb(var(--color-success))' : 'rgb(var(--color-muted))'}
                />
                {name}
              </span>
            ))}
          </div>
        )}
    </div>
  );
}

export default HomeSearch;
