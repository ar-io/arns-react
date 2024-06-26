import { useWalletState } from '@src/state/contexts/WalletState';
// import { buildArNSRecordQuery } from '@src/utils/network';
// import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useIsMobile, useRegistrationStatus } from '../../../hooks';
import { ArweaveTransactionID } from '../../../services/arweave/ArweaveTransactionID';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import { FEATURED_DOMAINS } from '../../../utils/constants';
import {
  decodeDomainToASCII,
  lowerCaseDomain,
} from '../../../utils/searchUtils/searchUtils';
import SearchBar from '../../inputs/Search/SearchBar/SearchBar';
import { FeaturedDomains } from '../../layout';
import './styles.css';

function Home() {
  // const queryClient = useQueryClient();

  const [{ arioContract }] = useGlobalState();
  const [{ walletAddress }] = useWalletState();
  const [searchParams, setSearchParams] = useSearchParams();
  const [{ domain, antID }, dispatchRegisterState] = useRegistrationState();
  const {
    isReserved,
    reservedFor,
    loading: isValidatingRegistration,
  } = useRegistrationStatus(domain);
  const [featuredDomains, setFeaturedDomains] = useState<{
    [x: string]: string;
  }>();
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

  useEffect(() => {
    fetchFeaturedDomains();
  }, []);

  async function fetchFeaturedDomains() {
    try {
      const results = await Promise.all(
        FEATURED_DOMAINS.map(async (domain: string) => {
          const record = await arioContract.getArNSRecord({ name: domain });
          const res = record?.processId ? [domain, record?.processId] : [];
          return res;
        }),
      );
      const newFeaturedDomains = Object.fromEntries(
        results.filter((x) => x.length),
      );
      setFeaturedDomains(newFeaturedDomains);
    } catch (error) {
      console.error(error);
    }
  }

  function updateShowFeaturedDomains({
    isReserved,
    reservedFor,
    currentFeaturedDomains,
    antId,
    domainName,
  }: {
    currentFeaturedDomains: { [x: string]: string };
    antId: ArweaveTransactionID | undefined;
    domainName: string | undefined;
    isReserved: boolean;
    reservedFor?: ArweaveTransactionID;
  }): boolean {
    if (
      (currentFeaturedDomains &&
        !antId &&
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
          padding: isMobile ? '10px' : '30px',
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
          gap: 0,
          maxWidth: '900px',
          minWidth: isMobile ? '100%' : '750px',
        }}
      >
        <SearchBar placeholderText={'Search for a name'} />
        {updateShowFeaturedDomains({
          isReserved: isReserved,
          reservedFor: reservedFor,
          currentFeaturedDomains: featuredDomains ?? {},
          antId: antID,
          domainName: lowerCaseDomain(domain),
        }) &&
        featuredDomains &&
        !isValidatingRegistration ? (
          <FeaturedDomains domains={featuredDomains} />
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

export default Home;
