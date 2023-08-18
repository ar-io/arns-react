import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useIsMobile } from '../../../hooks';
import useRegistrationStatus from '../../../hooks/useRegistrationStatus/useRegistrationStatus';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import { ArweaveTransactionID } from '../../../types';
import { FEATURED_DOMAINS } from '../../../utils/constants';
import {
  decodeDomainToASCII,
  encodeDomainToASCII,
  isPDNSDomainNameAvailable,
  isPDNSDomainNameValid,
  lowerCaseDomain,
} from '../../../utils/searchUtils/searchUtils';
import SearchBar from '../../inputs/Search/SearchBar/SearchBar';
import { FeaturedDomains, Loader } from '../../layout';
import { SearchBarFooter, SearchBarHeader } from '../../layout';
import './styles.css';

export const searchBarSuccessPredicate = ({
  value,
  records,
}: {
  value: string | undefined;
  records: { [x: string]: any };
}) => {
  if (!value) {
    return false;
  }

  return isPDNSDomainNameAvailable({
    name: encodeDomainToASCII(value),
    records: records,
  });
};

export const searchBarValidationPredicate = ({
  value,
}: {
  value: string | undefined;
}) => {
  if (!value) {
    return false;
  }

  return isPDNSDomainNameValid({
    name: encodeDomainToASCII(value),
  });
};

function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [{ pdnsSourceContract }] = useGlobalState();
  const [{ domain, antID }, dispatchRegisterState] = useRegistrationState();
  const [{ isAuction, isReserved, loading: isValidatingRegistration }] =
    useRegistrationStatus(domain);
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
    auction: boolean;
    reserved: boolean;
    domains: { [x: string]: string };
    id: ArweaveTransactionID | undefined;
    name: string | undefined;
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
        }}
      >
        Arweave Name System
      </div>

      {!Object.keys(pdnsSourceContract.records).length ? (
        <Loader
          size={80}
          wrapperStyle={{ margin: '75px' }}
          message="Loading ARNS Registry Contract..."
        />
      ) : (
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
            onSubmit={(next = false) => {
              dispatchRegisterState({
                type: 'setIsSearching',
                payload: true,
              });
              if (next) {
                navigate(`/register/${decodeDomainToASCII(domain)}`);
              }
            }}
            onChange={() => {
              dispatchRegisterState({
                type: 'reset',
              });
            }}
            onSuccess={(value: string) => {
              dispatchRegisterState({
                type: 'setDomainName',
                payload: value,
              });
              dispatchRegisterState({
                type: 'setANTID',
                payload: undefined,
              });
            }}
            onFailure={(name: string, result?: string) => {
              dispatchRegisterState({
                type: 'setDomainName',
                payload: encodeDomainToASCII(name),
              });
              dispatchRegisterState({
                type: 'setANTID',
                payload: result ? new ArweaveTransactionID(result) : undefined,
              });
            }}
            successPredicate={(value: string | undefined) =>
              searchBarSuccessPredicate({
                value: lowerCaseDomain(value ?? ''),
                records: pdnsSourceContract.records,
              })
            }
            validationPredicate={(value: string | undefined) =>
              searchBarValidationPredicate({
                value: lowerCaseDomain(value ?? ''),
              })
            }
            placeholderText={'Search for a name'}
            headerElement={
              <SearchBarHeader
                defaultText={'Find a name'}
                reservedList={
                  pdnsSourceContract.reserved
                    ? Object.keys(pdnsSourceContract.reserved)
                    : []
                }
              />
            }
            footerElement={
              <SearchBarFooter
                isAuction={
                  pdnsSourceContract?.auctions && domain
                    ? Object.keys(pdnsSourceContract.auctions).includes(
                        lowerCaseDomain(domain),
                      )
                    : false
                }
                reservedList={Object.keys(pdnsSourceContract?.reserved ?? {})}
                searchTerm={domain}
                searchResult={
                  domain && pdnsSourceContract.records[lowerCaseDomain(domain)]
                    ? new ArweaveTransactionID(
                        pdnsSourceContract.records[
                          lowerCaseDomain(domain)
                        ].contractTxId,
                      )
                    : undefined
                }
              />
            }
            height={65}
          />
          {!isValidatingRegistration &&
          updateShowFeaturedDomains({
            auction: isAuction,
            reserved: isReserved,
            domains: featuredDomains ?? {},
            id: antID,
            name: lowerCaseDomain(domain),
          }) &&
          featuredDomains ? (
            <FeaturedDomains domains={featuredDomains} />
          ) : (
            <></>
          )}
        </div>
      )}
    </div>
  );
}

export default Home;
