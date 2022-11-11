import SearchBar from '../../inputs/Search/SearchBar/SearchBar';
import './styles.css';
import { useStateValue } from '../../../state/state';
import { useState, useEffect } from 'react';
import { ARNS_NAME_REGEX } from '../../../../types/constants';
import { SearchBarHeader, SearchBarFooter } from '../../layout';

function Home() {
  const [{ arnsSourceContract }] = useStateValue();
  const [records, setRecords] = useState({});

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
          value ? !Object.keys(records).includes(value) : false
        }
        validationPredicate={(value: string | undefined) =>
          value ? ARNS_NAME_REGEX.test(value) : false
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
    </div>
  );
}

export default Home;
