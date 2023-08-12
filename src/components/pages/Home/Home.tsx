import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useArweaveCompositeProvider } from '../../../hooks';
import { useGlobalState } from '../../../state/contexts/GlobalState';
import { useRegistrationState } from '../../../state/contexts/RegistrationState';
import { ArweaveTransactionID } from '../../../types';
import { FEATURED_DOMAINS } from '../../../utils/constants';
import {
  decodeDomainToASCII,
  encodeDomainToASCII,
  isPDNSDomainNameAvailable,
  isPDNSDomainNameValid,
} from '../../../utils/searchUtils/searchUtils';
import SearchBar from '../../inputs/Search/SearchBar/SearchBar';
import { FeaturedDomains, Loader } from '../../layout';
import { SearchBarFooter, SearchBarHeader } from '../../layout';
import './styles.css';

function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [{ pdnsSourceContract }] = useGlobalState();
  const [{ domain, antID }, dispatchRegisterState] = useRegistrationState();

  const [featuredDomains, setFeaturedDomains] = useState<{
    [x: string]: string;
  }>();
  const arweaveDataProvider = useArweaveCompositeProvider();

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

  function showFeaturedDomains(): boolean {
    const isFeaturedDomains = featuredDomains;
    const isNotPdntID = !antID;
    const isNotAuction = !arweaveDataProvider.isDomainInAuction({
      domain,
      auctionsList: Object.keys(pdnsSourceContract.auctions ?? {}),
    });
    const isNotReservedDomain = !arweaveDataProvider.isDomainReserved({
      domain,
      reservedList: Object.keys(pdnsSourceContract.reserved),
    });

    if (
      (isFeaturedDomains &&
        isNotPdntID &&
        isNotReservedDomain &&
        isNotAuction) ||
      !domain
    ) {
      return true;
    }

    return false;
  }

  return (
    <div className="page">
      <div
        className="white"
        style={{ fontSize: 57, padding: 56, fontWeight: 500 }}
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
            minWidth: '750px',
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
              isPDNSDomainNameAvailable({
                name: value ? encodeDomainToASCII(value) : value,
                records: pdnsSourceContract?.records ?? {},
              })
            }
            validationPredicate={(value: string | undefined) =>
              isPDNSDomainNameValid({ name: value })
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
                    ? Object.keys(pdnsSourceContract.auctions).includes(domain)
                    : false
                }
                reservedList={Object.keys(pdnsSourceContract?.reserved ?? {})}
                searchTerm={domain}
                searchResult={
                  domain &&
                  pdnsSourceContract.records[encodeDomainToASCII(domain)]
                    ? new ArweaveTransactionID(
                        pdnsSourceContract.records[
                          encodeDomainToASCII(domain)
                        ].contractTxId,
                      )
                    : undefined
                }
              />
            }
            height={65}
          />
          {showFeaturedDomains() && featuredDomains ? (
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
