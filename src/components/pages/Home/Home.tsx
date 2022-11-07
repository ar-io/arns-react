import SearchBar from '../../inputs/Search/SearchBar/SearchBar';
import './styles.css';
import { useStateValue } from '../../../state/state';
import { useState, useEffect } from 'react';
import AvailabilityHeader from '../../layout/AvailabilityHeader/AvailabilityHeader';

function Home() {
  const [{ arnsSourceContract }] = useStateValue();
  const [records, setRecords] = useState({});

  const [availability, setAvailability] = useState('search');
  const [searchName, setSearchName] = useState('');

  const [placeholderText, setPlaceholderText] = useState('Find a name');

  useEffect(() => {
    let newRecords = arnsSourceContract.records;
    setRecords(newRecords);
  }, [arnsSourceContract]);

  function availiblityCheck(props: string) {
    // if name is not in the legal character range or chars, dnt run
    const namePattern = new RegExp('^[a-zA-Z0-9_-]{1,32}$');
    if (!namePattern.test(props) && props !== '') {
      console.log('not a valid name', namePattern.test(props));
      return;
    } else {
      //if empty reset to search state
      if (props == '') {
        setAvailability('search');
        setPlaceholderText('Find a name');
      }
      //if not registered set as available
      if (!Object.keys(records).includes(props) && props !== '') {
        setAvailability('available');
        setSearchName(props);
      }
      //if registered set as unavailable
      if (Object.keys(records).includes(props) && props !== '') {
        setAvailability('unavailable');
        setSearchName(props);
        setPlaceholderText('try another name');
      }
    }
  }

  return (
    <div className="page">
      <div className="pageHeader">Arweave Name System</div>
      <SearchBar
        buttonAction={(props) => availiblityCheck(props)}
        placeholderText={placeholderText}
        headerElement={
          <AvailabilityHeader availability={availability} name={searchName} />
        }
        footerText={
          'Names must be 1-32 characters. Dashes and underscores are permitted, but cannot be trailing characters and cannot be used in single character domains.'
        }
        availability={availability}
      />
    </div>
  );
}

export default Home;
