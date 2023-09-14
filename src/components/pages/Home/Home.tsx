import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useIsMobile, useRegistrationStatus } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import { ArweaveTransactionID } from '../../../types';
import { FEATURED_DOMAINS } from '../../../utils/constants';
import {
  decodeDomainToASCII,
  encodeDomainToASCII,
  lowerCaseDomain,
} from '../../../utils/searchUtils/searchUtils';
import SearchBar from '../../inputs/Search/SearchBar/SearchBar';
import { FeaturedDomains } from '../../layout';
import './styles.css';

function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [{ pdnsSourceContract }] = useGlobalState();
  const [{ domain, antID }, dispatchRegisterState] = useRegistrationState();
  const [{ isAuction }] = useRegistrationStatus(domain);
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
    auction?: boolean;
    reserved?: boolean;
  }): boolean {
    if ((domains && !id && !reserved && !auction) || !name) {
      return true;
    }

    return false;
  }

  return (
    <div className="page" style={{ padding: isMobile ? '15px' : '' }}>
      <div
        className={'white'}
        style={{
          fontSize: isMobile ? 26 : 57,
          padding: isMobile ? '30px 0px' : 56,
          fontWeight: 500,
          whiteSpace: 'nowrap',
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
        <SearchBar
          values={pdnsSourceContract.records}
          value={domain ? encodeDomainToASCII(domain) : domain}
          placeholderText={'Search for a name'}
        />
        {
          //!isValidatingRegistration &&
          updateShowFeaturedDomains({
            auction: isAuction,
            reserved:
              !!domain && !!pdnsSourceContract.records[lowerCaseDomain(domain)],
            domains: featuredDomains ?? {},
            id: antID,
            name: lowerCaseDomain(domain),
          }) && featuredDomains ? (
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
