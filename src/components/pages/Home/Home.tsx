import { useWalletState } from '@src/state/contexts/WalletState';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useIsMobile, useRegistrationStatus } from '../../../hooks';
import { ArweaveTransactionID } from '../../../services/arweave/ArweaveTransactionID';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import {
  decodeDomainToASCII,
  lowerCaseDomain,
} from '../../../utils/searchUtils/searchUtils';
import SearchBar from '../../inputs/Search/SearchBar/SearchBar';
import { FeaturedDomains } from '../../layout';

function Home() {
  const [{ walletAddress }] = useWalletState();
  const [searchParams, setSearchParams] = useSearchParams();
  const [{ domain, antID }, dispatchRegisterState] = useRegistrationState();
  const {
    isReserved,
    reservedFor,
    loading: isValidatingRegistration,
  } = useRegistrationStatus(domain);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (domain && domain !== searchParams.get('search')) {
      const serializeSearchParams: Record<string, string> = {
        search: decodeDomainToASCII(domain),
      };
      setSearchParams(serializeSearchParams);
      return;
    }
  }, [domain]);

  useEffect(() => {
    const searchDomain = searchParams.get('search');
    if (searchDomain && searchDomain !== domain) {
      dispatchRegisterState({
        type: 'setDomainName',
        payload: searchDomain,
      });
      return;
    }
  }, [searchParams]);

  function updateShowFeaturedDomains({
    isReserved,
    reservedFor,

    antId,
    domainName,
  }: {
    antId: ArweaveTransactionID | undefined;
    domainName: string | undefined;
    isReserved: boolean;
    reservedFor?: ArweaveTransactionID;
  }): boolean {
    if (
      (!antId &&
        (!isReserved ||
          (isReserved &&
            reservedFor?.toString() === walletAddress?.toString()))) ||
      !domainName
    ) {
      return true;
    }

    return false;
  }

  return (
    <div
      className="page"
      style={{ padding: isMobile ? '15px' : '', boxSizing: 'border-box' }}
    >
      <div
        className={'white'}
        style={{
          fontSize: isMobile ? 26 : 57,
          padding: isMobile ? '10px' : '20px',
          paddingTop: '10px',
          fontWeight: 500,
          whiteSpace: isMobile ? undefined : 'nowrap',
        }}
      >
        Arweave Name System
      </div>

      <div
        className="flex flex-column flex-center"
        style={{
          width: '100%',
          maxWidth: '900px',
          gap: 0,
          minWidth: isMobile ? '100%' : '750px',
        }}
      >
        <SearchBar placeholderText={'Search for a name'} />
        {updateShowFeaturedDomains({
          isReserved: isReserved,
          reservedFor: reservedFor,
          antId: antID,
          domainName: lowerCaseDomain(domain),
        }) && !isValidatingRegistration ? (
          <FeaturedDomains />
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

export default Home;
