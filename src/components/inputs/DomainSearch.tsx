import { AoArNSNameData } from '@ar.io/sdk';
import { useArNSRegistryDomains } from '@src/hooks/useArNSRegistryDomains';
import { decodeDomainToASCII, lowerCaseDomain } from '@src/utils';
import { MAX_ARNS_NAME_LENGTH } from '@src/utils/constants';
import { SearchIcon, XIcon } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

function DomainSearch({
  children = <></>,
  placeholder = 'Search for a domain',
  setIsSearching = () => null,
  setIsAvailable = () => null,
  setDomainQuery = () => null,
  setDomainRecord = () => null,
  setIsValidDomain = () => null,
  setValidationError = () => null,
  className,
  inputWrapperClass,
  inputClass,
  buttonClass,
  searchIcon = (
    <SearchIcon width={'18px'} height={'18px'} className="fill-white" />
  ),
  clearIcon = <XIcon width={'18px'} height={'18px'} className="fill-white" />,
}: {
  children?: ReactNode;
  placeholder?: string;
  setIsSearching?: (isSearching: boolean) => void;
  setIsAvailable?: (isAvailable: boolean) => void;
  setDomainQuery?: (searchQuery: string) => void;
  setDomainRecord?: (domainRecord: AoArNSNameData | undefined) => void;
  setIsValidDomain?: (isValidDomain: boolean) => void;
  setValidationError?: (validationError: string) => void;
  className?: string;
  inputWrapperClass?: string;
  inputClass?: string;
  buttonClass?: string;
  searchIcon?: ReactNode;
  clearIcon?: ReactNode;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { data: arnsDomains, isLoading: loadingArnsRegistryDomains } =
    useArNSRegistryDomains();
  const [searchQuery, setSearchQuery] = useState<string>('');

  function reset() {
    setSearchParams({ ...searchParams, search: '' });
    setSearchQuery('');
    setIsSearching(false);
    setIsAvailable(false);
    setDomainQuery('');
    setDomainRecord({} as AoArNSNameData);
  }

  function availabilityHandler({
    domain,
    registeredDomains,
  }: {
    domain: string;
    registeredDomains: Record<string, AoArNSNameData>;
  }) {
    const domainRecord = registeredDomains[domain];
    if (domainRecord) {
      setIsAvailable(false);
      setDomainRecord(domainRecord);
      setIsValidDomain(false);
      setValidationError('This domain is already taken');
      setDomainRecord(domainRecord);
    } else {
      setIsAvailable(true);
      setDomainRecord({} as AoArNSNameData);
      setIsValidDomain(true);
      setValidationError('');
    }
  }

  function inputHandler(v: string) {
    const newSearchQuery = lowerCaseDomain(v.trim());
    if (newSearchQuery.length > MAX_ARNS_NAME_LENGTH) {
      return;
    }
    setSearchParams({ ...searchParams, search: newSearchQuery });
    setSearchQuery(newSearchQuery);
    if (newSearchQuery.length > 0) {
      setIsSearching(true);
      setDomainQuery(newSearchQuery);
    } else {
      setIsSearching(false);
      setIsAvailable(false);
      setDomainQuery('');
      setDomainRecord({} as AoArNSNameData);
      setValidationError('');
    }
  }

  // handle search param changes
  useEffect(() => {
    const search = searchParams.get('search');
    if (searchQuery !== search) {
      inputHandler(search ?? '');
    }
  }, [location.search]);

  // handle domain availability and price changes
  useEffect(() => {
    const domainsObject = arnsDomains?.items?.reduce(
      (acc: Record<string, AoArNSNameData>, domain) => {
        acc[domain.name] = domain;
        return acc;
      },
      {},
    );
    availabilityHandler({
      domain: searchQuery,
      registeredDomains: domainsObject ?? {},
    });

    setIsSearching(loadingArnsRegistryDomains);
  }, [searchQuery, arnsDomains, loadingArnsRegistryDomains]);

  return (
    <div className={`${className}`}>
      <div className={`${inputWrapperClass}`}>
        <input
          type="text"
          placeholder={placeholder}
          value={decodeDomainToASCII(searchQuery)}
          onChange={(e) => inputHandler(e.target.value)}
          className={`${inputClass}`}
          data-testid="domain-search-input"
        />
        <button
          className={`${buttonClass}`}
          data-testid="domain-search-button"
          onClick={() => reset()}
        >
          {searchQuery.length ? clearIcon : searchIcon}
        </button>
      </div>
      {children}
    </div>
  );
}

export default DomainSearch;
