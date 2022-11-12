import { useEffect, useState } from 'react';

import { useStateValue } from '../../../state/state';
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
  const [records, setRecords] = useState(arnsSourceContract.records);

  useEffect(() => {
    const records = arnsSourceContract.records;
    setRecords(records);
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
      <FeaturedDomains domains={records} />
    </div>
  );
}

export default Home;
