import { useEffect, useState } from 'react';

import { useStateValue } from '../../../state/state';
import { ArNSDomains } from '../../../types';
import { FEATURED_DOMAINS } from '../../../utils/constants';
import {FeaturedDomains} from '../../layout';
import {
  isArNSDomainNameAvailable,
  isArNSDomainNameValid,
} from '../../../utils/searchUtils';
import SearchBar from '../../inputs/Search/SearchBar/SearchBar';
import { SearchBarFooter, SearchBarHeader } from '../../layout';
import './styles.css';
import RegisterNameModal from '../../modals/RegisterNameModal/RegisterNameModal';

function Home() {
  const [{ arnsSourceContract }] = useStateValue();
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
      <div className="pageHeader">Arweave Name System</div>
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
        <RegisterNameModal />
    </div>
  );
}

export default Home;
