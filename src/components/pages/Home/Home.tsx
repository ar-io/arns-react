import { useEffect, useState } from 'react';

import { useGlobalState } from '../../../state/contexts/GlobalState';
import { ArNSDomains } from '../../../types';
import { FEATURED_DOMAINS } from '../../../utils/constants';
import {
  isArNSDomainNameAvailable,
  isArNSDomainNameValid,
} from '../../../utils/searchUtils';
import SearchBar from '../../inputs/Search/SearchBar/SearchBar';
import { SearchBarFooter, SearchBarHeader } from '../../layout';
import FeaturedDomains from '../../layout/FeaturedDomains/FeaturedDomains';
import './styles.css';

function Home() {
  const [{ arnsSourceContract }] = useGlobalState();
  const [records, setRecords] = useState<ArNSDomains>(
    arnsSourceContract.records,
  );
  const [featuredDomains, setFeaturedDomains] = useState<ArNSDomains>();
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const newRecords = arnsSourceContract.records;
    setRecords(newRecords);
    const featuredDomains = Object.fromEntries(
      Object.entries(newRecords).filter(([domain]) => {
        return FEATURED_DOMAINS.includes(domain);
      }),
    );
    setFeaturedDomains(featuredDomains);
  }, [arnsSourceContract]);
  return (
    <div className="page">
      <div className="pageHeader h1">Arweave Name System</div>
      <SearchBar
        setIsSearching={setIsSearching}
        values={records}
        successPredicate={(value: string | undefined) =>
          isArNSDomainNameAvailable({ name: value, records })
        }
        validationPredicate={(value: string | undefined) =>
          isArNSDomainNameValid({ name: value })
        }
        placeholderText={'Enter a name'}
        headerElement={<SearchBarHeader defaultText={'Find a domain name'} />}
        footerElement={
          <SearchBarFooter
            defaultText={
              'Names must be 1-32 characters. Dashes are permitted, but cannot be trailing characters and cannot be used in single character domains.'
            }
          />
        }
      />
      {featuredDomains && !isSearching ? (
        <FeaturedDomains domains={featuredDomains} />
      ) : (
        <></>
      )}
    </div>
  );
}

export default Home;
