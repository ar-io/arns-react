import SearchBar from '../../inputs/Search/SearchBar/SearchBar';
import './styles.css';
import { useStateValue } from '../../../state/state';
import { useState, useEffect } from 'react';
import SearchBarHeader from '../../layout/SearchBarHeader/SearchBarHeader';
import SearchBarFooter from '../../layout/SearchBarFooter/SearchBarFooter';

const ARNS_NAME_REGEX = new RegExp('^[a-zA-Z0-9_-]{1,32}$');

function Home() {
  const [{ arnsSourceContract }] = useStateValue();
  const [records, setRecords] = useState({});

  useEffect(() => {
    let newRecords = arnsSourceContract.records;
    setRecords(newRecords);
  }, [arnsSourceContract]);

  return (
    <div className="page">
      <div className="pageHeader">Arweave Name System</div>
      <SearchBar
        values={records}
        predicate={(value) =>
          !Object.keys(records).includes(value) && ARNS_NAME_REGEX.test(value)
        }
        placeholderText={'Enter a name.'}
        headerElement={<SearchBarHeader defaultText={'Find a name'} />}
        footerElement={
          <SearchBarFooter
            defaultText={
              'Names must be 1-32 characters. Dashes and underscores are permitted, but cannot be trailing characters and cannot be used in single character domains.'
            }
          />
        }
      />
    </div>
  );
}

export default Home;
