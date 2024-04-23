import { useWalletState } from '@src/state/contexts/WalletState';
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
import PageLoader from '../../layout/progress/PageLoader/PageLoader';
import './styles.css';

function Home() {
  const [{ arweaveDataProvider }] = useGlobalState();
  const [{ walletAddress }] = useWalletState();
  const [searchParams, setSearchParams] = useSearchParams();
  const [{ domain, antID }, dispatchRegisterState] = useRegistrationState();
  const {
    isActiveAuction,
    isReserved,
    reservee,
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
          const record = await arweaveDataProvider
            .getRecord({ domain })
            .catch(() => undefined);
          const res = record?.contractTxId
            ? [domain, record?.contractTxId]
            : [];
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
    auction,
    reserved,
    reservee,
    domains,
    id,
    name,
  }: {
    domains: { [x: string]: string };
    id: ArweaveTransactionID | undefined;
    name: string | undefined;
    auction: boolean;
    reserved: boolean;
    reservee?: ArweaveTransactionID;
  }): boolean {
    if (
      (domains &&
        !id &&
        !reserved &&
        reservee?.toString() !== walletAddress?.toString() &&
        !auction) ||
      !name
    ) {
      return true;
    }

    return false;
  }

  if (!featuredDomains) {
    return <PageLoader loading message={'Loading Home'} />;
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
          auction: isActiveAuction,
          reserved: isReserved,
          reservee: reservee,
          domains: featuredDomains ?? {},
          id: antID,
          name: lowerCaseDomain(domain),
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
