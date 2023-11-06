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
  const [searchParams, setSearchParams] = useSearchParams();
  const [{ pdnsSourceContract }] = useGlobalState();
  const [{ domain, antID }, dispatchRegisterState] = useRegistrationState();
  const {
    isActiveAuction,
    isReserved,
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
    if (Object.keys(pdnsSourceContract.records).length) {
      const newFeaturedDomains = Object.fromEntries(
        FEATURED_DOMAINS.map((domain: string) =>
          pdnsSourceContract.records[domain]?.contractTxId
            ? [domain, pdnsSourceContract.records[domain].contractTxId]
            : [],
        ).filter((n) => n.length),
      );

      setFeaturedDomains(newFeaturedDomains);
    }
  }, [pdnsSourceContract]);

  function updateShowFeaturedDomains({
    auction,
    reserved,
    domains,
    id,
    name,
  }: {
    domains: { [x: string]: string };
    id: ArweaveTransactionID | undefined;
    name: string | undefined;
    auction: boolean;
    reserved: boolean;
  }): boolean {
    if ((domains && !id && !reserved && !auction) || !name) {
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
        {
          //!isValidatingRegistration &&
          updateShowFeaturedDomains({
            auction: isActiveAuction,
            reserved: isReserved,
            domains: featuredDomains ?? {},
            id: antID,
            name: lowerCaseDomain(domain),
          }) &&
          featuredDomains &&
          !isValidatingRegistration ? (
            <FeaturedDomains domains={featuredDomains} />
          ) : (
            <></>
          )
        }
      </div>
    </div>
  );
}

export default Home;
