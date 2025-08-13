import { AoArNSNameData } from '@ar.io/sdk/web';
import { useRegistrationStatus } from '@src/hooks/useRegistrationStatus/useRegistrationStatus';
import { decodeDomainToASCII, lowerCaseDomain } from '@src/utils';
import { MAX_ARNS_NAME_LENGTH } from '@src/utils/constants';
import { SearchIcon, XIcon } from 'lucide-react';
import { ReactNode, useEffect, useRef, useState } from 'react';

function DomainSearch({
  children = <></>,
  placeholder = 'Search for a domain',
  setIsSearching = () => null,
  setIsAvailable = () => null,
  setIsReturnedName = () => null,
  setDomainQuery = () => null,
  setDomainRecord = () => null,
  setIsValidDomain = () => null,
  setValidationError = () => null,
  onClickOutside = () => null,
  onFocus = () => null,
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
  setIsReturnedName?: (isReturnedName: boolean) => void;
  setDomainQuery?: (searchQuery: string) => void;
  setDomainRecord?: (domainRecord: AoArNSNameData | undefined) => void;
  setIsValidDomain?: (isValidDomain: boolean) => void;
  setValidationError?: (validationError: string) => void;
  onClickOutside?: (e: MouseEvent) => void;
  onFocus?: () => void;
  className?: string;
  inputWrapperClass?: string;
  inputClass?: string;
  buttonClass?: string;
  searchIcon?: ReactNode;
  clearIcon?: ReactNode;
}) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
  const {
    record: domainRecord,
    isAvailable,
    isReturnedName,
    isLoading,
  } = useRegistrationStatus(debouncedSearchQuery);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  function reset() {
    setSearchQuery('');
    setIsSearching(false);
    setIsAvailable(false);
    setIsReturnedName(false);
    setDomainQuery('');
    setDebouncedSearchQuery('');
    setDomainRecord({} as AoArNSNameData);
    setIsValidDomain(false);
    setValidationError('');
  }

  function availabilityHandler({
    debouncedSearchQuery,
    isLoading,
    isAvailable,
    isReturnedName,
    domainRecord,
  }: {
    debouncedSearchQuery: string;
    isLoading: boolean;
    isAvailable: boolean;
    isReturnedName: boolean;
    domainRecord: AoArNSNameData | null | undefined;
  }) {
    if (debouncedSearchQuery.length === 0) {
      reset();
      return;
    }

    // we have already handled debounced on the input, so if this is called, we are ready to update the state
    setIsSearching(isLoading);
    setDomainQuery(debouncedSearchQuery);
    setIsAvailable(isAvailable);
    setIsReturnedName(isReturnedName);
    setDomainRecord(domainRecord ?? ({} as AoArNSNameData));
    setValidationError(isAvailable ? '' : 'This domain is already taken');
  }

  function inputHandler(v: string) {
    const newSearchQuery = lowerCaseDomain(v.trim());
    if (newSearchQuery.length > MAX_ARNS_NAME_LENGTH) {
      return;
    }

    // set the state right away so the input is updated
    setSearchQuery(newSearchQuery);

    // clear the timeout if it exists
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // no need to trigger anything if the search query is empty
    if (newSearchQuery.length === 0) {
      reset();
      return;
    }

    // show searching right away, but do not update the search query until the debounce timeout is complete
    setIsSearching(true);

    // set the debounced search query
    debounceTimeoutRef.current = setTimeout(() => {
      console.log('setting debounced search query to', newSearchQuery);
      setDebouncedSearchQuery(newSearchQuery);
    }, 500); // 500ms delay
  }

  // add listeners to trigger focus and click out callbacks
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onClickOutside(e);
      }
    }

    function handleFocus() {
      onFocus();
    }
    // we listen to the document for click events, and container for focus events because the container is a child of the document and will cause issues on modal workflows with the details being overlaid on the modal
    document.addEventListener('click', handleClickOutside);
    container.addEventListener('focus', handleFocus, true);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      container.removeEventListener('focus', handleFocus, true);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    availabilityHandler({
      debouncedSearchQuery,
      isLoading,
      isAvailable,
      isReturnedName,
      domainRecord,
    });
  }, [
    debouncedSearchQuery,
    isLoading,
    isAvailable,
    isReturnedName,
    domainRecord,
  ]);

  return (
    <div ref={containerRef} className={`${className}`}>
      <div className={`${inputWrapperClass}`}>
        <input
          ref={inputRef}
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
