import { useEffect, useState } from 'react';

import { useStateValue } from '../../../state/state';
import { ArNSDomains } from '../../../types';
import { FEATURED_DOMAINS } from '../../../utils/constants';
import {
  isArNSDomainNameAvailable,
  isArNSDomainNameValid,
} from '../../../utils/searchUtils';
import SearchBar from '../../inputs/Search/SearchBar/SearchBar';
import { FeaturedDomains } from '../../layout';
import { SearchBarFooter, SearchBarHeader } from '../../layout';
import './styles.css';

function Home() {
  const [{ arnsSourceContract }] = useStateValue();
  const [records, setRecords] = useState<ArNSDomains>(
    arnsSourceContract.records,
  );
  const [featuredDomains, setFeaturedDomains] = useState<ArNSDomains>();

  useEffect(() => {
    const records = arnsSourceContract.records;
    setRecords(records);

    const featuredDomains = Object.fromEntries(
      Object.entries(records).filter(([domain]) => {
        return FEATURED_DOMAINS.includes(domain);
      }),
    );
    setFeaturedDomains(featuredDomains);
  }, [arnsSourceContract]);

  return (
    <div className="page">
      <div className="pageHeader">Arweave Name System</div>
      <SearchBar
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
      {featuredDomains ? <FeaturedDomains domains={featuredDomains} /> : <></>}
    </div>
  );
}

export default Home;
