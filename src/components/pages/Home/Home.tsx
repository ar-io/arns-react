import { useState, useEffect } from 'react';
import SearchBar from '../../inputs/SearchBar/SearchBar';
import FeaturedDomains from '../../FeaturedDomains';
import YearsCounter from '../../inputs/YearsCounter/YearsCounter';

function Home() {
  const [searchStateHeader, setSearchStateHeader] = useState('unavailable'); //search, available, unavailable
  const [searchName, setSearchName] = useState('');

  const toggle = () => {
    if (searchStateHeader === 'search') {
      setSearchStateHeader('available');
    }
    if (searchStateHeader === 'available') {
      setSearchStateHeader('unavailable');
    }
    if (searchStateHeader === 'unavailable') {
      setSearchStateHeader('search');
    }
  };

  return (
    <div className="home">
      <p className="brandHeader">Arweave Name Service</p>

      {searchStateHeader === 'search' ? (
        <p className="sectionHeader">Search for a name</p>
      ) : (
        <></>
      )}
      {searchStateHeader === 'available' ? (
        <p className="sectionHeader" style={{ fontFamily: 'Rubik-Bold' }}>
          {searchName}sam
          <text
            style={{
              color: 'var(--success-green)',
              fontWeight: 'inherit',
              fontSize: 'inherit',
              fontFamily: 'Rubik',
              paddingLeft: '4px',
            }}
          >
            is available!
          </text>
        </p>
      ) : (
        <></>
      )}
      {searchStateHeader === 'unavailable' ? (
        <p className="sectionHeader" style={{ fontFamily: 'Rubik-Bold' }}>
          {searchName}sam{' '}
          <text
            style={{
              color: 'var(--error-red)',
              fontWeight: 'inherit',
              fontSize: 'inherit',
              fontFamily: 'Rubik',
              paddingLeft: '4px',
            }}
          >
            is already registered, choose another name.
          </text>
        </p>
      ) : (
        <></>
      )}
      <SearchBar searchButtonAction={toggle} />
      {searchStateHeader === 'search' ? (
        <p className="textFaded">
          Names must be 1-20 characters. Dashes and underscores are permitted,
          but cannot be trailing characters and cannot be used in single
          character domains.
        </p>
      ) : (
        <></>
      )}
      {searchStateHeader === 'search' ? <FeaturedDomains /> : <></>}
      {searchStateHeader === 'available' ? <YearsCounter /> : <></>}
    </div>
  );
}

export default Home;
