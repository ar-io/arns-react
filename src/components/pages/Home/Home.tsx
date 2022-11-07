import SearchBar from '../../inputs/Search/SearchBar/SearchBar';
import './styles.css';
import { useStateValue } from '../../../state/state';
import { useState, useEffect } from 'react';
import { isArNSDomainNameAvailaible } from '../../../utils/searchUtils';
import SearchBarHeader from '../../layout/SearchBarHeader/SearchBarHeader';

function Home() {
  const [{ arnsSourceContract }] = useStateValue();
  const [records, setRecords] = useState({});

  const [placeholderText, setPlaceholderText] = useState('Find a name');

  useEffect(() => {
    let newRecords = arnsSourceContract.records;
    setRecords(newRecords);
  }, [arnsSourceContract]);

  return (
    <div className="page">
      <div className="pageHeader">Arweave Name System</div>
      <SearchBar
        buttonAction={(props) =>
          isArNSDomainNameAvailaible({ name: props, records: records })
        }
        placeholderText={placeholderText}
        headerElement={<SearchBarHeader isValid={undefined} name={''} />}
        footerText={
          'Names must be 1-32 characters. Dashes and underscores are permitted, but cannot be trailing characters and cannot be used in single character domains.'
        }
      />
    </div>
  );
}

export default Home;
