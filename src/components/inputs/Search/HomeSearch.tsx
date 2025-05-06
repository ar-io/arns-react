import { CheckCircleFilled } from '@ant-design/icons';
import { AoArNSNameData } from '@ar.io/sdk/web';
import DomainDetailsTip from '@src/components/Tooltips/DomainDetailsTip';
import { Tooltip } from '@src/components/data-display';
import { RNPChart } from '@src/components/data-display/charts/RNPChart';
import { CircleCheckFilled, SearchIcon } from '@src/components/icons';
import useDebounce from '@src/hooks/useDebounce';
import { useReturnedNames } from '@src/hooks/useReturnedNames';
import { decodeDomainToASCII, lowerCaseDomain } from '@src/utils';
import { NETWORK_DEFAULTS } from '@src/utils/constants';
import Lottie from 'lottie-react';
import { ChevronRight, CircleAlert, XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import arioLoading from '../../icons/ario-spinner.json';
import DomainSearch from '../DomainSearch';
import DomainPiceList from './DomainPriceList';

const recentlyReturnedTooltipMessage = `Recently expired leases or returned permanent names are initially priced with a premium starting at a 50x multiplier. This premium decreases linearly over 14 days, eventually returning to the base registration price.`;

const maxCharValidation = 'Max. 51 characters';
const noSpecialCharsValidation = 'No special characters';
const dashesValidation = 'Dashes cannot be leading or trailing';
const wwwValidation = 'Cannot be www';
const defaultValidations = {
  [maxCharValidation]: false,
  [noSpecialCharsValidation]: false,
  [dashesValidation]: false,
  [wwwValidation]: false,
};

function HomeSearch() {
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const { data: returnedNames } = useReturnedNames();
  const [isAvailable, setIsAvailable] = useState(false);
  const [validations, setValidations] =
    useState<typeof defaultValidations>(defaultValidations);
  const [validationError, setValidationError] = useState('');
  const [isValidDomain, setIsValidDomain] = useState(false);
  const [query, setDomainQuery] = useState('');
  const domainQuery = useDebounce(query ?? '', query.length <= 1 ? 0 : 800);
  const [domainRecord, setDomainRecord] = useState<AoArNSNameData>();
  const [showResults, setShowResults] = useState(true);

  const isReturnedName = returnedNames
    ? !!returnedNames.items.find(
        (item) => item.name === lowerCaseDomain(domainQuery),
      )
    : false;

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
      return 'border-grey';
    }
    if (domain.length === 0) {
      return 'border-dark-grey';
    }
    if (searching) {
      return 'border-white';
    }
    if (availability) {
      return 'border-success';
    } else {
      return 'border-error';
    }
  }
  return (
    <div
      className={
        domainQuery.length == 0 || !showResults
          ? ``
          : `modal-container relative`
      }
    >
      <div
        className={`flex flex-col w-full max-w-[800px] min-h-fit ${
          domainQuery.length == 0 ? `` : `absolute mx-0 top-[240px]`
        }`}
      >
        <div className="flex flex-col w-full h-full">
          {!isValidDomain && domainQuery.length ? (
            <div
              className="flex flex-row min-h-[50px] pb-2 text-xl font-semibold text-grey justify-center items-center"
              data-testid="home-search-invalid-header"
            >
              Invalid ArNS domain, {validationError}
            </div>
          ) : isSearching ||
            query !== domainQuery ||
            domainQuery.length == 0 ||
            !isAvailable ? (
            <div
              className="min-h-[50px]"
              data-testid="home-search-spacer-header"
            />
          ) : (
            <div
              className="flex flex-row min-h-[50px] pb-2 text-2xl font-semibold text-white justify-center items-center"
              style={{ gap: 0 }}
              data-testid="home-search-available-header"
            >
              <span style={{ color: 'var(--success-green)' }}>
                {decodeDomainToASCII(domainQuery)}
              </span>
              &nbsp;is available!&nbsp;
              <CheckCircleFilled
                style={{ fontSize: '20px', color: 'var(--success-green)' }}
              />
            </div>
          )}
          <DomainSearch
            className={`flex flex-col w-full rounded-[4px] bg-foreground border-[1px] ${getBorderStyle(
              {
                availability: isAvailable,
                searching: isSearching || query !== domainQuery,
                domain: domainQuery,
                validDomain: isValidDomain,
              },
            )}`}
            inputWrapperClass="flex flex-row w-full p-2 pr-[100px] relative gap-2"
            inputClass="flex w-full pl-4 h-[50px] bg-foreground focus:outline-none placeholder:text-grey text-[14px] text-white text-lg"
            buttonClass={`flex flex-row items-center justify-center absolute right-0 top-0 h-full max-w-[65px]`}
            setIsSearching={(v) => setIsSearching(v)}
            setIsAvailable={(v) => setIsAvailable(v)}
            setDomainQuery={(v) => setDomainQuery(v)}
            setDomainRecord={(v) => setDomainRecord(v)}
            onClickOutside={() => {
              setShowResults(false);
            }}
            onFocus={() => {
              setShowResults(true);
            }}
            placeholder="Search for a name"
            searchIcon={
              <span className="flex w-full h-full items-center justify-center border-l-[1px] border-dark-grey">
                <SearchIcon
                  width={'18px'}
                  height={'18px'}
                  className="fill-white"
                />
              </span>
            }
            clearIcon={
              <XIcon
                width={'18px'}
                height={'18px'}
                className="fill-white text-white"
              />
            }
          >
            {domainQuery.length && showResults ? (
              <div
                className="flex flex-col w-full p-6 pt-4 border-t-[1px] border-dark-grey"
                data-testid="home-search-child-container"
              >
                <div className="flex flew-row w-full justify-between">
                  <span className="text-grey text-sm">
                    {isSearching || query !== domainQuery ? (
                      <span>Searching...</span>
                    ) : isAvailable ? (
                      !isValidDomain ? (
                        <span className="whitespace-nowrap flex items-start justify-center gap-2 text-error">
                          INVALID{' '}
                          <CircleAlert
                            className="m-[2px]"
                            width={'14px'}
                            height={'14px'}
                          />
                        </span>
                      ) : isReturnedName ? (
                        <span className="whitespace-nowrap flex items-start justify-center gap-2 text-primary">
                          RECENTLY RETURNED{' '}
                          <Tooltip
                            message={recentlyReturnedTooltipMessage}
                            icon={
                              <CircleAlert
                                className="m-[2px]"
                                width={'14px'}
                                height={'14px'}
                              />
                            }
                            tooltipOverrides={{
                              overlayInnerStyle: {
                                width: '338px',
                                padding: '1rem',
                              },
                            }}
                          />
                        </span>
                      ) : (
                        <span className="whitespace-nowrap flex items-center gap-2">
                          AVAILABLE{' '}
                          <CircleCheckFilled
                            className="fill-success"
                            width={'14px'}
                            height={'14px'}
                          />
                        </span>
                      )
                    ) : (
                      <span className="whitespace-nowrap flex items-center gap-2">
                        NOT AVAILABLE
                        <DomainDetailsTip
                          domain={domainQuery}
                          domainRecord={domainRecord}
                        />
                      </span>
                    )}
                  </span>
                  {isAvailable && !isSearching && isValidDomain && (
                    <DomainPiceList domain={domainQuery} />
                  )}
                </div>
                {isSearching || query !== domainQuery ? (
                  <Lottie
                    animationData={arioLoading}
                    loop={true}
                    className="h-[60px]"
                  />
                ) : isReturnedName ? (
                  <div className="flex flex-col w-full gap-2 mt-4 h-700px">
                    <div className="flex flex-row w-full justify-between ">
                      <span className="text-xl text-white">
                        ar://{decodeDomainToASCII(domainQuery)}
                      </span>
                      <button
                        className={`py-2 px-3 text-sm bg-primary font-bold rounded-[4px] text-black disabled:opacity-50 disabled:bg-grey`}
                        disabled={!isValidDomain}
                        onClick={() => {
                          navigate(`/register/${lowerCaseDomain(domainQuery)}`);
                        }}
                      >
                        Register
                      </button>
                    </div>
                    <div className="h-[200px]">
                      {' '}
                      <RNPChart name={lowerCaseDomain(domainQuery)} />
                    </div>
                  </div>
                ) : isAvailable ? (
                  <div className="flex flex-row w-full justify-between mt-4">
                    <span className="text-xl text-white">
                      ar://{decodeDomainToASCII(domainQuery)}
                    </span>
                    <button
                      className={`py-2 px-3 text-sm bg-primary font-bold rounded-[4px] text-black disabled:opacity-50 disabled:bg-grey`}
                      disabled={!isValidDomain}
                      onClick={() => {
                        navigate(`/register/${lowerCaseDomain(domainQuery)}`);
                      }}
                    >
                      Register
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-row w-full justify-between mt-4">
                    <span className="text-xl text-grey">
                      {decodeDomainToASCII(domainQuery)}.
                      {NETWORK_DEFAULTS.ARNS.HOST}
                    </span>
                    <button
                      className="text-[12px] text-white whitespace-nowrap flex items-center"
                      style={{ gap: 0 }}
                      onClick={() => {
                        navigate(
                          `/manage/names/${lowerCaseDomain(domainQuery)}`,
                        );
                      }}
                    >
                      View Details{' '}
                      <ChevronRight width={'18px'} height={'18px'} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <></>
            )}
          </DomainSearch>
          {/* validation notes */}
          <div
            className="flex flex-row w-full mt-2 justify-center items-center max-w-[775px] min-w-full"
            style={{ rowGap: '4px' }}
          >
            {domainQuery.length ? (
              Object.entries(validations).map(([name, isValid], index) => (
                <span
                  key={index}
                  className={
                    `flex flex-row justify-center items-center whitespace-nowrap text-sm ` +
                    (isValid ? 'text-grey' : 'animate-pulse text-grey')
                  }
                  style={{ gap: '5px' }}
                >
                  <CircleCheckFilled
                    width={'14px'}
                    height={'14px'}
                    fill={isValid ? 'var(--success-green)' : 'var(--text-grey)'}
                  />{' '}
                  {name}
                </span>
              ))
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeSearch;
