import { CheckCircleFilled } from '@ant-design/icons';
import { AoArNSNameData } from '@ar.io/sdk';
import DomainDetailsTip from '@src/components/data-display/DomainDetailsTip';
import { CircleCheckFilled, SearchIcon } from '@src/components/icons';
import { useGlobalState, useWalletState } from '@src/state';
import { decodeDomainToASCII, lowerCaseDomain } from '@src/utils';
import Lottie from 'lottie-react';
import { ChevronRight, XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import arioLoading from '../../icons/ario-spinner.json';
import DomainSearch from '../DomainSearch';
import DomainPiceList from './DomainPriceList';

const defaultValidations = {
  ['Max. 51 characters']: false,
  ['No special characters or underscores']: false,
  ['Dashes cannot be leading or trailing']: false,
};

function HomeSearch() {
  const navigate = useNavigate();
  const [{ walletAddress }] = useWalletState();
  const [{ gateway }] = useGlobalState();
  const [isSearching, setIsSearching] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [validations, setValidations] =
    useState<typeof defaultValidations>(defaultValidations);
  const [validationError, setValidationError] = useState('');
  const [isValidDomain, setIsValidDomain] = useState(false);
  const [domainQuery, setDomainQuery] = useState('');
  const [domainRecord, setDomainRecord] = useState<AoArNSNameData>();

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
      ['Max. 51 characters']: safeDomain.length <= 51,
      ['No special characters or underscores']: /^[a-zA-Z0-9-]*$/.test(
        safeDomain,
      ),
      ['Dashes cannot be leading or trailing']: !/^-|-$/g.test(safeDomain),
    };
    let validDomain = true;
    Object.entries(validations).forEach(([name, isValid]) => {
      switch (name) {
        case 'No special characters or underscores':
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
    <div className={domainQuery.length == 0 ? `` : `modal-container relative`}>
      <div
        className={`flex flex-col w-full max-w-[800px] h-[200px] ${
          domainQuery.length == 0 ? `` : `absolute mx-0 top-[240px]`
        }`}
      >
        <div className="flex flex-col w-full h-full">
          {!isValidDomain && domainQuery.length ? (
            <div className="flex flex-row min-h-[50px] pb-2 text-xl font-semibold text-grey justify-center items-center">
              Invalid ArNS domain, {validationError}
            </div>
          ) : isSearching || domainQuery.length == 0 || !isAvailable ? (
            <div className="min-h-[50px]" />
          ) : (
            <div
              className="flex flex-row min-h-[50px] pb-2 text-2xl font-semibold text-white justify-center items-center"
              style={{ gap: 0 }}
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
                searching: isSearching,
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
            {domainQuery.length ? (
              <div className="flex flex-col w-full p-6 pt-4 border-t-[1px] border-dark-grey">
                <div className="flex flew-row w-full justify-between">
                  <span className="text-grey text-sm">
                    {isSearching ? (
                      <span>Searching...</span>
                    ) : isAvailable ? (
                      <span className="whitespace-nowrap flex items-center gap-2">
                        AVAILABLE{' '}
                        <CircleCheckFilled
                          className="fill-success"
                          width={'14px'}
                          height={'14px'}
                        />
                      </span>
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
                {isSearching ? (
                  <Lottie
                    animationData={arioLoading}
                    loop={true}
                    className="h-[60px]"
                  />
                ) : isAvailable ? (
                  <div className="flex flex-row w-full justify-between mt-4">
                    <span className="text-xl text-white">
                      ar://{decodeDomainToASCII(domainQuery)}
                    </span>
                    <button
                      className={`py-2 px-3 text-sm bg-primary font-bold rounded-[4px] text-black disabled:opacity-50 disabled:bg-grey`}
                      disabled={!isValidDomain}
                      onClick={() => {
                        if (!walletAddress?.toString()) {
                          navigate('/connect', {
                            state: `/?search=${lowerCaseDomain(domainQuery)}`,
                          });
                        } else {
                          navigate(`/register/${lowerCaseDomain(domainQuery)}`);
                        }
                      }}
                    >
                      Register
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-row w-full justify-between mt-4">
                    <span className="text-xl text-grey">
                      {decodeDomainToASCII(domainQuery)}.{gateway}
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
            className="flex flex-row w-full mt-2 justify-center items-center max-w-[775px]"
            style={{ rowGap: '4px' }}
          >
            {domainQuery.length ? (
              Object.entries(validations).map(([name, isValid], index) => (
                <span
                  key={index}
                  className={
                    `flex flex-row justify-center items-center whitespace-nowrap text-sm  ` +
                    (isValid ? 'text-white' : 'animate-pulse text-grey')
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
